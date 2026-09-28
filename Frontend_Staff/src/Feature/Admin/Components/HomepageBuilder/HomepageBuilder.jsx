import React from 'react';
import FooterSettings from '../Settings/Components/Footer/FooterSettings';

// Subcomponents
import HeroTextSettings from './Components/HeroTextSettings';
import HeroSlidesEditor from './Components/HeroSlidesEditor';
import PromoBannersEditor from './Components/PromoBannersEditor';
import DynamicSectionsEditor from './Components/DynamicSectionsEditor';
import SectionModal from './Components/SectionModal';

// Custom Hook
import { useHomepageBuilder } from './hooks/useHomepageBuilder';

const HomepageBuilder = () => {
  const {
    heroSlides,
    sections,
    isLoading,
    masterBanners,
    handleToggleMasterBanner,
    handleUpdateMasterBannerOrder,
    handleToggleStatus,
    handleEdit,
    handleDelete,
    openModal,
    isModalOpen,
    setIsModalOpen,
    modalType,
    editId,
    formData,
    setFormData,
    bannerSlides,
    setBannerSlides,
    selectedProductIds,
    handleProductSelect,
    categories,
    menuItems,
    deals,
    handleSave,
    isSavingComponent,
  } = useHomepageBuilder();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Homepage Layout & Dynamic Content Builder
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Customize hero banners, promotional sliders, deal carousels, and footer brand identity.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
          Loading Dynamic Homepage Layout...
        </div>
      )}

      {/* 1. Hero Static Content Settings */}
      {/* <HeroTextSettings /> */}

      {/* 2. Hero Carousel Slides */}
      <HeroSlidesEditor
        heroSlides={heroSlides}
        openModal={openModal}
        handleToggleStatus={handleToggleStatus}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* 4. Homepage Promo Banners Master Control */}
      {/* <PromoBannersEditor
        masterBanners={masterBanners}
        handleUpdateMasterBannerOrder={handleUpdateMasterBannerOrder}
        handleToggleMasterBanner={handleToggleMasterBanner}
      /> */}

      {/* 5. Dynamic Homepage Sections */}
      <DynamicSectionsEditor
        sections={sections}
        openModal={openModal}
        handleToggleStatus={handleToggleStatus}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* 6. Footer Settings Integration */}
      <FooterSettings />

      {/* ADD / EDIT COMPONENT MODAL */}
      <SectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalType={modalType}
        editId={editId}
        formData={formData}
        setFormData={setFormData}
        bannerSlides={bannerSlides}
        setBannerSlides={setBannerSlides}
        selectedProductIds={selectedProductIds}
        handleProductSelect={handleProductSelect}
        categories={categories}
        menuItems={menuItems}
        deals={deals}
        handleSave={handleSave}
        isSavingComponent={isSavingComponent}
      />
    </div>
  );
};

export default HomepageBuilder;
