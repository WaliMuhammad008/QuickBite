import React from "react";
import {
  FaSlidersH,
  FaLayerGroup,
  FaClock,
  FaStopCircle,
  FaRobot,
} from "react-icons/fa";

export default function AutoPilotControlBar({
  batchRadius,
  setBatchRadius,
  isAutoPilotOn,
  setIsAutoPilotOn,
  autoPilotMinutes,
  setAutoPilotMinutes,
  timerDisplay,
  onSmartBatch,
}) {
  return (
    <div className="my-3 p-2.5 sm:p-3.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-stone-200 dark:border-neutral-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs transition-colors">
      {/* Left Group (Radius Slider & Manual Batch) */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
        {/* Slider Inset Capsule */}
        {/* <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-neutral-800/60 border border-stone-200 dark:border-neutral-700/60 shadow-xs">
          <FaSlidersH className="text-amber-500 text-xs shrink-0" />
          <span className="font-mono text-xs font-semibold text-stone-700 dark:text-neutral-300 whitespace-nowrap">
            Radius: {(batchRadius / 1000).toFixed(1)} KM
          </span>
          <input
            type="range"
            min="1000"
            max="5000"
            step="500"
            value={batchRadius}
            onChange={(e) => setBatchRadius(Number(e.target.value))}
            disabled={isAutoPilotOn}
            className="w-24 sm:w-28 accent-amber-500 cursor-pointer h-1.5 bg-stone-300 dark:bg-neutral-700 rounded-lg"
          />
        </div> */}

        {/* Manual Batch Button */}
        <button
          type="button"
          onClick={onSmartBatch}
          disabled={isAutoPilotOn}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs font-['Oswald',sans-serif] tracking-wide shadow-xs transition-all border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaLayerGroup />
          <span>Manual Batch</span>
        </button>
      </div>

      {/* Right Group (Interval Select & AutoPilot Toggle) */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:ml-auto flex-1 sm:flex-initial justify-between sm:justify-end">
        {/* Interval Selector Capsule */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 dark:bg-neutral-800/60 border border-stone-200 dark:border-neutral-700/60 text-xs font-medium text-stone-700 dark:text-neutral-300 shadow-xs">
          <FaClock className="text-amber-500 text-xs shrink-0" />
          <select
            value={autoPilotMinutes}
            onChange={(e) => setAutoPilotMinutes(Number(e.target.value))}
            disabled={isAutoPilotOn}
            className="bg-transparent text-stone-800 dark:text-neutral-200 border-none outline-none cursor-pointer font-bold text-xs [&>option]:bg-white dark:[&>option]:bg-neutral-900"
          >
            <option value={0}>Endless (No Limit)</option>
            <option value={15}>15 Minutes</option>
            <option value={30}>30 Minutes</option>
            <option value={60}>1 Hour</option>
          </select>
        </div>

        {/* AutoPilot Activation Button */}
        <button
          type="button"
          onClick={() => setIsAutoPilotOn(!isAutoPilotOn)}
          className={`flex items-center justify-center gap-2 font-bold px-4 py-2 rounded-xl text-xs font-['Oswald',sans-serif] tracking-wide transition-all active:scale-95 border-none cursor-pointer flex-1 sm:flex-initial min-w-[190px] ${
            isAutoPilotOn
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 shadow-md animate-pulse"
              : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20 shadow-md"
          }`}
        >
          {isAutoPilotOn ? (
            <>
              <FaStopCircle />
              <span>STOP AUTO-PILOT</span>
              {timerDisplay && (
                <span className="text-red-200 ml-1 font-mono">({timerDisplay})</span>
              )}
            </>
          ) : (
            <>
              <FaRobot />
              <span>ACTIVATE AUTO-PILOT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
