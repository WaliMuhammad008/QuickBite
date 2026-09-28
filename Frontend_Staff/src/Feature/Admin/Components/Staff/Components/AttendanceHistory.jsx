import React, { useState, useEffect } from "react";
import { FaFileExcel, FaChartPie, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { apiFetch } from "../../../../../utils/apiHelper";

const AttendanceHistory = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await apiFetch("get_attendance.php");
        const result = await response.json();
        if (result.success) {
          setAttendanceData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const handleExportCSV = () => {
    if (attendanceData.length === 0) return;
    const headers = ["Employee Name", "Total Days", "Present", "Absent", "Late", "Attendance Rate"];
    const rows = attendanceData.map((emp) => [
      `"${emp.name}"`,
      26,
      emp.present || 0,
      emp.absent || 0,
      emp.late || 0,
      `${Math.min(100, Math.round(((emp.present || 0) / 26) * 100))}%`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${new Date().toISOString().slice(0, 7)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading)
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Monthly Attendance History...
      </div>
    );

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header & Export Button */}
      <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <h4 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Monthly Performance & Attendance History
          </h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Staff reliability rating and present-to-working days breakdown.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none shrink-0 active:scale-95"
        >
          <FaFileExcel className="text-xs" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* History Table */}
      <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
        <div className="table-responsive-container">
          <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Staff Member
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Working Days
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Present
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Absent
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Late
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Performance Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {attendanceData.length > 0 ? (
                attendanceData.map((emp) => {
                  const present = parseInt(emp.present) || 0;
                  const absent = parseInt(emp.absent) || 0;
                  const late = parseInt(emp.late) || 0;
                  const workingDays = 26;
                  let percentage = Math.min(100, Math.round((present / workingDays) * 100));

                  const barColor =
                    percentage >= 85
                      ? "bg-emerald-500"
                      : percentage >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500";

                  const textColor =
                    percentage >= 85
                      ? "text-emerald-600 dark:text-emerald-400"
                      : percentage >= 50
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-rose-600 dark:text-rose-400";

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 sm:p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {(emp.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                              {emp.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle text-slate-500 dark:text-neutral-400 font-medium">
                        {workingDays} Days
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle text-emerald-600 dark:text-emerald-400 font-black font-mono">
                        {present} Days
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle text-rose-600 dark:text-rose-400 font-bold font-mono">
                        {absent} Days
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle text-amber-700 dark:text-amber-400 font-bold font-mono">
                        {late} Days
                      </td>
                      <td className="p-3.5 sm:p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-28 h-2 bg-slate-200 dark:bg-black/50 rounded-full overflow-hidden border border-slate-300 dark:border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className={`font-black text-xs font-mono ${textColor}`}>
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-12 text-xs text-[var(--admin-muted,#888)] font-semibold"
                  >
                    No staff attendance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
