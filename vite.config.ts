import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  base: "/login",
  server: {
    host: "0.0.0.0",
    open: true,
    port: 3000,
  },
});
