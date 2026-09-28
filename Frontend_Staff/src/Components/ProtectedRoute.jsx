import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useStaffAuth, getRoleDashboard } from "../Context/AuthContext";
import Swal from "sweetalert2";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, token, isAuthenticated, logout } = useStaffAuth();
  const location = useLocation();

  // Tab-isolated session verification directly from active tab's sessionStorage
  let activeUser = user;
  let activeToken = token;

  if (!activeUser || !activeToken) {
    try {
      const rawUser =
        sessionStorage.getItem("staff_user") ||
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("staff_session");
      const storedToken =
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") ||
        sessionStorage.getItem("staff_token");
      if (rawUser && storedToken) {
        activeUser = JSON.parse(rawUser);
        activeToken = storedToken;
      }
    } catch {
      activeUser = null;
      activeToken = null;
    }
  }

  // 1. Session Check - If not logged in OR no token OR no role, purge stale tab session and redirect to login
  const isInvalidSession = !activeUser || !activeToken || !activeUser?.role;

  useEffect(() => {
    if (isInvalidSession) {
      logout();
    }
  }, [isInvalidSession, logout]);

  if (isInvalidSession) {
    return <Navigate to="/login" replace />;
  }

  // 2. Case-Insensitive Role Matching
  const userRole = String(activeUser.role || "").toLowerCase().trim();
  const safeAllowedRoles = allowedRoles.map((role) =>
    String(role).toLowerCase().trim()
  );

  // 3. RBAC Block: If role is not authorized for this specific portal
  if (allowedRoles.length > 0 && !safeAllowedRoles.includes(userRole)) {
    console.warn(
      `[RBAC Guard Block] Role "${activeUser.role}" is not authorized for "${location.pathname}". Redirecting to authorized portal.`
    );

    const authorizedDashboard = getRoleDashboard(userRole);

    // Prevent redirect loop if already at target or login
    if (authorizedDashboard !== location.pathname && location.pathname !== "/login") {
      setTimeout(() => {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: `Access Denied: ${activeUser?.role || "Staff"} cannot access ${location.pathname}`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }, 100);
    }

    return <Navigate to={authorizedDashboard} replace />;
  }

  // 4. Authorized - render the protected dashboard
  return children;
};

export default ProtectedRoute;
