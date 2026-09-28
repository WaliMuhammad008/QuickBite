import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FaDollarSign, FaSave, FaSpinner, FaTruck } from "react-icons/fa";
import Swal from "sweetalert2";

const FinancialSettings = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    tax_rate: "0",
    delivery_fee: "0",
    free_delivery_threshold: "1500",
    accept_cards: false,
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
        tax_rate: settingsData.tax_rate || "0",
        delivery_fee: settingsData.default_delivery_fee || settingsData.delivery_fee || "0",
        free_delivery_threshold: settingsData.free_delivery_threshold || "1500",
        accept_cards: settingsData.accept_cards === "true" || settingsData.accept_cards === "1",
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
            tax_rate: settings.tax_rate,
            delivery_fee: settings.delivery_fee,
            default_delivery_fee: settings.delivery_fee,
            free_delivery_threshold: settings.free_delivery_threshold,
            accept_cards: settings.accept_cards ? "true" : "false",
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Financial Settings Updated!",
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
        Loading Financial Settings...
      </div>
    );

  return (
    <div className="admin-card-surface bg-white dark:bg-[#161616] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-white/[0.06] text-slate-900 dark:text-white shadow-sm space-y-6 animate-slide-up">
      {/* Card Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <FaDollarSign className="text-amber-500 text-sm" />
          <h3 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Financial, Taxes & Delivery Charges
          </h3>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
          <span>Save Financials</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Accept Online Credit/Debit Cards */}
        {/* <div className="p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
              Accept Online Card Payments
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Enable debit/credit card gateway option during checkout on customer portal.
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="accept_cards"
              checked={settings.accept_cards}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div> */}

        {/* Tax Rate, Delivery Fee & Free Delivery Threshold */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Sales Tax / GST Rate (%)
            </label>
            <input
              type="number"
              name="tax_rate"
              value={settings.tax_rate}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
              placeholder="e.g. 16"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Standard Flat Delivery Fee (Rs.)
            </label>
            <input
              type="number"
              name="delivery_fee"
              value={settings.delivery_fee}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
              placeholder="e.g. 150"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FaTruck className="text-amber-500 text-[11px]" />
              <span>Free Delivery Min Spend (Rs.)</span>
            </label>
            <input
              type="number"
              name="free_delivery_threshold"
              value={settings.free_delivery_threshold}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 font-mono"
              placeholder="e.g. 1500"
            />
            <p className="text-[10px] text-slate-500 dark:text-neutral-400 mt-1 m-0">
              Cart subtotal required to trigger 100% Free Delivery waiver.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSettings;
