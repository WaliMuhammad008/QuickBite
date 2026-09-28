import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

export default function FooterBranding({ footerData }) {
  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3 sm:space-y-4">
      <h2 className="font-['Oswald',sans-serif] text-2xl sm:text-3xl font-black text-gray-900 dark:text-white m-0 tracking-wide uppercase">
        BIG<span className="text-amber-500">BITE</span>
      </h2>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 leading-relaxed max-w-sm m-0">
        {footerData?.footer_tagline}
      </p>
      <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-1">
        <a
          href={footerData?.footer_facebook}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
          aria-label="Facebook"
        >
          <FaFacebookF className="text-xs sm:text-sm" />
        </a>
        <a
          href={footerData?.footer_twitter}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
          aria-label="Twitter"
        >
          <FaTwitter className="text-xs sm:text-sm" />
        </a>
        <a
          href={footerData?.footer_instagram}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
          aria-label="Instagram"
        >
          <FaInstagram className="text-xs sm:text-sm" />
        </a>
        <a
          href={footerData?.footer_youtube}
          target="_blank"
          rel="noreferrer"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-amber-400 dark:hover:bg-amber-400 text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-gray-950 flex items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 no-underline shadow-xs"
          aria-label="YouTube"
        >
          <FaYoutube className="text-xs sm:text-sm" />
        </a>
      </div>
    </div>
  );
}
