import React from "react";
import {
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import MenuSearchFilterBar from "./Components/MenuSearchFilterBar";
import MenuCategoryTabs from "./Components/MenuCategoryTabs";
import MenuModal from "./Components/MenuModal";
import CategoryModal from "./Components/CategoryModal";
import MenuTable from "./Components/MenuTable";
import RecipeModal from "./Components/RecipeModal";
import AddonModal from "./Components/AddonModal";
import AddonGroupsManager from "./AddonGroupsManager";

import { useMenuManager } from "./hooks/useMenuManager";

const MenuManager = () => {
  const {
    activeTab,
    setActiveTab,
    isRecipeModalOpen,
    setIsRecipeModalOpen,
    selectedMenuForRecipe,
    setSelectedMenuForRecipe,
    isAddonModalOpen,
    setIsAddonModalOpen,
    selectedItemForAddons,
    toast,
    confirmDialog,
    setConfirmDialog,
    isMenuModalOpen,
    setIsMenuModalOpen,
    editingItem,
    setEditingItem,
    defaultMenuForm,
    menuForm,
    setMenuForm,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    defaultCategoryForm,
    categoryForm,
    setCategoryForm,
    menuItems,
    categories,
    inventoryItems,
    customSliders,
    handleOpenAddons,
    handleSaveMenu,
    triggerDeleteMenu,
    handleSaveCategory,
    triggerDeleteCategory,
    handleConfirmAction,
    handleEditItem,
    isSavingItem,
  } = useMenuManager();

  return (
    <div>
      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-[rgba(0,0,0,0.6)] backdrop-blur-[6px] flex justify-center items-center z-[99999999]">
          <div className="w-[90%] max-w-[400px] bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-[16px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-slide-up text-center">
            <div className="bg-[rgba(239,68,68,0.03)] p-[30px_20px_20px] border-b border-[var(--admin-border)] relative">
              <div className="w-[65px] h-[65px] bg-[rgba(239,68,68,0.1)] text-[var(--admin-orange)] rounded-full flex justify-center items-center text-[26px] mx-auto mb-[15px] shadow-[var(--shadow-glow)] border border-[rgba(239,68,68,0.2)]">
                <FaTrash />
              </div>
              <h3 className="m-0 text-[22px] font-black text-[var(--admin-text)]">
                {confirmDialog.title}
              </h3>
              <p className="mt-[5px] text-[13px] text-[var(--admin-muted)] font-semibold">
                {confirmDialog.message}
              </p>
            </div>
            <div className="p-[15px_25px] bg-[rgba(0,0,0,0.1)] flex gap-[12px]">
              <button
                type="button"
                className="flex-1 p-[14px] bg-transparent border border-[var(--admin-border)] text-[var(--admin-muted)] rounded-[10px] font-bold cursor-pointer transition-colors duration-200 hover:text-[var(--admin-text)] hover:border-[var(--admin-text)]"
                onClick={() =>
                  setConfirmDialog({ ...confirmDialog, show: false })
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-[2] p-[14px] bg-[var(--admin-orange)] border-none text-white rounded-[10px] font-black text-[15px] flex justify-center items-center gap-[8px] cursor-pointer shadow-[var(--shadow-glow)] transition-transform duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-glow)]"
                onClick={handleConfirmAction}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & View Switcher */}
      <MenuSearchFilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddProduct={() => {
          setEditingItem(null);
          setMenuForm(defaultMenuForm);
          setIsMenuModalOpen(true);
        }}
      />

      {/* Main Content Body */}
      {activeTab === "items" ? (
        <MenuTable
          menuItems={menuItems}
          categories={categories}
          onEdit={handleEditItem}
          onDelete={triggerDeleteMenu}
          onAddOns={handleOpenAddons}
          onSetRecipe={(item) => {
            setSelectedMenuForRecipe(item);
            setIsRecipeModalOpen(true);
          }}
        />
      ) : activeTab === "addongroups" ? (
        <AddonGroupsManager />
      ) : (
        <MenuCategoryTabs
          categories={categories}
          menuItems={menuItems}
          onAddCategory={() => {
            setEditingCategory(null);
            setCategoryForm(defaultCategoryForm);
            setIsCategoryModalOpen(true);
          }}
          onEditCategory={(cat) => {
            setEditingCategory(cat);
            setCategoryForm({
              name: cat.name,
              img: cat.img,
              show_on_hero: Boolean(cat.show_on_hero === 1 || cat.show_on_hero === "1" || cat.show_on_hero === true),
            });
            setIsCategoryModalOpen(true);
          }}
          onDeleteCategory={triggerDeleteCategory}
        />
      )}

      {/* Modals */}
      <MenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        editingItem={editingItem}
        menuForm={menuForm}
        setMenuForm={setMenuForm}
        onSave={handleSaveMenu}
        categories={categories}
        customSliders={customSliders}
        isSaving={isSavingItem}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        editingCategory={editingCategory}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        onSave={handleSaveCategory}
      />

      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        menuItem={selectedMenuForRecipe}
        inventoryItems={inventoryItems}
      />

      <AddonModal
        isOpen={isAddonModalOpen}
        onClose={() => setIsAddonModalOpen(false)}
        menuItem={selectedItemForAddons}
        inventoryItems={inventoryItems}
      />

      {/* Floating Toast Feedback (Positioned at bottom of DOM with highest z-index) */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-[99999999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up select-none border pointer-events-auto ${
            toast.type === "success"
              ? "bg-white dark:bg-[#18181b] border-emerald-500/40 dark:border-emerald-500/40 text-slate-900 dark:text-white shadow-emerald-500/10 dark:shadow-black/60"
              : "bg-white dark:bg-[#18181b] border-rose-500/40 dark:border-rose-500/40 text-slate-900 dark:text-white shadow-rose-500/10 dark:shadow-black/60"
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30"
                : "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30"
            }`}
          >
            {toast.type === "success" ? (
              <FaCheckCircle className="text-base text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FaExclamationCircle className="text-base text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div className="flex flex-col pr-1">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                toast.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {toast.type === "success" ? "Success" : "Error"}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;
