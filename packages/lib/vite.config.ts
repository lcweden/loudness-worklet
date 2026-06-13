import solid from "vite-plugin-solid";
import { defineConfig, UserConfig } from "vite-plus";

export default defineConfig({
  cacheDir: "../../node_modules/.vite",
  server: { host: true },
  test: { environment: "node" },
  pack: [
    {
      dts: false,
      entry: { "loudness.worklet": "src/scripts/loudness-processor.ts" },
      exports: true,
      format: ["esm"],
      minify: true,
      name: "lib",
      outExtensions: () => ({ js: ".js" }),
    },
    {
      dts: { entry: "src/index.ts" },
      entry: { index: "src/index.ts" },
      exports: true,
      format: ["esm"],
      name: "lib",
      outExtensions: () => ({ js: ".js" }),
    },
  ],
  plugins: [solid()],
}) as UserConfig;
