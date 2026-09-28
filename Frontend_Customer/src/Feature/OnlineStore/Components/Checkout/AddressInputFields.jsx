import React from "react";
import { FaMapMarkerAlt, FaSpinner, FaCheckCircle } from "react-icons/fa";

export default function AddressInputFields({
  houseNo = "",
  setHouseNo,
  street = "",
  setStreet,
  area = "",
  setArea,
  errors = {},
  setErrors,
  onUseCurrentLocation,
  isDetectingGps = false,
  hasExactGps = false,
}) {
  return (
    <div className="space-y-4">
      {/* GPS Location Auto-Detection Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            <FaMapMarkerAlt />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>Pinpoint Delivery Location</span>
              {hasExactGps && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-1">
                  <FaCheckCircle className="text-[9px]" /> GPS Locked
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 m-0">
              Auto-detect coordinates for exact rider navigation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isDetectingGps}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all border-none shadow-sm disabled:opacity-50"
        >
          {isDetectingGps ? (
            <>
              <FaSpinner className="animate-spin text-xs" />
              <span>Detecting...</span>
            </>
          ) : hasExactGps ? (
            <>
              <FaCheckCircle className="text-xs text-emerald-800" />
              <span>GPS Updated</span>
            </>
          ) : (
            <>
              <FaMapMarkerAlt className="text-xs" />
              <span>Use Current GPS</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            House / Flat / Building No. *
          </label>
          <input
            type="text"
            value={houseNo}
            onChange={(e) => {
              setHouseNo(e.target.value);
              if (errors.houseNo && setErrors)
                setErrors({ ...errors, houseNo: "" });
            }}
            placeholder="e.g. House 42, Floor 2"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
              errors.houseNo
                ? "border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          {errors.houseNo && (
            <span className="text-xs text-red-500">{errors.houseNo}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Street / Block *
          </label>
          <input
            type="text"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              if (errors.street && setErrors)
                setErrors({ ...errors, street: "" });
            }}
            placeholder="e.g. Street 9, Block B"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
              errors.street
                ? "border-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          {errors.street && (
            <span className="text-xs text-red-500">{errors.street}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
          Area / Landmark *
        </label>
        <input
          type="text"
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            if (errors.area && setErrors) setErrors({ ...errors, area: "" });
          }}
          placeholder="e.g. Shadipura / Gulberg III / DHA"
          className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
            errors.area
              ? "border-red-500"
              : "border-gray-200 dark:border-neutral-700"
          }`}
        />
        {errors.area && (
          <span className="text-xs text-red-500">{errors.area}</span>
        )}
      </div>
    </div>
  );
}
