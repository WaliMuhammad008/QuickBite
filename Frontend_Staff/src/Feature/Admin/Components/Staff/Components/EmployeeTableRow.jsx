import React from "react";
import { FaEdit, FaTrash, FaPhone, FaEnvelope } from "react-icons/fa";

const getRoleBadge = (roleName) => {
  const role = (roleName || "").toLowerCase();
  switch (role) {
    case "manager":
      return "bg-purple-500/15 text-purple-400 border border-purple-500/30";
    case "chef":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    case "rider":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "cashier":
      return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    case "waiter":
      return "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30";
    case "dispatcher":
      return "bg-pink-500/15 text-pink-400 border border-pink-500/30";
    default:
      return "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30";
  }
};

export default function EmployeeTableRow({
  emp,
  handleEditClick,
  handleDelete,
}) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
      <td className="p-3.5 sm:p-4 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {(emp.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
              {emp.name}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold block">
              ID: #{emp.id}
            </span>
          </div>
        </div>
      </td>
      <td className="p-3.5 sm:p-4 align-middle">
        <div className="flex flex-col items-start gap-1">
          <span
            className={`!rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider inline-block ${getRoleBadge(
              emp.role
            )}`}
          >
            {emp.role || "Unassigned"}
          </span>
          {!emp.username && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/10">
              No Portal Access
            </span>
          )}
        </div>
      </td>
      <td className="p-3.5 sm:p-4 align-middle font-medium text-slate-600 dark:text-neutral-400">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <FaPhone className="text-[10px] text-slate-400 dark:text-neutral-500" />
            <span className="text-xs">{emp.phone || "--"}</span>
          </div>
          {emp.email && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-neutral-400 truncate max-w-[200px]" title={emp.email}>
              <FaEnvelope className="text-[9px] shrink-0 text-amber-500" />
              <span className="truncate">{emp.email}</span>
            </div>
          )}
        </div>
      </td>
      <td className="p-3.5 sm:p-4 align-middle font-black text-amber-600 dark:text-amber-400 font-mono">
        Rs. {Number(emp.salary || 0).toLocaleString()}
      </td>
      <td className="p-3.5 sm:p-4 align-middle">
        <span
          className={`px-3 py-0.5 !rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
            emp.status === "Active"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-neutral-500/15 text-neutral-500 dark:text-neutral-400 border border-neutral-500/30"
          }`}
        >
          {emp.status}
        </span>
      </td>
      <td className="p-3.5 sm:p-4 align-middle text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => handleEditClick(emp)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-neutral-950 dark:bg-white/5 dark:hover:bg-amber-500 dark:hover:text-neutral-950 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Edit Details"
          >
            <FaEdit className="text-[11px]" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={() => handleDelete(emp.id, emp.name)}
            className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Delete Record"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      </td>
    </tr>
  );
}
