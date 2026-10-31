import { FRESH_BAKED_DONUT_POSTS } from '@/app/lib/video-template-fresh-baked-donut';

export type StudioAppId = 'spill-it' | 'fab' | 'nighty';

export type StudioApp = {
  id: StudioAppId;
  label: string;
};

export type ImageTemplateCard = {
  id: number;
  title: string;
  subtitle: string;
  coverSrc?: string;
};

export type VideoTemplateCard = {
  id: number;
  title: string;
  subtitle: string;
  coverSrc?: string;
  videoSrc?: string;
};

export const STUDIO_APPS: readonly StudioApp[] = [
  { id: 'spill-it', label: 'Spill It' },
  { id: 'fab', label: 'Fab' },
  { id: 'nighty', label: 'Nighty' },
] as const;

export const DEFAULT_STUDIO_APP_ID: StudioAppId = 'spill-it';

export function isStudioAppId(value: string | null | undefined): value is StudioAppId {
  return STUDIO_APPS.some((app) => app.id === value);
}

/** Map legacy URL app ids to current ones. */
export function resolveStudioAppId(value: string | null | undefined): StudioAppId {
  if (isStudioAppId(value)) return value;
  if (value === 'bleamies') return 'spill-it';
  return DEFAULT_STUDIO_APP_ID;
}

/** Image templates available for each app (IDs are scoped per app). */
export const IMAGE_TEMPLATES_BY_APP: Record<StudioAppId, ImageTemplateCard[]> = {
  'spill-it': [
    { id: 1, title: 'Template 1', subtitle: '' },
    {
      id: 2,
      title: 'Template 2',
      subtitle: '',
      coverSrc: '/image-templates/template-2-cover.jpg',
    },
    {
      id: 6,
      title: 'Template 6',
      subtitle: '',
      coverSrc: '/image-templates/template-6-bear.png',
    },
    {
      id: 7,
      title: 'Template 7',
      subtitle: '',
      coverSrc: '/image-templates/template-7-cover.jpg',
    },
    {
      id: 8,
      title: 'Couples selfie',
      subtitle: '',
      coverSrc: '/image-templates/template-8-cover.jpg',
    },
    {
      id: 9,
      title: 'Top down selfie angle',
      subtitle: '',
      coverSrc: '/image-templates/template-9-cover.jpg',
    },
    {
      id: 10,
      title: 'Couples cute moments',
      subtitle: '',
      coverSrc: '/image-templates/template-10-cover.jpg',
    },
    {
      id: 11,
      title: 'Cute celebrity couples',
      subtitle: '',
      coverSrc: '/image-templates/template-11-cover.jpg',
    },
    {
      id: 12,
      title: 'Template 12',
      subtitle: '',
      coverSrc: '/image-templates/template-12-1.png',
    },
    {
      id: 13,
      title: 'Template 13',
      subtitle: '',
      coverSrc: '/image-templates/template-13-cover.jpg',
    },
    {
      id: 14,
      title: 'Template 14',
      subtitle: '',
      coverSrc: '/image-templates/template-14-cover.jpg',
    },
    {
      id: 15,
      title: 'Template 15',
      subtitle: '',
    },
    {
      id: 16,
      title: 'Notes questions',
      subtitle: '',
      coverSrc: '/image-templates/template-16-cover.png',
    },
    {
      id: 17,
      title: 'Split cover',
      subtitle: '',
      coverSrc: '/image-templates/template-17-cover.jpg',
    },
    {
      id: 18,
      title: 'Pastel questions',
      subtitle: '',
      coverSrc: '/image-templates/template-18-cover.png',
    },
    {
      id: 19,
      title: 'Red glow',
      subtitle: '',
    },
    {
      id: 20,
      title: 'Ocean questions',
      subtitle: '',
      coverSrc: '/image-templates/template-20-cover.jpg',
    },
  ],
  fab: [
    { id: 1, title: 'Heart shaped paper', subtitle: '' },
  ],
  nighty: [],
};

/** Video templates available for each app (IDs are scoped per app). */
export const VIDEO_TEMPLATES_BY_APP: Record<StudioAppId, VideoTemplateCard[]> = {
  'spill-it': [
    {
      id: 2,
      title: 'Couples Nature',
      subtitle: '',
      coverSrc: '/video-templates/template-2-cover.jpg',
      videoSrc: '/video-template-2/15402243_2160_3840_30fps.mp4',
    },
    {
      id: 3,
      title: 'iPhone Notes',
      subtitle: '',
      coverSrc: '/video-templates/iphone-notes-cover.png',
    },
    { id: 4, title: 'Ocean sunset', subtitle: '' },
    {
      id: 5,
      title: 'Fresh Baked Donut',
      subtitle: '',
      coverSrc: FRESH_BAKED_DONUT_POSTS[0]?.thumbnailUrl,
    },
    {
      id: 6,
      title: 'Cinematic',
      subtitle: '',
    },
  ],
  fab: [
    { id: 1, title: 'Affirmation montage', subtitle: '' },
    { id: 2, title: 'Template 2', subtitle: '' },
    { id: 3, title: 'Template 3', subtitle: '' },
    { id: 4, title: 'Template 4', subtitle: '' },
  ],
  nighty: [
    { id: 1, title: 'Particle', subtitle: '' },
    { id: 2, title: 'Rain', subtitle: '' },
  ],
};

export function getImageTemplatesForApp(appId: StudioAppId): ImageTemplateCard[] {
  return IMAGE_TEMPLATES_BY_APP[appId] ?? [];
}

export function getVideoTemplatesForApp(appId: StudioAppId): VideoTemplateCard[] {
  return VIDEO_TEMPLATES_BY_APP[appId] ?? [];
}
