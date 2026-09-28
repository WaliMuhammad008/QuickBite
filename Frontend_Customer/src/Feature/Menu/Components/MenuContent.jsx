import React from "react";
import ProductCard from "../../../Components/UI/ProductCard";

const MenuContent = ({ searchTerm, searchResults, categories, menuItems, isExpanded }) => {
  const titleClasses =
    "font-['Oswald',sans-serif] text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-wide mb-6 flex items-center before:content-[''] before:inline-block before:w-1.5 before:h-7 before:bg-red-600 before:mr-3.5 before:rounded-sm before:shadow-[0_0_10px_rgba(239,68,68,0.4)]";

  // Dynamically adjust grid columns (2-column baseline on mobile):
  // With Sidebar (isExpanded === false): 2 cols on mobile/tablet -> 3 cols on desktop
  // Without Sidebar (isExpanded === true): 2 cols on mobile/tablet -> 3 cols on md -> 4 cols on lg
  const gridClasses = isExpanded
    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4.5 xl:gap-6 w-full transition-all duration-300"
    : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-4.5 xl:gap-6 w-full transition-all duration-300";

  if (searchTerm) {
    return (
      <div className="mb-12 animate-[fadeIn_0.5s_ease-in-out]">
        <h3 className={titleClasses}>
          Results for: <span className="text-red-600 ml-2">"{searchTerm}"</span>
        </h3>
        {searchResults && searchResults.length > 0 ? (
          <div className={gridClasses}>
            {searchResults.map((item, idx) => (
              <div id={`product-${item.name || item.id || idx}`} key={item.id || item.name || idx} className="w-full">
                <ProductCard
                  item={item}
                  image={item.img || item.image}
                  title={item.name || item.title}
                  description={item.description}
                  price={item.price}
                  isTopDeal={item.isTopDeal}
                  isBestSeller={item.isBestSeller}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-16 px-4 bg-white dark:bg-[#18181b] rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 shadow-sm">
            <h4 className="mb-1 text-gray-900 dark:text-white text-lg font-bold">No food found.</h4>
            <p className="text-sm">Try searching for something else.</p>
          </div>
        )}
      </div>
    );
  }

  if (!Array.isArray(categories)) return null;

  return categories.map((cat, idx) => {
    const catName = typeof cat === "string" ? cat : cat?.name || "";
    const catKey = typeof cat === "string" ? cat : cat?.id || cat?.name || `cat-${idx}`;
    if (!catName) return null;

    const items = (menuItems || []).filter(
      (i) => (i.category || "").toLowerCase() === catName.toLowerCase()
    );
    if (items.length === 0) return null;

    return (
      <div key={catKey} id={catName} className="mb-12 animate-[fadeIn_0.5s_ease-in-out]">
        <h3 className={titleClasses}>{catName}</h3>
        <div className={gridClasses}>
          {items.map((item, itemIdx) => (
            <div id={`product-${item.name || item.id || itemIdx}`} key={item.id || item.name || itemIdx} className="w-full">
              <ProductCard
                item={item}
                image={item.img || item.image}
                title={item.name || item.title}
                description={item.description}
                price={item.price}
                isTopDeal={item.isTopDeal}
                isBestSeller={item.isBestSeller}
              />
            </div>
          ))}
        </div>
      </div>
    );
  });
};

export default MenuContent;