import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

export function useLegalSettings() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("about");

  const [settings, setSettings] = useState({
    // About Us
    about_hero_badge: "",
    about_hero_title: "",
    about_hero_subtitle: "",
    about_journey_title: "",
    about_journey_text: "",
    about_card1_title: "",
    about_card1_desc: "",
    about_card2_title: "",
    about_card2_desc: "",
    about_card3_title: "",
    about_card3_desc: "",
    about_mission_title: "",
    about_mission_text: "",

    // Privacy Policy
    privacy_hero_badge: "",
    privacy_hero_title: "",
    privacy_hero_subtitle: "",
    privacy_overview_title: "",
    privacy_overview_text: "",
    privacy_card1_title: "",
    privacy_card1_desc: "",
    privacy_card2_title: "",
    privacy_card2_desc: "",
    privacy_card3_title: "",
    privacy_card3_desc: "",
    privacy_guarantee_title: "",
    privacy_guarantee_text: "",

    // Terms & Conditions
    terms_hero_badge: "",
    terms_hero_title: "",
    terms_hero_subtitle: "",
    terms_agreement_title: "",
    terms_agreement_text: "",
    terms_card1_title: "",
    terms_card1_desc: "",
    terms_card2_title: "",
    terms_card2_desc: "",
    terms_card3_title: "",
    terms_card3_desc: "",
    terms_refund_title: "",
    terms_refund_text: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch settings from API
  const { data: settingsData = {}, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/get_settings.php`
      );
      const result = await response.json();
      return result.success ? result.data : {};
    },
  });

  // 2. Map data to form state
  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings({
        about_hero_badge: settingsData.about_hero_badge || "",
        about_hero_title: settingsData.about_hero_title || "",
        about_hero_subtitle: settingsData.about_hero_subtitle || "",
        about_journey_title: settingsData.about_journey_title || "",
        about_journey_text:
          settingsData.about_journey_text || settingsData.about_us || "",
        about_card1_title: settingsData.about_card1_title || "",
        about_card1_desc: settingsData.about_card1_desc || "",
        about_card2_title: settingsData.about_card2_title || "",
        about_card2_desc: settingsData.about_card2_desc || "",
        about_card3_title: settingsData.about_card3_title || "",
        about_card3_desc: settingsData.about_card3_desc || "",
        about_mission_title: settingsData.about_mission_title || "",
        about_mission_text:
          settingsData.about_mission_text ||
          settingsData.about_us_mission ||
          "",

        privacy_hero_badge: settingsData.privacy_hero_badge || "",
        privacy_hero_title: settingsData.privacy_hero_title || "",
        privacy_hero_subtitle: settingsData.privacy_hero_subtitle || "",
        privacy_overview_title: settingsData.privacy_overview_title || "",
        privacy_overview_text:
          settingsData.privacy_overview_text ||
          settingsData.privacy_policy ||
          "",
        privacy_card1_title: settingsData.privacy_card1_title || "",
        privacy_card1_desc: settingsData.privacy_card1_desc || "",
        privacy_card2_title: settingsData.privacy_card2_title || "",
        privacy_card2_desc: settingsData.privacy_card2_desc || "",
        privacy_card3_title: settingsData.privacy_card3_title || "",
        privacy_card3_desc: settingsData.privacy_card3_desc || "",
        privacy_guarantee_title: settingsData.privacy_guarantee_title || "",
        privacy_guarantee_text: settingsData.privacy_guarantee_text || "",

        terms_hero_badge: settingsData.terms_hero_badge || "",
        terms_hero_title: settingsData.terms_hero_title || "",
        terms_hero_subtitle: settingsData.terms_hero_subtitle || "",
        terms_agreement_title: settingsData.terms_agreement_title || "",
        terms_agreement_text:
          settingsData.terms_agreement_text ||
          settingsData.terms_and_conditions ||
          "",
        terms_card1_title: settingsData.terms_card1_title || "",
        terms_card1_desc: settingsData.terms_card1_desc || "",
        terms_card2_title: settingsData.terms_card2_title || "",
        terms_card2_desc: settingsData.terms_card2_desc || "",
        terms_card3_title: settingsData.terms_card3_title || "",
        terms_card3_desc: settingsData.terms_card3_desc || "",
        terms_refund_title: settingsData.terms_refund_title || "",
        terms_refund_text: settingsData.terms_refund_text || "",
      });
    }
  }, [settingsData]);

  // 3. Handle input/textarea changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Save settings to Database
  const handleSave = async () => {
    setIsSaving(true);
    const token = sessionStorage.getItem("auth_token") || "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}`, "X-Auth-Token": token }
              : {}),
          },
          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Legal & Content Pages Updated!",
          showConfirmButton: false,
          timer: 2000,
        });

        // Invalidate queries so both admin and customer refresh
        queryClient.invalidateQueries({ queryKey: ["settings"] });
        queryClient.invalidateQueries({ queryKey: ["store_settings"] });
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to update content",
          "error"
        );
      }
    } catch (error) {
      console.error("Save content error:", error);
      Swal.fire("Error", "Network connection failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    activeSection,
    setActiveSection,
    settings,
    handleChange,
    handleSave,
    isSaving,
    isLoading,
  };
}
