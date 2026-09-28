import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FaUsers,
  FaCalendarCheck,
  FaUserPlus,
  FaMoneyBillWave,
  FaClock,
  FaHistory,
} from "react-icons/fa";

// Components Imports
import EmployeeList from "./Components/EmployeeList";
import AttendanceSheet from "./Components/AttendanceSheet";
import Payroll from "./Components/Payroll";
// import ShiftManager from "./Components/ShiftManager";
import AttendanceHistory from "./Components/AttendanceHistory";
import AddEmployeeModal from "./Components/AddEmployeeModal";
import { apiFetch } from "../../../../utils/apiHelper";

const StaffDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("employees");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: staffData = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const response = await apiFetch("get_staff.php");
      const result = await response.json();
      return result.success && Array.isArray(result.data) ? result.data : [];
    }
  });

  const stats = useMemo(() => {
    return {
      total: staffData.length,
      active: staffData.filter((emp) => emp.status === "Active").length
    };
  }, [staffData]);

  const handleEmployeeAdded = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['staff'] });
    queryClient.invalidateQueries({ queryKey: ['staff_roles'] });
  };

  const tabs = [
    { id: "employees", label: "Employee List", icon: <FaUsers /> },
    { id: "attendance", label: "Daily Attendance", icon: <FaCalendarCheck /> },
    { id: "payroll", label: "Payroll", icon: <FaMoneyBillWave /> },
    // { id: "shifts", label: "Shift Roster", icon: <FaClock /> },
    { id: "history", label: "Attendance History", icon: <FaHistory /> },
  ];

  return (
    <div className="space-y-5 animate-slide-up pb-8">
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-red-600 rounded-full shrink-0" />
            <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white m-0 font-['Oswald',sans-serif] uppercase tracking-wide">
              Staff & HR Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-neutral-400 m-0 mt-0.5 font-sans">
            Manage employee records, daily attendance, payroll calculations, and shifts.
          </p>
        </div>

        {activeTab === "employees" && (
          <button
            type="button"
            className="btn-brand-cta px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer border-none shrink-0 active:scale-95"
            onClick={() => setIsModalOpen(true)}
          >
            <FaUserPlus className="text-xs" />
            <span>Add New Staff</span>
          </button>
        )}
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-white/[0.06] shadow-sm">
          <div>
            <p className="m-0 text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Total Registered Staff</p>
            <h3 className="m-0 text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20">
            <FaUsers />
          </div>
        </div>

        <div className="admin-card-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-white/[0.06] shadow-sm">
          <div>
            <p className="m-0 text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Active on Shift</p>
            <h3 className="m-0 text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{stats.active}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <FaCalendarCheck />
          </div>
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full py-2 border-b border-slate-200 dark:border-white/[0.06]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center gap-2 cursor-pointer transition-all border-none whitespace-nowrap shrink-0 ${
                isActive
                  ? "btn-brand-cta !rounded-full px-5 py-2 text-xs font-bold shadow-sm"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/[0.04] hover:bg-slate-200 dark:hover:bg-white/[0.08] px-5 py-2 rounded-full text-xs font-semibold border border-slate-200/60 dark:border-white/[0.06]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === "employees" && <EmployeeList />}
        {activeTab === "attendance" && <AttendanceSheet />}
        {activeTab === "payroll" && <Payroll />}
        {activeTab === "shifts" && <ShiftManager />}
        {activeTab === "history" && <AttendanceHistory />}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleEmployeeAdded}
      />
    </div>
  );
};

export default StaffDashboard;
