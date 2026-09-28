import React, { useState, useEffect } from "react";
import { FaWifi, FaExclamationTriangle } from "react-icons/fa";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline status"
      className="fixed top-0 left-0 right-0 bg-rose-600 text-white text-xs font-bold py-2 px-4 text-center z-[100] shadow-md flex items-center justify-center gap-2"
    >
      <FaExclamationTriangle className="animate-pulse text-amber-300" />
      <span>You are currently offline. Displaying saved menu & deals.</span>
    </aside>
  );
}
