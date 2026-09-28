import React, { useState } from "react";
import { FaFire, FaPepperHot, FaChevronDown, FaCheck } from "react-icons/fa";

export default function ItemSpiceSelector({
  isDeal = false,
  hasSpiceOption = true,
  selectedSpice = "Medium Spicy",
  setSelectedSpice,
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (isDeal || hasSpiceOption === false) return null;

  const spiceOptions = [
    {
      id: "Mild",
      label: "Mild",
      desc: "Gentle flavor, subtle seasoning",
      icon: <FaFire className="text-emerald-500 w-3.5 h-3.5 shrink-0" />,
      activeColor:
        "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20",
    },
    {
      id: "Medium Spicy",
      label: "Medium",
      desc: "Signature chef balance",
      icon: <FaPepperHot className="text-amber-500 w-3.5 h-3.5 shrink-0" />,
      activeColor:
        "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 ring-2 ring-amber-500/20",
    },
    {
      id: "Hot & Fiery",
      label: "Fire Hot",
      desc: "Bold, intense spicy kick",
      icon: <FaFire className="text-red-500 w-3.5 h-3.5 shrink-0" />,
      activeColor:
        "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 ring-2 ring-red-500/20",
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-neutral-900/60 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden transition-all duration-300">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left cursor-pointer border-none bg-transparent"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <FaPepperHot className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white m-0 font-['Oswald',sans-serif] flex items-center gap-2">
              Choose Spice Level
              <span className="text-[11px] font-sans font-semibold text-amber-600 dark:text-amber-400 capitalize">
                ({selectedSpice})
              </span>
            </h4>
            <span className="text-[11px] text-gray-500 dark:text-neutral-400">
              Select your preferred heat profile
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Optional
          </span>
          <FaChevronDown
            className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="p-3 sm:p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {spiceOptions.map((opt) => {
              const isSelected = selectedSpice === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSpice && setSelectedSpice(opt.id)}
                  className={`p-2.5 rounded-xl border text-left sm:text-center transition-all cursor-pointer flex sm:flex-col items-center sm:justify-center gap-2 sm:gap-1 ${
                    isSelected
                      ? `${opt.activeColor} font-bold shadow-xs`
                      : "bg-white dark:bg-neutral-800/40 border-gray-200/80 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:border-gray-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {opt.icon}
                    <span className="text-xs font-bold font-['Oswald',sans-serif] uppercase tracking-wide">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <FaCheck className="w-2.5 h-2.5 ml-auto sm:ml-1 text-inherit" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-neutral-400 line-clamp-1">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
