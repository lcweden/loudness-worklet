import { defineConfig, UserConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    svelte: true,
    sortTailwindcss: true,
    sortImports: { newlinesBetween: false },
    jsdoc: {
      addDefaultToDescription: true,
      capitalizeDescriptions: true,
      commentLineStrategy: "multiline",
      descriptionWithDot: true,
    },
    sortPackageJson: true,
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  run: { cache: true },
}) as UserConfig;
