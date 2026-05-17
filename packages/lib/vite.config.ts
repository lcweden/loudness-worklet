import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "../../node_modules/.vite",
  worker: { format: "es" },
  build: {
    target: "esnext",
    lib: {
      entry: new URL("src/index.ts", import.meta.url).pathname,
      name: "loudness-worklet",
      fileName: () => "index.js",
      formats: ["es"],
    },
    outDir: "dist",
    emptyOutDir: true,
    minify: true,
  },
});
