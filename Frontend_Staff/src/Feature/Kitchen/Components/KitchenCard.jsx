import React, { useState } from "react";
import { FaUtensils, FaArrowRight, FaCheck, FaPrint, FaFire, FaExclamationTriangle, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import { apiFetch } from "../../../utils/apiHelper";

export default function KitchenCard({
  order,
  btnText,
  btnClass = "amber",
  onNext,
  isReady = false,
  onPrint,
}) {
  const [isRemaking, setIsRemaking] = useState(false);
  const [hasRemakeReported, setHasRemakeReported] = useState(false);

  // Ultra safe items parsing
  let parsedItems = [];
  try {
    const rawData =
      order.items ||
      order.cart ||
      order.order_items ||
      order.details ||
      order.products;

    if (rawData) {
      if (typeof rawData === "string") {
        parsedItems = JSON.parse(rawData);
      } else if (Array.isArray(rawData)) {
        parsedItems = rawData;
      }
    }
  } catch (e) {
    console.error("Failed to parse items for order card", e);
  }

  const handleReportBurn = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Report Burn / Remake",
      html: `
        <div style="text-align: left; font-size: 13px; font-family: inherit;">
          <p style="margin-bottom: 8px; color: #a1a1aa;">Select the reason for food remake. Raw ingredient loss will be automatically audited and alerted to Admin.</p>
          <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #fff;">Reason for Loss</label>
          <select id="swal-reason" class="swal2-input" style="width: 100%; margin: 0 0 12px 0; background: #27272a; color: #fff; border: 1px solid #3f3f46;">
            <option value="Overcooked / Burnt">Overcooked / Burnt</option>
            <option value="Customer Modification Mistake">Customer Modification Mistake</option>
            <option value="Dropped / Contaminated">Dropped / Contaminated</option>
            <option value="Recipe Prep Error">Recipe Prep Error</option>
            <option value="Other Kitchen Wastage">Other Kitchen Wastage</option>
          </select>
          <label style="display: block; margin-bottom: 4px; font-weight: bold; color: #fff;">Specific Notes</label>
          <textarea id="swal-notes" class="swal2-textarea" placeholder="e.g. Patty burned on grill during rush" style="width: 100%; margin: 0; background: #27272a; color: #fff; border: 1px solid #3f3f46; height: 70px;"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Submit Remake Ticket",
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#52525b",
      background: "#18181b",
      color: "#fff",
      preConfirm: () => {
        return {
          reason: document.getElementById("swal-reason").value,
          notes: document.getElementById("swal-notes").value,
        };
      },
    });

    if (formValues) {
      setIsRemaking(true);
      try {
        const user = JSON.parse(
          sessionStorage.getItem("staff_user") ||
            sessionStorage.getItem("staff_session") ||
            sessionStorage.getItem("user") ||
            "{}"
        );
        const chefName = user.name || user.username || "Kitchen Chef";

        const res = await apiFetch("log_wastage.php", {
          method: "POST",
          body: JSON.stringify({
            action: "report_kitchen_burn",
            order_id: order.id,
            reason: formValues.reason,
            notes: formValues.notes,
            reported_by: chefName,
          }),
        });
        const data = await res.json();

        if (data.success) {
          setHasRemakeReported(true);
          Swal.fire({
            icon: "success",
            title: "Remake Ticket Logged",
            text: `Wastage loss of Rs ${parseFloat(data.total_cost_lost || 0).toFixed(2)} logged to audit ledger. Admin alerted.`,
            background: "#18181b",
            color: "#fff",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire("Error", data.message || "Failed to log remake", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Server connection failed", "error");
      } finally {
        setIsRemaking(false);
      }
    }
  };

  const isTakeaway =
    order.table === "Takeaway" ||
    order.table_number === "Takeaway" ||
    order.type?.toLowerCase().includes("takeaway");

  const btnStyleClass =
    btnClass === "amber"
      ? "bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black"
      : btnClass === "orange"
      ? "bg-orange-500 hover:bg-orange-600 text-white font-black"
      : btnClass === "emerald"
      ? "bg-emerald-500 hover:bg-emerald-600 text-white font-black"
      : "bg-stone-200 text-stone-500 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed opacity-80 font-bold";

  return (
    <div
      className={`rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        hasRemakeReported
          ? "border-rose-500/80 bg-rose-950/20"
          : isReady
          ? "bg-stone-50/90 border-emerald-500/50 dark:bg-neutral-900/80 dark:border-emerald-500/40"
          : "bg-white border-stone-200/90 dark:bg-neutral-900 dark:border-neutral-800"
      }`}
    >
      {/* Remake Active Header Stripe if triggered */}
      {hasRemakeReported && (
        <div className="bg-rose-500/20 text-rose-400 px-3 py-1 text-[11px] font-bold flex items-center justify-between border-b border-rose-500/30">
          <span className="flex items-center gap-1.5">
            <FaFire className="animate-bounce" /> Remake In Progress
          </span>
          <span className="opacity-90">Audited</span>
        </div>
      )}

      {/* Card Header: Table + Time + Print + Remake Action */}
      <div className="px-3 sm:px-3.5 py-2 sm:py-2.5 bg-stone-50 border-b border-stone-200 dark:bg-neutral-950/60 dark:border-neutral-800/80 flex justify-between items-center">
        <div className="bg-stone-100 text-stone-900 dark:bg-neutral-800 dark:text-neutral-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md font-bold text-xs flex items-center gap-1.5 shadow-xs border border-stone-200/60 dark:border-neutral-700/60 truncate max-w-[140px] sm:max-w-none">
          <FaUtensils className="text-[10px] text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate">{order.table || order.table_number || "Takeaway"}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Report Burn / Remake Action */}
          <button
            type="button"
            onClick={handleReportBurn}
            disabled={isRemaking}
            className="px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white flex items-center gap-1 transition-all border border-rose-500/20 cursor-pointer text-[10px] font-black uppercase tracking-wider active:scale-95"
            title="Report Burned Item or Remake Ticket"
            aria-label="Report Burn or Remake"
          >
            <FaFire className="text-[9px]" />
            <span>Remake</span>
          </button>

          {onPrint && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrint(order);
              }}
              className="w-7 h-7 rounded-md bg-stone-100 hover:bg-amber-400 text-stone-700 hover:text-neutral-950 dark:bg-neutral-800 dark:hover:bg-amber-400 dark:text-neutral-300 dark:hover:text-neutral-950 flex items-center justify-center transition-all border border-stone-200/80 dark:border-neutral-700 cursor-pointer text-xs active:scale-95"
              title="Print KOT"
              aria-label="Print Kitchen Ticket"
            >
              <FaPrint />
            </button>
          )}
          <span className="text-stone-500 dark:text-neutral-400 font-bold text-[11px] sm:text-xs font-mono">
            {order.time}
          </span>
        </div>
      </div>

      {/* Card Body: Items List with FCFS Queue Priority & Wait Timer */}
      <div className="p-3 sm:p-3.5 flex-1">
        <div className="flex justify-between items-center text-xs text-stone-500 dark:text-neutral-400 font-bold mb-2.5 sm:mb-3 pb-1.5 sm:pb-2 border-b border-dashed border-stone-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 font-mono text-stone-900 dark:text-neutral-200 font-bold">
            <span>#{order.id}</span>
            {order.fcfsRank && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  order.fcfsRank === 1
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse"
                    : order.fcfsRank === 2
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-stone-200 dark:bg-neutral-800 text-stone-600 dark:text-neutral-400"
                }`}
                title={`FCFS Queue Priority #${order.fcfsRank} (First-Come, First-Served)`}
              >
                Queue #{order.fcfsRank}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {typeof order.elapsedMinutes === "number" && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                  order.elapsedMinutes >= 20
                    ? "bg-rose-500 text-white animate-pulse"
                    : order.elapsedMinutes >= 10
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                }`}
                title={`Order wait time: ${order.elapsedMinutes} mins`}
              >
                <FaClock className="text-[9px]" />
                {order.elapsedMinutes}m wait
              </span>
            )}
            <span className="uppercase tracking-wider text-amber-700 dark:text-amber-400 font-black text-[10px] sm:text-[11px]">
              {order.type || "Dine-In"}
            </span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-2.5">
          {parsedItems.length > 0 ? (
            parsedItems.map((item, idx) => (
              <div
                key={idx}
                className="pb-2 sm:pb-2.5 border-b border-dashed border-stone-200/70 dark:border-neutral-800/60 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-2 text-xs sm:text-sm font-bold text-stone-900 dark:text-neutral-100">
                  <span className="bg-stone-100 text-amber-700 dark:bg-neutral-800 dark:text-amber-400 font-black text-[11px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 flex justify-center items-center rounded-md shrink-0 text-center mt-0.5 border border-stone-200/80 dark:border-neutral-700">
                    {item.qty || item.quantity || 1}x
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="leading-snug break-words">
                      {item.name || item.title || item.item_name}
                    </span>
                    {item.size && item.size !== "Regular" && (
                      <span className="text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs ml-1.5 font-black">
                        [{item.size}]
                      </span>
                    )}
                    {(item.spice_level || item.spiceLevel) && (
                      <span className={`text-[10px] sm:text-[11px] ml-1.5 px-1.5 py-0.5 rounded font-black uppercase ${
                        (item.spice_level || item.spiceLevel).includes("Hot") || (item.spice_level || item.spiceLevel).includes("Fire")
                          ? "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
                          : (item.spice_level || item.spiceLevel).includes("Mild")
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}>
                        🌶️ {item.spice_level || item.spiceLevel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub details: Addons, Exclusions, Notes */}
                <div className="pl-7 sm:pl-8 mt-1 space-y-1">
                  {/* Selected Addons */}
                  {(() => {
                    let addonsList = [];
                    if (item.selected_addons) {
                      addonsList = typeof item.selected_addons === "string" ? JSON.parse(item.selected_addons) : item.selected_addons;
                    } else if (item.selected_addons_json) {
                      try {
                        addonsList = typeof item.selected_addons_json === "string" ? JSON.parse(item.selected_addons_json) : item.selected_addons_json;
                      } catch(e) {}
                    } else if (item.addons && Array.isArray(item.addons)) {
                      addonsList = item.addons;
                    }
                    if (Array.isArray(addonsList) && addonsList.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {addonsList.map((a, aIdx) => {
                            const aName = typeof a === "string" ? a : (a?.name || a?.title || a?.addon_name || "");
                            if (!aName) return null;
                            return (
                              <span
                                key={aIdx}
                                className="text-[10px] sm:text-[11px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded shadow-2xs"
                              >
                                + {aName}
                              </span>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {item.description && (
                    <p className="text-[10px] sm:text-[11px] text-stone-600 dark:text-neutral-400 leading-tight m-0 break-words">
                      {item.description}
                    </p>
                  )}
                  {item.note && (
                    <div className="block max-w-full break-words bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded px-2 py-1 text-amber-900 dark:text-amber-300 font-semibold italic text-[10px] sm:text-[11px]">
                      📝 Note: {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-stone-400 dark:text-neutral-500 text-xs italic py-2">
              No items details found.
            </div>
          )}
        </div>
      </div>

      {/* Card Action Button - Min 44px touch height */}
      {btnText && (
        <button
          type="button"
          className={`w-full py-2.5 sm:py-3 px-4 min-h-[42px] sm:min-h-[44px] rounded-none font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer mt-auto border-none active:brightness-95 ${btnStyleClass}`}
          onClick={onNext}
          disabled={btnClass === "gray" || !onNext}
        >
          <span>{btnText}</span>
          {isReady ? (
            <FaCheck className="text-xs" />
          ) : (
            <FaArrowRight className="text-xs" />
          )}
        </button>
      )}
    </div>
  );
}
