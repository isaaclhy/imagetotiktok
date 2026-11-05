import type { Metadata } from 'next';
import { VideoLibraryClient } from '@/app/library/video-library-client';

export const metadata: Metadata = {
  title: 'Video library',
  description: 'Saved Spill It promo videos',
};

export default function VideoLibraryPage() {
  return <VideoLibraryClient />;
}
