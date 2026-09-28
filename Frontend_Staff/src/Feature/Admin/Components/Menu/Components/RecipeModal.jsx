import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTimes, FaSpinner } from "react-icons/fa";
import RecipeVariantTabs from "./RecipeVariantTabs";
import RecipeIngredientsMatrix from "./RecipeIngredientsMatrix";

const RecipeModal = ({ isOpen, onClose, menuItem, inventoryItems }) => {
  const [ingredients, setIngredients] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState("");

  useEffect(() => {
    if (isOpen && menuItem) {
      if (menuItem.variants && menuItem.variants.length > 0) {
        setSelectedVariant(menuItem.variants[0].size);
      } else {
        setSelectedVariant("Regular");
      }
    } else {
      setIngredients([]);
      setSelectedVariant("");
    }
  }, [isOpen, menuItem]);

  useEffect(() => {
    if (isOpen && menuItem && selectedVariant) {
      const fetchExistingRecipe = async () => {
        setIsFetching(true);
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE}/get_recipe.php?menu_item_id=${menuItem.id}&variant_name=${selectedVariant}`
          );
          const data = await response.json();

          if (
            response.ok &&
            data.status === "success" &&
            data.ingredients.length > 0
          ) {
            const existingIngredients = data.ingredients.map((ing) => ({
              inventory_id: ing.inventory_id,
              qty: ing.qty,
              is_removable: ing.is_removable == 1,
            }));
            setIngredients(existingIngredients);
          } else {
            setIngredients([
              { inventory_id: "", qty: "", is_removable: false },
            ]);
          }
        } catch (error) {
          console.error("Error fetching recipe:", error);
          setIngredients([{ inventory_id: "", qty: "", is_removable: false }]);
        } finally {
          setIsFetching(false);
        }
      };

      fetchExistingRecipe();
    }
  }, [isOpen, menuItem, selectedVariant]);

  if (!isOpen || !menuItem) return null;

  const addIngredientRow = () => {
    setIngredients([
      ...ingredients,
      { inventory_id: "", qty: "", is_removable: false },
    ]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async () => {
    const validIngredients = ingredients.filter(
      (ing) => ing.inventory_id !== "" && Number(ing.qty) > 0
    );

    if (validIngredients.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "Empty Recipe",
        text: "Please add at least one valid ingredient with quantity greater than 0.",
        background: "#171717",
        color: "#fff",
      });
    }

    const payload = {
      menu_item_id: menuItem.id,
      variant_name: selectedVariant,
      ingredients: validIngredients,
    };

    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/save_recipe.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Recipe Saved!",
          text: `Recipe for ${menuItem.name} (${selectedVariant}) updated successfully.`,
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        onClose();
      } else {
        throw new Error(data.message || "Failed to save recipe");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save recipe.",
        background: "#171717",
        color: "#fff",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-5 z-[99999]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg md:max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl max-h-[88vh] flex flex-col animate-slide-up text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
              <h3 className="m-0 text-base sm:text-lg md:text-xl font-black text-zinc-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
                Inventory Portion Recipe
              </h3>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-1 m-0">
              Product: {menuItem.name}
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={onClose}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Variant Tabs */}
        <RecipeVariantTabs
          variants={menuItem.variants}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
        />

        {/* Ingredients Rows */}
        <div className="flex-1 overflow-y-auto pr-1">
          <RecipeIngredientsMatrix
            ingredients={ingredients}
            inventoryItems={inventoryItems}
            isFetching={isFetching}
            addIngredientRow={addIngredientRow}
            handleIngredientChange={handleIngredientChange}
            removeIngredient={removeIngredient}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer transition-all flex items-center gap-2"
            onClick={handleSaveRecipe}
            disabled={isSaving}
          >
            {isSaving && <FaSpinner className="animate-spin text-xs" />}
            <span>Save Recipe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
