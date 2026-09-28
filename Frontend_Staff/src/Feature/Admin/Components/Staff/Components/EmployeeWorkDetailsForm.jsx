import React, { useState } from "react";
import {
  FaUserLock,
  FaMotorcycle,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { useStaffRoles } from "../hooks/useStaffRoles";

export default function EmployeeWorkDetailsForm({
  formData,
  handleChange,
  customRoleName,
  setCustomRoleName,
  enablePortalAccess = true,
  setEnablePortalAccess,
}) {
  const { roles } = useStaffRoles();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isCustomRole = formData.role === "__CUSTOM__";

  const pwd = formData.password || "";
  const cpwd = formData.confirm_password || "";

  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  const isMatch = pwd.length > 0 && cpwd.length > 0 && pwd === cpwd;

  const PORTAL_ROLES = [
    "Admin",
    "Manager",
    "Cashier",
    "Dispatcher",
    "Chef",
    "Kitchen",
    "Rider",
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Staff Role *
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => {
              handleChange(e);
              const val = e.target.value;
              if (setEnablePortalAccess) {
                setEnablePortalAccess(PORTAL_ROLES.includes(val));
              }
            }}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} className="bg-white dark:bg-[#171717]" value={r}>
                {r === "Chef" ? "Chef / Kitchen" : r}
              </option>
            ))}
            <option className="bg-white dark:bg-[#171717] font-bold text-amber-600 dark:text-amber-400" value="__CUSTOM__">
              + Enter Custom Role...
            </option>
          </select>
          {isCustomRole && (
            <div className="mt-2.5 animate-slide-up">
              <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Custom Role Title *
              </label>
              <input
                type="text"
                placeholder="Specify Role Title (e.g. Security Guard, Cleaner, Barista)"
                value={customRoleName}
                onChange={(e) => setCustomRoleName(e.target.value)}
                required
                autoFocus
                className="w-full px-3.5 py-2 bg-white dark:bg-[#171717] border border-amber-500 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-slate-400 dark:placeholder-neutral-500"
              />
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
            Monthly Salary (Rs.) *
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
            placeholder="e.g. 45000"
          />
        </div>
      </div>

      {/* Rider Specific Details */}
      {formData.role === "Rider" && (
        <div className="p-3.5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-amber-500/20 space-y-3 animate-slide-up">
          <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <FaMotorcycle />
            <span>Rider Vehicle & License Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                Bike Plate Number *
              </label>
              <input
                type="text"
                name="bike_number"
                value={formData.bike_number}
                onChange={handleChange}
                required={formData.role === "Rider"}
                className="w-full px-3 py-2 bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
                placeholder="e.g. LEB-1234"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 block mb-1">
                License Number *
              </label>
              <input
                type="text"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                required={formData.role === "Rider"}
                className="w-full px-3 py-2 bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs"
                placeholder="e.g. DL-9876543"
              />
            </div>
          </div>
        </div>
      )}

      {/* Portal Credentials Section */}
      <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 space-y-3.5">
        <div className="flex items-center justify-between pb-1">
          <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center gap-2">
            <FaUserLock className="text-amber-500" />
            <span>Portal Login Credentials</span>
          </div>
          {enablePortalAccess && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Strong Password Enforced
            </span>
          )}
        </div>

        {/* Portal Login Access Toggle */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-black/30 rounded-xl border border-slate-200 dark:border-white/10">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 block">
              Enable Portal Login Access
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400 block">
              {enablePortalAccess
                ? "This staff member can log in to their assigned portal (POS, Dispatcher, Kitchen, Rider, etc.)"
                : "No portal credentials required (e.g. Cleaners, Waiters, Guards, Ground Staff)"}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
            <input
              type="checkbox"
              checked={enablePortalAccess}
              onChange={(e) => {
                if (setEnablePortalAccess) {
                  setEnablePortalAccess(e.target.checked);
                }
              }}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {enablePortalAccess ? (
          <div className="space-y-3.5 pt-1 animate-slide-up">
            {/* Username & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required={enablePortalAccess}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
                  placeholder="e.g. ali_staff"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  Email (For OTP Login)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
                  placeholder="e.g. staff@quickibite.com"
                />
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password Field */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={enablePortalAccess}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-200 border-none bg-transparent cursor-pointer p-1 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password || ""}
                    onChange={handleChange}
                    required={enablePortalAccess}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-black/40 border ${
                      cpwd && !isMatch
                        ? "border-red-500 focus:border-red-500"
                        : cpwd && isMatch
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-slate-300 dark:border-white/10 focus:border-amber-500"
                    } text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-600`}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-200 border-none bg-transparent cursor-pointer p-1 transition-colors"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Password Criteria Indicators */}
            <div className="p-2.5 bg-slate-100/70 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider m-0">
                Password Requirements:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                    hasLength
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-neutral-500"
                  }`}
                >
                  {hasLength ? (
                    <FaCheck className="text-[10px] text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
                  )}
                  <span>Min. 8 Letters</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                    hasUpper
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-neutral-500"
                  }`}
                >
                  {hasUpper ? (
                    <FaCheck className="text-[10px] text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
                  )}
                  <span>1+ Capital (A-Z)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                    hasSpecial
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400 dark:text-neutral-500"
                  }`}
                >
                  {hasSpecial ? (
                    <FaCheck className="text-[10px] text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
                  )}
                  <span>1+ Special (!@#$)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                    isMatch
                      ? "text-emerald-600 dark:text-emerald-400"
                      : cpwd && !isMatch
                      ? "text-red-500 dark:text-red-400"
                      : "text-slate-400 dark:text-neutral-500"
                  }`}
                >
                  {isMatch ? (
                    <FaCheck className="text-[10px] text-emerald-500 shrink-0" />
                  ) : cpwd && !isMatch ? (
                    <FaTimes className="text-[10px] text-red-500 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
                  )}
                  <span>Both Match</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-100/80 dark:bg-white/[0.02] rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">
              Portal access is disabled. No username or password is required for this role.
            </span>
          </div>
        )}
      </div>
    </>
  );
}
