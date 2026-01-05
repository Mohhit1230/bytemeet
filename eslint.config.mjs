import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore backend JS files from TypeScript rules
    "backend/**",
  ]),
  // Custom rules
  {
    rules: {
      // Allow any in specific cases (we'll fix critical ones)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars with underscore prefix
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Relax unescaped entities (common in JSX)
      "react/no-unescaped-entities": "warn",
      // Allow setState in effects with proper handling
      "react-hooks/set-state-in-effect": "warn",
      // Allow anonymous default exports for services
      "import/no-anonymous-default-export": "warn",
    }
  }
]);

export default eslintConfig;

