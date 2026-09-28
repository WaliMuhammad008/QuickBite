import React from "react";
import { FaPhoneAlt, FaEnvelope, FaChevronDown } from "react-icons/fa";

export default function FooterNavColumns({
  expandedSection,
  toggleSection,
  footerData,
  navigate,
}) {
  return (
    <>
      {/* Column 2: Information */}
      <div className="flex flex-col">
        <h4
          className="flex justify-between items-center sm:block font-['Oswald',sans-serif] text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 sm:mb-4 cursor-pointer sm:cursor-auto"
          onClick={() => toggleSection("info")}
        >
          Information
          <FaChevronDown
            className={`sm:hidden text-xs text-gray-400 transition-transform duration-300 ${
              expandedSection === "info" ? "rotate-180" : ""
            }`}
          />
        </h4>
        <ul
          className={`list-none p-0 m-0 space-y-2 max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible transition-all duration-300 ${
            expandedSection === "info" ? "max-h-48 pt-1" : ""
          }`}
        >
          <li>
            <span
              className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/about")}
            >
              About Us
            </span>
          </li>
          <li>
            <span
              className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </span>
          </li>
          <li>
            <span
              className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/terms")}
            >
              Terms & Conditions
            </span>
          </li>
        </ul>
      </div>

      {/* Column 3: Food & Orders */}
      <div className="flex flex-col">
        <h4
          className="flex justify-between items-center sm:block font-['Oswald',sans-serif] text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 sm:mb-4 cursor-pointer sm:cursor-auto"
          onClick={() => toggleSection("food")}
        >
          Our Menu
          <FaChevronDown
            className={`sm:hidden text-xs text-gray-400 transition-transform duration-300 ${
              expandedSection === "food" ? "rotate-180" : ""
            }`}
          />
        </h4>
        <ul
          className={`list-none p-0 m-0 space-y-2 max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible transition-all duration-300 ${
            expandedSection === "food" ? "max-h-48 pt-1" : ""
          }`}
        >
          <li>
            <span
              className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/menu")}
            >
              Explore Menu
            </span>
          </li>
          <li>
            <span
              className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/deals")}
            >
              Top Deals
            </span>
          </li>
          <li>
            <span
              className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/track-order")}
            >
              Live Order Tracker
            </span>
          </li>
        </ul>
      </div>

      {/* Column 4: Contact Us */}
      <div className="flex flex-col">
        <h4
          className="flex justify-between items-center sm:block font-['Oswald',sans-serif] text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 sm:mb-4 cursor-pointer sm:cursor-auto"
          onClick={() => toggleSection("contact")}
        >
          Contact Us
          <FaChevronDown
            className={`sm:hidden text-xs text-gray-400 transition-transform duration-300 ${
              expandedSection === "contact" ? "rotate-180" : ""
            }`}
          />
        </h4>
        <ul
          className={`list-none p-0 m-0 space-y-2.5 max-h-0 sm:max-h-none overflow-hidden sm:overflow-visible transition-all duration-300 ${
            expandedSection === "contact" ? "max-h-48 pt-1" : ""
          }`}
        >
          <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
            <FaPhoneAlt className="text-amber-500 text-xs flex-shrink-0" />
            <a
              href={`tel:${footerData?.footer_phone}`}
              className="text-inherit no-underline hover:text-amber-500"
            >
              {footerData?.footer_phone}
            </a>
          </li>
          <li className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
            <FaEnvelope className="text-amber-500 text-xs flex-shrink-0" />
            <a
              href={`mailto:${footerData?.footer_email}`}
              className="text-inherit no-underline hover:text-amber-500 truncate"
            >
              {footerData?.footer_email}
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
