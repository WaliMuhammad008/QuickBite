import React from "react";

export default function PrivacyPolicyEditor({ settings = {}, handleChange }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero Section Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          1. Hero Header & Subtitle
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
              Top Pill Badge Tag
            </label>
            <input
              type="text"
              name="privacy_hero_badge"
              value={settings.privacy_hero_badge || ""}
              onChange={handleChange}
              placeholder="DATA SECURITY & TRUST"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
              Main Page Heading
            </label>
            <input
              type="text"
              name="privacy_hero_title"
              value={settings.privacy_hero_title || ""}
              onChange={handleChange}
              placeholder="PRIVACY POLICY"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Hero Subtitle Description
          </label>
          <textarea
            name="privacy_hero_subtitle"
            rows={2}
            value={settings.privacy_hero_subtitle || ""}
            onChange={handleChange}
            placeholder="How we protect, encrypt, and handle your information..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Overview Statement Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          2. Privacy Overview
        </h4>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Section Heading
          </label>
          <input
            type="text"
            name="privacy_overview_title"
            value={settings.privacy_overview_title || ""}
            onChange={handleChange}
            placeholder="Privacy Overview"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Policy Statement
          </label>
          <textarea
            name="privacy_overview_text"
            rows={4}
            value={settings.privacy_overview_text || ""}
            onChange={handleChange}
            placeholder="Detail customer data collection, order coordinates, and encryption..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>

      {/* 3 Safeguard Cards */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          3. Three Data Safeguard Cards
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Safeguard #1
            </span>
            <input
              type="text"
              name="privacy_card1_title"
              value={settings.privacy_card1_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. Encrypted Data)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="privacy_card1_desc"
              rows={3}
              value={settings.privacy_card1_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Safeguard #2
            </span>
            <input
              type="text"
              name="privacy_card2_title"
              value={settings.privacy_card2_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. No Data Sharing)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="privacy_card2_desc"
              rows={3}
              value={settings.privacy_card2_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Safeguard #3
            </span>
            <input
              type="text"
              name="privacy_card3_title"
              value={settings.privacy_card3_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. Transparent Usage)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="privacy_card3_desc"
              rows={3}
              value={settings.privacy_card3_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Guarantee Section Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          4. Data Protection Guarantee
        </h4>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Section Heading
          </label>
          <input
            type="text"
            name="privacy_guarantee_title"
            value={settings.privacy_guarantee_title || ""}
            onChange={handleChange}
            placeholder="Data Protection Guarantee"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Guarantee Statement
          </label>
          <textarea
            name="privacy_guarantee_text"
            rows={3}
            value={settings.privacy_guarantee_text || ""}
            onChange={handleChange}
            placeholder="Enter physical, electronic, and administrative safeguards..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
