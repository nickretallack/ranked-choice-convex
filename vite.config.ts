import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@convex/_generated": path.resolve(__dirname, "./convex/_generated"),
      "@convex/shared": path.resolve(__dirname, "./convex/shared"),
    },
  },
});
