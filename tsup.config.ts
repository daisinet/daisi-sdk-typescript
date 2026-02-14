import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    outDir: "dist",
    external: ["nice-grpc-web"],
  },
  {
    entry: {
      web: "src/web.ts",
    },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    outDir: "dist",
    external: ["nice-grpc"],
  },
]);
