import React from "react";
import { FaUtensils, FaArrowRight } from "react-icons/fa";

export default function CategoryView({
  categories = [],
  menuItems = [],
  onSelectCategory,
}) {
  const displayCategories = categories.filter(
    (c) => c !== "All" && c.toLowerCase() !== "add-ons"
  );

  return (
    <div className="w-full space-y-3" style={{ transform: "none", perspective: "none" }}>
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
          Select Menu Category
        </h3>
        <span className="text-xs text-zinc-400">
          {displayCategories.length} Categories
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {displayCategories.map((category) => {
          const categoryItems = menuItems.filter(
            (item) => item.category === category
          );
          const firstImageItem = categoryItems.find((item) => item.img);
          const itemCount = categoryItems.length;

          return (
            <div
              key={category}
              onClick={() => onSelectCategory(category)}
              className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:shadow-amber-500/10 transition-all select-none active:scale-[0.98]"
            >
              <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 mb-3 flex items-center justify-center">
                {firstImageItem?.img ? (
                  <img
                    src={
                      firstImageItem.img.startsWith("http")
                        ? firstImageItem.img
                        : `${import.meta.env.VITE_API_BASE.replace(/\/api$/, "")}/${firstImageItem.img.replace(/^\//, "")}`
                    }
                    alt={category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center text-zinc-400 ${
                    firstImageItem?.img ? "hidden" : "flex"
                  }`}
                >
                  <FaUtensils className="text-3xl opacity-30 group-hover:text-amber-500 transition-colors" />
                </div>

                <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold font-mono text-white">
                  {itemCount} Items
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="m-0 font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors line-clamp-1">
                    {category}
                  </h4>
                  <p className="m-0 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Browse catalog
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 group-hover:bg-amber-500 group-hover:text-neutral-950 text-zinc-400 flex items-center justify-center transition-all shrink-0">
                  <FaArrowRight className="text-xs" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
