import { defineConfig } from "tsup";

export default defineConfig({
    entry: {
        cli: "src/cli/index.tsx",
    },
    format: ["esm"],
    sourcemap: true,
    clean: true,
});
