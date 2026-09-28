import React from 'react';
import {
  FaTimes as IconTimes,
  FaSpinner as IconSpinner,
  FaSave as IconSave,
} from 'react-icons/fa';
import BannerSlidesEditor from './BannerSlidesEditor';
import ProductSliderConfigForm from './ProductSliderConfigForm';
import HeroSlideConfigForm from './HeroSlideConfigForm';

export default function SectionModal({
  isOpen = false,
  onClose,
  modalType = 'section',
  editId = null,
  formData = {},
  setFormData,
  bannerSlides = [],
  setBannerSlides,
  selectedProductIds = [],
  handleProductSelect,
  categories = [],
  menuItems = [],
  deals = [],
  handleSave,
  isSavingComponent = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="admin-card-surface w-full max-w-lg bg-white dark:bg-[#121216] border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-3xl p-5 sm:p-7 shadow-2xl relative animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
              {editId ? 'Edit' : 'Add'} {modalType === 'hero' ? 'Hero Slide' : 'Homepage Section'}
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-colors"
            onClick={onClose}
          >
            <IconTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {modalType === 'section' && (
            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                Section Type *
              </label>
              <select
                value={formData.section_type}
                onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option className="bg-white dark:bg-[#171717]" value="product_slider">Product Slider</option>
                <option className="bg-white dark:bg-[#171717]" value="banner">Promotional Banner</option>
                <option className="bg-white dark:bg-[#171717]" value="explore_menu">Explore Menu (Categories bubbles)</option>
                <option className="bg-white dark:bg-[#171717]" value="reviews">Customer Reviews & Testimonials</option>
                <option className="bg-white dark:bg-[#171717]" value="hero">Hero Slider Component</option>
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Section Heading *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. TOP DEALS, BEST SELLERS"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {modalType === 'section' && formData.section_type !== 'banner' && (
            <div>
              <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                Button Text / Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. View All Deals"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {modalType === 'hero' && (
            <HeroSlideConfigForm
              formData={formData}
              setFormData={setFormData}
              editId={editId}
              menuItems={menuItems}
              deals={deals}
            />
          )}

          {modalType === 'section' && formData.section_type === 'banner' && (
            <BannerSlidesEditor
              bannerSlides={bannerSlides}
              setBannerSlides={setBannerSlides}
              menuItems={menuItems}
              deals={deals}
            />
          )}

          {modalType === 'section' && formData.section_type === 'product_slider' && (
            <ProductSliderConfigForm
              formData={formData}
              setFormData={setFormData}
              categories={categories}
              menuItems={menuItems}
              selectedProductIds={selectedProductIds}
              handleProductSelect={handleProductSelect}
            />
          )}

          {modalType === 'section' && formData.section_type === 'reviews' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 space-y-2.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-neutral-300 uppercase tracking-wider block">
                Reviews Filter Mode
              </label>
              <select
                value={formData.content_data || 'filter:all'}
                onChange={(e) => setFormData({ ...formData, content_data: e.target.value })}
                className="w-full px-4 py-2.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="filter:all">Show All Approved Reviews</option>
                <option value="filter:featured">Show Featured / Pinned Reviews Only</option>
                <option value="filter:top_rated">Show Top Rated (4★ & 5★ Only)</option>
              </select>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium m-0 leading-relaxed">
                ⭐ <strong>Tip:</strong> Individual reviews can be approved, hidden, or pinned as <strong>Featured</strong> from the <strong>Customer Reviews</strong> tab in the sidebar.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Display Sort Order
            </label>
            <input
              type="number"
              min="1"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingComponent}
              className="btn-brand-cta px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none disabled:opacity-50 active:scale-95"
            >
              {isSavingComponent ? <IconSpinner className="animate-spin text-xs" /> : <IconSave className="text-xs" />}
              <span>Save Component</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
