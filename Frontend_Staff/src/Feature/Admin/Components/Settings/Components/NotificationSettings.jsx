import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaBell, FaSave, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";

const NotificationSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    sound_alert: true,
    email_notif: false,
    stock_alerts: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const { data: settingsData = {}, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/get_settings.php`);
      const result = await response.json();
      return result.success ? result.data : {};
    }
  });

  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings({
        sound_alert: settingsData.sound_alert === "true",
        email_notif: settingsData.email_notif === "true",
        stock_alerts: settingsData.stock_alerts === "true",
      });
    }
  }, [settingsData]);

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sound_alert: settings.sound_alert ? "true" : "false",
            email_notif: settings.email_notif ? "true" : "false",
            stock_alerts: settings.stock_alerts ? "true" : "false",
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Notifications Updated!",
          showConfirmButton: false,
          timer: 1500,
          background: "#171717",
          color: "#fff",
        });
        queryClient.invalidateQueries({ queryKey: ['settings'] });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Network Connection Failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="py-12 text-center text-xs text-[var(--admin-muted,#888)] font-bold uppercase tracking-wider">
        Loading Notifications Settings...
      </div>
    );

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      {/* Card Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <FaBell className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Sound Chimes & Staff Alert Triggers
          </h3>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
          <span>Save Alerts</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Sound Alert Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
              POS Order Bell Chime (Sound Alert)
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Play sound notification audio chime whenever a new online order arrives.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="sound_alert"
              checked={settings.sound_alert}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Email Notification Toggle */}
        <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
              Email Order Receipts to Admin
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Send an email copy of each finalized order invoice to the store admin email.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="email_notif"
              checked={settings.email_notif}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Low Stock Warning Alert */}
        <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
              Low Stock Level Warning Badges
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Highlight inventory items and recipe ingredients in red when stock falls below reorder threshold.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="stock_alerts"
              checked={settings.stock_alerts}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
