import React from 'react';
import { FaTrash as IconTrash } from 'react-icons/fa';
import LinkTargetSelector from './LinkTargetSelector';
import { compressImage, resolveImageUrl } from '../../../../../utils/imageOptimizer';

export default function BannerSlidesEditor({
  bannerSlides = [],
  setBannerSlides,
  menuItems = [],
  deals = [],
}) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-neutral-900/60 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-3">
      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-neutral-800">
        <h4 className="text-xs font-bold uppercase text-slate-900 dark:text-white m-0">Banner Slides</h4>
        <button
          type="button"
          onClick={() => setBannerSlides([...bannerSlides, { title: '', subtitle: '', link_url: '', file: null, image_url: '' }])}
          className="btn-brand-cta px-3 py-1 text-[10px] uppercase tracking-wider cursor-pointer border-none"
        >
          + Add Slide
        </button>
      </div>

      {bannerSlides.map((slide, index) => (
        <div key={index} className="p-3 bg-white dark:bg-[#16161a] rounded-xl border border-slate-200 dark:border-neutral-800 space-y-2 relative shadow-sm">
          {bannerSlides.length > 1 && (
            <button
              type="button"
              onClick={() => {
                const newSlides = [...bannerSlides];
                newSlides.splice(index, 1);
                setBannerSlides(newSlides);
              }}
              className="absolute top-2 right-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer bg-transparent border-none"
            >
              <IconTrash className="text-xs" />
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">Slide Title</label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => {
                  const newSlides = [...bannerSlides];
                  newSlides[index].title = e.target.value;
                  setBannerSlides(newSlides);
                }}
                className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">Slide Subtitle</label>
              <input
                type="text"
                value={slide.subtitle}
                onChange={(e) => {
                  const newSlides = [...bannerSlides];
                  newSlides[index].subtitle = e.target.value;
                  setBannerSlides(newSlides);
                }}
                className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block mb-1">Target Action</label>
              <LinkTargetSelector
                value={slide.link_url}
                onChange={(val) => {
                  const newSlides = [...bannerSlides];
                  newSlides[index].link_url = val;
                  setBannerSlides(newSlides);
                }}
                isSmall={true}
                menuItems={menuItems}
                deals={deals}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-600 dark:text-neutral-400 block">Upload Slide Banner Image</label>
                <span className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold">⚡ Auto-compressed for fast upload</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const rawFile = e.target.files[0];
                  if (!rawFile) return;

                  const previewUrl = URL.createObjectURL(rawFile);
                  const updatedSlides = [...bannerSlides];
                  updatedSlides[index] = {
                    ...updatedSlides[index],
                    previewUrl,
                    isOptimizing: true,
                  };
                  setBannerSlides(updatedSlides);

                  try {
                    const optimizedFile = await compressImage(rawFile, {
                      maxWidth: 1920,
                      maxHeight: 1080,
                      quality: 0.82,
                    });
                    setBannerSlides((prev) => {
                      const next = [...prev];
                      if (next[index]) {
                        next[index] = {
                          ...next[index],
                          file: optimizedFile,
                          isOptimizing: false,
                          optimizedSizeKb: Math.round(optimizedFile.size / 1024),
                          originalSizeKb: Math.round(rawFile.size / 1024),
                        };
                      }
                      return next;
                    });
                  } catch (err) {
                    setBannerSlides((prev) => {
                      const next = [...prev];
                      if (next[index]) {
                        next[index] = {
                          ...next[index],
                          file: rawFile,
                          isOptimizing: false,
                        };
                      }
                      return next;
                    });
                  }
                }}
                required={!slide.image_url && !slide.file}
                className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-lg text-xs"
              />

              {(slide.previewUrl || slide.image_url) && (
                <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-800">
                  <img
                    src={slide.previewUrl || resolveImageUrl(slide.image_url, 200)}
                    alt="Preview"
                    className="w-16 h-10 object-cover rounded border border-slate-300 dark:border-neutral-700 shrink-0"
                  />
                  <div className="text-[11px] min-w-0 flex-1">
                    {slide.isOptimizing ? (
                      <span className="text-amber-500 font-bold animate-pulse">⚡ Optimizing image in background...</span>
                    ) : slide.optimizedSizeKb ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Ready for instant upload</span>
                        <span className="text-[10px] text-slate-500 dark:text-neutral-400">
                          ({slide.optimizedSizeKb} KB
                          {slide.originalSizeKb > slide.optimizedSizeKb &&
                            ` - saved ${Math.round((1 - slide.optimizedSizeKb / slide.originalSizeKb) * 100)}%`}
                          )
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 dark:text-neutral-400">Active image configured</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
