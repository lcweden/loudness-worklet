import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { homepage, repository, version } from "../../package.json";

export default defineConfig({
  cacheDir: "../../node_modules/.vite",
  plugins: [solid(), tailwindcss()],
  define: {
    __VERSION__: JSON.stringify(version),
    __REPO_URL__: JSON.stringify(repository.url),
    __HOME_PAGE__: JSON.stringify(homepage),
  },
  server: {
    host: true,
  },
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
  },
  base: "/loudness-worklet/",
});
