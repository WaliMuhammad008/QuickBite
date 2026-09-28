import React from "react";
import AddonGroupCard from "./Components/AddonGroupCard";
import AddonMappingModal from "./Components/AddonMappingModal";
import AddonModal from "./Components/AddonModal";
import ProductAddonsDirectory from "./Components/ProductAddonsDirectory";
import { useAddonGroupsManager } from "./hooks/useAddonGroupsManager";
import { FaPlus, FaLayerGroup, FaHamburger } from "react-icons/fa";

const AddonGroupsManager = () => {
  const {
    mappings,
    productAddonsList,
    categories,
    menuItems,
    inventoryItems,
    loading,
    isModalOpen,
    setIsModalOpen,
    isSaving,
    currentMapping,
    setCurrentMapping,
    isEditing,
    openModal,
    isProductAddonModalOpen,
    setIsProductAddonModalOpen,
    selectedProductForAddons,
    openProductAddonModal,
    handleAddAddon,
    handleAddonChange,
    handleRemoveAddon,
    handleSave,
    handleDelete,
    refreshData,
  } = useAddonGroupsManager();

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-full overflow-x-hidden">
      {/* ═══ TOP CONSOLIDATED HEADER BAR ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-6 bg-amber-500 rounded-full shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide m-0">
              Addon Groups & Custom Modifiers
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-neutral-400 text-xs sm:text-sm mt-1 m-0">
            Unified management for Category-Level Upsells (Drinks, Dips, Sides) and Product-Level Custom Add-ons.
          </p>
        </div>

        {/* 2 Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => openProductAddonModal(null)}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-xs active:scale-95"
          >
            <FaHamburger className="text-amber-500 text-xs shrink-0" />
            <span>+ Manage Product Add-ons</span>
          </button>

          <button
            type="button"
            onClick={() => openModal()}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-amber-500/20 active:scale-95 border-none"
          >
            <FaPlus className="text-xs shrink-0" />
            <span>+ Add Category Mapping</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-500 dark:text-neutral-400 text-sm font-semibold">
          Loading add-on ecosystem data from database...
        </div>
      ) : (
        <>
          {/* ═══ SECTION A: CATEGORY ADDON MAPPINGS ═══ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <span className="w-1.5 h-4 bg-amber-500 rounded-full shrink-0" />
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
                Category Add-on Mappings
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-neutral-400 m-0">
              Live category-to-category associations (e.g. Burgers show Drinks, Fries & Dips).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
              {mappings.map((mapGroup) => (
                <AddonGroupCard
                  key={mapGroup.target_category}
                  mapGroup={mapGroup}
                  openModal={openModal}
                  handleDelete={handleDelete}
                />
              ))}
              {mappings.length === 0 && (
                <div className="col-span-full text-center py-10 text-zinc-500 dark:text-neutral-400 bg-zinc-50 dark:bg-neutral-900 rounded-2xl border border-dashed border-zinc-300 dark:border-neutral-800 text-xs">
                  No category mappings found. Click "+ Add Category Mapping" to configure one.
                </div>
              )}
            </div>
          </div>

          {/* ═══ SECTION B: PRODUCT-SPECIFIC CUSTOM ADDONS DIRECTORY ═══ */}
          <ProductAddonsDirectory
            productAddonsList={productAddonsList}
            categories={categories}
            onEditProductAddons={openProductAddonModal}
            onRefresh={refreshData}
          />
        </>
      )}

      {/* Modal 1: Category Mapping Modal */}
      <AddonMappingModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isEditing={isEditing}
        currentMapping={currentMapping}
        setCurrentMapping={setCurrentMapping}
        categories={categories}
        handleAddAddon={handleAddAddon}
        handleAddonChange={handleAddonChange}
        handleRemoveAddon={handleRemoveAddon}
        handleSave={handleSave}
        isSaving={isSaving}
      />

      {/* Modal 2: Product Custom Addons Modal */}
      <AddonModal
        isOpen={isProductAddonModalOpen}
        onClose={() => setIsProductAddonModalOpen(false)}
        menuItem={selectedProductForAddons}
        menuItems={menuItems}
        inventoryItems={inventoryItems}
        onSaved={refreshData}
      />
    </div>
  );
};

export default AddonGroupsManager;
