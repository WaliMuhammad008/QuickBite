import React from "react";

export default function TermsConditionsEditor({ settings = {}, handleChange }) {
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
              name="terms_hero_badge"
              value={settings.terms_hero_badge || ""}
              onChange={handleChange}
              placeholder="TERMS OF SERVICE"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
              Main Page Heading
            </label>
            <input
              type="text"
              name="terms_hero_title"
              value={settings.terms_hero_title || ""}
              onChange={handleChange}
              placeholder="TERMS & CONDITIONS"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Hero Subtitle Description
          </label>
          <textarea
            name="terms_hero_subtitle"
            rows={2}
            value={settings.terms_hero_subtitle || ""}
            onChange={handleChange}
            placeholder="Please review the terms and ordering guidelines..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Agreement Statement Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          2. Ordering & Service Agreement
        </h4>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Section Heading
          </label>
          <input
            type="text"
            name="terms_agreement_title"
            value={settings.terms_agreement_title || ""}
            onChange={handleChange}
            placeholder="Ordering & Service Agreement"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Agreement Terms Text
          </label>
          <textarea
            name="terms_agreement_text"
            rows={4}
            value={settings.terms_agreement_text || ""}
            onChange={handleChange}
            placeholder="Detail customer terms of service, kitchen preparation, and delivery commitments..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>

      {/* 3 Terms Cards */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          3. Three Policy Pillar Cards
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Policy #1
            </span>
            <input
              type="text"
              name="terms_card1_title"
              value={settings.terms_card1_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. Order Confirmation)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="terms_card1_desc"
              rows={3}
              value={settings.terms_card1_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Policy #2
            </span>
            <input
              type="text"
              name="terms_card2_title"
              value={settings.terms_card2_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. Payment Terms)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="terms_card2_desc"
              rows={3}
              value={settings.terms_card2_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Policy #3
            </span>
            <input
              type="text"
              name="terms_card3_title"
              value={settings.terms_card3_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. Delivery Schedule)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="terms_card3_desc"
              rows={3}
              value={settings.terms_card3_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Refund Guidelines Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          4. Cancellation & Refund Guidelines
        </h4>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Section Heading
          </label>
          <input
            type="text"
            name="terms_refund_title"
            value={settings.terms_refund_title || ""}
            onChange={handleChange}
            placeholder="Cancellation & Refund Guidelines"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Refund Rules Text
          </label>
          <textarea
            name="terms_refund_text"
            rows={3}
            value={settings.terms_refund_text || ""}
            onChange={handleChange}
            placeholder="Enter cancellation windows, missing item claims, and store credit policies..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
