import React from 'react';
import LinkTargetSelector from './LinkTargetSelector';
import { compressImage, resolveImageUrl } from '../../../../../utils/imageOptimizer';

export default function HeroSlideConfigForm({
  formData = {},
  setFormData,
  editId = null,
  menuItems = [],
  deals = [],
}) {
  return (
    <>
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Subtitle / Tagline
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="e.g. Hot & Fresh Pizza Bundles"
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block">
            Banner Image {editId && <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-normal">(Leave blank to keep existing)</span>}
          </label>
          <span className="text-amber-600 dark:text-amber-400 text-[10px] font-semibold">⚡ Auto-compressed for fast upload</span>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const rawFile = e.target.files[0];
            if (!rawFile) return;

            const previewUrl = URL.createObjectURL(rawFile);
            setFormData((prev) => ({
              ...prev,
              previewUrl,
              isOptimizing: true,
            }));

            try {
              const optimizedFile = await compressImage(rawFile, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.82,
              });
              setFormData((prev) => ({
                ...prev,
                file: optimizedFile,
                isOptimizing: false,
                optimizedSizeKb: Math.round(optimizedFile.size / 1024),
                originalSizeKb: Math.round(rawFile.size / 1024),
              }));
            } catch (err) {
              setFormData((prev) => ({
                ...prev,
                file: rawFile,
                isOptimizing: false,
              }));
            }
          }}
          required={!editId && !formData.file && !formData.image_url}
          className="w-full p-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs"
        />

        {(formData.previewUrl || formData.image_url) && (
          <div className="flex items-center gap-3 p-2 bg-slate-100 dark:bg-neutral-900 rounded-lg border border-slate-200 dark:border-neutral-800">
            <img
              src={formData.previewUrl || resolveImageUrl(formData.image_url, 200)}
              alt="Preview"
              className="w-16 h-10 object-cover rounded border border-slate-300 dark:border-neutral-700 shrink-0"
            />
            <div className="text-[11px] min-w-0 flex-1">
              {formData.isOptimizing ? (
                <span className="text-amber-500 font-bold animate-pulse">⚡ Optimizing image in background...</span>
              ) : formData.optimizedSizeKb ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Ready for instant upload</span>
                  <span className="text-[10px] text-slate-500 dark:text-neutral-400">
                    ({formData.optimizedSizeKb} KB
                    {formData.originalSizeKb > formData.optimizedSizeKb &&
                      ` - saved ${Math.round((1 - formData.optimizedSizeKb / formData.originalSizeKb) * 100)}%`}
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

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Link / Target Action
        </label>
        <LinkTargetSelector
          value={formData.link_url}
          onChange={(val) => setFormData({ ...formData, link_url: val })}
          menuItems={menuItems}
          deals={deals}
        />
      </div>
    </>
  );
}
