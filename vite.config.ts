import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxy = {
  "/api": "http://localhost:8000",
  "/health": "http://localhost:8000",
  // Admin-uploaded images are served by FastAPI, not Vite.
  "/media": "http://localhost:8000"
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy
  },
  // The preview server serves the production build, and needs the same proxy
  // or every API call 404s against the static server instead of the backend.
  preview: {
    port: 4173,
    proxy
  }
});
