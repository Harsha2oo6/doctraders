import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  // Pin the project root (a stray lockfile higher up the disk otherwise confuses Next).
  outputFileTracingRoot: path.resolve("."),
  turbopack: { root: path.resolve(".") },
};

export default config;
