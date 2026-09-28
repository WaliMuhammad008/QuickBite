import React from "react";

export default function AboutUsEditor({ settings = {}, handleChange }) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero Section Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          1. Hero Header & Headline
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
              Top Pill Badge Tag
            </label>
            <input
              type="text"
              name="about_hero_badge"
              value={settings.about_hero_badge || ""}
              onChange={handleChange}
              placeholder="OUR STORY & PASSION"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
              Main Page Heading
            </label>
            <input
              type="text"
              name="about_hero_title"
              value={settings.about_hero_title || ""}
              onChange={handleChange}
              placeholder="ABOUT BIGBITE"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Hero Subtitle Description
          </label>
          <textarea
            name="about_hero_subtitle"
            rows={2}
            value={settings.about_hero_subtitle || ""}
            onChange={handleChange}
            placeholder="Crafting mouth-watering burgers, loaded fries, cheesy pizzas..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Journey Section Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          2. Our Journey Section
        </h4>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Section Heading
          </label>
          <input
            type="text"
            name="about_journey_title"
            value={settings.about_journey_title || ""}
            onChange={handleChange}
            placeholder="Our Journey"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Journey Story Text
          </label>
          <textarea
            name="about_journey_text"
            rows={4}
            value={settings.about_journey_text || ""}
            onChange={handleChange}
            placeholder="Detail the founding story, recipes, and culinary vision..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>

      {/* 3 Pillar Feature Cards */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          3. Three Pillar Feature Cards
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Pillar Card #1
            </span>
            <input
              type="text"
              name="about_card1_title"
              value={settings.about_card1_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. 100% Fresh)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="about_card1_desc"
              rows={3}
              value={settings.about_card1_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Pillar Card #2
            </span>
            <input
              type="text"
              name="about_card2_title"
              value={settings.about_card2_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. Hot Delivery)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="about_card2_desc"
              rows={3}
              value={settings.about_card2_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-3">
            <span className="text-xs font-bold text-amber-500 uppercase">
              Pillar Card #3
            </span>
            <input
              type="text"
              name="about_card3_title"
              value={settings.about_card3_title || ""}
              onChange={handleChange}
              placeholder="Card Title (e.g. Hygiene Assured)"
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold"
            />
            <textarea
              name="about_card3_desc"
              rows={3}
              value={settings.about_card3_desc || ""}
              onChange={handleChange}
              placeholder="Description..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs"
            />
          </div>
        </div>
      </div>

      {/* Mission Section Card */}
      <div className="admin-card-surface bg-white dark:bg-[#161616] border border-slate-200 dark:border-white/[0.06] rounded-2xl shadow-sm p-6 flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0 uppercase tracking-wide flex items-center gap-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
          4. Our Mission Statement
        </h4>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Section Heading
          </label>
          <input
            type="text"
            name="about_mission_title"
            value={settings.about_mission_title || ""}
            onChange={handleChange}
            placeholder="Our Mission"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
            Mission Statement
          </label>
          <textarea
            name="about_mission_text"
            rows={3}
            value={settings.about_mission_text || ""}
            onChange={handleChange}
            placeholder="Enter customer promise and dining vision..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-amber-500 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
