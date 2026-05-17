import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  cacheDir: "../../node_modules/.vite",
  plugins: [solid()],
  server: {
    host: true,
  },
  build: {
    target: "esnext",
    lib: {
      entry: new URL("src/index.ts", import.meta.url).pathname,
      name: "loudness-worklet",
      fileName: () => "loudness.worklet.js",
      formats: ["es"],
    },
    outDir: "dist",
    copyPublicDir: false,
    emptyOutDir: true,
    minify: true,
  },
});
