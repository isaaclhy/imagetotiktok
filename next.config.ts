import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid picking up a parent package-lock.json outside this repo.
  turbopack: {
    root: process.cwd(),
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
