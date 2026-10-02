import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    "**/artifacts/**",
    "**/cache/**",
    "**/.next/**",
    "**/next-env.d.ts",
    "runtime/**",
  ]),
  { rules: { "@next/next/no-html-link-for-pages": "off" } },
  {
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);
