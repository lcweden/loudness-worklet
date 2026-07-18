import { defineConfig } from "oxfmt";

export default defineConfig({
  svelte: true,
  sortTailwindcss: true,
  sortImports: {
    newlinesBetween: false,
  },
  jsdoc: {
    addDefaultToDescription: true,
    capitalizeDescriptions: true,
    commentLineStrategy: "multiline",
    descriptionWithDot: true,
  },
  sortPackageJson: true,
});
