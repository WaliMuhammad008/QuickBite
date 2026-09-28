import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

export function useFooterSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    footer_tagline: "",
    footer_facebook: "",
    footer_twitter: "",
    footer_instagram: "",
    footer_youtube: "",
    footer_phone: "",
    footer_email: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setSettings({
        footer_tagline: settingsData.footer_tagline || "",
        footer_facebook: settingsData.footer_facebook || "",
        footer_twitter: settingsData.footer_twitter || "",
        footer_instagram: settingsData.footer_instagram || "",
        footer_youtube: settingsData.footer_youtube || "",
        footer_phone: settingsData.footer_phone || "",
        footer_email: settingsData.footer_email || "",
      });
    }
  }, [settingsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let newErrors = {};

    // Email Validation
    if (
      settings.footer_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.footer_email)
    ) {
      newErrors.footer_email = "Please enter a valid email address.";
    }

    // Phone Validation (Allows numbers, spaces, plus, dashes)
    if (
      settings.footer_phone &&
      !/^[\d\s\+\-\(\)]+$/.test(settings.footer_phone)
    ) {
      newErrors.footer_phone = "Please enter a valid phone number.";
    }

    // URL Validation (must start with http:// or https:// if provided)
    const urlRegex = /^https?:\/\/.+/;
    if (settings.footer_facebook && !urlRegex.test(settings.footer_facebook)) {
      newErrors.footer_facebook = "Must be a valid URL (e.g. https://...).";
    }
    if (settings.footer_twitter && !urlRegex.test(settings.footer_twitter)) {
      newErrors.footer_twitter = "Must be a valid URL (e.g. https://...).";
    }
    if (
      settings.footer_instagram &&
      !urlRegex.test(settings.footer_instagram)
    ) {
      newErrors.footer_instagram = "Must be a valid URL (e.g. https://...).";
    }
    if (settings.footer_youtube && !urlRegex.test(settings.footer_youtube)) {
      newErrors.footer_youtube = "Must be a valid URL (e.g. https://...).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Swal.fire(
        "Validation Error",
        "Please fix the errors in the form before saving.",
        "error"
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE}/update_settings.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Footer Settings Saved!",
          showConfirmButton: false,
          timer: 1500,
        });
        queryClient.invalidateQueries({ queryKey: ["settings"] });
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      console.error("Failed to save footer settings:", error);
      Swal.fire("Error", "Could not connect to server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isSaving,
    errors,
    isLoading,
    handleChange,
    handleSave,
  };
}
