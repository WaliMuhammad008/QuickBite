import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-core": [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query",
          ],
          "vendor-maps": ["mapbox-gl", "react-map-gl"],
          "vendor-ui": [
            "sweetalert2",
            "react-hot-toast",
            "react-icons",
          ],
        },
      },
    },
  },
  server: {
    host: true,
  },
});
