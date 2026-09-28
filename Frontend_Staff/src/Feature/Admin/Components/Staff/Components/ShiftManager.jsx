// import React, { useState, useEffect } from "react";
// import { FaGear } from "react-icons/fa6";
// import Swal from "sweetalert2";
// import ShiftCardItem from "./ShiftCardItem";
// import ShiftTable from "./ShiftTable";
// import { apiFetch } from "../../../../../utils/apiHelper";

// const ShiftManager = () => {
//   const [employees, setEmployees] = useState([]);
//   const [shiftTimings, setShiftTimings] = useState({
//     Morning: "08:00 AM - 04:00 PM",
//     Evening: "04:00 PM - 12:00 AM",
//     Night: "12:00 AM - 08:00 AM",
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch Staff and Timings
//   const fetchShifts = async () => {
//     try {
//       const response = await apiFetch("get_shifts.php");
//       const result = await response.json();
//       if (result.success) {
//         setEmployees(result.data || []);
//         if (result.timings) setShiftTimings(result.timings);
//       }
//     } catch (error) {
//       console.error("Error fetching shifts:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchShifts();
//   }, []);

//   // Update Individual Staff Shift
//   const handleShiftChange = async (id, newShift) => {
//     const updatedEmployees = employees.map((emp) =>
//       emp.id === id ? { ...emp, shift: newShift } : emp
//     );
//     setEmployees(updatedEmployees);

//     try {
//       const response = await apiFetch("update_shift.php", {
//         method: "POST",
//         body: JSON.stringify({ staff_id: id, shift: newShift }),
//       });
//       const result = await response.json();

//       if (result.success) {
//         Swal.fire({
//           toast: true,
//           position: "top-end",
//           icon: "success",
//           title: `Shift Updated to ${newShift}`,
//           showConfirmButton: false,
//           timer: 1500,
//           background: "#171717",
//           color: "#fff",
//         });
//       } else {
//         Swal.fire("Error", result.message, "error");
//         fetchShifts();
//       }
//     } catch (error) {
//       Swal.fire("Error", "Network error.", "error");
//       fetchShifts();
//     }
//   };

//   // Set Global Shift Timings
//   const handleSetTimings = () => {
//     Swal.fire({
//       title: "Configure Global Shift Hours",
//       html: `
//         <div style="text-align: left; margin-bottom: 12px;">
//           <label style="font-size: 12px; color: #f59e0b; font-weight: bold;">Morning Shift</label>
//           <input id="swal-morning" class="swal2-input" value="${shiftTimings.Morning}" style="width: 100%; margin-top: 4px; background: #222; color: #fff;">
//         </div>
//         <div style="text-align: left; margin-bottom: 12px;">
//           <label style="font-size: 12px; color: #fb923c; font-weight: bold;">Evening Shift</label>
//           <input id="swal-evening" class="swal2-input" value="${shiftTimings.Evening}" style="width: 100%; margin-top: 4px; background: #222; color: #fff;">
//         </div>
//         <div style="text-align: left; margin-bottom: 12px;">
//           <label style="font-size: 12px; color: #818cf8; font-weight: bold;">Night Shift</label>
//           <input id="swal-night" class="swal2-input" value="${shiftTimings.Night}" style="width: 100%; margin-top: 4px; background: #222; color: #fff;">
//         </div>
//       `,
//       showCancelButton: true,
//       confirmButtonText: "Save Shift Hours",
//       confirmButtonColor: "#f59e0b",
//       background: "#171717",
//       color: "#fff",
//       preConfirm: () => {
//         return {
//           Morning: document.getElementById("swal-morning").value,
//           Evening: document.getElementById("swal-evening").value,
//           Night: document.getElementById("swal-night").value,
//         };
//       },
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const response = await apiFetch("update_shift_timings.php", {
//             method: "POST",
//             body: JSON.stringify(result.value),
//           });
//           const data = await response.json();
//           if (data.success) {
//             setShiftTimings(result.value);
//             Swal.fire({
//               icon: "success",
//               title: "Saved!",
//               text: "Shift schedule timings updated.",
//               timer: 1500,
//               showConfirmButton: false,
//               background: "#171717",
//               color: "#fff",
//             });
//           }
//         } catch (error) {
//           Swal.fire("Error", "Could not save shift timings", "error");
//         }
//       }
//     });
//   };

//   if (isLoading)
//     return (
//       <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
//         Loading Shift Roster...
//       </div>
//     );

//   return (
//     <div className="space-y-5 animate-slide-up">
//       {/* Shift Timing Cards */}
//       <ShiftCardItem shiftTimings={shiftTimings} />

//       {/* Header & Adjust Timing Button */}
//       <div className="admin-card-surface flex justify-between items-center p-4 rounded-2xl shadow-sm">
//         <div className="text-xs font-extrabold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">
//           Staff Shift Allocations ({employees.length} Members)
//         </div>
//         <button
//           type="button"
//           onClick={handleSetTimings}
//           className="btn-brand-cta px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-none active:scale-95"
//         >
//           <FaGear className="w-3.5 h-3.5" />
//           <span>Configure Shift Hours</span>
//         </button>
//       </div>

//       {/* Shift Table */}
//       <ShiftTable
//         employees={employees}
//         handleShiftChange={handleShiftChange}
//       />
//     </div>
//   );
// };

// export default ShiftManager;
