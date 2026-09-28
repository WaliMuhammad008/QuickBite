import React, { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaDesktop } from "react-icons/fa";

export default function StaffPWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsStandalone(true);
      return;
    }

    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      Boolean(import.meta.env.DEV);

    const dismissed = !isDev && sessionStorage.getItem("staff_pwa_dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem("staff_pwa_dismissed")) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log("BigBite Staff POS App Installed!");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsVisible(false);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert("To install BigBite Staff POS: tap the Share button in Safari and select 'Add to Home Screen'.");
      } else {
        alert("To install BigBite Staff POS: tap your browser menu (⋮) and select 'Install app' or 'Add to Home screen'.");
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    const isDev =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      Boolean(import.meta.env.DEV);
    if (!isDev) {
      sessionStorage.setItem("staff_pwa_dismissed", "true");
    }
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-amber-200/70 dark:border-zinc-800 backdrop-blur-md text-neutral-800 dark:text-zinc-100 rounded-2xl px-4 py-3 shadow-xl dark:shadow-2xl flex items-center gap-3 transition-colors duration-300">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <FaDesktop className="text-sm" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400 leading-tight">
            Install BigBite App
          </h4>
          <p className="text-[10px] text-neutral-600 dark:text-zinc-400 leading-snug">
            Launch POS fullscreen without browser bar
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <FaDownload className="text-[10px]" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
