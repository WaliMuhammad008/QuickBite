import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaMotorcycle, FaSave, FaToggleOn, FaToggleOff, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";

const OperationalSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    accept_orders: true,
    min_order: "0",
    delivery_radius: "10",
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
        accept_orders:
          settingsData.accept_orders !== "false" &&
          settingsData.accept_orders !== "0" &&
          settingsData.accept_orders !== false &&
          settingsData.accept_orders !== 0,
        min_order: settingsData.min_order || "0",
        delivery_radius: settingsData.delivery_radius || "10",
      });
    }
  }, [settingsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

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
            accept_orders: settings.accept_orders ? "true" : "false",
            min_order: settings.min_order,
            delivery_radius: settings.delivery_radius,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Operations Updated!",
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
        Loading Operations Settings...
      </div>
    );

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      {/* Card Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <FaMotorcycle className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Operations & Live Delivery Parameters
          </h3>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
          <span>Save Operations</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Accept Online Orders Card */}
        <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
              Accept Online Orders
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              When toggled off, customer portal will display store closed message and block checkout.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="accept_orders"
              checked={settings.accept_orders}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Minimum Order Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Minimum Order Value (Rs.)
            </label>
            <input
              type="number"
              name="min_order"
              value={settings.min_order}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              placeholder="e.g. 500"
            />
          </div>

          {/* Maximum Delivery Radius */}
          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Delivery Coverage Radius (km)
            </label>
            <input
              type="number"
              name="delivery_radius"
              value={settings.delivery_radius}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
              placeholder="e.g. 10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalSettings;
