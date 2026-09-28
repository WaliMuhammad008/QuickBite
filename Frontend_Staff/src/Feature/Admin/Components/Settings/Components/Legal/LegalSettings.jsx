import React from "react";
import {
  FaFileAlt,
  FaSave,
  FaShieldAlt,
  FaFileContract,
  FaHeart,
} from "react-icons/fa";

import AboutUsEditor from "./AboutUsEditor";
import PrivacyPolicyEditor from "./PrivacyPolicyEditor";
import TermsConditionsEditor from "./TermsConditionsEditor";
import { useLegalSettings } from "../../hooks/useLegalSettings";

const LegalSettings = () => {
  const {
    activeSection,
    setActiveSection,
    settings,
    handleChange,
    handleSave,
    isSaving,
    isLoading,
  } = useLegalSettings();

  if (isLoading) {
    return (
      <div className="p-6 text-[var(--admin-muted)] text-sm">
        Loading Legal & Content Pages...
      </div>
    );
  }

  const subTabs = [
    { id: "about", label: "About Us Page", icon: <FaHeart /> },
    { id: "privacy", label: "Privacy Policy", icon: <FaShieldAlt /> },
    { id: "terms", label: "Terms & Conditions", icon: <FaFileContract /> },
  ];

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* ══ Header & Save Action Bar ══ */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 m-0 font-['Oswald',sans-serif] uppercase">
            <FaFileAlt className="text-amber-500" />
            Legal & Content Manager
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 m-0 font-sans">
            Configure 100% of the titles, descriptions, feature cards, and legal
            policies on the customer portal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          <FaSave className="text-xs" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* ══ Sub-Section Navigation Chips ══ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-200 border-none ${
              activeSection === tab.id
                ? "btn-brand-cta"
                : "bg-slate-100 dark:bg-[#161616] text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. ABOUT US EDITOR */}
      {activeSection === "about" && (
        <AboutUsEditor settings={settings} handleChange={handleChange} />
      )}

      {/* 2. PRIVACY POLICY EDITOR */}
      {activeSection === "privacy" && (
        <PrivacyPolicyEditor settings={settings} handleChange={handleChange} />
      )}

      {/* 3. TERMS & CONDITIONS EDITOR */}
      {activeSection === "terms" && (
        <TermsConditionsEditor settings={settings} handleChange={handleChange} />
      )}

      {/* ══ Sticky Bottom Save Bar ══ */}
      <div className="sticky bottom-0 z-20 p-4 bg-white/95 dark:bg-[#161616]/95 border-t border-slate-200 dark:border-neutral-800 shadow-xl rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md mt-6">
        <div className="text-xs text-slate-500 dark:text-neutral-400 font-semibold hidden sm:block">
          Unsaved changes will not reflect on customer legal pages until saved.
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto btn-brand-cta px-6 py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50 border-none"
        >
          <FaSave />
          <span>{isSaving ? "Saving..." : "Save Legal Settings"}</span>
        </button>
      </div>
    </div>
  );
};

export default LegalSettings;
