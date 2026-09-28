import React from "react";

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

export default function AttendanceTableRow({
  emp,
  attendanceData = {},
  handleStatusChange,
  handleTimeChange,
}) {
  const currentStatus = attendanceData[emp.id]?.status || "Present";
  const isAbsent = currentStatus === "Absent";

  return (
    <tr
      className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
        isAbsent ? "bg-rose-500/[0.03]" : ""
      }`}
    >
      <td className="p-3.5 sm:p-4 align-middle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {emp.name.charAt(0).toUpperCase()}
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
        <span
          className={`!rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider inline-block ${getRoleBadge(
            emp.role
          )}`}
        >
          {emp.role}
        </span>
      </td>
      <td className="p-3.5 sm:p-4 align-middle">
        {/* Segmented Modern P / A / L Pills */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/[0.06] gap-1">
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
              currentStatus === "Present"
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-transparent text-slate-400 dark:text-neutral-500 hover:bg-slate-200/60 dark:hover:bg-white/10"
            }`}
            onClick={() => handleStatusChange(emp.id, "Present")}
            title="Mark Present"
          >
            P
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
              currentStatus === "Absent"
                ? "bg-rose-500 text-white shadow-sm"
                : "bg-transparent text-slate-400 dark:text-neutral-500 hover:bg-slate-200/60 dark:hover:bg-white/10"
            }`}
            onClick={() => handleStatusChange(emp.id, "Absent")}
            title="Mark Absent"
          >
            A
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border-none ${
              currentStatus === "Late"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "bg-transparent text-slate-400 dark:text-neutral-500 hover:bg-slate-200/60 dark:hover:bg-white/10"
            }`}
            onClick={() => handleStatusChange(emp.id, "Late")}
            title="Mark Late"
          >
            L
          </button>
        </div>
      </td>
      <td className="p-3.5 sm:p-4 align-middle">
        <input
          type="time"
          value={attendanceData[emp.id]?.time || "09:00"}
          onChange={(e) => handleTimeChange(emp.id, e.target.value)}
          className={`bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono outline-none focus:border-amber-500 transition-all ${
            isAbsent ? "opacity-30 cursor-not-allowed" : ""
          }`}
          disabled={isAbsent}
        />
      </td>
      <td className="p-3.5 sm:p-4 align-middle text-right">
        <span
          className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider inline-block ${
            currentStatus === "Present"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : currentStatus === "Absent"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
          }`}
        >
          {currentStatus === "Present" ? "On Time" : currentStatus}
        </span>
      </td>
    </tr>
  );
}
