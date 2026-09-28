import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useTheme } from "../../Context/ThemeContext";
import {
  FaShoppingBag,
  FaSun,
  FaMoon,
  FaMapMarkerAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import HeaderNavLinks from "./HeaderNavLinks";
import HeaderMobileDrawer from "./HeaderMobileDrawer";
import HeaderUserMenu from "./HeaderUserMenu";

const Header = () => {
  const [cartBounce, setCartBounce] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { orders, cartItems, toggleCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const prevCartCount = useRef(0);

  const currentPath = location.pathname.toLowerCase();

  const totalCartProducts = (cartItems || []).length;

  useEffect(() => {
    if (totalCartProducts > prevCartCount.current && prevCartCount.current >= 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 500);
      return () => clearTimeout(timer);
    }
    prevCartCount.current = totalCartProducts;
  }, [totalCartProducts]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "Deals", to: "/deals" },
    { label: "Track Order", to: "/track-order" },
    { label: "About Us", to: "/about-us" },
  ];

  const desktopNavItems = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "Deals", to: "/deals" },
  ];

  const isNavActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);



  return (
    <header className="fixed top-0 left-0 right-0 w-full h-14 sm:h-16 z-50 px-4 sm:px-6 transition-all duration-300 backdrop-blur-md bg-white/95 text-zinc-900 border-b border-zinc-200/80 shadow-xs dark:bg-[#0d0d0d]/95 dark:text-white dark:border-white/10 dark:shadow-md flex items-center">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        {/* Left: Typographic Wordmark */}
        <div
          className="flex items-center cursor-pointer group flex-shrink-0"
          onClick={() => navigate("/")}
        >
          <span className="font-['Oswald',sans-serif] font-black text-2xl sm:text-3xl tracking-wider leading-none text-zinc-950 dark:text-white group-hover:opacity-90 transition-opacity duration-200">
            BIG
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              BITE
            </span>
          </span>
        </div>

        {/* Right: Desktop Nav + Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          {/* Desktop Nav Links */}
          <HeaderNavLinks
            navItems={desktopNavItems}
            isNavActive={isNavActive}
            navigate={navigate}
          />

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative overflow-hidden group w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
              aria-label="Toggle theme"
            >
              <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <span className="relative z-10 text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                {theme === "dark" ? (
                  <FaSun className="text-orange-400 text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
                ) : (
                  <FaMoon className="text-zinc-700 text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
                )}
              </span>
            </button>

            {/* Track Order Icon (Desktop only shortcut) */}
            {(
              <button
                type="button"
                onClick={() => navigate("/track-order")}
                className="hidden sm:flex relative overflow-visible group w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
                aria-label="Track orders"
              >
                <span className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden pointer-events-none">
                  <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                </span>
                <span className="relative z-10 text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                  <FaMapMarkerAlt className="text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
                </span>
                {orders?.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20 pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                )}
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={toggleCart}
              className={`relative overflow-visible group w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs ${
                cartBounce ? "animate-bounce" : ""
              }`}
              aria-label="Open cart"
            >
              <span className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden pointer-events-none">
                <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              </span>
              <span className="relative z-10 text-orange-500 dark:text-orange-400 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                <FaShoppingBag className="text-xs sm:text-sm group-hover:text-white transition-colors duration-200" />
              </span>
              {totalCartProducts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-amber-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center leading-none shadow-md z-10 pointer-events-none border-2 border-white dark:border-neutral-950">
                  {totalCartProducts}
                </span>
              )}
            </button>

            {/* Customer User / Sign In Menu */}
            <HeaderUserMenu />

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative overflow-hidden group w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-[#1c1c1c] border border-zinc-200/80 dark:border-neutral-800 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs"
              aria-label="Toggle navigation menu"
            >
              <span className="absolute inset-0 w-full h-full bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
              <span className="relative z-10 text-zinc-800 dark:text-zinc-200 group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                {mobileMenuOpen ? (
                  <FaTimes className="text-sm text-orange-500 dark:text-orange-400 group-hover:text-white" />
                ) : (
                  <FaBars className="text-sm text-zinc-800 dark:text-zinc-200 group-hover:text-white" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <HeaderMobileDrawer
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navItems={navItems}
        isNavActive={isNavActive}
        navigate={navigate}
      />
    </header>
  );
};

export default Header;
