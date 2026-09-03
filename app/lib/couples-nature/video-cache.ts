import { prefetchVideoBlob } from '@/app/lib/couples-nature/background';

const blobBySrc = new Map<string, Promise<Blob>>();

/** Start downloading the clip while the user previews so export skips a second fetch. */
export function warmCouplesNatureVideoBlob(videoSrc: string | null | undefined): void {
  if (!videoSrc?.trim() || blobBySrc.has(videoSrc)) return;
  blobBySrc.set(videoSrc, prefetchVideoBlob(videoSrc));
}

export async function getCouplesNatureVideoBlob(
  videoSrc: string,
  cachedBlob?: Blob | null
): Promise<Blob> {
  if (cachedBlob) return cachedBlob;
  const pending = blobBySrc.get(videoSrc);
  if (pending) return pending;
  const blob = prefetchVideoBlob(videoSrc);
  blobBySrc.set(videoSrc, blob);
  return blob;
}

export function clearCouplesNatureVideoCache(videoSrc?: string): void {
  if (videoSrc) blobBySrc.delete(videoSrc);
  else blobBySrc.clear();
}
