import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../config/api";
import { evaluateStoreStatus } from "../utils/storeTiming";
import RestaurantClosedModal from "../Components/UI/RestaurantClosedModal";
import { socket } from "../utils/socket";

export const StoreStatusContext = createContext();

export function StoreStatusProvider({ children }) {
  const queryClient = useQueryClient();
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(Date.now());

  // 1. Fetch store settings with 30s background re-check
  const { data: storeSettings = {}, isLoading } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_BASE}/get_settings.php`);
        const result = await response.json();
        return result && result.success ? result.data : {};
      } catch (err) {
        console.warn("Could not fetch store settings:", err);
        return {};
      }
    },
    staleTime: 20000,
    refetchInterval: 30000, // Re-check every 30 seconds
  });

  // 2. Real-time Socket Listener for instant setting updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["store_settings"] });
    };

    socket.on("settings_updated", handleUpdate);
    socket.on("menu_updated", handleUpdate);
    socket.on("refresh_menu", handleUpdate);

    return () => {
      socket.off("settings_updated", handleUpdate);
      socket.off("menu_updated", handleUpdate);
      socket.off("refresh_menu", handleUpdate);
    };
  }, [queryClient]);

  // 3. Keep current time fresh every minute to update open/close status automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMinute(Date.now());
    }, 30000); // Check time every 30 seconds
    return () => clearInterval(timer);
  }, []);

  // 4. Calculate store open/close evaluation
  const storeStatus = useMemo(() => {
    return evaluateStoreStatus(storeSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSettings, currentMinute]);

  // 5. Automatic popup trigger on first arrival if store is closed
  useEffect(() => {
    if (isLoading) return;

    if (!storeStatus.isOpen) {
      const alreadyDismissed = sessionStorage.getItem("qb_closed_notice_dismissed");
      if (!alreadyDismissed) {
        // Small delay for smooth entry animation
        const timer = setTimeout(() => {
          setIsClosedModalOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [storeStatus.isOpen, isLoading]);

  const openClosedModal = () => {
    setIsClosedModalOpen(true);
  };

  const closeClosedModal = () => {
    setIsClosedModalOpen(false);
    sessionStorage.setItem("qb_closed_notice_dismissed", "true");
  };

  const contextValue = {
    ...storeStatus,
    storeSettings,
    isLoadingSettings: isLoading,
    isClosedModalOpen,
    openClosedModal,
    closeClosedModal,
  };

  return (
    <StoreStatusContext.Provider value={contextValue}>
      {children}
      <RestaurantClosedModal
        isOpen={isClosedModalOpen}
        onClose={closeClosedModal}
        storeStatus={storeStatus}
      />
    </StoreStatusContext.Provider>
  );
}

export function useStoreStatus() {
  const context = useContext(StoreStatusContext);
  if (!context) {
    throw new Error("useStoreStatus must be used within a StoreStatusProvider");
  }
  return context;
}
