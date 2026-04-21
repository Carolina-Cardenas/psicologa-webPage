import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // DEDUPE VA AQUÍ ADENTRO
    dedupe: ["react", "react-dom"], 
  },
  optimizeDeps: {
    include: ["sonner", "framer-motion", "react-router-dom"],
  },
});