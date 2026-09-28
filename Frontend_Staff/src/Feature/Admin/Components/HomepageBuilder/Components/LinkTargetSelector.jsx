import React from 'react';

export default function LinkTargetSelector({
  value,
  onChange,
  isSmall = false,
  menuItems = [],
  deals = [],
}) {
  const parseLink = (url) => {
    if (url?.startsWith('product:')) return { type: 'product', id: url.split(':')[1] };
    if (url?.startsWith('deal:')) return { type: 'deal', id: url.split(':')[1] };
    return { type: 'url', value: url || '' };
  };

  const buildLink = (type, val) => {
    if (type === 'product') return `product:${val}`;
    if (type === 'deal') return `deal:${val}`;
    return val;
  };

  const parsed = parseLink(value);

  return (
    <div className={`flex gap-2 ${isSmall ? 'mt-1' : 'mt-1.5'}`}>
      <select
        value={parsed.type}
        onChange={(e) => onChange(buildLink(e.target.value, ''))}
        className="p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
      >
        <option className="bg-white dark:bg-[#171717]" value="url">Standard URL</option>
        <option className="bg-white dark:bg-[#171717]" value="product">Link to Product</option>
        <option className="bg-white dark:bg-[#171717]" value="deal">Link to Deal</option>
      </select>

      {parsed.type === 'url' && (
        <input
          type="text"
          placeholder="/menu"
          value={parsed.value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
        />
      )}

      {parsed.type === 'product' && (
        <select
          value={parsed.id || ''}
          onChange={(e) => onChange(buildLink('product', e.target.value))}
          className="flex-1 p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option className="bg-white dark:bg-[#171717]" value="">Select a Product...</option>
          {menuItems.map((item) => (
            <option className="bg-white dark:bg-[#171717]" key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      )}

      {parsed.type === 'deal' && (
        <select
          value={parsed.id || ''}
          onChange={(e) => onChange(buildLink('deal', e.target.value))}
          className="flex-1 p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option className="bg-white dark:bg-[#171717]" value="">Select a Deal...</option>
          {deals.map((deal) => (
            <option className="bg-white dark:bg-[#171717]" key={deal.id} value={deal.id}>
              {deal.title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
