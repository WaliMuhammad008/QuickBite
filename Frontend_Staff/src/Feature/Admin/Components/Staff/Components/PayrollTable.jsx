import React from "react";
import PayrollTableRow from "./PayrollTableRow";

export default function PayrollTable({
  employees = [],
  workingDays = 26,
  handlePay,
}) {
  return (
    <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
      <div className="table-responsive-container">
        <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Employee
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Basic Salary
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Absences
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Deductions
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Net Payable
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                Status
              </th>
              <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <PayrollTableRow
                  key={emp.id}
                  emp={emp}
                  workingDays={workingDays}
                  handlePay={handlePay}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-12 text-xs text-[var(--admin-muted,#888)] font-semibold"
                >
                  No payroll records found for this cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
