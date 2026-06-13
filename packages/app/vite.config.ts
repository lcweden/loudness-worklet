import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";
import { defineConfig, UserConfig } from "vite-plus";
import { homepage, repository, version } from "../../package.json";

export default defineConfig({
  base: "/loudness-worklet/",
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
  },
  cacheDir: "../../node_modules/.vite",
  define: {
    __VERSION__: JSON.stringify(version),
    __REPO_URL__: JSON.stringify(repository.url),
    __HOME_PAGE__: JSON.stringify(homepage),
  },
  server: {
    host: true,
  },
  plugins: [solid(), tailwindcss()],
}) as UserConfig;
