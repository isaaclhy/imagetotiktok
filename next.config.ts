import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Absolute path to this app (avoids picking up a parent package-lock.json). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Parent ~/package-lock.json otherwise becomes the inferred workspace root,
  // so CSS imports like `tailwindcss` resolve outside this project and fail.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.join(projectRoot, 'node_modules/tailwindcss'),
    },
  },
  serverExternalPackages: [
    '@napi-rs/canvas',
    '@remotion/bundler',
    '@remotion/renderer',
    '@remotion/cli',
    'remotion',
    'esbuild',
  ],
};

export default nextConfig;
