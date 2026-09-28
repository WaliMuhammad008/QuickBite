import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaArrowLeft, FaSearch, FaUtensils } from "react-icons/fa";
import ProductCard from "../../../Components/UI/ProductCard";
import { API_BASE } from "../../../config/api";

const CategoryItemPage = () => {
  const { categoryName } = useParams();
  const decodedCat = decodeURIComponent(categoryName || "All");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // --- FETCH MENU ITEMS VIA REACT QUERY ---
  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/get_menu.php`
      );
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
  });

  // --- FILTERING LOGIC ---
  const categoryItems = useMemo(() => {
    if (decodedCat === "All") return menuItems;
    return menuItems.filter(
      (item) => item.category?.toLowerCase() === decodedCat.toLowerCase()
    );
  }, [menuItems, decodedCat]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return categoryItems;
    const term = searchTerm.toLowerCase();
    return categoryItems.filter(
      (item) =>
        (item.name || item.title || "").toLowerCase().includes(term) ||
        (item.description || "").toLowerCase().includes(term)
    );
  }, [categoryItems, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-neutral-900 dark:text-white transition-colors duration-300 font-sans pb-24">
      {/* ═════════════════════════════════════════════════════════
          1. CATEGORY HERO HEADER WITH 3D ACCENTS
      ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-6 pb-6 sm:pt-10 sm:pb-10 border-b border-gray-200/80 dark:border-neutral-800/80 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5">
        {/* Glow Accent */}
        <div className="absolute top-0 right-1/3 w-[350px] sm:w-[400px] h-[200px] sm:h-[250px] bg-amber-400/15 dark:bg-amber-400/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-3">
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-amber-500 dark:text-neutral-400 dark:hover:text-amber-400 transition-colors no-underline"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Full Menu</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            {/* Title & Count */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-1.5">
                <FaUtensils className="text-[10px]" />
                <span>{decodedCat === "All" ? "Full Collection" : "Category Showcase"}</span>
              </div>
              <h1 className="font-['Oswald',sans-serif] font-black text-2xl sm:text-4xl md:text-5xl tracking-tight text-neutral-950 dark:text-white uppercase leading-none m-0">
                {decodedCat === "All" ? "FULL" : decodedCat}{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  MENU
                </span>
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm md:text-base max-w-lg mt-1.5 font-medium">
                {categoryItems.length} delicious item{categoryItems.length !== 1 ? "s" : ""} freshly prepared with premium quality ingredients.
              </p>
            </div>

            {/* Quick In-Category Search */}
            <div className="w-full md:w-72 lg:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${decodedCat}...`}
                  className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs transition-all font-medium"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-neutral-500 text-xs pointer-events-none" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white bg-transparent border-none cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════
          2. PRODUCT GRID SECTION
      ═════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-64 sm:h-80 rounded-2xl sm:rounded-3xl bg-gray-200 dark:bg-neutral-800/60 animate-pulse border border-gray-200 dark:border-neutral-800"
              />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {filteredItems.map((item, idx) => (
              <div key={item.id || idx} className="w-full">
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
          /* Empty State */
          <div className="text-center py-16 sm:py-20 px-4 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-gray-300 dark:border-neutral-800 shadow-sm max-w-lg mx-auto">
            <FaUtensils className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 dark:text-neutral-700 mb-3" />
            <h3 className="font-['Oswald',sans-serif] text-xl sm:text-2xl font-bold text-gray-900 dark:text-white uppercase mb-2">
              No items found
            </h3>
            <p className="text-gray-500 dark:text-neutral-400 text-xs sm:text-sm mb-5">
              {searchTerm
                ? `We couldn't find anything matching "${searchTerm}" in ${decodedCat}.`
                : `There are currently no active items listed under "${decodedCat}".`}
            </p>
            <div className="flex justify-center gap-3">
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer border-none"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/menu")}
                  className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-['Oswald',sans-serif] font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer border-none"
                >
                  Browse Full Menu
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryItemPage;
