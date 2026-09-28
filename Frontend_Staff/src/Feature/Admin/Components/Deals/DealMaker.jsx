import DealBasicInfoForm from "./Components/DealBasicInfoForm";
import DealItemsSelector from "./Components/DealItemsSelector";
import DealPreviewCard from "./Components/DealPreviewCard";
import { useDealMaker } from "./hooks/useDealMaker";

const DealMaker = ({ editDeal, onSuccess }) => {
  const {
    dealForm,
    setDealForm,
    logoPreview,
    promoBannerPreview,
    isFeaturedBanner,
    setIsFeaturedBanner,
    bannerOrder,
    setBannerOrder,
    isPermanent,
    setIsPermanent,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    dayLimit,
    setDayLimit,
    includedItems,
    handleAddItemRow,
    handleRemoveItemRow,
    handleItemChange,
    handleUpdateItemRow,
    handleQuickSelectMenu,
    menuItems,
    availableAddonCategories,
    selectedAddonCategories,
    toggleAddonCategory,
    handleLogoChange,
    handlePromoBannerChange,
    fileInputRef,
    promoFileInputRef,
    handleSaveDeal,
    isSaving,
    dealPrice,
    origPrice,
    discountPercent,
  } = useDealMaker({ editDeal, onSuccess });

  return (
    <div className="space-y-6 animate-slide-up pb-8">
      {/* 2-Column Master Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: FORM BUILDER & COMBO REPEATER */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Deal Information */}
          <DealBasicInfoForm
            dealForm={dealForm}
            setDealForm={setDealForm}
            discountPercent={discountPercent}
            dealPrice={dealPrice}
            origPrice={origPrice}
            fileInputRef={fileInputRef}
            handleLogoChange={handleLogoChange}
            logoPreview={logoPreview}
            isPermanent={isPermanent}
            setIsPermanent={setIsPermanent}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            dayLimit={dayLimit}
            setDayLimit={setDayLimit}
            isFeaturedBanner={isFeaturedBanner}
            setIsFeaturedBanner={setIsFeaturedBanner}
            promoFileInputRef={promoFileInputRef}
            handlePromoBannerChange={handlePromoBannerChange}
            promoBannerPreview={promoBannerPreview}
            bannerOrder={bannerOrder}
            setBannerOrder={setBannerOrder}
          />

          {/* Cards 2 & 3: Bundled Items, Addon Categories, and Submit Bar */}
          <DealItemsSelector
            includedItems={includedItems}
            handleAddItemRow={handleAddItemRow}
            handleRemoveItemRow={handleRemoveItemRow}
            handleItemChange={handleItemChange}
            handleUpdateItemRow={handleUpdateItemRow}
            handleQuickSelectMenu={handleQuickSelectMenu}
            menuItems={menuItems}
            availableAddonCategories={availableAddonCategories}
            selectedAddonCategories={selectedAddonCategories}
            toggleAddonCategory={toggleAddonCategory}
            handleSaveDeal={handleSaveDeal}
            isSaving={isSaving}
            editDeal={editDeal}
          />
        </div>

        {/* RIGHT COLUMN: STICKY LIVE CUSTOMER CARD PREVIEW */}
        <DealPreviewCard
          logoPreview={logoPreview}
          dealForm={dealForm}
          discountPercent={discountPercent}
          dealPrice={dealPrice}
          origPrice={origPrice}
          isPermanent={isPermanent}
          startTime={startTime}
          endTime={endTime}
          dayLimit={dayLimit}
          includedItems={includedItems}
        />
      </div>
    </div>
  );
};

export default DealMaker;
