import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { imagetools } from "vite-imagetools";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    imagetools({
      include: "**/*.{svg,png,jpg,jpeg,webp}",
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },

  esbuild: {
    drop: ["console", "debugger"],
  },

  build: {
    target: "es2015",
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
    reportCompressedSize: true,

    modulePreload: {
      polyfill: true,
    },

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("react/jsx-runtime")
          ) {
            return;
          }

          if (id.includes("leaflet") || id.includes("react-leaflet")) {
            return "vendor_map";
          }
          if (id.includes("recharts") || id.includes("d3")) {
            return "vendor_charts";
          }
          if (id.includes("framer-motion")) {
            return "vendor_animation";
          }
          if (id.includes("@radix-ui") || id.includes("@floating-ui")) {
            return "vendor_ui";
          }
          if (id.includes("@supabase") || id.includes("@tanstack")) {
            return "vendor_data";
          }
        },
      },
    },
  },
}));
