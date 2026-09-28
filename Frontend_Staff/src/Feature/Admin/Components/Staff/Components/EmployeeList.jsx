import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import EmployeeFilterBar from "./EmployeeFilterBar";
import EmployeeTableRow from "./EmployeeTableRow";
import EditEmployeeModal from "./EditEmployeeModal";
import ServerPaginationControls from "../../SharedComponents/ServerPaginationControls";
import { apiFetch } from "../../../../../utils/apiHelper";

const PAGE_SIZE = 20;

const EmployeeList = () => {
  const queryClient = useQueryClient();
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const employeesRef = useRef(employees);
  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  const fetchStaffBatch = useCallback(async (offset = 0, isAppend = false) => {
    if (isAppend) {
      setIsLoadingMore(true);
    } else if (employeesRef.current.length === 0) {
      setIsLoading(true);
    }

    try {
      const response = await apiFetch(`get_staff.php?limit=${PAGE_SIZE}&offset=${offset}`);
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const fetched = result.data;
        const sTotal = result.total !== undefined ? result.total : fetched.length;
        setTotalCount(sTotal);

        if (isAppend) {
          setEmployees((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const newUnique = fetched.filter((e) => !existingIds.has(e.id));
            const merged = [...prev, ...newUnique];
            setHasMore(merged.length < sTotal);
            return merged;
          });
        } else {
          setEmployees(fetched);
          setHasMore(result.has_more !== undefined ? result.has_more : fetched.length < sTotal);
        }
      }
    } catch (err) {
      console.error("Staff fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const refreshSearch = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    try {
      const response = await apiFetch(`get_staff.php?search=${encodeURIComponent(trimmed)}`);
      const result = await response.json();
      if (result && result.success && Array.isArray(result.data)) {
        setSearchResults(result.data);
      }
    } catch (err) {
      console.error("Staff refresh search error:", err);
    }
  }, [searchQuery]);

  // Server-side debounced search across all database records
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await apiFetch(`get_staff.php?search=${encodeURIComponent(trimmed)}`);
        const result = await response.json();
        if (result && result.success && Array.isArray(result.data)) {
          setSearchResults(result.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Staff search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchStaffBatch(0, false);

    const handleStaffUpdated = () => {
      fetchStaffBatch(0, false);
      if (searchQuery.trim()) refreshSearch();
    };

    window.addEventListener("staff-updated", handleStaffUpdated);

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event?.query?.queryKey?.[0] === "staff" &&
        (event.type === "updated" || event.type === "invalidated")
      ) {
        fetchStaffBatch(0, false);
      }
    });

    return () => {
      window.removeEventListener("staff-updated", handleStaffUpdated);
      unsubscribe();
    };
  }, [fetchStaffBatch, queryClient, refreshSearch, searchQuery]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchStaffBatch(employees.length, true);
    }
  };

  const handleDelete = async (id, name) => {
    Swal.fire({
      title: `Delete ${name}?`,
      text: "This employee record and history will be removed from the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Delete",
      background: "#171717",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch("delete_staff.php", {
            method: "POST",
            body: JSON.stringify({ id }),
          });
          const resData = await response.json();
          if (resData.success) {
            // Immediate local state update
            setEmployees((prev) => prev.filter((e) => e.id !== id));
            setTotalCount((prev) => Math.max(0, prev - 1));
            setSearchResults((prev) => (prev ? prev.filter((e) => e.id !== id) : null));

            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Employee has been removed.",
              timer: 1500,
              showConfirmButton: false,
              background: "#171717",
              color: "#fff",
            });
            fetchStaffBatch(0, false);
            if (searchQuery.trim()) refreshSearch();
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            window.dispatchEvent(new CustomEvent("staff-updated"));
          } else {
            Swal.fire("Error!", resData.message || "Failed to delete staff member.", "error");
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to connect to server.", "error");
        }
      }
    });
  };

  const handleEditClick = (emp) => {
    setEditingEmp({
      ...emp,
      password: "",
      confirm_password: "",
    });
    setPhoneError("");
    setIsEditModalOpen(true);
  };

  const handleChange = (e) => {
    setEditingEmp({ ...editingEmp, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!/^03\d{9}$/.test(editingEmp.phone)) {
      setPhoneError("Please enter a valid 11-digit mobile number.");
      Swal.fire({
        icon: "error",
        title: "Invalid Mobile Number",
        text: "Please enter exactly 11 digits starting with 03 (e.g. 03001234567).",
        background: "#171717",
        color: "#fff",
      });
      return;
    }

    const pwd = (editingEmp.password || "").trim();
    const cpwd = (editingEmp.confirm_password || "").trim();

    if (pwd) {
      if (pwd.length < 8) {
        Swal.fire({
          icon: "warning",
          title: "Password Too Short",
          text: "New password must be at least 8 characters long.",
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      if (!/[A-Z]/.test(pwd)) {
        Swal.fire({
          icon: "warning",
          title: "Capital Letter Required",
          text: "New password must contain at least one capital letter (A-Z).",
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
        Swal.fire({
          icon: "warning",
          title: "Special Character Required",
          text: "New password must contain at least one special character (!@#$%^&* etc.).",
          background: "#171717",
          color: "#fff",
        });
        return;
      }

      if (pwd !== cpwd) {
        Swal.fire({
          icon: "error",
          title: "Passwords Do Not Match",
          text: "Please make sure your new password and confirm password match.",
          background: "#171717",
          color: "#fff",
        });
        return;
      }
    }

    try {
      const response = await apiFetch("update_staff.php", {
        method: "POST",
        body: JSON.stringify({
          ...editingEmp,
          password: pwd,
          confirm_password: cpwd,
        }),
      });
      let result;
      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        if (text.includes('"success":true') || text.includes('"success": true')) {
          result = { success: true, message: "Employee details updated." };
        } else {
          throw new Error(text || "Failed to update employee.");
        }
      }

      if (response.ok && result?.success) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: result.message || "Employee details updated.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        setIsEditModalOpen(false);
        fetchStaffBatch(0, false);
        if (searchQuery.trim()) refreshSearch();
        queryClient.invalidateQueries({ queryKey: ["staff"] });
        queryClient.invalidateQueries({ queryKey: ["staff_roles"] });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Failed to update employee.",
          background: "#171717",
          color: "#fff",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Server connection failed.",
        background: "#171717",
        color: "#fff",
      });
    }
  };

  const activeEmployees = searchResults !== null ? searchResults : employees;

  const filteredEmployees = activeEmployees.filter(
    (emp) =>
      (emp.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[var(--admin-muted,#888)] text-xs font-bold uppercase tracking-wider">
        Loading Staff Directory...
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Search and Filters Bar */}
      <EmployeeFilterBar
        totalCount={filteredEmployees.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Staff Table */}
      <div className="admin-card-surface rounded-2xl overflow-hidden shadow-sm">
        <div className="table-responsive-container">
          <table className="min-w-[760px] lg:min-w-full w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Staff Member
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Designation
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Phone & Email
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Monthly Salary
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider">
                  Status
                </th>
                <th className="p-3.5 sm:p-4 text-[11px] uppercase text-slate-700 dark:text-neutral-300 font-bold tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/[0.06]">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <EmployeeTableRow
                    key={emp.id}
                    emp={emp}
                    handleEditClick={handleEditClick}
                    handleDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider"
                  >
                    No staff members found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Server-side Pagination Load More */}
      <ServerPaginationControls
        loadedCount={employees.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        itemLabel="employees"
        isSearching={searchQuery.trim().length > 0}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingEmp={editingEmp}
        handleChange={handleChange}
        handleSave={handleSave}
        phoneError={phoneError}
      />
    </div>
  );
};

export default EmployeeList;
