import React from "react";

export default function HeaderNavLinks({ navItems = [], isNavActive, navigate }) {
  return (
    <nav className="hidden md:flex items-center gap-6 sm:gap-8 mr-2">
      {navItems.map((nav) => {
        const active = isNavActive(nav.to);
        return (
          <button
            key={nav.to}
            type="button"
            onClick={() => navigate(nav.to)}
            className={`text-sm md:text-[15px] font-extrabold uppercase tracking-wider transition-all duration-200 py-1 relative group cursor-pointer bg-transparent border-none ${
              active
                ? "text-orange-500 font-bold dark:text-amber-400"
                : "text-zinc-700 hover:text-orange-500 dark:text-zinc-300 dark:hover:text-amber-400"
            }`}
          >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
              {nav.label}
            </span>
            <span
              className={`absolute -bottom-1 left-0 h-[2.5px] bg-orange-500 dark:bg-amber-400 rounded-full transition-all duration-300 ease-out ${
                active ? "w-full" : "w-0 group-hover:w-full"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
