import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "../out/client",
    emptyOutDir: true,
  },
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: "./routes",
      generatedRouteTree: "./routeTree.gen.ts",
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    conditions: ["development"],
    alias: {
      "@tour-manager/shared": new URL("../shared/index.ts", import.meta.url).pathname,
      "@core": new URL("./core", import.meta.url).pathname,
      "@libs": new URL("./libs", import.meta.url).pathname,
      "@features": new URL("./features", import.meta.url).pathname,
      "@components": new URL("./components", import.meta.url).pathname,
      "@hooks": new URL("./hooks", import.meta.url).pathname,
      "@routes": new URL("./routes", import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
