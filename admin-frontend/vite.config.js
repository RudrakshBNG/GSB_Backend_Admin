import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { websocketFix } from "./vite-websocket-fix.js";

// https://vite.dev/config/
export default defineConfig({
  // Set the base path based on where the frontend will be hosted
  // - For AWS S3 or CloudFront, set to the path (e.g., "/" or "/subpath")
  // - For EC2, set to "/" if served from the root
  base: process.env.VITE_BASE_URL || "/",

  plugins: [react(), websocketFix()],

  server: {
    // Development server settings (not used in production)
    port: 3001,
    host: "0.0.0.0",
    hmr: {
      port: 3001,
      host: "localhost",
      overlay: false,
      clientPort: 3001,
    },
    proxy: {
      // Proxy API requests to the backend during development
      "/api": {
        target: "http://localhost:3000/api",
        changeOrigin: true,
        secure: false, // Set to false to bypass self-signed certificate issues in dev
        ws: true, // Enable WebSocket proxying if needed
      },
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
  },

  build: {
    outDir: "dist", // Output directory for the production build
    sourcemap: false, // Disable sourcemaps in production for security
    minify: "esbuild", // Ensure minification for optimized builds
  },
});
