import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaSave, FaHeading, FaSpinner } from "react-icons/fa";

const HeroTextSettings = () => {
  const [settings, setSettings] = useState({
    hero_title: "",
    hero_subtitle: "",
    hero_search_placeholder: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
        const result = await response.json();
        if (result.success && result.data) {
          setSettings({
            hero_title: result.data.hero_title || "",
            hero_subtitle: result.data.hero_subtitle || "",
            hero_search_placeholder: result.data.hero_search_placeholder || "",
          });
        }
      } catch (error) {
        console.error("Failed to load hero text settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/update_settings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: "Hero text settings have been updated successfully.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
      } else {
        Swal.fire("Error", result.message || "Failed to update settings.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="py-8 text-center text-xs text-[var(--admin-muted,#888)] font-bold uppercase tracking-wider">
        Loading Hero Static Content...
      </div>
    );

  return (
    <div className="admin-card-surface bg-white dark:bg-[#121216] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <FaHeading className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Hero Static Content & Headings
          </h3>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
          <span>Save Content</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Hero Title (Supports HTML e.g. &lt;span style="color:#f59e0b;"&gt;BIG BITE&lt;/span&gt;)
          </label>
          <input
            type="text"
            name="hero_title"
            value={settings.hero_title}
            onChange={handleChange}
            placeholder="WELCOME TO <span style='color:#f59e0b;'>BIG BITE!</span>"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Hero Subtitle
          </label>
          <input
            type="text"
            name="hero_subtitle"
            value={settings.hero_subtitle}
            onChange={handleChange}
            placeholder="Order Delicious Fast Food Online"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Search Bar Placeholder
          </label>
          <input
            type="text"
            name="hero_search_placeholder"
            value={settings.hero_search_placeholder}
            onChange={handleChange}
            placeholder="Search our delicious burgers, pizzas..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroTextSettings;
