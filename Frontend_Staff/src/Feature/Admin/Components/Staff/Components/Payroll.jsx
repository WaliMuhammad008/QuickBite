import React, { useState, useEffect } from "react";
import { FaPrint, FaCog } from "react-icons/fa";
import Swal from "sweetalert2";
import PayrollSummaryCards from "./PayrollSummaryCards";
import PayrollTable from "./PayrollTable";
import { apiFetch } from "../../../../../utils/apiHelper";

const Payroll = () => {
  const [employees, setEmployees] = useState([]);
  const [offDays, setOffDays] = useState(4);
  const [totalDays, setTotalDays] = useState(30);
  const [workingDays, setWorkingDays] = useState(26);
  const [currentMonthStr, setCurrentMonthStr] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch payroll data
  const fetchPayrollData = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("get_payroll_data.php");
      const result = await response.json();

      if (result.success) {
        setOffDays(result.off_days ?? 4);
        setTotalDays(result.total_days ?? 30);
        setWorkingDays(result.working_days ?? 26);
        setCurrentMonthStr(result.current_month || "Current Month");
        setEmployees(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch payroll data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  // Admin: set monthly off days
  const handleSetOffDays = () => {
    Swal.fire({
      title: "Configure Monthly Off Days",
      html: `
        <p style="color:#aaa;font-size:13px;margin-bottom:12px">
          Enter how many weekly-off / holiday days are in <strong>${currentMonthStr}</strong>.<br/>
          Working Days = Total Days (${totalDays}) − Off Days
        </p>
      `,
      input: "number",
      inputLabel: "Number of Off Days",
      inputValue: offDays,
      inputAttributes: { min: 0, max: totalDays - 1, step: 1 },
      showCancelButton: true,
      confirmButtonText: "Save",
      confirmButtonColor: "#f59e0b",
      background: "#171717",
      color: "#fff",
      inputValidator: (value) => {
        if (value === "" || value === null) return "Please enter a value!";
        if (parseInt(value) < 0) return "Off days cannot be negative!";
        if (parseInt(value) >= totalDays)
          return `Off days must be less than ${totalDays}!`;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newOffDays = parseInt(result.value);
        try {
          const res = await apiFetch("update_off_days.php", {
            method: "POST",
            body: JSON.stringify({ off_days: newOffDays }),
          });
          const resData = await res.json();
          if (resData.success) {
            Swal.fire({
              icon: "success",
              title: "Saved!",
              text: `Off days set to ${newOffDays}. Working days: ${
                totalDays - newOffDays
              }`,
              background: "#171717",
              color: "#fff",
              timer: 1500,
              showConfirmButton: false,
            });
            fetchPayrollData();
          } else {
            Swal.fire("Error", resData.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Could not save settings.", "error");
        }
      }
    });
  };

  // Pay salary
  const handlePay = (emp, absents, dailyRate, netPay) => {
    Swal.fire({
      title: `Pay ${emp.name}?`,
      html: `
        <div style="text-align:left;font-size:13px;line-height:1.8;padding:8px 0;">
          <div style="display:flex;justify-content:space-between;color:#aaa"><span>Basic Salary:</span><strong style="color:#fff">Rs. ${Number(
            emp.salary
          ).toLocaleString()}</strong></div>
          <div style="display:flex;justify-content:space-between;color:#aaa"><span>Absents (${absents}d):</span><strong style="color:#ef4444">-Rs. ${Math.round(
        absents * dailyRate
      ).toLocaleString()}</strong></div>
          <div style="display:flex;justify-content:space-between;color:#aaa;border-top:1px solid #333;margin-top:6px;padding-top:6px">
            <span style="font-weight:bold;color:#fff">Net Disbursement:</span>
            <strong style="font-size:15px;color:#10b981">Rs. ${Math.round(
              netPay
            ).toLocaleString()}</strong>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Disbursement",
      confirmButtonColor: "#10b981",
      background: "#171717",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch("pay_salary.php", {
            method: "POST",
            body: JSON.stringify({
              staff_id: emp.id,
              salary: emp.salary,
              absents: absents,
              net_pay: netPay,
            }),
          });
          const resData = await response.json();
          if (resData.success) {
            Swal.fire({
              icon: "success",
              title: "Disbursed!",
              text: `Salary paid to ${emp.name}.`,
              background: "#171717",
              color: "#fff",
              timer: 1500,
              showConfirmButton: false,
            });
            fetchPayrollData();
          } else {
            Swal.fire("Error", resData.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Network error.", "error");
        }
      }
    });
  };

  if (isLoading)
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Monthly Payroll Calculations...
      </div>
    );

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Top Header & Actions */}
      <div className="admin-card-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-5 rounded-2xl shadow-sm">
        <div>
          <h4 className="m-0 text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Oswald',sans-serif] uppercase tracking-wide">
            Monthly Payroll & Wage Calculation ({currentMonthStr})
          </h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Automatic calculation based on daily attendance and monthly base pay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            onClick={handleSetOffDays}
          >
            <FaCog className="text-xs" />
            <span>Off Days ({offDays})</span>
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            onClick={() => window.print()}
          >
            <FaPrint className="text-xs" />
            <span>Print Slips</span>
          </button>
        </div>
      </div>

      {/* KPI Info Strip */}
      <PayrollSummaryCards
        totalDays={totalDays}
        offDays={offDays}
        workingDays={workingDays}
      />

      {/* Payroll Table */}
      <PayrollTable
        employees={employees}
        workingDays={workingDays}
        handlePay={handlePay}
      />
    </div>
  );
};

export default Payroll;
