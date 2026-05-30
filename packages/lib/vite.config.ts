import { defineConfig } from "vite-plus";
import solid from "vite-plugin-solid";

export default defineConfig({
  cacheDir: "../../node_modules/.vite",
  server: { host: true },
  pack: [
    {
      dts: false,
      entry: { "loudness.worklet": "src/scripts/loudness.worklet.ts" },
      exports: true,
      format: ["esm"],
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
});
