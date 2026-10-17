import { defineConfig } from "vite-plus";

export default defineConfig({
  server: { host: true },
  test: { environment: "node" },
  pack: [
    {
      entry: { index: "src/index.ts" },
      format: ["esm"],
      outExtensions: () => ({ js: ".js" }),
      dts: { generator: "tsgo", entry: "src/index.ts" },
      minify: true,
      exports: false,
    },
    {
      entry: { "loudness.worklet": "src/scripts/loudness-processor.ts" },
      format: ["esm"],
      outExtensions: () => ({ js: ".js" }),
      outputOptions: { codeSplitting: false },
      dts: false,
      clean: false,
      minify: true,
      exports: false,
    },
  ],
});
