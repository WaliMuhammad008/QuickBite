import React from 'react';

export default function ProductSliderConfigForm({
  formData = {},
  setFormData,
  categories = [],
  menuItems = [],
  selectedProductIds = [],
  handleProductSelect,
}) {
  return (
    <div>
      <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
        Data Source (Catalog Items)
      </label>
      <select
        value={formData.content_data}
        onChange={(e) => setFormData({ ...formData, content_data: e.target.value })}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        <option className="bg-white dark:bg-[#171717]" value="filter:best_sellers">Best Sellers</option>
        <option className="bg-white dark:bg-[#171717]" value="filter:top_deals">Top Deals & Combos</option>
        <option className="bg-white dark:bg-[#171717]" value="custom_selection">Custom Selection (Select Manually)</option>
        {categories.map((c) => (
          <option className="bg-white dark:bg-[#171717]" key={c.id} value={`category:${c.name}`}>
            Category: {c.name}
          </option>
        ))}
      </select>

      {formData.content_data === 'custom_selection' && (
        <div className="p-3 mt-2 bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 rounded-xl space-y-2 max-h-48 overflow-y-auto">
          <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase block">Check Items to Include:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {menuItems.map((item) => {
              const isSelected = selectedProductIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  onClick={() => handleProductSelect(item.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
                      : 'bg-white dark:bg-neutral-800/80 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="accent-amber-500"
                  />
                  <span className="truncate">{item.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
