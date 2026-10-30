import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/** Shared ESLint preset for every Next.js app. Call it with `import.meta.url` of the app. */
export function nextConfig(importMetaUrl) {
  const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(importMetaUrl)) });
  return [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    { rules: { "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }] } },
  ];
}
