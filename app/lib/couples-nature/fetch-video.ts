import { VIDEO_TEMPLATE2_PEXELS_QUERIES } from '@/app/lib/constants';
import {
  fetchClientRandomPexelsVideo,
  type ClientPexelsVideoResult,
} from '@/app/lib/pexels-video-client';

export async function fetchRandomCouplesNatureVideo(): Promise<ClientPexelsVideoResult> {
  return fetchClientRandomPexelsVideo({ queries: VIDEO_TEMPLATE2_PEXELS_QUERIES });
}
