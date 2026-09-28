import React from "react";

export default function EmployeePersonalInfoForm({
  formData,
  handleChange,
  phoneError,
  setPhoneError,
  setFormData,
}) {
  return (
    <>
      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Full Legal Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          placeholder="e.g. Muhammad Ali"
        />
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Mobile Contact (11 Digits) *
        </label>
        <input
          type="tel"
          name="phone"
          maxLength="11"
          value={formData.phone}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, phone: val }));
            if (val.length > 0 && val.length < 11) {
              setPhoneError("Please enter all 11 digits.");
            } else if (val.length === 11 && !/^03\d{9}$/.test(val)) {
              setPhoneError("Number must start with 03 (e.g. 03001234567).");
            } else {
              setPhoneError("");
            }
          }}
          required
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          placeholder="e.g. 03001234567"
        />
        {phoneError && (
          <span className="text-[10px] text-rose-500 font-bold block mt-1">
            {phoneError}
          </span>
        )}
      </div>

      <div>
        <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
          Email Address (For Password Reset & Notifications)
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
          placeholder="e.g. staff@gmail.com"
        />
      </div>
    </>
  );
}
