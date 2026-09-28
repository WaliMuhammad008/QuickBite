import React, { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaMobileAlt } from "react-icons/fa";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
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

    const dismissed = !isDev && sessionStorage.getItem("pwa_prompt_dismissed");
    if (!dismissed) {
      // Show in dev by default so styling and mobile view can be tested reliably
      setIsVisible(true);
    }

    const handler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      if (!sessionStorage.getItem("pwa_prompt_dismissed")) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log("BigBite PWA successfully installed!");
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the native install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsVisible(false);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert("To install BigBite: tap the Share button in Safari and select 'Add to Home Screen'.");
      } else {
        alert("To install BigBite: tap your browser menu (⋮) and select 'Install app' or 'Add to Home screen'.");
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
      sessionStorage.setItem("pwa_prompt_dismissed", "true");
    }
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="block md:hidden fixed bottom-4 left-4 right-4 z-50 animate-bounce-in">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-neutral-800 dark:text-zinc-100 border border-amber-200/70 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xl dark:shadow-2xl flex items-center justify-between gap-3 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <FaMobileAlt className="text-xl" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-500 dark:text-amber-400 leading-tight">
              Install BigBite App
            </h4>
            <p className="text-[11px] text-neutral-600 dark:text-zinc-400 leading-snug">
              Faster orders, instant deals & offline access!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
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
