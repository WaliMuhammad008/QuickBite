import React, { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../utils/apiHelper";
import TableFloorFilterBar from "./Components/TableFloorFilterBar";
import TableGrid from "./Components/TableGrid";
import TableFormModal from "./Components/TableFormModal";

const TableManager = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");

  const [qrBaseUrl, setQrBaseUrl] = useState("");
  const [baseUrlInput, setBaseUrlInput] = useState("");

  const qrRefs = useRef({});

  const { data = {}, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: async () => {
      const response = await apiFetch("admin_manage_tables.php");
      const result = await response.json();
      return result.success
        ? { tables: result.data, qrBaseUrl: result.qr_base_url }
        : { tables: [], qrBaseUrl: "" };
    },
  });

  const tables = data.tables || [];

  useEffect(() => {
    if (data.qrBaseUrl !== undefined && !qrBaseUrl && !baseUrlInput) {
      setQrBaseUrl(data.qrBaseUrl);
      setBaseUrlInput(data.qrBaseUrl);
    }
  }, [data.qrBaseUrl]);

  const handleSaveBaseUrl = async () => {
    try {
      const response = await apiFetch("admin_manage_tables.php", {
        method: "POST",
        body: JSON.stringify({
          action: "save_qr_base_url",
          url: baseUrlInput,
        }),
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Base URL Saved!",
          text: "QR codes will now generate with this domain prefix.",
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        setQrBaseUrl(baseUrlInput);
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to save base URL", "error");
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      Swal.fire("Error", "Table Name is required", "error");
      return;
    }

    try {
      const response = await apiFetch("admin_manage_tables.php", {
        method: "POST",
        body: JSON.stringify({
          action: "add",
          table_name: newTableName.trim(),
          capacity: newTableCapacity,
        }),
      });
      const result = await response.json();
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Table Added!",
          text: `Table ${newTableName} created successfully.`,
          timer: 1500,
          showConfirmButton: false,
          background: "#171717",
          color: "#fff",
        });
        setNewTableName("");
        setNewTableCapacity("4");
        setIsModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server Error", "error");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await apiFetch("admin_manage_tables.php", {
        method: "POST",
        body: JSON.stringify({ action: "toggle_status", id }),
      });
      const result = await response.json();
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      }
    } catch (error) {
      console.error("Error toggling status", error);
    }
  };

  const handleDelete = async (id, tableName) => {
    Swal.fire({
      title: `Delete ${tableName}?`,
      text: "This table and associated QR links will be permanently removed.",
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
          const response = await apiFetch("admin_manage_tables.php", {
            method: "POST",
            body: JSON.stringify({ action: "delete", id }),
          });
          const res = await response.json();
          if (res.success) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Table has been deleted.",
              timer: 1500,
              showConfirmButton: false,
              background: "#171717",
              color: "#fff",
            });
            queryClient.invalidateQueries({ queryKey: ["tables"] });
          } else {
            Swal.fire("Error", res.message, "error");
          }
        } catch (error) {
          Swal.fire("Error", "Server Error", "error");
        }
      }
    });
  };

  const downloadQR = (tableId, tableName) => {
    const canvas = qrRefs.current[tableId];
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_Code_${tableName.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const copyQrLink = (url) => {
    navigator.clipboard.writeText(url);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Dine-In Link Copied",
      showConfirmButton: false,
      timer: 1500,
      background: "#171717",
      color: "#fff",
    });
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header Bar & Base Domain Helper */}
      <TableFloorFilterBar
        baseUrlInput={baseUrlInput}
        setBaseUrlInput={setBaseUrlInput}
        handleSaveBaseUrl={handleSaveBaseUrl}
        setIsModalOpen={setIsModalOpen}
      />

      {/* Tables Grid */}
      <TableGrid
        isLoading={isLoading}
        tables={tables}
        qrBaseUrl={qrBaseUrl}
        qrRefs={qrRefs}
        handleToggleStatus={handleToggleStatus}
        copyQrLink={copyQrLink}
        downloadQR={downloadQR}
        handleDelete={handleDelete}
      />

      {/* Add Table Modal */}
      <TableFormModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleAddTable={handleAddTable}
        newTableName={newTableName}
        setNewTableName={setNewTableName}
        newTableCapacity={newTableCapacity}
        setNewTableCapacity={setNewTableCapacity}
      />
    </div>
  );
};

export default TableManager;
