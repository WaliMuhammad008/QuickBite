import React from "react";

export default function ProductProfitRow({ item }) {
  const margin = Number(item.margin) || 0;
  const profit = Number(item.profit) || 0;
  let badgeStyle = "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
  let marginColor = "bg-emerald-500";

  if (margin <= 30) {
    badgeStyle = "bg-rose-500/15 text-rose-500 border border-rose-500/30";
    marginColor = "bg-rose-500";
  } else if (margin <= 50) {
    badgeStyle = "bg-amber-500/15 text-amber-500 border border-amber-500/30";
    marginColor = "bg-amber-500";
  }

  return (
    <tr className="hover:bg-[var(--table-row-hover)] transition-colors">
      <td className="p-3.5 sm:p-4 align-middle">
        <div>
          <span className="font-extrabold text-sm text-[var(--text-primary)] block">
            {item.title}
          </span>
          {item.category && (
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase">
              {item.category}
            </span>
          )}
        </div>
      </td>

      <td className="p-3.5 sm:p-4 align-middle font-bold text-[var(--text-primary)] font-mono">
        {item.qty}
      </td>

      <td className="p-3.5 sm:p-4 align-middle font-bold text-[var(--text-secondary)] font-mono">
        Rs. {Math.round(Number(item.revenue || 0)).toLocaleString()}
      </td>

      <td className="p-3.5 sm:p-4 align-middle text-[var(--text-secondary)] font-medium font-mono">
        Rs. {Math.round(Number(item.cogs || 0)).toLocaleString()}
      </td>

      <td className="p-3.5 sm:p-4 align-middle">
        <span
          className={`font-black text-sm font-mono ${
            profit < 0 ? "text-rose-500" : "text-emerald-500"
          }`}
        >
          Rs. {Math.round(profit).toLocaleString()}
        </span>
      </td>

      <td className="p-3.5 sm:p-4 align-middle">
        <div className="flex items-center gap-2.5">
          <div className="w-20 h-2 bg-black/20 dark:bg-black/50 rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${marginColor}`}
              style={{ width: `${Math.min(100, Math.max(0, margin))}%` }}
            />
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono inline-block ${badgeStyle}`}
          >
            {margin}%
          </span>
        </div>
      </td>
    </tr>
  );
}
