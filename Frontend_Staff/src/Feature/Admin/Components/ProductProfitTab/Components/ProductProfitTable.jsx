import React from "react";
import { FaSort } from "react-icons/fa";
import ProductProfitRow from "./ProductProfitRow";

export default function ProductProfitTable({
  loading,
  sortedData = [],
  handleSort,
}) {
  return (
    <div className="bg-[var(--panel-bg)] rounded-2xl border border-[var(--border-subtle)] overflow-x-auto shadow-sm">
      <table className="w-full border-collapse min-w-[760px] text-left text-xs">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] bg-[var(--table-header-bg)]">
            <th
              onClick={() => handleSort("title")}
              className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Product Title</span>
                <FaSort className="text-[10px] text-[var(--text-muted)]" />
              </div>
            </th>
            <th
              onClick={() => handleSort("qty")}
              className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Units Sold</span>
                <FaSort className="text-[10px] text-[var(--text-muted)]" />
              </div>
            </th>
            <th
              onClick={() => handleSort("revenue")}
              className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Gross Revenue</span>
                <FaSort className="text-[10px] text-[var(--text-muted)]" />
              </div>
            </th>
            <th
              onClick={() => handleSort("cogs")}
              className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Total Cost (COGS)</span>
                <FaSort className="text-[10px] text-[var(--text-muted)]" />
              </div>
            </th>
            <th
              onClick={() => handleSort("profit")}
              className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Net Profit</span>
                <FaSort className="text-[10px] text-[var(--text-muted)]" />
              </div>
            </th>
            <th
              onClick={() => handleSort("margin")}
              className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider cursor-pointer hover:text-amber-500 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Margin %</span>
                <FaSort className="text-[10px] text-[var(--text-muted)]" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {loading ? (
            <tr>
              <td
                colSpan="6"
                className="text-center py-12 text-xs text-[var(--text-secondary)] font-semibold"
              >
                Calculating Unit Economics & Profitability...
              </td>
            </tr>
          ) : sortedData.length > 0 ? (
            sortedData.map((item, index) => (
              <ProductProfitRow key={index} item={item} />
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
                className="text-center py-12 text-xs text-[var(--text-secondary)] font-semibold"
              >
                No completed sales records found for this period.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
