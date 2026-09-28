import React, { useState } from "react";
import { FaPhoneAlt, FaCheckCircle, FaTimes, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";

export default function GooglePhoneModal() {
  const { showPhoneModal, setShowPhoneModal, updateCustomerPhone, customer } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showPhoneModal) return null;

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val.length <= 11) {
      setPhone(val);
      if (val.length > 0 && !val.startsWith("03")) {
        setError("Mobile number must start with 03");
      } else if (val.length === 11) {
        setError("");
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = phone.trim();

    if (!clean) {
      setError("Please enter your mobile number");
      return;
    }

    if (!/^03[0-9]{9}$/.test(clean)) {
      setError("Please enter a valid 11-digit mobile number (03XXXXXXXXX)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await updateCustomerPhone(clean);
      if (!res.success) {
        setError(res.message || "Failed to save phone number");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      sessionStorage.setItem("qb_skip_phone_prompt", "true");
      setShowPhoneModal(false);
    }
  };

  const isValid = /^03[0-9]{9}$/.test(phone);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-scale-up text-zinc-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close modal"
        >
          <FaTimes className="text-xs" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-neutral-950 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20">
            <FaPhoneAlt />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black font-['Oswald',sans-serif] uppercase tracking-wide text-zinc-900 dark:text-white m-0">
              Complete Your Profile
            </h3>
            <p className="text-xs text-zinc-600 dark:text-neutral-400 mt-0.5">
              Welcome, {customer?.full_name || "Foodie"}! 👋
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-neutral-300 leading-relaxed mb-6">
          Please enter your active 11-digit mobile number for instant order dispatch, live GPS tracking, and delivery updates.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-600 dark:text-neutral-400 mb-2">
              Mobile / WhatsApp Number <span className="text-amber-500 dark:text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600 dark:text-neutral-400 text-xs font-mono font-bold">
                🇵🇰 +92
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="03XXXXXXXXX"
                disabled={loading}
                autoFocus
                className={`w-full pl-20 pr-10 py-3.5 bg-gray-50 dark:bg-neutral-900/90 border rounded-2xl text-zinc-900 dark:text-white text-sm font-mono tracking-wider placeholder:text-gray-400 dark:placeholder:text-neutral-600 focus:outline-none transition-all ${
                  error
                    ? "border-red-500/70 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : isValid
                    ? "border-emerald-500/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    : "border-gray-300 dark:border-white/10 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20"
                }`}
              />
              {isValid && (
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500 dark:text-emerald-400 text-sm">
                  <FaCheckCircle />
                </div>
              )}
            </div>

            {error ? (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium flex items-center gap-1.5 animate-fade-in">
                <span>⚠️</span> {error}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 dark:text-neutral-500 mt-2 flex items-center gap-1.5">
                <FaShieldAlt className="text-[10px]" /> Never shared with third parties. Used strictly for rider contact.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={!isValid || loading}
              className={`w-full py-3.5 px-4 rounded-2xl font-black font-['Oswald',sans-serif] uppercase tracking-wider text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                isValid && !loading
                  ? "bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-500/20 cursor-pointer active:scale-[0.99]"
                  : "bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 cursor-not-allowed border border-gray-300 dark:border-white/5"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Number...</span>
                </>
              ) : (
                <span>Save & Continue</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full text-center text-xs text-zinc-500 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1 cursor-pointer disabled:opacity-50"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
