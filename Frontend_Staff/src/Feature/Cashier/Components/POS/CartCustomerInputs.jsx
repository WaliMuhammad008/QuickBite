import React, { useState } from "react";
import { FaChair, FaTimes } from "react-icons/fa";
import TableSelectorModal from "./TableSelectorModal";

export default function CartCustomerInputs({
  orderType = "Dine-In",
  tableNo = "",
  setTableNo,
  customerName = "",
  setCustomerName,
  customerMobile = "",
  setCustomerMobile,
}) {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  return (
    <div className="space-y-2 mb-3 shrink-0">
      {orderType === "Dine-In" && (
        <div>
          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer box-border ${
              tableNo
                ? "bg-amber-500/15 dark:bg-amber-500/20 border-amber-500/40 text-neutral-900 dark:text-white shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  tableNo
                    ? "bg-amber-500 text-neutral-950 font-bold"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <FaChair />
              </div>
              {tableNo ? (
                <div className="text-left truncate">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider block leading-tight">
                    Selected Table
                  </span>
                  <span className="font-['Oswald',sans-serif] font-black text-sm tracking-wide text-zinc-900 dark:text-white block leading-tight">
                    {tableNo}
                  </span>
                </div>
              ) : (
                <span className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
                  Select Dine-In Table *
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {tableNo && (
                <span
                  role="button"
                  title="Clear Table"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTableNo("");
                  }}
                  className="w-5 h-5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-white flex items-center justify-center text-[10px] cursor-pointer"
                >
                  <FaTimes />
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] uppercase tracking-wider transition-all">
                {tableNo ? "Change" : "Select"}
              </span>
            </div>
          </button>

          <TableSelectorModal
            isOpen={isTableModalOpen}
            onClose={() => setIsTableModalOpen(false)}
            onSelectTable={(selected) => setTableNo(selected)}
            selectedTable={tableNo}
          />
        </div>
      )}

      {orderType === "Delivery" && (
        <>
          <input
            type="text"
            className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
            placeholder="Delivery Address *"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
          />
          <input
            type="text"
            className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
            placeholder="Customer Mobile Number *"
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
          />
        </>
      )}

      <input
        type="text"
        className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-amber-500 transition-colors box-border"
        placeholder="Customer Name (Optional)"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />
    </div>
  );
}
