import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus";

export default defineConfig({
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
  plugins: [svelte({ configFile: false })],
}) as UserConfig;
