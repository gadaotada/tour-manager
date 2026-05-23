import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["esm"],
  outDir: "../out/server",
  sourcemap: true,
  clean: true,
  dts: false,
  bundle: true,
  platform: "node",
  target: "node22"
});
