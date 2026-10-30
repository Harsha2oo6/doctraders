import type { NextConfig } from "next";

const config: NextConfig = {
  // Workspace packages ship TypeScript source, so Next must compile them.
  transpilePackages: ["@doctraders/ui", "@doctraders/machines", "@doctraders/schemas", "@doctraders/mock", "@doctraders/api-client"],
};

export default config;
