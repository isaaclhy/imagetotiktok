import { bundle } from '@remotion/bundler';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Remotion's `bundle()` runs webpack over the whole composition — often 10–30s+.
 * We cache the serve URL for the lifetime of the Node process so each download
 * only pays for encode (renderMedia), not a full rebundle.
 *
 * When any `remotion/**` source file changes, we drop the old bundle so exports
 * pick up new composition code (otherwise e.g. caption colors look "stuck").
 */
function collectRemotionFileStats(dir: string, acc: string[]): void {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) collectRemotionFileStats(full, acc);
    else if (/\.(tsx?|css|json)$/i.test(name)) acc.push(`${full}:${st.mtimeMs}`);
  }
}

function getRemotionFingerprint(): string {
  const dir = path.join(process.cwd(), 'remotion');
  const parts: string[] = [];
  try {
    collectRemotionFileStats(dir, parts);
  } catch {
    return 'remotion-missing';
  }
  parts.sort();
  return crypto.createHash('sha256').update(parts.join('\n')).digest('hex');
}

let bundlePromise: Promise<string> | null = null;
let fingerprintOfResolvedBundle = '';
let lastResolvedServeUrl: string | null = null;

async function bundleOnceOrRetryIfSourcesChangedDuringBuild(): Promise<string> {
  const before = getRemotionFingerprint();
  let serveUrl = await bundle({
    entryPoint: path.join(process.cwd(), 'remotion', 'index.ts'),
    webpackOverride: (config) => config,
  });
  const after = getRemotionFingerprint();
  if (before !== after) {
    try {
      fs.rmSync(serveUrl, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    serveUrl = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion', 'index.ts'),
      webpackOverride: (config) => config,
    });
  }
  return serveUrl;
}

export function getRemotionBundleServeUrl(): Promise<string> {
  const fp = getRemotionFingerprint();

  if (lastResolvedServeUrl && fingerprintOfResolvedBundle !== fp) {
    try {
      fs.rmSync(lastResolvedServeUrl, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    lastResolvedServeUrl = null;
    bundlePromise = null;
    fingerprintOfResolvedBundle = '';
  }

  if (!bundlePromise) {
    bundlePromise = bundleOnceOrRetryIfSourcesChangedDuringBuild().then((url) => {
      lastResolvedServeUrl = url;
      fingerprintOfResolvedBundle = getRemotionFingerprint();
      return url;
    });
  }

  return bundlePromise;
}
