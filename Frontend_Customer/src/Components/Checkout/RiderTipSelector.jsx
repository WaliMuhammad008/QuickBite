import React, { useState } from "react";
import { LuBike, LuHeart } from "react-icons/lu";

const PRESET_TIPS = [50, 100, 200];

const RiderTipSelector = ({
  selectedTip,
  tipAmount,
  onSelectTip,
  onTipChange,
  isDelivery = true,
}) => {
  const currentTip = selectedTip !== undefined ? selectedTip : (tipAmount || 0);
  const handleSelectTip = (amount) => {
    if (onSelectTip) onSelectTip(amount);
    if (onTipChange) onTipChange(amount);
  };

  if (!isDelivery) return null; // Strictly render on delivery orders only

  const [customTip, setCustomTip] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomTip(val);
    const numeric = parseFloat(val);
    handleSelectTip(!isNaN(numeric) && numeric >= 0 ? numeric : 0);
  };

  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <LuBike className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-black font-['Oswald',sans-serif] uppercase tracking-wider text-neutral-900 dark:text-white m-0">
            Tip Your Rider
          </h4>
        </div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 m-0 mb-2">
        Reward your delivery partner.
      </p>

      <div className="grid grid-cols-5 gap-2 pt-1">
        {PRESET_TIPS.map((tip) => (
          <button
            key={tip}
            type="button"
            onClick={() => {
              setIsCustom(false);
              setCustomTip("");
              handleSelectTip(currentTip === tip ? 0 : tip);
            }}
            className={`py-2.5 text-xs font-['Oswald',sans-serif] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
              !isCustom && currentTip === tip
                ? "bg-amber-400 border-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-400/30"
                : "bg-gray-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:border-amber-400"
            }`}
          >
            Rs {tip}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setIsCustom(true);
            handleSelectTip(parseFloat(customTip) || 0);
          }}
          className={`py-2.5 text-xs font-['Oswald',sans-serif] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
            isCustom
              ? "bg-amber-400 border-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-400/30"
              : "bg-gray-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border-gray-200 dark:border-neutral-700 hover:border-amber-400"
          }`}
        >
          Custom
        </button>

        <button
          type="button"
          onClick={() => {
            setIsCustom(false);
            setCustomTip("");
            handleSelectTip(0);
          }}
          className={`py-2.5 text-xs font-['Oswald',sans-serif] font-bold uppercase rounded-xl border transition-all cursor-pointer ${
            currentTip === 0 && !isCustom
              ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white border-neutral-400 dark:border-neutral-500 font-black"
              : "bg-gray-50 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 border-gray-200 dark:border-neutral-800 hover:border-neutral-400"
          }`}
        >
          None
        </button>
      </div>

      {isCustom && (
        <div className="pt-2 animate-fade-in">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs font-bold text-neutral-400">Rs</span>
            <input
              type="number"
              min="0"
              placeholder="Enter custom tip amount"
              value={customTip}
              onChange={handleCustomChange}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl text-xs font-bold focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderTipSelector;
