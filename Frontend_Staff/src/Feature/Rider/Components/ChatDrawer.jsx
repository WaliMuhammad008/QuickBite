import React from "react";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ChatDrawer({ isOpen, onClose, customerName }) {
  const quickReplies = [
    "I have arrived outside!",
    "Stuck in traffic, arriving in 5 mins.",
    "Please share your exact landmark.",
    "Order picked up, on my way.",
  ];

  const handleSend = (reply) => {
    toast.success(`Message sent to ${customerName}: "${reply}"`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 border-t border-stone-200 dark:border-neutral-800 rounded-t-3xl w-full max-w-[480px] p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-stone-200 dark:border-neutral-800 mb-4">
          <h3 className="font-['Oswald',sans-serif] font-bold text-base text-stone-900 dark:text-white m-0 uppercase tracking-wide">
            Chat with {customerName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-neutral-800 text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white flex items-center justify-center border-none cursor-pointer text-xs active:scale-95"
          >
            <FaTimes />
          </button>
        </div>

        <p className="text-stone-500 dark:text-neutral-400 text-xs text-center mb-3">
          Tap a quick response to send via SMS / App:
        </p>

        <div className="space-y-2">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSend(reply)}
              className="w-full min-h-[44px] p-3 rounded-xl bg-stone-50 hover:bg-amber-500/10 dark:bg-neutral-950/80 dark:hover:bg-neutral-800 border border-stone-200 dark:border-neutral-800 text-left text-xs font-semibold text-stone-800 dark:text-neutral-200 flex justify-between items-center cursor-pointer transition-all active:scale-98"
            >
              <span>{reply}</span>
              <FaPaperPlane className="text-amber-500 text-xs shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}