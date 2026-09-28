import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AUTH_STORAGE_KEYS = [
  "staff_session",
  "user",
  "staff_user",
  "auth_token",
  "token",
  "staff_token",
  "adminActiveTab",
  "isAuth",
  "cashier_active_tab",
  "rider_duty_status",
  "rider_session",
  "myOrders",
  "cartItems",
];

// Route access matrix for staff portals
export const ROUTE_ALLOWED_ROLES = {
  "/admin": ["admin", "manager", "owner"],
  "/cashier": ["cashier", "pos", "admin", "manager", "owner"],
  "/kitchen": ["chef", "kitchen", "cook", "admin", "manager", "owner"],
  "/rider": ["rider", "delivery", "admin", "manager", "owner"],
  "/dispatcher": ["dispatcher", "dispatch", "admin", "manager", "owner"],
};

// Check if a role has permission to access a specific route
export const isRoleAllowedForPath = (role, pathname) => {
  if (!role || !pathname) return false;
  const r = String(role).toLowerCase().trim();
  const cleanPath = "/" + pathname.replace(/^\/+/, "").split("/")[0].toLowerCase();
  const allowed = ROUTE_ALLOWED_ROLES[cleanPath];
  if (!allowed) return false;
  return allowed.includes(r);
};

// Helper to determine home dashboard based on role
export const getRoleDashboard = (role) => {
  if (!role) return "/login";
  const r = String(role).toLowerCase().trim();
  if (r === "admin" || r === "manager" || r === "owner") return "/admin";
  if (r === "cashier" || r === "pos") return "/cashier";
  if (r === "chef" || r === "kitchen" || r === "cook") return "/kitchen";
  if (r === "dispatcher" || r === "dispatch") return "/dispatcher";
  if (r === "rider" || r === "delivery") return "/rider";
  return "/login";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw =
        sessionStorage.getItem("staff_user") ||
        sessionStorage.getItem("staff_session") ||
        sessionStorage.getItem("user") ||
        localStorage.getItem("staff_user") ||
        localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return (
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("staff_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("staff_token") ||
      null
    );
  });

  const [isLoading, setIsLoading] = useState(false);

  // Tab-isolated login: strictly persists to this tab's sessionStorage
  const login = useCallback((userData, authToken) => {
    if (!userData || !authToken) return;
    const jsonStr = JSON.stringify(userData);

    sessionStorage.setItem("staff_user", jsonStr);
    sessionStorage.setItem("user", jsonStr);
    sessionStorage.setItem("staff_session", jsonStr);
    sessionStorage.setItem("token", authToken);
    sessionStorage.setItem("auth_token", authToken);
    sessionStorage.setItem("staff_token", authToken);
    sessionStorage.setItem("isAuth", "true");

    setUser(userData);
    setToken(authToken);
  }, []);

  // Comprehensive logout: completely purges session & local storage across all staff storage keys
  const logout = useCallback(() => {
    AUTH_STORAGE_KEYS.forEach((key) => {
      try {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      } catch (err) {
        console.error("Storage purge error:", err);
      }
    });

    // Wipe any role-specific dynamic keys in localStorage
    try {
      Object.keys(localStorage).forEach((k) => {
        if (
          k.startsWith("active_orders_") ||
          k.startsWith("history_") ||
          k.startsWith("rider_") ||
          k.startsWith("cashier_")
        ) {
          localStorage.removeItem(k);
        }
      });
    } catch (err) {
      console.error("Storage wildcard purge error:", err);
    }

    setUser(null);
    setToken(null);
  }, []);

  const value = {
    user,
    token,
    role: user?.role ? String(user.role).toLowerCase() : null,
    isAuthenticated: Boolean(user && token),
    isLoading,
    setIsLoading,
    login,
    logout,
    getRoleDashboard,
    isRoleAllowedForPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useStaffAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useStaffAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
