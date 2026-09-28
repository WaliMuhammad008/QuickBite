import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './style/index.css'
import App from './App.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx'

// 🔥 Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent unnecessary refetches when user switches tabs
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// --- GLOBAL FETCH INTERCEPTOR FOR JWT AUTHENTICATION ---
const originalFetch = window.fetch;
window.fetch = async function (resource, options) {
  const token = sessionStorage.getItem("auth_token");
  if (token) {
    let url = "";
    if (typeof resource === "string") {
      url = resource;
    } else if (resource instanceof Request) {
      url = resource.url;
    }

    // Intercept only calls destined for our BB backend
    const isBackendCall =
      url.includes("localhost/BB%20backend") ||
      url.includes("localhost/BB backend") ||
      url.includes("/BB%20backend/api/") ||
      url.includes("/BB backend/api/") ||
      url.includes("/backend/api") ||
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
