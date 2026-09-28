import React from "react";
import { FaQrcode } from "react-icons/fa";
import TableGridCard from "./TableGridCard";

export default function TableGrid({
  isLoading,
  tables = [],
  qrBaseUrl,
  qrRefs,
  handleToggleStatus,
  copyQrLink,
  downloadQR,
  handleDelete,
}) {
  if (isLoading) {
    return (
      <div className="py-20 text-center text-[var(--text-secondary)] text-xs font-bold uppercase tracking-wider">
        Loading Tables & QR Codes...
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="bg-[var(--panel-bg)] rounded-2xl border border-[var(--border-subtle)] p-12 text-center shadow-sm">
        <FaQrcode className="text-3xl text-[var(--text-muted)] mx-auto mb-3" />
        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
          No Tables Configured
        </h4>
        <p className="text-xs text-[var(--text-secondary)] mb-4">
          Create your first table using the button above to generate a scannable
          dine-in QR code.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {tables.map((table) => (
        <TableGridCard
          key={table.id}
          table={table}
          qrBaseUrl={qrBaseUrl}
          qrRefs={qrRefs}
          handleToggleStatus={handleToggleStatus}
          copyQrLink={copyQrLink}
          downloadQR={downloadQR}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  );
}
