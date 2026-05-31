import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95
      }
    }
  },
  resolve: {
    conditions: ["development"],
    alias: {
      "@tour-manager/shared": new URL("../shared/index.ts", import.meta.url).pathname,
      "@core": new URL("./core", import.meta.url).pathname,
      "@libs": new URL("./libs", import.meta.url).pathname,
      "@features": new URL("./features", import.meta.url).pathname,
    },
  },
});
