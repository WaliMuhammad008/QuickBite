import React from "react";
import { FaCopy, FaDownload, FaTrash } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

export default function TableGridCard({
  table,
  qrBaseUrl,
  qrRefs,
  handleToggleStatus,
  copyQrLink,
  downloadQR,
  handleDelete,
}) {
  const base = qrBaseUrl || window.location.origin;
  const qrValue = `${base}/?mode=dine_in&table=${encodeURIComponent(
    table.table_name
  )}`;
  const isActive = Number(table.status) === 1;

  return (
    <div
      className={`bg-[var(--panel-bg)] rounded-2xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all duration-200 shadow-sm relative ${
        isActive
          ? "border-[var(--border-subtle)] hover:border-amber-500/30"
          : "border-[var(--border-subtle)] opacity-60"
      }`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-bold text-xs font-mono">
              #{table.id}
            </span>
            <span className="font-extrabold text-sm text-[var(--text-primary)] block">
              {table.table_name}
            </span>
          </div>
        </div>

        {/* Active Toggle Button */}
        <button
          type="button"
          onClick={() => handleToggleStatus(table.id)}
          className={`px-3 py-1 !rounded-full text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
            isActive
              ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25"
              : "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30 hover:bg-neutral-500/25"
          }`}
          title={isActive ? "Deactivate Table" : "Activate Table"}
        >
          {isActive ? "Active" : "Disabled"}
        </button>
      </div>

      {/* Framed QR Code Center */}
      <div className="bg-white p-4 rounded-2xl mx-auto shadow-md border-4 border-black/10 dark:border-black/30 flex items-center justify-center">
        <QRCodeCanvas
          value={qrValue}
          size={140}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={false}
          ref={(el) => (qrRefs.current[table.id] = el)}
        />
      </div>

      {/* URL Chip with 1-click Copy */}
      <div className="bg-[var(--input-bg)] p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <span className="text-[10px] text-[var(--text-secondary)] font-mono truncate max-w-[170px]">
          {qrValue}
        </span>
        <button
          type="button"
          onClick={() => copyQrLink(qrValue)}
          className="p-1 text-[var(--text-muted)] hover:text-amber-500 bg-transparent border-none cursor-pointer transition-colors shrink-0"
          title="Copy QR Link"
        >
          <FaCopy className="text-xs" />
        </button>
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => downloadQR(table.id, table.table_name)}
          className="flex-1 py-2 rounded-xl bg-[var(--input-bg)] hover:bg-amber-500 hover:text-neutral-950 text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
        >
          <FaDownload className="text-[11px]" />
          <span>Download PNG</span>
        </button>

        <button
          type="button"
          onClick={() => handleDelete(table.id, table.table_name)}
          className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm shrink-0"
          title="Delete Table"
        >
          <FaTrash className="text-xs" />
        </button>
      </div>
    </div>
  );
}
