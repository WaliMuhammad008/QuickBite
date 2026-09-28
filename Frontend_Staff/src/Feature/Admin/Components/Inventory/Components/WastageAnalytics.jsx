import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FaFire,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMotorcycle,
  FaCashRegister,
  FaUtensils,
  FaFilter,
  FaSync,
  FaShieldAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../../utils/apiHelper";

export default function WastageAnalytics() {
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = useState("all");

  // 1. Fetch Wastage Analytics KPI Summary
  const { data: analytics = {}, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["wastage_analytics"],
    queryFn: async () => {
      const res = await apiFetch("admin_wastage_manager.php?action=get_wastage_analytics");
      const data = await res.json();
      return data.success ? data : {};
    },
    refetchInterval: 10000,
  });

  // 2. Fetch Detailed Wastage Logs
  const { data: logsData = {}, isLoading: isLogsLoading } = useQuery({
    queryKey: ["wastage_logs"],
    queryFn: async () => {
      const res = await apiFetch("admin_wastage_manager.php?action=get_wastage_logs");
      const data = await res.json();
      return data.success ? data.logs : [];
    },
    refetchInterval: 10000,
  });

  const logs = Array.isArray(logsData) ? logsData : [];

  // 3. Fetch Inventory Items for Direct Raw Wastage Logging
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const res = await apiFetch("inventory_api.php");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const handleLogRawWastage = async () => {
    if (!inventoryItems.length) {
      Swal.fire("Notice", "No inventory items available to log wastage.", "info");
      return;
    }

    const optionsHtml = inventoryItems
      .map(
        (item) =>
          `<option value="${item.id}" data-unit="${item.unit || "kg"}" data-price="${item.price || 0}">
            ${item.name} (${item.stock} ${item.unit || "kg"} in stock) - Rs ${item.price}
          </option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Log Raw Ingredient Wastage",
      html: `
        <div style="text-align: left; font-size: 13px;">
          <label style="font-weight: bold; display: block; margin-bottom: 4px; color: #fff;">Select Ingredient:</label>
          <select id="swal-inv-id" style="width: 100%; padding: 8px 12px; background: #27272a; color: #fff; border: 1px solid #3f3f46; border-radius: 8px; margin-bottom: 12px;">
            ${optionsHtml}
          </select>

          <label style="font-weight: bold; display: block; margin-bottom: 4px; color: #fff;">Quantity to Deduct:</label>
          <input id="swal-inv-qty" type="number" step="0.1" min="0.1" placeholder="e.g. 2.5" style="width: 100%; padding: 8px 12px; background: #27272a; color: #fff; border: 1px solid #3f3f46; border-radius: 8px; margin-bottom: 12px; box-sizing: border-box;" />

          <label style="font-weight: bold; display: block; margin-bottom: 4px; color: #fff;">Reason:</label>
          <select id="swal-inv-reason" style="width: 100%; padding: 8px 12px; background: #27272a; color: #fff; border: 1px solid #3f3f46; border-radius: 8px; margin-bottom: 12px;">
            <option value="Expired / Spoilage">Expired / Spoilage</option>
            <option value="Spilled in Kitchen">Spilled in Kitchen</option>
            <option value="Damaged Packaging / Contaminated">Damaged Packaging / Contaminated</option>
            <option value="Quality Inspection Rejection">Quality Inspection Rejection</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Record & Deduct Stock",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      background: "#18181b",
      color: "#fff",
      preConfirm: () => {
        const invSelect = document.getElementById("swal-inv-id");
        const qty = parseFloat(document.getElementById("swal-inv-qty").value);
        if (isNaN(qty) || qty <= 0) {
          Swal.showValidationMessage("Please enter a valid positive quantity");
          return false;
        }
        return {
          inventory_id: invSelect.value,
          quantity: qty,
          reason: document.getElementById("swal-inv-reason").value,
        };
      },
    });

    if (formValues) {
      try {
        const user = JSON.parse(
          sessionStorage.getItem("staff_user") ||
            sessionStorage.getItem("staff_session") ||
            sessionStorage.getItem("user") ||
            "{}"
        );
        const adminName = user.name || user.username || "Admin";

        const res = await apiFetch("admin_wastage_manager.php", {
          method: "POST",
          body: JSON.stringify({
            action: "log_raw_wastage",
            inventory_id: formValues.inventory_id,
            quantity: formValues.quantity,
            reason: formValues.reason,
            reported_by: adminName,
          }),
        });
        const data = await res.json();
        if (data.success) {
          Swal.fire({
            icon: "success",
            title: "Wastage Logged",
            html: `
              <p>Deducted <strong>${data.quantity_deducted}</strong> from <strong>${data.inventory_name}</strong>.</p>
              <p style="color: #ef4444; font-weight: bold;">Loss Impact: Rs ${parseFloat(data.cost_lost || 0).toFixed(2)}</p>
              ${data.low_stock_alert ? `<p style="color: #f59e0b; font-weight: bold;">⚠️ Low Stock Alert Generated!</p>` : ""}
            `,
            background: "#18181b",
            color: "#fff",
          });
          queryClient.invalidateQueries({ queryKey: ["wastage_logs"] });
          queryClient.invalidateQueries({ queryKey: ["wastage_analytics"] });
          queryClient.invalidateQueries({ queryKey: ["inventory"] });
        } else {
          Swal.fire("Error", data.message || "Failed to log wastage", "error");
        }
      } catch (err) {
        Swal.fire("Error", "Server connection failed", "error");
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedStage === "all") return true;
    return log.stage === selectedStage;
  });

  const handleVerify = async (logId) => {
    try {
      const user = JSON.parse(
        sessionStorage.getItem("staff_user") ||
          sessionStorage.getItem("staff_session") ||
          sessionStorage.getItem("user") ||
          "{}"
      );
      const adminName = user.name || user.username || "Admin";

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/admin_wastage_manager.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify_wastage",
            id: logId,
            verified_by: adminName,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Audit Verified",
          text: "Wastage record has been officially verified and archived.",
          timer: 1500,
          showConfirmButton: false,
        });
        queryClient.invalidateQueries({ queryKey: ["wastage_logs"] });
        queryClient.invalidateQueries({ queryKey: ["wastage_analytics"] });
      } else {
        Swal.fire("Error", data.message || "Failed to verify audit", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server connection failed", "error");
    }
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case "kitchen":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <FaUtensils className="text-[10px]" /> Kitchen Burn/Remake
          </span>
        );
      case "rider":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <FaMotorcycle className="text-[10px]" /> Delivery Failed
          </span>
        );
      case "cashier":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <FaCashRegister className="text-[10px]" /> Mid-Prep Cancel
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            <FaExclamationTriangle className="text-[10px]" /> {stage}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden animate-fade-in">
      {/* ═══ 1. TOP KPI SUMMARY CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Today's Loss Cost */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
              Today's Loss Cost
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <FaFire className="text-sm" />
            </div>
          </div>
          <div className="pt-3">
            <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-rose-600 dark:text-rose-400">
              Rs {parseFloat(analytics.today_lost_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-1 m-0">
              Calculated from recipe ingredients & custom add-on costs
            </p>
          </div>
        </div>

        {/* Card 2: Pending Audits Count */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
              Pending Audit Verifications
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FaShieldAlt className="text-sm" />
            </div>
          </div>
          <div className="pt-3">
            <div className="text-2xl sm:text-3xl font-black font-['Oswald',sans-serif] text-amber-600 dark:text-amber-400">
              {analytics.pending_audits || 0} Logs
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-neutral-400 mt-1 m-0">
              Awaiting manager/admin review and signoff
            </p>
          </div>
        </div>

        {/* Card 3: Top Wasted Item */}
        <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-neutral-800">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-neutral-400">
              Top Depleted Raw Material
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <FaExclamationTriangle className="text-sm" />
            </div>
          </div>
          <div className="pt-3">
            <div className="text-xl sm:text-2xl font-black font-['Oswald',sans-serif] text-zinc-900 dark:text-white truncate">
              {analytics.top_wasted_item?.name || "No wastage recorded"}
            </div>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              {analytics.top_wasted_item?.total_qty || 0} {analytics.top_wasted_item?.unit || "units"} (Rs {parseFloat(analytics.top_wasted_item?.total_cost || 0).toLocaleString()})
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 2. CONTROLS & FILTER BAR ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-2">
          <FaFilter className="text-xs text-amber-500" />
          <span className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300">Filter Stage:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Logs" },
              { id: "kitchen", label: "Kitchen Remakes" },
              { id: "rider", label: "Delivery Failed" },
              { id: "cashier", label: "Mid-Prep Cancel" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStage(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedStage === tab.id
                    ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-xs"
                    : "bg-zinc-50 dark:bg-neutral-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-neutral-700 hover:border-amber-500/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogRawWastage}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-rose-500/30 transition-all active:scale-95 shadow-xs"
          >
            <FaFire className="text-[10px]" />
            <span>Log Raw Wastage</span>
          </button>
          <button
            type="button"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["wastage_logs"] });
              queryClient.invalidateQueries({ queryKey: ["wastage_analytics"] });
            }}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-neutral-700 transition-all"
          >
            <FaSync className="text-[10px]" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* ═══ 3. DETAILED WASTAGE AUDIT TABLE ═══ */}
      <div className="bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-neutral-950/60 border-b border-zinc-200 dark:border-neutral-800 text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-neutral-400 font-['Oswald',sans-serif]">
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Stage</th>
                <th className="py-3.5 px-4">Reported By</th>
                <th className="py-3.5 px-4">Raw Ingredient Lost</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
                <th className="py-3.5 px-4">Cost Impact</th>
                <th className="py-3.5 px-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-neutral-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-zinc-400 italic">
                    No wastage or package loss records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isVerified = Boolean(log.is_verified == 1 || log.is_verified === true);
                  const formattedDate = new Date(log.created_at).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  });

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                        {formattedDate}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white font-mono">
                        {log.order_id ? `#${log.order_id}` : "N/A"}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getStageBadge(log.stage)}
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                        {log.reported_by}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {log.inventory_name}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-neutral-400">
                          {parseFloat(log.quantity)} {log.unit}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-zinc-600 dark:text-zinc-300" title={log.reason}>
                        {log.reason}
                      </td>
                      <td className="py-3 px-4 font-black font-['Oswald',sans-serif] text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        Rs {parseFloat(log.cost_lost || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <FaCheckCircle className="text-xs" /> Verified by {log.verified_by || "Admin"}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleVerify(log.id)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-neutral-950 dark:text-amber-400 dark:hover:text-neutral-950 border border-amber-500/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-xs"
                          >
                            Verify Audit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
