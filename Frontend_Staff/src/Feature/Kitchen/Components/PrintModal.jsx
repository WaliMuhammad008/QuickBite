import React from "react";
import { FaPrint, FaTimes } from "react-icons/fa";

export default function PrintModal({ printOrder, onClose }) {
  if (!printOrder) return null;

  const executePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Thermal Printer Raw HTML format
    const content = `
      <html>
        <head>
          <title>KOT - ${printOrder.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 10px; width: 300px; margin: 0 auto; color: #000; background: #fff; }
            .center { text-align: center; }
            .brand { font-size: 24px; font-weight: 900; letter-spacing: 1px; margin-bottom: 5px; }
            .title { font-size: 18px; font-weight: bold; border-bottom: 2px dashed #000; border-top: 2px dashed #000; padding: 5px 0; margin-bottom: 10px; }
            .meta-data { font-size: 14px; margin-bottom: 5px; font-weight: bold; }
            .divider { border-bottom: 1px solid #000; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-bottom: 6px; }
            .note { font-size: 12px; font-style: italic; margin-left: 25px; margin-bottom: 8px; }
            .table-box { background: #000; color: #fff; font-size: 20px; padding: 8px; text-align: center; font-weight: 900; margin: 15px 0; border-radius: 4px; }
            .footer { text-align: center; font-size: 12px; margin-top: 20px; font-weight: bold;}
          </style>
        </head>
        <body>
          <div class="center">
            <div class="brand">BIG BITE</div>
            <div class="title">KITCHEN ORDER TICKET</div>
          </div>
          <div class="meta-data">Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          <div class="meta-data">Order ID: #${printOrder.id}</div>
          <div class="meta-data">Type: ${printOrder.type.toUpperCase()}</div>
          <div class="table-box">${printOrder.table ? printOrder.table.toUpperCase() : "TAKEAWAY"}</div>
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 5px;">
             <span>QTY x ITEM</span>
          </div>
          <div class="divider"></div>
          ${(printOrder.items || []).map((item) => `
            <div class="item-row"><span>${item.qty}x ${item.name}</span></div>
            ${item.note ? `<div class="note">** Note: ${item.note}</div>` : ""}
          `).join("")}
          <div class="divider"></div>
          <div class="center" style="font-size: 16px; font-weight: bold; margin-top: 10px;">
            TOTAL ITEMS: ${(printOrder.items || []).reduce((a, b) => a + (b.qty || 1), 0)}
          </div>
          <div class="footer">*** END OF KOT ***</div>
        </body>
      </html>
    `;
    iframe.contentWindow.document.write(content);
    iframe.contentWindow.document.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      onClose();
    }, 1000);
  };

  const totalItemsCount = (printOrder.items || []).reduce(
    (a, b) => a + (b.qty || 1),
    0
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-[94%] sm:w-full max-w-md max-h-[90vh] flex flex-col bg-white dark:bg-neutral-900 border border-stone-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-stone-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-amber-500/10 p-4 sm:p-5 text-center border-b border-stone-200 dark:border-neutral-800 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-stone-400 hover:text-stone-700 dark:text-neutral-400 dark:hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors border-none"
            aria-label="Close"
          >
            <FaTimes />
          </button>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full flex justify-center items-center text-lg sm:text-xl mx-auto mb-2 border border-amber-500/30">
            <FaPrint />
          </div>
          <h3 className="m-0 text-base sm:text-lg font-['Oswald',sans-serif] font-black text-stone-900 dark:text-white uppercase tracking-wider">
            Kitchen Ticket (KOT)
          </h3>
        </div>

        {/* Modal Ticket Preview with Scroll */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 overscroll-contain">
          <div className="bg-stone-50 dark:bg-neutral-950 border border-dashed border-stone-300 dark:border-neutral-700 rounded-xl p-3.5 sm:p-4 font-mono text-stone-900 dark:text-neutral-200 text-xs">
            <div className="text-center mb-3 pb-2.5 border-b border-dashed border-stone-200 dark:border-neutral-800">
              <h4 className="m-0 text-amber-600 dark:text-amber-400 text-sm sm:text-base font-bold">BIG BITE</h4>
              <span className="text-stone-500 dark:text-neutral-500 text-[11px]">
                Order #{printOrder.id}
              </span>
            </div>

            <div className="flex justify-between mb-2 text-stone-600 dark:text-neutral-400 text-[11px]">
              <span>
                Type: <strong className="text-stone-900 dark:text-white">{printOrder.type}</strong>
              </span>
              <span>
                Table: <strong className="text-stone-900 dark:text-white">{printOrder.table}</strong>
              </span>
            </div>

            <div className="border-t border-dashed border-stone-200 dark:border-neutral-800 pt-2.5 mt-2.5 space-y-2">
              {(printOrder.items || []).map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-stone-900 dark:text-neutral-100">
                    <span className="break-words mr-2">{item.name}</span>
                    <span className="text-amber-600 dark:text-amber-400 shrink-0">x{item.qty}</span>
                  </div>
                  {item.note && (
                    <div className="text-[10px] text-stone-500 dark:text-neutral-500 italic">
                      - {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-stone-200 dark:border-neutral-800 pt-2 mt-3 flex justify-between text-stone-600 dark:text-neutral-400 font-bold">
              <span>Total Items</span>
              <span className="text-stone-900 dark:text-white">{totalItemsCount}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 sm:p-4 bg-stone-100/60 dark:bg-neutral-950/60 flex gap-2.5 border-t border-stone-200 dark:border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-transparent hover:bg-stone-200/60 dark:hover:bg-white/5 border border-stone-300 dark:border-neutral-700 text-stone-700 dark:text-neutral-300 font-bold text-xs uppercase cursor-pointer transition-all active:scale-95 min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={executePrint}
            className="flex-[2] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 border-none text-neutral-950 font-black font-['Oswald',sans-serif] text-xs uppercase tracking-wider cursor-pointer flex justify-center items-center gap-2 shadow-md transition-all min-h-[40px]"
          >
            <FaPrint className="text-xs" />
            <span>Print KOT</span>
          </button>
        </div>
      </div>
    </div>
  );
}