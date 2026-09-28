import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useOrderSession = () => {
  const [searchParams] = useSearchParams();
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("bigbite_order_session") || localStorage.getItem("quickbite_order_session");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse bigbite_order_session:", e);
    }
    // Fallback to legacy sessionStorage if present
    const sessionMode = sessionStorage.getItem("orderMode");
    const sessionTable = sessionStorage.getItem("tableNumber");
    if (sessionMode === "Dine-In" || sessionTable) {
      return {
        mode: "dine_in",
        tableNumber: sessionTable || "1",
        isQrScanned: true,
      };
    }
    return { mode: "delivery", tableNumber: null, isQrScanned: false };
  });

  useEffect(() => {
    const tableParam = searchParams.get("table");
    const modeParam = searchParams.get("mode");

    if (tableParam) {
      const newSession = {
        mode: "dine_in",
        tableNumber: tableParam,
        isQrScanned: true,
      };
      localStorage.setItem("bigbite_order_session", JSON.stringify(newSession));
      sessionStorage.setItem("orderMode", "Dine-In");
      sessionStorage.setItem("tableNumber", tableParam);
      setSession(newSession);
    } else if (modeParam && ["delivery", "takeaway", "dine_in"].includes(modeParam.toLowerCase())) {
      const normalizedMode = modeParam.toLowerCase();
      if (!session.isQrScanned || normalizedMode !== "dine_in") {
        const newSession = {
          mode: normalizedMode,
          tableNumber: normalizedMode === "dine_in" ? (session.tableNumber || "1") : null,
          isQrScanned: normalizedMode === "dine_in" ? session.isQrScanned : false,
        };
        localStorage.setItem("bigbite_order_session", JSON.stringify(newSession));
        setSession(newSession);
      }
    }
  }, [searchParams]);

  const switchMode = (mode) => {
    const updated = {
      ...session,
      mode,
      tableNumber: mode === "dine_in" ? (session.tableNumber || "1") : null,
      isQrScanned: mode === "dine_in" ? session.isQrScanned : false,
    };
    localStorage.setItem("bigbite_order_session", JSON.stringify(updated));
    setSession(updated);
  };

  const clearDineIn = () => {
    const defaultSession = { mode: "delivery", tableNumber: null, isQrScanned: false };
    localStorage.setItem("bigbite_order_session", JSON.stringify(defaultSession));
    sessionStorage.removeItem("orderMode");
    sessionStorage.removeItem("tableNumber");
    setSession(defaultSession);
  };

  return { session, switchMode, clearDineIn };
};
