import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    cli: "src/cli/index.ts",
  },
  outDir: "dist/cli",
  format: ["esm"],
  fixedExtension: false,
  sourcemap: true,
  clean: true,
});
