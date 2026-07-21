import { defineConfig } from "oxlint";

export default defineConfig({
  jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
  rules: { "vite-plus/prefer-vite-plus-imports": "error" },
  options: { typeAware: true, typeCheck: true },
});
