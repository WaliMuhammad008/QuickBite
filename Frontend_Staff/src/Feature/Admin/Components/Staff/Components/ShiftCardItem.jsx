// import React from "react";
// import { FaSun, FaCloudSun, FaMoon } from "react-icons/fa6";

// export default function ShiftCardItem({ shiftTimings }) {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//       {/* Morning Shift Card */}
//       <div className="admin-card-surface p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
//             <FaSun className="text-amber-500 w-4 h-4 inline mr-1.5" />
//             <span>Morning Shift</span>
//           </div>
//           <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
//             {shiftTimings.Morning}
//           </span>
//         </div>
//         <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
//           <FaSun className="w-5 h-5" />
//         </div>
//       </div>

//       {/* Evening Shift Card */}
//       <div className="admin-card-surface p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center text-xs font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
//             <FaCloudSun className="text-orange-500 w-4 h-4 inline mr-1.5" />
//             <span>Evening Shift</span>
//           </div>
//           <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
//             {shiftTimings.Evening}
//           </span>
//         </div>
//         <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20">
//           <FaCloudSun className="w-5 h-5" />
//         </div>
//       </div>

//       {/* Night Shift Card */}
//       <div className="admin-card-surface p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.06] shadow-sm flex items-center justify-between">
//         <div className="space-y-1">
//           <div className="flex items-center text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
//             <FaMoon className="text-indigo-400 w-4 h-4 inline mr-1.5" />
//             <span>Night Shift</span>
//           </div>
//           <span className="text-sm font-black text-slate-900 dark:text-white font-mono block">
//             {shiftTimings.Night}
//           </span>
//         </div>
//         <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
//           <FaMoon className="w-5 h-5" />
//         </div>
//       </div>
//     </div>
//   );
// }
