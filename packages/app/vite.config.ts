import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";
import type { UserConfig } from "vite-plus";

export default defineConfig({
  server: { host: true },
  plugins: [
    tailwindcss(),
    sveltekit({
      alias: {
        "@assets": "src/assets",
        "@common": "src/common",
        "@components": "src/components",
        "@hooks": "src/hooks",
        "@icons": "src/icons",
        "@routes": "src/routes",
        "@utils": "src/utils",
      },
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },
      adapter: adapter({ fallback: "404.html" }),
      files: { assets: "public" },
      paths: { base: "/loudness-worklet" },
    }),
  ] as UserConfig["plugins"],
}) as UserConfig;
