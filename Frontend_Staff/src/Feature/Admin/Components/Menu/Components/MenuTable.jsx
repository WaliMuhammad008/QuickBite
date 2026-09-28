import React, { useState } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaBookOpen,
  FaLayerGroup,
  FaUtensils,
} from "react-icons/fa";
import { resolveImageUrl } from "../../../../../utils/imageOptimizer";

const getItemStockStatus = (item) => {
  const isOutOfStock =
    item.inStock === false ||
    item.inStock === 0 ||
    item.inStock === "0";
  const isStoreDisabled =
    item.isAvailable === false ||
    item.isAvailable === 0 ||
    item.isAvailable === "0";

  const variants = Array.isArray(item.variants) ? item.variants : [];
  const inStockVariantsCount = variants.filter(
    (v) => v.inStock !== false && v.inStock !== 0 && v.inStock !== "0"
  ).length;
  const isPartialStock =
    variants.length > 1 &&
    inStockVariantsCount > 0 &&
    inStockVariantsCount < variants.length;

  if (isOutOfStock) {
    return {
      status: "out_of_stock",
      label: "Out of Stock",
      badgeClass:
        "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
      dotClass: "bg-rose-500 animate-pulse",
      isOutOfStock: true,
      isStoreDisabled: false,
    };
  }

  if (isPartialStock) {
    return {
      status: "partial_stock",
      label: `Partial (${inStockVariantsCount}/${variants.length})`,
      badgeClass:
        "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
      dotClass: "bg-amber-500",
      isOutOfStock: false,
      isStoreDisabled: false,
    };
  }

  if (isStoreDisabled) {
    return {
      status: "disabled",
      label: "Store Hidden",
      badgeClass:
        "bg-slate-500/15 text-slate-600 dark:text-neutral-400 border border-slate-500/30",
      dotClass: "bg-slate-400",
      isOutOfStock: false,
      isStoreDisabled: true,
    };
  }

  return {
    status: "in_stock",
    label: "In Stock",
    badgeClass:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    dotClass: "bg-emerald-500",
    isOutOfStock: false,
    isStoreDisabled: false,
  };
};

const MenuTable = ({
  menuItems = [],
  categories = [],
  onEdit,
  onDelete,
  onSetRecipe,
  onAddOns,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStockFilter, setSelectedStockFilter] = useState("All");

  const outOfStockCount = menuItems.filter(
    (i) => i.inStock === false || i.inStock === 0 || i.inStock === "0"
  ).length;
  const inStockCount = menuItems.filter(
    (i) =>
      i.inStock !== false &&
      i.inStock !== 0 &&
      i.inStock !== "0" &&
      i.isAvailable !== false &&
      i.isAvailable !== 0 &&
      i.isAvailable !== "0"
  ).length;

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      (item.category && item.category === selectedCategory);

    const stockInfo = getItemStockStatus(item);
    let matchesStock = true;
    if (selectedStockFilter === "out_of_stock") {
      matchesStock = stockInfo.status === "out_of_stock";
    } else if (selectedStockFilter === "in_stock") {
      matchesStock =
        stockInfo.status === "in_stock" ||
        stockInfo.status === "partial_stock";
    } else if (selectedStockFilter === "disabled") {
      matchesStock = stockInfo.status === "disabled";
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="animate-slide-up space-y-4">
      {/* Responsive Filter & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-[var(--panel-bg)] p-3 sm:p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Category Select */}
          <select
            className="bg-[var(--input-bg)] text-[var(--text-primary)] p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer outline-none w-full sm:w-52 border border-[var(--border-subtle)] focus:border-amber-500 transition-colors"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" value="All">
              All Categories ({menuItems.length})
            </option>
            {categories.map((cat) => (
              <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock Filter Select */}
          <select
            className="bg-[var(--input-bg)] text-[var(--text-primary)] p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer outline-none w-full sm:w-52 border border-[var(--border-subtle)] focus:border-amber-500 transition-colors"
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
          >
            <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" value="All">
              All Stock Status ({menuItems.length})
            </option>
            <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" value="in_stock">
              In Stock ({inStockCount})
            </option>
            <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" value="out_of_stock">
              Out of Stock ({outOfStockCount})
            </option>
            <option className="bg-[var(--panel-bg)] text-[var(--text-primary)]" value="disabled">
              Store Hidden
            </option>
          </select>
        </div>

        <div className="flex items-center bg-[var(--input-bg)] px-3 py-1 rounded-xl border border-[var(--border-subtle)] focus-within:border-amber-500 transition-colors w-full md:w-72">
          <FaSearch className="text-[var(--text-muted)] text-sm mr-2.5 shrink-0" />
          <input
            className="bg-transparent border-none text-[var(--text-primary)] py-2 text-xs sm:text-sm outline-none w-full placeholder-[var(--text-muted)] font-medium"
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
        {filteredMenuItems.length > 0 ? (
          <div className="table-responsive-container">
            <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-[var(--text-primary)]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                  <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                    Product
                  </th>
                  <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                    Category
                  </th>
                  <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                    Base Price
                  </th>
                  <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider">
                    Stock Status
                  </th>
                  <th className="p-3.5 sm:p-4 text-[11px] uppercase text-[var(--text-primary)] font-bold tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
                {filteredMenuItems.map((item) => {
                  const displayPrice = item.price ?? item.variants?.[0]?.price ?? 0;
                  const stockInfo = getItemStockStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group ${
                        stockInfo.isOutOfStock ? "bg-rose-500/[0.02]" : ""
                      }`}
                    >
                      <td className="p-3.5 sm:p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl bg-black/10 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative transition-all ${
                              stockInfo.isOutOfStock
                                ? "ring-1 ring-rose-500/40"
                                : ""
                            }`}
                          >
                            <img
                              src={resolveImageUrl(item.img, 100)}
                              alt={item.name}
                              className={`w-full h-full object-cover rounded-lg transition-all ${
                                stockInfo.isOutOfStock
                                  ? "grayscale contrast-75 opacity-70"
                                  : ""
                              }`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/100x100?text=Food";
                              }}
                            />
                            {stockInfo.isOutOfStock && (
                              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="text-[9px] font-black text-rose-300 uppercase tracking-tighter bg-rose-950/90 border border-rose-500/40 px-1 py-0.5 rounded shadow-xs">
                                  OOS
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[var(--text-primary)] block truncate">
                                {item.name}
                              </span>
                              {stockInfo.isOutOfStock && (
                                <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                                  Depleted
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)] block truncate max-w-[200px]">
                              {stockInfo.isOutOfStock
                                ? "Recipe ingredients out of stock"
                                : item.description || "No description provided"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle">
                        <span className="bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {item.category || "Unassigned"}
                        </span>
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle font-black text-amber-600 dark:text-amber-400 font-mono">
                        Rs. {Number(displayPrice).toLocaleString()}
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle">
                        <span
                          className={`!rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${stockInfo.badgeClass}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${stockInfo.dotClass}`}
                          />
                          {stockInfo.label}
                        </span>
                      </td>

                      <td className="p-3.5 sm:p-4 align-middle text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 cursor-pointer transition-all shadow-sm"
                            title="Manage Recipe"
                            onClick={() => onSetRecipe(item)}
                          >
                            <FaBookOpen className="text-xs" />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-500/20 cursor-pointer transition-all shadow-sm"
                            title="Edit Item"
                            onClick={() => onEdit(item)}
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            type="button"
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 cursor-pointer transition-all shadow-sm"
                            title="Delete Item"
                            onClick={() => onDelete(item.id)}
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            <p className="text-sm font-semibold">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuTable;
