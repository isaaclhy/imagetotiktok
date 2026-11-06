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
  // Static copycat JPEGs must not be traced into any function. The
  // character-image route only reads `public/characters`.
  outputFileTracingExcludes: {
    '*': ['public/copycat-backgrounds/**/*'],
  },
  outputFileTracingIncludes: {
    '/api/video-library/route': ['./data/cartoon-originals/**/*'],
    '/api/video-library/[id]/route': ['./data/cartoon-originals/**/*'],
    '/api/video-library/test-artifact/route': ['./data/cartoon-originals/test-artifact.mp4'],
  },
};

export default nextConfig;
