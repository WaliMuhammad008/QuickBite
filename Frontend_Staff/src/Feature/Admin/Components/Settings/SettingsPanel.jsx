import React, { useState } from "react";
import {
  FaStore,
  FaMotorcycle,
  FaDollarSign,
  FaBell,
  FaFileAlt,
} from "react-icons/fa";

// Import All Tab Components
import GeneralSettings from "./Components/General/GeneralSettings";
import OperationalSettings from "./Components/General/OperationalSettings";
import FinancialSettings from "./Components/General/FinancialSettings";
import NotificationSettings from "./Components/NotificationSettings";
import LegalSettings from "./Components/Legal/LegalSettings";

const SettingsPanel = () => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General Info", icon: <FaStore /> },
    { id: "operations", label: "Operations", icon: <FaMotorcycle /> },
    { id: "finance", label: "Financial", icon: <FaDollarSign /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "legal", label: "Legal & Content", icon: <FaFileAlt /> },
  ];

  return (
    <div className="animate-slide-up space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Store Configuration & System Settings
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Configure restaurant identity, operating hours, delivery parameters, tax rates, and legal policies.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start w-full pb-16">
        {/* Left Vertical Sub-Sidebar */}
        <div className="w-full md:w-64 shrink-0 admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-3 flex flex-col gap-1.5 md:sticky md:top-4 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm text-left transition-all border-none cursor-pointer ${
                activeTab === tab.id
                  ? "btn-brand-cta"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] bg-transparent"
              }`}
            >
              <span className="text-base shrink-0">{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Active Content Panel */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "operations" && <OperationalSettings />}
          {activeTab === "finance" && <FinancialSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "legal" && <LegalSettings />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
