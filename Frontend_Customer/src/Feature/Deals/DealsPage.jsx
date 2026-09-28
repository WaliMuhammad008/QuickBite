import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DealsSidebar from "./Components/DealsSidebar";
import DealsHeroBanner from "./Components/DealsHeroBanner";
import DealsGridList from "./Components/DealsGridList";
import { API_BASE } from "../../config/api";

const DealsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All Deals");
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch Deals & Combos via React Query
  const { data: combosData = [], isLoading: isCombosLoading } = useQuery({
    queryKey: ["active_deals"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/get_active_deals.php`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data.map((deal) => ({
          id: `deal-${deal.id}`,
          deal_id: deal.id,
          name: deal.title || deal.name,
          title: deal.title || deal.name,
          price: parseFloat(deal.price),
          original_price: deal.original_price
            ? parseFloat(deal.original_price)
            : null,
          badge_tag: deal.badge_tag || deal.tag || "HOT DEAL",
          tag: deal.badge_tag || deal.tag || "HOT DEAL",
          img: deal.img || deal.image,
          image: deal.img || deal.image,
          is_deal: true,
          isTopDeal: true,
          isBestSeller: true,
          items: deal.items || [],
          items_description: deal.items_description,
          description:
            deal.items_description ||
            deal.description ||
            "Exclusive combo deal packed with your favorites.",
          is_permanent: deal.is_permanent == 1 || deal.is_permanent === true,
          start_time: deal.start_time,
          end_time: deal.end_time,
          is_time_active: deal.is_time_active !== false && deal.isTimeActive !== false,
          time_window_text: deal.time_window_text || "",
          isAvailable: deal.isAvailable !== false,
          inStock: deal.inStock !== false && deal.inStock !== 0 && deal.inStock !== "0",
        }));
      }
      return [];
    },
  });

  // Fetch Menu Items (Optional Fallback for items flagged as top deal)
  const { data: menuData = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const isLoading = isMenuLoading || isCombosLoading;

  // Combine & Normalize Deals
  const allDeals = useMemo(() => {
    const menuTopDeals = menuData
      .filter((item) => item.isTopDeal === true)
      .map((item) => ({
        ...item,
        is_deal: true,
        badge_tag: item.tag || "SPECIAL DEAL",
        items_description: item.description || item.name,
      }));

    return [...combosData, ...menuTopDeals];
  }, [combosData, menuData]);

  // Dynamically extract unique badge categories from active deals
  const dynamicCategories = useMemo(() => {
    const set = new Set(["All Deals"]);
    allDeals.forEach((deal) => {
      const tag = deal.badge_tag || deal.tag;
      if (tag && typeof tag === "string" && tag.trim()) {
        set.add(tag.trim().toUpperCase());
      }
    });
    return Array.from(set);
  }, [allDeals]);

  // Helper category matcher
  const matchesCategory = (deal, category) => {
    if (!category || category === "All Deals") return true;

    const dealTag = (deal.badge_tag || deal.tag || "").toLowerCase().trim();
    const catLower = category.toLowerCase().trim();
    if (dealTag === catLower) return true;

    const title = (deal.title || deal.name || "").toLowerCase();
    const desc = (
      deal.description ||
      deal.items_description ||
      ""
    ).toLowerCase();

    if (
      catLower.includes("burger") &&
      (title.includes("burger") || desc.includes("burger"))
    )
      return true;
    if (
      catLower.includes("pizza") &&
      (title.includes("pizza") || desc.includes("pizza"))
    )
      return true;
    if (
      catLower.includes("broast") &&
      (title.includes("broast") ||
        desc.includes("broast") ||
        title.includes("chicken"))
    )
      return true;
    if (
      catLower.includes("wrap") &&
      (title.includes("wrap") ||
        desc.includes("wrap") ||
        title.includes("shawarma"))
    )
      return true;

    return false;
  };

  const filteredDeals = useMemo(() => {
    return allDeals.filter((deal) => matchesCategory(deal, activeCategory));
  }, [allDeals, activeCategory]);

  return (
    <div className="bg-slate-50 dark:bg-[#0a0a0c] min-h-screen text-gray-900 dark:text-neutral-100 transition-colors duration-300 pb-24">
      {/* 1. Hero Showcase */}
      <DealsHeroBanner />

      {/* 2. Sticky Sidebar + Adaptive Deals Grid */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 relative">
        <div className="flex items-start w-full relative transition-all duration-300">
          {/* Left Categories Sidebar (Desktop) */}
          <aside
            className={`hidden lg:block shrink-0 lg:sticky lg:top-24 lg:self-start overflow-hidden transition-all duration-300 ease-in-out z-20 ${
              isDesktopSidebarVisible
                ? "w-56 lg:w-64 opacity-100 translate-x-0 mr-6"
                : "w-0 opacity-0 -translate-x-6 mr-0 pointer-events-none"
            }`}
          >
            <div className="w-56 lg:w-64 max-h-[calc(100vh-120px)] overflow-y-auto z-30 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <DealsSidebar
                categories={dynamicCategories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>
          </aside>

          {/* Right Deals Content Area */}
          <DealsGridList
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            isDesktopSidebarVisible={isDesktopSidebarVisible}
            setIsDesktopSidebarVisible={setIsDesktopSidebarVisible}
            setIsMobileFilterOpen={setIsMobileFilterOpen}
            isLoading={isLoading}
            filteredDeals={filteredDeals}
          />
        </div>
      </main>
    </div>
  );
};

export default DealsPage;
