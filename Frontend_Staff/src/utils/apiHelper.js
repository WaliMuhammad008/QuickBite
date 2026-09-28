/**
 * apiHelper.js - Authenticated API Fetch Utility
 * Use this instead of plain fetch() for all protected API calls.
 * It automatically attaches the JWT token from sessionStorage.
 */

const API_BASE = import.meta.env.VITE_API_BASE || `${import.meta.env.VITE_API_BASE}`;

/**
 * Get the stored JWT token
 */
export const getToken = () => {
  try {
    return (
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("staff_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("staff_token") ||
      null
    );
  } catch {
    return null;
  }
};

/**
 * Get standard authentication headers
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "X-Auth-Token": token,
      }
    : {};
};

/**
 * Authenticated fetch - automatically adds Authorization and X-Auth-Token headers
 * @param {string} endpoint - e.g. "get_staff.php", "/get_staff.php", or full URL
 * @param {object} options  - fetch options (method, body, etc.)
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
          "X-Auth-Token": token,
        }
      : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${API_BASE}/${endpoint.replace(/^\//, "")}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};

/**
 * Public fetch - no token attached (for customer-facing APIs)
 * @param {string} endpoint - e.g. "get_menu.php"
 * @param {object} options  - fetch options
 */
export const publicFetch = async (endpoint, options = {}) => {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${API_BASE}/${endpoint.replace(/^\//, "")}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};
