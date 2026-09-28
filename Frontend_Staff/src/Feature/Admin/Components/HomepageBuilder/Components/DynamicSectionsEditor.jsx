import React from 'react';
import {
  FaListUl as IconListUl,
  FaPlus as IconPlus,
  FaEdit as IconEdit,
  FaTrash as IconTrash,
} from 'react-icons/fa';

export default function DynamicSectionsEditor({
  sections = [],
  openModal,
  handleToggleStatus,
  handleEdit,
  handleDelete,
}) {
  return (
    <div className="admin-card-surface bg-white dark:bg-[#121216] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <IconListUl className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Homepage Dynamic Sections
          </h3>
        </div>
        <button
          type="button"
          onClick={() => openModal('section')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md shadow-amber-500/20 border-none"
        >
          <IconPlus className="text-xs" />
          <span>Add Section</span>
        </button>
      </div>

      <div className="space-y-3">
        {sections.map((sec) => {
          const isSecActive = sec.is_active === undefined || Number(sec.is_active) === 1;
          return (
            <div
              key={sec.id}
              className={`admin-card-surface bg-slate-50 dark:bg-[#16161a] p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                isSecActive ? 'border-slate-200 dark:border-neutral-800' : 'border-slate-200 dark:border-neutral-800/60 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-black text-xs shrink-0 font-mono">
                  {sec.sort_order}
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                    {sec.title || sec.section_type.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-semibold block">
                    Type: {sec.section_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(sec.id, 'section', isSecActive ? 1 : 0)}
                  className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                    isSecActive
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isSecActive ? 'Active' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(sec, 'section')}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800/80 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Edit Section"
                >
                  <IconEdit className="text-xs" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(sec.id, 'section')}
                  className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 dark:text-red-400 hover:text-white border border-red-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                  title="Delete Section"
                >
                  <IconTrash className="text-xs" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
