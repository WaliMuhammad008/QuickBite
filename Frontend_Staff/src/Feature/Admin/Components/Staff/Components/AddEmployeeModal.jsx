import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaUserPlus, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import EmployeePersonalInfoForm from "./EmployeePersonalInfoForm";
import EmployeeWorkDetailsForm from "./EmployeeWorkDetailsForm";
import { apiFetch } from "../../../../../utils/apiHelper";

const PORTAL_ROLES = [
  "Admin",
  "Manager",
  "Cashier",
  "Dispatcher",
  "Chef",
  "Kitchen",
  "Rider",
];

const initialFormData = {
  name: "",
  role: "Waiter",
  phone: "",
  email: "",
  salary: "",
  username: "",
  password: "",
  confirm_password: "",
  bike_number: "",
  license_number: "",
};

const AddEmployeeModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [enablePortalAccess, setEnablePortalAccess] = useState(false);
  const [customRoleName, setCustomRoleName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!/^03\d{9}$/.test(formData.phone)) {
      setPhoneError("Please enter a valid 11-digit mobile number.");
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter exactly 11 digits starting with 03 (e.g. 03001234567).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    const isCustomRole = formData.role === "__CUSTOM__";
    if (isCustomRole && !customRoleName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Role Title",
        text: "Please specify the custom role title (e.g. Security Guard, Cleaner, Barista).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    const pwd = (formData.password || "").trim();
    const cpwd = (formData.confirm_password || "").trim();
    const uname = (formData.username || "").trim();

    // Validate credentials only when portal access is enabled
    if (enablePortalAccess) {
      if (!uname) {
        Swal.fire({
          icon: "warning",
          title: "Username Required",
          text: "Please enter a username for portal login access.",
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      if (!pwd || pwd.length < 8) {
        Swal.fire({
          icon: "warning",
          title: "Password Too Short",
          text: "Password must be at least 8 characters long.",
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      if (!/[A-Z]/.test(pwd)) {
        Swal.fire({
          icon: "warning",
          title: "Capital Letter Required",
          text: "Password must contain at least one capital letter (A-Z).",
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
        Swal.fire({
          icon: "warning",
          title: "Special Character Required",
          text: "Password must contain at least one special character (!@#$%^&* etc.).",
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      if (pwd !== cpwd) {
        Swal.fire({
          icon: "error",
          title: "Passwords Do Not Match",
          text: "Please make sure your password and confirm password match.",
          background: "#171717",
          color: "#fff",
        });
        return;
      }
    }

    const finalRole = isCustomRole ? customRoleName.trim() : formData.role;
    const cleanEmail = (formData.email || "").trim();

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email Address",
        text: "Please provide a valid email address (e.g. staff@example.com).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        role: finalRole,
        phone: formData.phone.trim(),
        email: cleanEmail || null,
        salary: formData.salary,
        enable_portal: enablePortalAccess,
        username: enablePortalAccess ? uname : null,
        password: enablePortalAccess ? pwd : null,
        confirm_password: enablePortalAccess ? cpwd : null,
        bike_number: formData.bike_number || "",
        license_number: formData.license_number || "",
      };

      const response = await apiFetch("add_staff.php", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      let result;
      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        console.error("Non-JSON API response in add_staff:", text, parseErr);
        if (text.includes('"success":true') || text.includes('"success": true')) {
          result = { success: true, message: "Staff enrolled successfully." };
        } else {
          throw new Error(text || "Invalid server response.");
        }
      }

      if (response.ok && result?.success) {
        Swal.fire({
          icon: "success",
          title: "Staff Enrolled!",
          text: result.message || "New staff member added.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });

        if (onSave) onSave();
        window.dispatchEvent(new CustomEvent("staff-updated"));

        setFormData(initialFormData);
        setCustomRoleName("");
        setEnablePortalAccess(false);
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Action Failed",
          text: result?.message || "Failed to enroll staff member.",
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Staff enrollment network error:", error);
      Swal.fire({
        icon: "error",
        title: "System Error",
        text: error?.message || "Failed to connect with server.",
        background: "#171717",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 w-screen h-screen transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative z-[10000] w-full max-w-lg md:max-w-xl bg-white dark:bg-[#121216] shadow-2xl shadow-black/80 rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 sm:p-7 max-h-[90vh] overflow-y-auto space-y-4 animate-slide-up text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h3 className="m-0 text-base sm:text-lg font-black font-['Oswald',sans-serif] uppercase tracking-wide">
              Enroll New Staff Member
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <EmployeePersonalInfoForm
            formData={formData}
            handleChange={handleChange}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            setFormData={setFormData}
          />

          <EmployeeWorkDetailsForm
            formData={formData}
            handleChange={handleChange}
            customRoleName={customRoleName}
            setCustomRoleName={setCustomRoleName}
            enablePortalAccess={enablePortalAccess}
            setEnablePortalAccess={setEnablePortalAccess}
          />

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/[0.06]">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-white/10 text-xs font-bold uppercase tracking-wider cursor-pointer"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-brand-cta px-6 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaUserPlus className="text-xs" />
              )}
              <span>Enroll Staff</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddEmployeeModal;
