import React from "react";
import { FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function PayrollTableRow({
  emp,
  workingDays = 26,
  handlePay,
}) {
  const salary = Number(emp.salary) || 0;
  const absents = Number(emp.absents) || 0;
  const isPaid = Number(emp.is_paid) > 0;

  const dailyRate = workingDays > 0 ? Math.round(salary / workingDays) : 0;
  const totalDeduction = absents * dailyRate;
  const netPay = Math.max(0, salary - totalDeduction);

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
              {emp.role}
            </span>
          </div>
        </div>
      </td>

      <td className="p-3.5 sm:p-4 align-middle">
        <span className="font-bold text-slate-900 dark:text-white block">
          Rs. {salary.toLocaleString()}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-neutral-500">
          Rs. {dailyRate.toLocaleString()} / day
        </span>
      </td>

      <td className="p-3.5 sm:p-4 align-middle">
        <span
          className={`!rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-block ${
            absents > 0
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {absents} {absents === 1 ? "Day" : "Days"}
        </span>
      </td>

      <td className="p-3.5 sm:p-4 align-middle">
        <span
          className={`font-bold ${
            absents > 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-slate-400 dark:text-neutral-500"
          }`}
        >
          {absents > 0 ? `- Rs. ${totalDeduction.toLocaleString()}` : "Rs. 0"}
        </span>
      </td>

      <td className="p-3.5 sm:p-4 align-middle">
        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
          Rs. {netPay.toLocaleString()}
        </span>
      </td>

      <td className="p-3.5 sm:p-4 align-middle">
        <span
          className={`!rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
            isPaid
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
          }`}
        >
          {isPaid ? (
            <>
              <FaCheckCircle className="text-[10px]" /> PAID
            </>
          ) : (
            <>
              <FaExclamationCircle className="text-[10px]" /> PENDING
            </>
          )}
        </span>
      </td>

      <td className="p-3.5 sm:p-4 align-middle text-right">
        {isPaid ? (
          <span className="text-[11px] text-slate-400 dark:text-neutral-500 font-semibold italic">
            Disbursed
          </span>
        ) : (
          <button
            type="button"
            onClick={() => handlePay(emp, absents, dailyRate, netPay)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border-none active:scale-95 inline-flex"
          >
            <FaMoneyBillWave className="text-xs" />
            <span>Pay Salary</span>
          </button>
        )}
      </td>
    </tr>
  );
}
