import React from "react";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const InventoryTable = ({
  products,
  onEdit,
  onDelete,
  requestSort,
  sortConfig,
}) => {
  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key)
      return <FaSort className="opacity-30 text-[10px]" />;
    return sortConfig.direction === "asc" ? <FaSortUp className="text-amber-400 text-[10px]" /> : <FaSortDown className="text-amber-400 text-[10px]" />;
  };

  return (
    <div className="admin-card-surface rounded-2xl shadow-sm animate-slide-up overflow-hidden">
      <div className="table-responsive-container">
        <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--table-header-bg)]">
              <th
                className="p-3.5 sm:p-4 text-[var(--text-primary)] font-bold uppercase tracking-wider select-none cursor-pointer hover:text-amber-500"
                onClick={() => requestSort("name")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Ingredient</span>
                  {getSortIcon("name")}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 text-[var(--text-primary)] font-bold uppercase tracking-wider select-none cursor-pointer hover:text-amber-500"
                onClick={() => requestSort("price")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Unit Price</span>
                  {getSortIcon("price")}
                </div>
              </th>
              <th
                className="p-3.5 sm:p-4 text-[var(--text-primary)] font-bold uppercase tracking-wider select-none cursor-pointer hover:text-amber-500"
                onClick={() => requestSort("stock")}
              >
                <div className="flex items-center gap-1.5">
                  <span>Available Stock</span>
                  {getSortIcon("stock")}
                </div>
              </th>
              <th className="p-3.5 sm:p-4 text-[var(--text-primary)] font-bold uppercase tracking-wider select-none">
                Stock Status
              </th>
              <th className="p-3.5 sm:p-4 text-[var(--text-primary)] font-bold uppercase tracking-wider select-none text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {products.length > 0 ? (
              products.map((product) => {
                const stockVal = parseFloat(product.stock || 0);
                const threshold = parseFloat(product.threshold || 10);
                
                let badgeStyle = "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30";
                let statusText = "In Stock";
                let progressPercent = Math.min(100, (stockVal / (threshold * 3 || 30)) * 100);
                let progressColor = "bg-emerald-500";

                if (stockVal === 0) {
                  badgeStyle = "bg-rose-500/15 text-rose-500 border border-rose-500/30";
                  statusText = "Out of Stock";
                  progressPercent = 0;
                  progressColor = "bg-rose-500";
                } else if (stockVal <= threshold) {
                  badgeStyle = "bg-amber-500/15 text-amber-500 border border-amber-500/30";
                  statusText = "Low Stock";
                  progressPercent = Math.max(10, Math.min(40, (stockVal / threshold) * 40));
                  progressColor = "bg-amber-500";
                }

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-[var(--table-row-hover)] transition-colors"
                  >
                    <td className="p-3.5 sm:p-4 text-[var(--text-primary)] font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono font-bold text-amber-500">
                      Rs. {parseFloat(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[var(--text-primary)] text-xs">
                            {stockVal}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--input-bg)] text-[10px] font-bold text-[var(--text-secondary)] font-mono border border-[var(--border-subtle)]">
                            {product.unit || 'kg'}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-black/20 dark:bg-black/50 overflow-hidden">
                          <div
                            className={`h-full ${progressColor} transition-all duration-300`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <span className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border inline-block ${badgeStyle}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl bg-[var(--input-bg)] hover:bg-amber-500 hover:text-neutral-950 text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                          onClick={() => onEdit(product)}
                          title="Edit Ingredient"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          type="button"
                          className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                          onClick={() => onDelete(product.id)}
                          title="Delete Ingredient"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 text-neutral-400 font-semibold">
                  No inventory ingredients found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
