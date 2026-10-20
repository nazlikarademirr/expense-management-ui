import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  base: "/expense-management",
  server: {
    host: "0.0.0.0",
    open: true,
    port: 3000,
    proxy: {
      "/company-service": {
        target: "https://localhost:7004",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/company-service/, ""),
      },
      "/expense-service": {
        target: "https://localhost:7165",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/expense-service/, ""),
      },
      "/report-service": {
        target: "https://localhost:7214",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/report-service/, ""),
      },
      "/core-service": {
        target: "https://localhost:7192",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/core-service/, ""),
      },
    },
  },
});
