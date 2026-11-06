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
  // The library routes only need the two original MP4s. A dynamic
  // path.join(process.cwd(), ...) otherwise traces the whole repo,
  // including the ten quiz files and cartoon assets, past the
  // serverless size limit.
  outputFileTracingExcludes: {
    '*': ['public/copycat-backgrounds/**/*'],
    // One pattern for the list, the [id] player, and the test route.
    // A key written as [id] is a glob character class, so it never matches.
    '/api/video-library/**': [
      './cartoon-quiz/**/*',
      './data/cartoon-batch/**/*',
      './public/**/*',
      './docs/**/*',
      './scripts/**/*',
    ],
  },
  outputFileTracingIncludes: {
    '/api/video-library/route': ['./data/cartoon-originals/**/*'],
    '/api/video-library/[id]/route': ['./data/cartoon-originals/**/*'],
    '/api/video-library/test-artifact/route': ['./data/cartoon-originals/test-artifact.mp4'],
  },
};

export default nextConfig;
