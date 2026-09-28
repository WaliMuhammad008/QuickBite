import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import App from './App.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- GLOBAL FETCH INTERCEPTOR FOR JWT AUTHENTICATION ---
const originalFetch = window.fetch;
window.fetch = async function (resource, options) {
  const token =
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("staff_token");
  if (token) {
    let url = "";
    if (typeof resource === "string") {
      url = resource;
    } else if (resource instanceof Request) {
      url = resource.url;
    }

    // Intercept only calls destined for our BB backend (supporting subfolders & relative paths)
    const isBackendCall =
      url.includes("/BB%20backend/") ||
      url.includes("/BB backend/") ||
      url.includes("/quickibite/") ||
      url.includes("/backend/api") ||
      url.includes("/api/") ||
      url.includes("alwaysdata.net") ||
      url.includes("infinityfreeapp.com");

    if (isBackendCall) {
      if (resource instanceof Request) {
        if (!resource.headers.has("Authorization") && !resource.headers.has("X-Auth-Token")) {
          const newHeaders = new Headers(resource.headers);
          newHeaders.set("Authorization", `Bearer ${token}`);
          newHeaders.set("X-Auth-Token", token);
          resource = new Request(resource, { headers: newHeaders });
        }
      } else {
        options = options || {};
        options.headers = options.headers || {};
        if (options.headers instanceof Headers) {
          if (!options.headers.has("Authorization") && !options.headers.has("X-Auth-Token")) {
            options.headers.set("Authorization", `Bearer ${token}`);
            options.headers.set("X-Auth-Token", token);
          }
        } else if (Array.isArray(options.headers)) {
          const hasAuth = options.headers.some(
            ([key]) => key.toLowerCase() === "authorization"
          );
          if (!hasAuth) {
            options.headers.push(["Authorization", `Bearer ${token}`]);
            options.headers.push(["X-Auth-Token", token]);
          }
        } else {
          const hasAuth = Object.keys(options.headers).some(
            (k) => k.toLowerCase() === "authorization"
          );
          if (!hasAuth) {
            options.headers["Authorization"] = `Bearer ${token}`;
            options.headers["X-Auth-Token"] = token;
          }
        }
      }
    }
  }
  return originalFetch(resource, options);
};

// Create a query client for React Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
      refetchOnWindowFocus: true, // Refresh data when switching back to the tab
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
