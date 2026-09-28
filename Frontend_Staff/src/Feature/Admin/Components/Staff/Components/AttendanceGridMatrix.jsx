import React from "react";
import { FaUserCheck, FaUserSlash, FaUserClock } from "react-icons/fa";
import AttendanceTableRow from "./AttendanceTableRow";

export default function AttendanceGridMatrix({
  employees = [],
  attendanceData = {},
  stats = { present: 0, absent: 0, late: 0 },
  handleStatusChange,
  handleTimeChange,
}) {
  return (
    <div className="space-y-4">
      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <FaUserCheck className="text-sm" />
            <span>Present Today</span>
          </div>
          <span className="font-bold text-2xl tracking-tight font-mono">
            {stats.present}
          </span>
        </div>

        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <FaUserSlash className="text-sm" />
            <span>Absent Staff</span>
          </div>
          <span className="font-bold text-2xl tracking-tight font-mono">
            {stats.absent}
          </span>
        </div>

        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
            <FaUserClock className="text-sm" />
            <span>Late Check-in</span>
          </div>
          <span className="font-bold text-2xl tracking-tight font-mono">
            {stats.late}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
        <div className="table-responsive-container">
          <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Employee
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Role
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Mark Status (P / A / L)
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Check-In Time
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
                  Status Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <AttendanceTableRow
                    key={emp.id}
                    emp={emp}
                    attendanceData={attendanceData}
                    handleStatusChange={handleStatusChange}
                    handleTimeChange={handleTimeChange}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-xs text-[var(--admin-muted,#888)] font-semibold"
                  >
                    No active staff found to mark attendance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
