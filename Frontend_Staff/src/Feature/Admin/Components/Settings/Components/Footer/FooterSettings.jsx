import React from "react";
import { FaSave } from "react-icons/fa";
import FooterBrandingSettings from "./FooterBrandingSettings";
import SocialLinksSettings from "./SocialLinksSettings";
import { useFooterSettings } from "../../hooks/useFooterSettings";

const FooterSettings = () => {
  const {
    settings,
    isSaving,
    errors,
    isLoading,
    handleChange,
    handleSave,
  } = useFooterSettings();

  if (isLoading) {
    return <div className="loading-state-text">Loading Settings...</div>;
  }

  return (
    <div className="admin-card-surface bg-white dark:bg-[#121216] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
          Footer Branding & Social Links
        </div>

        <button
          type="button"
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
          onClick={handleSave}
          disabled={isSaving}
        >
          <FaSave className="text-xs" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FooterBrandingSettings
          settings={settings}
          handleChange={handleChange}
          errors={errors}
        />

        <SocialLinksSettings
          settings={settings}
          handleChange={handleChange}
          errors={errors}
        />
      </div>
    </div>
  );
};

export default FooterSettings;
