import React from 'react';
import {
  FaPlus as IconPlus,
  FaImage as IconImage,
  FaEdit as IconEdit,
  FaTrash as IconTrash,
} from 'react-icons/fa';

export default function HeroSlidesEditor({
  heroSlides = [],
  openModal,
  handleToggleStatus,
  handleEdit,
  handleDelete,
}) {
  return (
    <div className="admin-card-surface bg-white dark:bg-[#121216] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <IconImage className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Hero Carousel Slides 
          </h3>
        </div>
        <button
          type="button"
          onClick={() => openModal('hero')}
          className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none active:scale-95"
        >
          <IconPlus className="text-xs" />
          <span>Add Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heroSlides.map((slide) => {
          const isSlideActive = slide.is_active === undefined || Number(slide.is_active) === 1;
          return (
            <div
              key={slide.id}
              className={`admin-card-surface bg-slate-50 dark:bg-[#16161a] p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 text-slate-900 dark:text-white ${
                isSlideActive ? 'border-slate-200 dark:border-neutral-800' : 'border-slate-200 dark:border-neutral-800/60 opacity-50'
              }`}
            >
              <div className="aspect-[21/9] w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-black/60 border border-slate-200 dark:border-neutral-800 relative">
                <img
                  src={slide.image_url}
                  alt={slide.title || 'Slide'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/800x350?text=Hero+Slide';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-400 border border-white/10 text-[10px] font-black font-mono">
                  Order #{slide.sort_order}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-neutral-800">
                <div className="min-w-0 pr-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                    {slide.title || 'Untitled Slide'}
                  </span>
                  {slide.subtitle && (
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 block truncate">
                      {slide.subtitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(slide.id, 'hero', isSlideActive ? 1 : 0)}
                    className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                      isSlideActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isSlideActive ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(slide, 'hero')}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800/80 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Edit Slide"
                  >
                    <IconEdit className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(slide.id, 'hero')}
                    className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 dark:text-red-400 hover:text-white border border-red-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Delete Slide"
                  >
                    <IconTrash className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
