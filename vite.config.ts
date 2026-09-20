import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/health": "http://localhost:8000",
      // Admin-uploaded images are served by FastAPI, not Vite.
      "/media": "http://localhost:8000"
    }
  }
});
