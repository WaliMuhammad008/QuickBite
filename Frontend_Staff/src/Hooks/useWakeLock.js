import { useEffect, useRef } from "react";

/**
 * Screen Wake Lock hook: Prevents tablet/phone screen from dimming/sleeping
 * during active Kitchen, POS or Delivery shifts.
 */
export default function useWakeLock(enabled = true) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    let isSubscribed = true;

    const requestWakeLock = async () => {
      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          wakeLockRef.current.addEventListener("release", () => {
            wakeLockRef.current = null;
          });
        }
      } catch (err) {
        console.warn("Screen Wake Lock could not be acquired:", err.message);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [enabled]);
}

export { useWakeLock };
