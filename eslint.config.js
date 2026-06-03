import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/out/**",
      "**/coverage/**",
      "**/node_modules/**",
      "eslint.config.js",
      "scripts/**",
      "client/routeTree.gen.ts"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { "prefer": "type-imports" }
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { "checksVoidReturn": { "attributes": false } }
      ]
    }
  }
);
