import {
  freshBakedDonutPlaybackSrc,
  type FreshBakedDonutPost,
} from '@/app/lib/video-template-fresh-baked-donut';

export async function exportFreshBakedDonutClip(post: FreshBakedDonutPost): Promise<Blob> {
  const res = await fetch(freshBakedDonutPlaybackSrc(post));
  if (!res.ok) {
    throw new Error(`Failed to download clip (${res.status})`);
  }
  return res.blob();
}
