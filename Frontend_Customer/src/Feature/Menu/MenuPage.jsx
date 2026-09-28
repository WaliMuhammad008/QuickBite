import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "./Components/Sidebar";
import SearchBar from "./Components/SearchBar";
import MenuContent from "./Components/MenuContent";
import MenuHeroHeader from "./Components/MenuHeroHeader";
import MenuSidebarDesktop from "./Components/MenuSidebarDesktop";
import { API_BASE } from "../../config/api";

const MenuPage = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchBoxRef = useRef(null);

  // API Fetching using React Query
  const { data: rawCategories = [], isLoading: isCatLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/get_categories.php`
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: menuItems = [], isLoading: isMenuLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/get_menu.php`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });

  const categories = useMemo(() => {
    if (!Array.isArray(rawCategories)) return [];
    return rawCategories
      .map((c) => (typeof c === "string" ? c : c?.name || ""))
      .filter(Boolean);
  }, [rawCategories]);

  const isLoading = isCatLoading || isMenuLoading;

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
      setExpandedCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const performScroll = (el, offset = 140) => {
    if (!el) return;
    const topPos = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: topPos,
      behavior: "smooth",
    });
  };

  // Handle Category Redirect from other pages
  useEffect(() => {
    const rawTarget = location.state?.category;
    const targetCategory =
      typeof rawTarget === "object" ? rawTarget?.name : rawTarget;

    if (!isLoading && targetCategory && categories.length > 0) {
      const matchedCat = categories.find(
        (cat) => cat.toLowerCase() === targetCategory.toLowerCase()
      );
      if (matchedCat) {
        setActiveCategory(matchedCat);
        setExpandedCategory(matchedCat);
        setSearchTerm("");

        setTimeout(() => {
          const el = document.getElementById(matchedCat);
          performScroll(el);
        }, 150);

        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, isLoading, categories, navigate]);

  // Handle Search & Category Query Params
  useEffect(() => {
    if (!isLoading && categories.length > 0) {
      const params = new URLSearchParams(location.search);
      const searchQuery = params.get("search");
      const categoryQuery = params.get("category");

      if (searchQuery) {
        setSearchTerm(searchQuery);
      } else if (categoryQuery) {
        const normalizedQuery = categoryQuery
          .toLowerCase()
          .replace(/[-_]/g, " ")
          .trim();
        const matchedCat = categories.find((c) => {
          const catLower = c.toLowerCase();
          return (
            catLower === normalizedQuery ||
            catLower.includes(normalizedQuery) ||
            normalizedQuery.includes(catLower) ||
            (normalizedQuery.includes("wrap") &&
              (catLower.includes("wrap") ||
                catLower.includes("shawarma") ||
                catLower.includes("roll"))) ||
            (normalizedQuery.includes("potato") &&
              (catLower.includes("potato") || catLower.includes("fries"))) ||
            (normalizedQuery.includes("fries") &&
              (catLower.includes("potato") || catLower.includes("fries"))) ||
            (normalizedQuery.includes("pizza") && catLower.includes("pizza")) ||
            (normalizedQuery.includes("burger") && catLower.includes("burger"))
          );
        });

        if (matchedCat) {
          setActiveCategory(matchedCat);
          setExpandedCategory(matchedCat);
          setSearchTerm("");

          setTimeout(() => {
            const el = document.getElementById(matchedCat);
            performScroll(el);
          }, 150);
        }
      }
    }
  }, [location.search, isLoading, categories]);

  const filteredMenuItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems;
    const lower = searchTerm.toLowerCase();
    return menuItems.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(lower)) ||
        (item.description && item.description.toLowerCase().includes(lower)) ||
        (item.category && item.category.toLowerCase().includes(lower))
    );
  }, [menuItems, searchTerm]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return filteredMenuItems.slice(0, 8);
  }, [filteredMenuItems, searchTerm]);

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    setExpandedCategory(cat);
    setSearchTerm("");
    const element = document.getElementById(cat);
    performScroll(element);
  };

  const scrollToProduct = (item) => {
    setActiveCategory(item.category);
    setExpandedCategory(item.category);
    setSearchTerm("");
    setTimeout(() => {
      const element = document.getElementById(`product-${item.id}`);
      performScroll(element, 160);
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-amber-500 gap-3 font-bold text-lg tracking-wide font-['Oswald',sans-serif]">
        <div className="w-4 h-4 bg-amber-400 rounded-full animate-bounce" />
        <div
          className="w-4 h-4 bg-amber-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="w-4 h-4 bg-amber-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        />
        <span className="ml-2">Loading Delicious Menu...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0a0a0c] min-h-screen text-gray-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Mobile Drawer Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        expandedCategory={expandedCategory}
        menuItems={menuItems}
        onCategoryClick={(c) => {
          scrollToCategory(c);
          setIsSidebarOpen(false);
        }}
        onProductClick={scrollToProduct}
      />

      {/* 1. 3D Menu Hero Header */}
      <MenuHeroHeader />

      {/* 2. Sticky Top Control Bar */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        searchBoxRef={searchBoxRef}
        onFilterToggle={() => {
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(true);
          } else {
            setIsDesktopSidebarVisible((prev) => !prev);
          }
        }}
        isFilterActive={isDesktopSidebarVisible || isSidebarOpen}
      />

      {/* 3. Main Content with Animated Sticky Sidebar */}
      <div className="flex items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative w-full transition-all duration-300">
        {/* Desktop Categories Sidebar */}
        <MenuSidebarDesktop
          isDesktopSidebarVisible={isDesktopSidebarVisible}
          categories={categories}
          activeCategory={activeCategory}
          scrollToCategory={scrollToCategory}
        />

        {/* Dynamic Menu Product Grid Content */}
        <main className="flex-1 min-w-0 w-full transition-all duration-300 ease-in-out">
          <MenuContent
            searchTerm={searchTerm}
            searchResults={searchResults}
            categories={categories}
            menuItems={menuItems}
            isExpanded={!isDesktopSidebarVisible}
          />
        </main>
      </div>
    </div>
  );
};

export default MenuPage;