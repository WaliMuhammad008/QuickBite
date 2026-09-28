import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUserLock, FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { useStaffRoles } from "../hooks/useStaffRoles";

export default function EditEmployeeModal({
  isOpen,
  onClose,
  editingEmp,
  handleChange,
  handleSave,
  phoneError,
}) {
  const { roles } = useStaffRoles();
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (editingEmp) {
      const isKnown = roles.includes(editingEmp.role);
      const isCustom = !isKnown && Boolean(editingEmp.role);
      setIsCustomRole(isCustom);
      setCustomRoleInput(isCustom ? (editingEmp.role || "") : "");
    }
  }, [editingEmp?.id, editingEmp?.role, roles]);

  if (!isOpen || !editingEmp) return null;

  const handleRoleSelect = (e) => {
    const val = e.target.value;
    if (val === "__CUSTOM__") {
      setIsCustomRole(true);
      handleChange({ target: { name: "role", value: customRoleInput || "" } });
    } else {
      setIsCustomRole(false);
      handleChange(e);
    }
  };

  const handleCustomRoleChange = (e) => {
    const val = e.target.value;
    setCustomRoleInput(val);
    handleChange({ target: { name: "role", value: val } });
  };

  const pwd = editingEmp.password || "";
  const cpwd = editingEmp.confirm_password || "";

  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  const isMatch = pwd.length > 0 && cpwd.length > 0 && pwd === cpwd;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 w-screen h-screen transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] w-full max-w-lg bg-white dark:bg-[#121216] shadow-2xl shadow-black/80 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base font-black font-['Oswald',sans-serif] uppercase tracking-wide">
              Edit Staff Member
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border-none cursor-pointer transition-all active:scale-90"
            onClick={onClose}
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={editingEmp.name || ""}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Role / Designation
            </label>
            <select
              name="role"
              value={isCustomRole ? "__CUSTOM__" : (editingEmp.role || "")}
              onChange={handleRoleSelect}
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
                  value={customRoleInput}
                  onChange={handleCustomRoleChange}
                  required
                  autoFocus
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#171717] border border-amber-500 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder-slate-400 dark:placeholder-neutral-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Mobile Number
            </label>
            <input
              type="text"
              name="phone"
              value={editingEmp.phone || ""}
              onChange={handleChange}
              required
              placeholder="03001234567"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
            {phoneError && (
              <p className="text-rose-500 text-[11px] font-bold mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Email Address (For Password Reset)
            </label>
            <input
              type="email"
              name="email"
              value={editingEmp.email || ""}
              onChange={handleChange}
              placeholder="e.g. staff@gmail.com"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Monthly Base Salary (PKR)
            </label>
            <input
              type="number"
              name="salary"
              value={editingEmp.salary || ""}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <select
              name="status"
              value={editingEmp.status || "Active"}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option className="bg-white dark:bg-[#171717]" value="Active">Active</option>
              <option className="bg-white dark:bg-[#171717]" value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Portal Login Credentials */}
          <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <div className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                <FaUserLock className="text-amber-500" />
                <span>Portal Login Credentials</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400">
                Optional: Leave blank to retain existing password
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editingEmp.username || ""}
                  onChange={handleChange}
                  placeholder="e.g. ali_staff (leave blank for No Portal Access)"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  Email (For OTP Login)
                </label>
                <input
                  type="email"
                  name="email"
                  value={editingEmp.email || ""}
                  onChange={handleChange}
                  placeholder="e.g. staff@quickibite.com"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* New Password */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={editingEmp.password || ""}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none focus:border-amber-500 placeholder:text-slate-400 dark:placeholder:text-neutral-600"
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

              {/* Confirm New Password */}
              <div>
                <label className="text-[11px] font-extrabold text-slate-600 dark:text-neutral-400 block mb-1 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={editingEmp.confirm_password || ""}
                    onChange={handleChange}
                    placeholder={pwd ? "Re-enter new password" : "Leave blank"}
                    disabled={!pwd}
                    className={`w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-black/40 border ${
                      pwd && cpwd && !isMatch
                        ? "border-red-500 focus:border-red-500"
                        : pwd && cpwd && isMatch
                        ? "border-emerald-500 focus:border-emerald-500"
                        : "border-slate-300 dark:border-white/10 focus:border-amber-500"
                    } text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-600 disabled:opacity-40`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={!pwd}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-200 border-none bg-transparent cursor-pointer p-1 transition-colors disabled:opacity-30"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Checklist when password is being updated */}
            {pwd.length > 0 && (
              <div className="p-2.5 bg-slate-100/70 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/[0.06] space-y-1.5 animate-slide-up">
                <p className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider m-0">
                  New Password Requirements:
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
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-neutral-600 shrink-0" />
                    )}
                    <span>Both Match</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-brand-cta px-5 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
