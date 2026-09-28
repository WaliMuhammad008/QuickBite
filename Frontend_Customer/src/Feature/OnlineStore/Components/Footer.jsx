import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import FooterBranding from "./FooterBranding";
import FooterNavColumns from "./FooterNavColumns";
import { API_BASE } from "../../../config/api";

const Footer = ({ style }) => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (window.innerWidth <= 640) {
      setExpandedSection(expandedSection === section ? null : section);
    }
  };

  // Fetch Footer Settings via React Query
  const { data: footerData } = useQuery({
    queryKey: ["store_settings_footer"],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/get_settings.php`
      );
      const result = await response.json();
      if (result.success) {
        return {
          footer_tagline:
            result.data.footer_tagline ||
            "Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.",
          footer_facebook: result.data.footer_facebook || "#",
          footer_twitter: result.data.footer_twitter || "#",
          footer_instagram: result.data.footer_instagram || "#",
          footer_youtube: result.data.footer_youtube || "#",
          footer_phone: result.data.footer_phone || "+92 300 1234567",
          footer_email: result.data.footer_email || "support@bigbite.com",
        };
      }
      return {
        footer_tagline:
          "Fresh Food, Delivered Hot & Fast. Experience the best taste in town with our premium quality ingredients.",
        footer_facebook: "#",
        footer_twitter: "#",
        footer_instagram: "#",
        footer_youtube: "#",
        footer_phone: "+92 300 1234567",
        footer_email: "support@bigbite.com",
      };
    },
  });

  return (
    <footer
      className="bg-white dark:bg-[#121214] text-gray-900 dark:text-white border-t border-gray-200 dark:border-neutral-800 transition-colors duration-300"
      style={style}
    >
      <div className="pt-8 pb-8 sm:pt-14 sm:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Column 1: Brand Info */}
          <FooterBranding footerData={footerData} />

          {/* Columns 2, 3, 4: Nav Links & Contacts */}
          <FooterNavColumns
            expandedSection={expandedSection}
            toggleSection={toggleSection}
            footerData={footerData}
            navigate={navigate}
          />
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-200/80 dark:border-neutral-800/80 py-4 bg-gray-50 dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2.5 text-center sm:text-left">
          <p className="m-0 text-xs text-gray-500 dark:text-neutral-500">
            © {new Date().getFullYear()} BigBite. All Rights Reserved.
          </p>
          <div className="flex gap-4">
            <span
              className="text-xs text-gray-500 dark:text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </span>
            <span
              className="text-xs text-gray-500 dark:text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => navigate("/terms")}
            >
              Terms of Use
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
