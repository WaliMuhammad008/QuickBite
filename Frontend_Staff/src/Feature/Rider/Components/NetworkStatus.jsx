import React, { useState, useEffect } from "react";
import { FaWifi } from "react-icons/fa";

export default function NetworkStatus() {
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
    <div className="bg-red-600 text-white text-center py-2 px-3 absolute top-0 left-0 w-full z-50 font-bold text-xs flex justify-center items-center gap-2 shadow-md">
      <FaWifi className="animate-pulse" />
      <span>No Internet Connection. Rider App is Offline!</span>
    </div>
  );
}