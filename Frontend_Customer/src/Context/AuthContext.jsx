import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { API_BASE } from "../config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem("bigbite_customer_user") || localStorage.getItem("quickbite_customer_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Auth Modal State & Handlers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // 'login' | 'register' | 'forgot'
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const openAuthModal = (modeOrTab = "login") => {
    let target = modeOrTab;
    if (target === "signin") target = "login";
    if (target === "signup") target = "register";
    setAuthModalTab(target);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Auto-prompt Google OAuth users who have no phone number on file
  useEffect(() => {
    if (customer && (!customer.phone || customer.phone.trim() === "")) {
      const skipped = sessionStorage.getItem("qb_skip_phone_prompt");
      if (!skipped) {
        setShowPhoneModal(true);
      }
    }
  }, [customer]);

  // Fetch saved addresses for the authenticated customer
  const fetchAddresses = useCallback(async (customerId = null) => {
    const cid = customerId || customer?.id;
    if (!cid) {
      setSavedAddresses([]);
      return;
    }

    try {
      setLoadingAddresses(true);
      const res = await fetch(`${API_BASE}/customer_addresses.php?customer_id=${cid}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.addresses)) {
        setSavedAddresses(data.addresses);
      } else {
        setSavedAddresses([]);
      }
    } catch (err) {
      console.error("Error loading customer addresses:", err);
      setSavedAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, [customer?.id]);

  useEffect(() => {
    if (customer?.id) {
      fetchAddresses(customer.id);
    } else {
      setSavedAddresses([]);
    }
  }, [customer?.id, fetchAddresses]);

  // Login handler
  const login = async ({ identifier, password }) => {
    try {
      const res = await fetch(`${API_BASE}/customer_login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (data.success && data.customer) {
        setCustomer(data.customer);
        localStorage.setItem("bigbite_customer_user", JSON.stringify(data.customer));
        toast.success(`Welcome back, ${data.customer.full_name}! 👋`);
        setIsAuthModalOpen(false);
        fetchAddresses(data.customer.id);
        return { success: true, customer: data.customer };
      } else {
        toast.error(data.message || "Invalid login credentials.");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error during login. Please try again.");
      return { success: false, message: "Network error" };
    }
  };

  // Register handler
  const register = async ({ full_name, phone, email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/customer_register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, phone, email, password }),
      });
      const data = await res.json();

      if (data.success && data.customer) {
        setCustomer(data.customer);
        localStorage.setItem("bigbite_customer_user", JSON.stringify(data.customer));
        toast.success(`Account created! Welcome to BigBite, ${data.customer.full_name}! 🎉`);
        setIsAuthModalOpen(false);
        fetchAddresses(data.customer.id);
        return { success: true, customer: data.customer };
      } else {
        toast.error(data.message || "Registration failed.");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Network error during registration. Please try again.");
      return { success: false, message: "Network error" };
    }
  };

  // Google OAuth Login handler
  const googleLogin = async ({ email, name, google_id, avatar }) => {
    try {
      const res = await fetch(`${API_BASE}/customer_google_auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, google_id, avatar }),
      });
      const data = await res.json();

      if (data.success && data.customer) {
        setCustomer(data.customer);
        localStorage.setItem("bigbite_customer_user", JSON.stringify(data.customer));
        toast.success(`Google sign-in successful! Welcome, ${data.customer.full_name}! 👋`);
        setIsAuthModalOpen(false);
        fetchAddresses(data.customer.id);

        // Prompt user to add phone number if missing
        if (!data.customer.phone || data.customer.phone.trim() === "") {
          setShowPhoneModal(true);
        }

        return { success: true, customer: data.customer };
      } else {
        toast.error(data.message || "Google authentication failed.");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Google auth error:", err);
      toast.error("Network error during Google sign-in.");
      return { success: false, message: "Network error" };
    }
  };

  // Update Customer Phone handler (for Google OAuth users or profile completion)
  const updateCustomerPhone = async (phone) => {
    if (!customer?.id) {
      toast.error("Please log in first.");
      return { success: false, message: "User not logged in." };
    }

    try {
      const res = await fetch(`${API_BASE}/customer_update_phone.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer.id,
          phone: phone.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        const updatedCust = {
          ...customer,
          phone: data.phone,
          mobile: data.phone,
        };
        setCustomer(updatedCust);
        localStorage.setItem("bigbite_customer_user", JSON.stringify(updatedCust));
        toast.success("Phone number saved successfully! 🎉");
        setShowPhoneModal(false);
        return { success: true, phone: data.phone };
      } else {
        toast.error(data.message || "Failed to update phone number.");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Phone update error:", err);
      toast.error("Network error while updating phone number.");
      return { success: false, message: "Network error" };
    }
  };

  // Password reset request handler
  const requestPasswordReset = async (email) => {
    try {
      const res = await fetch(`${API_BASE}/customer_reset_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Reset code sent to your Gmail!");
        return { success: true, email: data.email };
      } else {
        return { success: false, error_type: data.error_type, message: data.message || "User not found." };
      }
    } catch (err) {
      console.error("Reset request error:", err);
      toast.error("Network error while requesting password reset.");
      return { success: false, message: "Network error" };
    }
  };

  // Password reset confirm handler
  const confirmPasswordReset = async ({ identifier, reset_code, new_password }) => {
    try {
      const res = await fetch(`${API_BASE}/customer_reset_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", identifier, reset_code, new_password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Password reset successful! Please log in.");
        return { success: true };
      } else {
        toast.error(data.message || "Failed to reset password.");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Reset confirm error:", err);
      toast.error("Network error while resetting password.");
      return { success: false };
    }
  };

  // Logout handler
  const logout = () => {
    setCustomer(null);
    setSavedAddresses([]);
    localStorage.removeItem("bigbite_customer_user");
    localStorage.removeItem("quickbite_customer_user");
    toast.success("Logged out successfully.");
  };

  // Add Address handler
  const addAddress = async (addressData) => {
    if (!customer?.id) {
      toast.error("Please log in to save addresses.");
      return { success: false };
    }

    try {
      const payload = {
        customer_id: customer.id,
        ...addressData,
      };

      const res = await fetch(`${API_BASE}/customer_addresses.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.address) {
        toast.success("Address saved to your profile!");
        fetchAddresses(customer.id);
        return { success: true, address: data.address };
      } else {
        toast.error(data.message || "Failed to save address.");
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error("Save address error:", err);
      toast.error("Network error saving address.");
      return { success: false };
    }
  };

  // Delete Address handler
  const deleteAddress = async (addressId) => {
    if (!customer?.id) return { success: false };

    try {
      const res = await fetch(
        `${API_BASE}/customer_addresses.php?id=${addressId}&customer_id=${customer.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (data.success) {
        toast.success("Address removed.");
        setSavedAddresses((prev) => {
          const remaining = prev.filter((a) => a.id !== addressId);
          const wasDefault = prev.find((a) => a.id === addressId)?.is_default == 1;
          if (wasDefault && remaining.length > 0) {
            remaining[0] = { ...remaining[0], is_default: 1 };
          }
          return remaining;
        });
        return { success: true };
      } else {
        toast.error(data.message || "Failed to remove address.");
        return { success: false };
      }
    } catch (err) {
      console.error("Delete address error:", err);
      return { success: false };
    }
  };

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [profileDrawerTab, setProfileDrawerTab] = useState("orders"); // 'orders' | 'addresses'

  const openProfileDrawer = (tab = "orders") => {
    setProfileDrawerTab(tab);
    setIsProfileDrawerOpen(true);
  };

  const closeProfileDrawer = () => {
    setIsProfileDrawerOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        savedAddresses,
        loadingAddresses,
        isAuthModalOpen,
        authModalTab,
        authModalMode: authModalTab,
        setAuthModalTab,
        setAuthModalMode: setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        isProfileDrawerOpen,
        profileDrawerTab,
        setProfileDrawerTab,
        openProfileDrawer,
        closeProfileDrawer,
        login,
        googleLogin,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
        fetchAddresses,
        addAddress,
        deleteAddress,
        showPhoneModal,
        setShowPhoneModal,
        updateCustomerPhone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
