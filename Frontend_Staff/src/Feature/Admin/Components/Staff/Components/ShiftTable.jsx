// import React from "react";
// import { FaSun, FaCloudSun, FaMoon } from "react-icons/fa6";

// const renderShiftBadge = (shiftName) => {
//   switch (shiftName) {
//     case "Evening":
//       return (
//         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20">
//           <FaCloudSun className="w-3.5 h-3.5 text-orange-500" />
//           <span>Evening</span>
//         </span>
//       );
//     case "Night":
//       return (
//         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
//           <FaMoon className="w-3.5 h-3.5 text-indigo-400" />
//           <span>Night</span>
//         </span>
//       );
//     case "Morning":
//     default:
//       return (
//         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
//           <FaSun className="w-3.5 h-3.5 text-amber-500" />
//           <span>Morning</span>
//         </span>
//       );
//   }
// };

// export default function ShiftTable({
//   employees = [],
//   handleShiftChange,
// }) {
//   return (
//     <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
//       <div className="table-responsive-container">
//         <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
//           <thead>
//             <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
//               <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
//                 Staff Member
//               </th>
//               <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
//                 Role
//               </th>
//               <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
//                 Current Shift
//               </th>
//               <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
//                 Assign New Shift
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
//             {employees.length > 0 ? (
//               employees.map((emp) => (
//                 <tr
//                   key={emp.id}
//                   className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
//                 >
//                   <td className="p-3.5 sm:p-4 align-middle">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
//                         {(emp.name || "U").charAt(0).toUpperCase()}
//                       </div>
//                       <div className="min-w-0">
//                         <span className="font-extrabold text-sm text-slate-900 dark:text-white block truncate">
//                           {emp.name}
//                         </span>
//                         <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-semibold block">
//                           ID: #{emp.id}
//                         </span>
//                       </div>
//                     </div>
//                   </td>

//                   <td className="p-3.5 sm:p-4 align-middle font-semibold text-slate-700 dark:text-neutral-300">
//                     {emp.role}
//                   </td>

//                   <td className="p-3.5 sm:p-4 align-middle">
//                     {renderShiftBadge(emp.shift || "Morning")}
//                   </td>

//                   <td className="p-3.5 sm:p-4 align-middle text-right">
//                     <select
//                       value={emp.shift || "Morning"}
//                       onChange={(e) =>
//                         handleShiftChange(emp.id, e.target.value)
//                       }
//                       className="admin-card-surface border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-amber-500 outline-none cursor-pointer"
//                     >
//                       <option
//                         className="bg-white dark:bg-[#171717]"
//                         value="Morning"
//                       >
//                         Morning Shift
//                       </option>
//                       <option
//                         className="bg-white dark:bg-[#171717]"
//                         value="Evening"
//                       >
//                         Evening Shift
//                       </option>
//                       <option
//                         className="bg-white dark:bg-[#171717]"
//                         value="Night"
//                       >
//                         Night Shift
//                       </option>
//                     </select>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td
//                   colSpan="4"
//                   className="text-center py-12 text-xs text-[var(--admin-muted,#888)] font-semibold"
//                 >
//                   No staff members available for shift assignment.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
