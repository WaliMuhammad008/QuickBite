import React from "react";
import { LuCircleAlert } from "react-icons/lu";

export default function CustomerContactFields({
  customerName = "",
  handleNameChange,
  customerMobile = "",
  handleMobileChange,
  errors = {},
  phoneCollision = {},
  onOpenLogin,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900/90 border border-gray-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-3 sm:space-y-4">
      <h3 className="font-['Oswald',sans-serif] font-bold text-base sm:text-lg uppercase tracking-wide text-neutral-900 dark:text-white m-0 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
        2. Contact Information
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Full Name *
          </label>
          <input
            type="text"
            value={
              typeof customerName === "string"
                ? customerName
                : customerName?.target?.value || customerName?.value || ""
            }
            onChange={(e) => {
              const cleanVal = e.target.value.replace(/[^a-zA-Z\s]/g, "");
              handleNameChange(cleanVal);
            }}
            placeholder="e.g. Muhammad Ali"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors ${
              errors.name
                ? "border-red-500 bg-red-50/10 ring-1 ring-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          {errors.name ? (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <LuCircleAlert className="w-3 h-3 shrink-0" />
              {errors.name}
            </span>
          ) : (
            <span className="text-[11px] text-neutral-400">
              Alphabets and spaces only
            </span>
          )}
        </div>

        {/* Phone Number Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            Phone Number (11 Digits) *
          </label>
          <input
            type="tel"
            maxLength={11}
            value={
              typeof customerMobile === "string"
                ? customerMobile
                : customerMobile?.target?.value || customerMobile?.value || ""
            }
            onChange={(e) => {
              const cleanDigits = e.target.value.replace(/\D/g, "").slice(0, 11);
              handleMobileChange(cleanDigits);
            }}
            placeholder="03XXXXXXXXX"
            className={`w-full p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/80 border text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors font-mono ${
              errors.mobile
                ? "border-red-500 bg-red-50/10 ring-1 ring-red-500"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          />
          
        </div>

        {/* 🌟 Guest Phone Collision Notice Banner */}
        {phoneCollision?.isColliding && (
          <div className="sm:col-span-2 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shrink-0 font-black text-xs shadow-md mt-0.5">
                ★
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-amber-500 m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
                  Registered Account Detected {phoneCollision.existingName ? `(${phoneCollision.existingName})` : ""}
                </p>
                <p className="text-[11px] sm:text-xs text-neutral-300 dark:text-neutral-300 mt-1 leading-relaxed">
                  This mobile number is linked with an existing BigBite account. Log in to claim loyalty points and track this order in your profile.
                </p>
              </div>
            </div>

            {onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="self-start sm:self-center shrink-0 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-neutral-950 text-xs font-black font-['Oswald',sans-serif] uppercase tracking-wider transition-all shadow-md cursor-pointer border-none"
              >
                Log In Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
