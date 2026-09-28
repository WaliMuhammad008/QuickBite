import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import OrderTracking from "../../Feature/Order/Components/OrderTracker";
import { useCart } from "../../Context/CartContext";

import { FaBox, FaSearch, FaFire } from "react-icons/fa";
import { resolveImageUrl } from "../../utils/imageOptimizer";

const Header = () => {
  const [showOrders, setShowOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useCart();
  const searchRef = useRef(null);

  const [menuItems, setMenuItems] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const isMenuPage = location.pathname.toLowerCase().includes("menu");

  const currentPath = location.pathname.toLowerCase();
  const shouldHideIcon =
    currentPath.includes("kitchen") ||
    currentPath.includes("cashier") ||
    currentPath.includes("admin") ||
    currentPath.includes("login");

  useEffect(() => {
    if (isMenuPage) {
      const params = new URLSearchParams(location.search);
      setSearchTerm(params.get("search") || "");
    } else {
      setSearchTerm("");
    }
  }, [location.search, isMenuPage]);

  // Fetch Menu for Dynamic Search
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_menu.php`);
        const result = await response.json();
        if (result.success && result.data) {
          setMenuItems(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch menu for search", err);
      }
    };
    fetchMenu();
  }, []);

  // Handle outside click for search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSearchFocused(false);
    if (searchTerm.trim()) {
      navigate(`/menu?search=${searchTerm.trim()}`);
    } else {
      navigate(`/menu`);
    }
  };

  const filteredItems = searchTerm.trim() 
    ? menuItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <>
      <header className="sticky top-0 z-[1100] bg-[var(--bg-body,#0a0a0a)]">
        <div className="bg-[var(--bg-body,#0a0a0a)] shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
          <div className="h-[3.75rem] md:h-[4.375rem] flex items-center justify-between px-5">
            {/* 1. LEFT SECTION (Logo with Fire Icon) */}
            <div className="flex items-center">
              <div className="flex items-center gap-[0.625rem] cursor-pointer" onClick={() => navigate("/")}>
                <div className="bg-[#ef4444] text-white p-2 rounded-lg">
                  <FaFire /> {/* 🔥 Yahan Fire Icon laga diya */}
                </div>
                <div>
                  <h1 className="font-['Oswald',sans-serif] text-[1.5rem] text-[var(--text-main,#ffffff)] m-0 tracking-[1px]">
                    Big<span className="text-[#ef4444]">Bite</span>
                  </h1>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE SECTION (Dynamic Search) */}
            <div className="relative hidden md:block" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center transition-all duration-300">
                <FaSearch className={`absolute left-3 text-[0.875rem] z-[2] pointer-events-none transition-all duration-300 ${isSearchFocused ? 'text-[#ef4444]' : 'text-[#888]'}`} />
                <input
                  type="text"
                  placeholder="Search your favorite food..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className={`w-[21.875rem] bg-[var(--panel-bg,#1a1a1a)] rounded-[1.25rem] py-2 pr-[0.937rem] pl-[2.187rem] text-[var(--text-main,#fff)] outline-none transition-all duration-300 ${isSearchFocused ? 'opacity-100 border border-[#ef4444]' : 'opacity-70 border border-transparent bg-[rgba(255,255,255,0.05)]'}`}
                />
              </form>

              {/* Dynamic Search Dropdown */}
              {isSearchFocused && searchTerm.trim() !== "" && (
                <div className="absolute top-[2.812rem] left-0 w-full bg-[#111] border border-[#333] rounded-xl max-h-[21.875rem] overflow-y-auto shadow-[0_8px_20px_rgba(0,0,0,0.8)] z-[1000] animate-[slideDown_0.2s_ease-out] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-[#444] [&::-webkit-scrollbar-thumb]:rounded-[6px]">
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        className="flex items-center p-[0.625rem_0.937rem] border-b border-[#222] cursor-pointer transition-colors duration-200 hover:bg-[#222] last:border-b-0"
                        onClick={() => {
                          setSearchTerm("");
                          setIsSearchFocused(false);
                          navigate(`/menu?search=${encodeURIComponent(item.name)}`);
                        }}
                      >
                        <img
                          className="w-[2.812rem] h-[2.812rem] rounded-[0.375rem] object-contain p-1 border border-[#333] bg-white/5 mr-[0.937rem]"
                          src={resolveImageUrl(item.img, 100)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/100x100?text=No+Img";
                          }}
                        />
                        <div className="flex flex-col">
                          <span className="text-white text-[0.875rem] font-medium mb-[0.188rem]">{item.name}</span>
                          <span className="text-[#ef4444] text-[0.812rem] font-bold">Rs {Number(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-[0.937rem] text-center text-[#888] text-[0.875rem]">No products found...</div>
                  )}
                </div>
              )}
            </div>

            {/* 3. RIGHT SECTION */}
            <div className="flex items-center">
              <div className="flex items-center gap-[0.937rem]">
                {!shouldHideIcon && (
                  <div
                    className="relative text-[1.25rem] text-[var(--text-main,#fff)] cursor-pointer transition-colors duration-200 hover:text-[#ef4444]"
                    onClick={() => setShowOrders(true)}
                    title="Live Tracking"
                  >
                    <FaBox />
                    {orders?.length > 0 && (
                      <span className="absolute -top-[0.375rem] -right-[0.5rem] bg-[#ef4444] text-white text-[0.625rem] w-[1.125rem] h-[1.125rem] rounded-full flex items-center justify-center border-2 border-[#0a0a0a] font-bold">{orders.length}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. MOBILE SEARCH ROW */}
          {isMenuPage && (
            <div className="block md:hidden px-[0.937rem] pb-[0.937rem] bg-[var(--bg-body,#0a0a0a)]">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <FaSearch className="absolute left-[0.937rem] top-1/2 -translate-y-1/2 text-[#ef4444]" />
                <input
                  type="text"
                  placeholder="Search item or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--panel-bg,#1a1a1a)] border border-[var(--border-color,#333)] rounded-xl py-3 pr-[0.937rem] pl-[2.812rem] text-[var(--text-main,#fff)] outline-none text-[0.875rem] transition-all duration-300 focus:border-[#ef4444]"
                />
              </form>
            </div>
          )}
        </div>
      </header>

      <OrderTracking isOpen={showOrders} onClose={() => setShowOrders(false)} />
    </>
  );
};

export default Header;

