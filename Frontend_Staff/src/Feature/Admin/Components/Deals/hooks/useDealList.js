import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../../utils/apiHelper";

export function useDealList() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["admin_deals"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_admin_deals.php`
      );
      const data = await response.json();
      return data.success ? data.data : [];
    },
  });

  // Toggle Active/Inactive Status
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 || currentStatus === "1" ? 0 : 1;
    try {
      const response = await apiFetch("update_deal_status.php", {
        method: "POST",
        body: JSON.stringify({ id, is_active: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["admin_deals"] });
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: newStatus ? "Deal Activated" : "Deal Deactivated",
          showConfirmButton: false,
          timer: 1500,
          background: "#171717",
          color: "#fff",
        });
      } else {
        Swal.fire("Error", data.message || "Failed to update status", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server connection failed", "error");
    }
  };

  // Delete Deal
  const handleDelete = (id, title) => {
    Swal.fire({
      title: `Delete "${title}"?`,
      text: "This combo deal and all its bundled choices will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Yes, Delete Deal",
      background: "#171717",
      color: "#fff",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiFetch("delete_deal.php", {
            method: "POST",
            body: JSON.stringify({
              id,
              auth_token: sessionStorage.getItem("auth_token"),
            }),
          });
          const data = await response.json();
          if (data.success) {
            Swal.fire("Deleted!", "Deal has been removed.", "success");
            queryClient.invalidateQueries({ queryKey: ["admin_deals"] });
          } else {
            Swal.fire(
              "Error",
              data.message || "Could not delete deal",
              "error"
            );
          }
        } catch (error) {
          Swal.fire("Error", "Could not delete deal", "error");
        }
      }
    });
  };

  const filteredDeals = deals.filter(
    (d) =>
      (d.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.badge_tag || d.tag || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (d.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    filteredDeals,
    isLoading,
    handleToggleStatus,
    handleDelete,
  };
}
