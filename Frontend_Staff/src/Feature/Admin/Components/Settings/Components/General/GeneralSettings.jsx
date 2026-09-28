import React from "react";
import { FaStore, FaSave, FaSpinner } from "react-icons/fa";
import RestaurantProfileForm from "./RestaurantProfileForm";
import OperationalHoursForm from "./OperationalHoursForm";
import { useGeneralSettings } from "../../hooks/useGeneralSettings";

const GeneralSettings = () => {
  const {
    settings,
    setSettings,
    logoFile,
    isSaving,
    phoneError,
    setPhoneError,
    fileInputRef,
    isLoading,
    handleChange,
    handleLocationChange,
    handleLogoChange,
    handleRemoveLogo,
    handleSave,
  } = useGeneralSettings();

  if (isLoading) {
    return (
      <div className="py-12 text-center text-xs text-[var(--admin-muted,#888)] font-bold uppercase tracking-wider">
        Loading General Settings...
      </div>
    );
  }

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      {/* Card Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <FaStore className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Restaurant Identity & Business Hours
          </h3>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? (
            <FaSpinner className="animate-spin text-xs" />
          ) : (
            <FaSave className="text-xs" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <RestaurantProfileForm
          settings={settings}
          setSettings={setSettings}
          handleChange={handleChange}
          handleLocationChange={handleLocationChange}
          logoFile={logoFile}
          handleLogoChange={handleLogoChange}
          handleRemoveLogo={handleRemoveLogo}
          fileInputRef={fileInputRef}
          phoneError={phoneError}
          setPhoneError={setPhoneError}
        />

        <OperationalHoursForm
          settings={settings}
          handleChange={handleChange}
        />
      </div>
    </div>
  );
};

export default GeneralSettings;
