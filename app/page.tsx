'use client';

import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import type { CanvasData } from '@/app/lib/types';
import { generateCardImage as generateCardImageLib } from '@/app/lib/generate-card-image';
import { extractDominantColor, wrapText } from '@/app/lib/canvas-utils';
import {
  CARD_BG_FALLBACK_PALETTE,
  PROMPTS,
  SPILL_IT_TEMPLATE_COVER_PROMPTS,
  FUNNY_QUESTIONS,
  FLIRTY_QUESTIONS,
  ME_OR_YOU_QUESTIONS,
  BRAVE_QUESTIONS,
  KAWAII_DRIVE_FOLDER_ID,
  COUPLES_NATURE_DRIVE_FOLDER_ID,
  COUPLES_NATURE_VIDEO_FILTER,
  VIDEO_TEMPLATE2_HIGHLIGHT_BACKGROUND,
  VIDEO_TEMPLATE2_PEXELS_QUERIES,
  NIGHTY_PARTICLE_PEXELS_QUERIES,
  NIGHTY_RAIN_VIDEO_OPTIONS,
  NIGHTY_RAIN_DEFAULT_VIDEO,
  nightyRainVideoOption,
  type NightyRainVideoId,
  NIGHTY_RAIN_CAPTION,
  NIGHTY_RAIN_CAPTION_SUBLINE,
  NIGHTY_RAIN_MIST_WASH,
  NIGHTY_RAIN_MIST_TOP,
  NIGHTY_RAIN_MIST_BOTTOM,
  NIGHTY_RAIN_MIST_VIGNETTE,
  NIGHTY_RAIN_MIST_BLOOM,
  NIGHTY_RAIN_MIST_TEAL,
  NIGHTY_RAIN_MAX_DURATION_SEC,
  NIGHTY_RAIN_EXPORT_WIDTH,
  NIGHTY_RAIN_EXPORT_HEIGHT,
  NIGHTY_RAIN_EXPORT_VIDEO_BITRATE,
  NIGHTY_RAIN_EXPORT_FPS,
  NIGHTY_RAIN_CAPTION_SIZE_RATIO,
  NIGHTY_RAIN_SUBLINE_SIZE_RATIO,
  NIGHTY_RAIN_CAPTION_MAX_WIDTH_RATIO,
  NIGHTY_RAIN_CAPTION_FONT_WEIGHT,
  NIGHTY_RAIN_CAPTION_COLOR,
  NIGHTY_RAIN_SUBLINE_Y_RATIO,
  NIGHTY_RAIN_DEFAULT_SOUND,
  nightyRainSoundsForVideo,
  nightyRainDefaultSoundForVideo,
  nightyRainAudioSrc,
  type NightyRainSoundId,
  NIGHTY_PARTICLE_USE_TEST_VIDEO,
  NIGHTY_PARTICLE_TEST_VIDEO_SRC,
  NIGHTY_PARTICLE_DEFAULT_LINES,
  NIGHTY_PARTICLE_TIMING,
  NIGHTY_PARTICLE_CAPTION_SIZE_RATIO,
  NIGHTY_PARTICLE_CAPTION_FONT_WEIGHT,
  NIGHTY_PARTICLE_CANVAS_FONT_STACK,
  NIGHTY_PARTICLE_FONT_STACK,
  NIGHTY_PARTICLE_EXPORT_WIDTH,
  NIGHTY_PARTICLE_EXPORT_HEIGHT,
  NIGHTY_PARTICLE_EXPORT_VIDEO_BITRATE,
  NIGHTY_PARTICLE_AUDIO_SRC,
  NIGHTY_PARTICLE_DEFAULT_WAVE,
  nightyParticleAudioSrc,
  pickNightyParticleAccentColor,
  nightyParticleMaxDurationSec,
  type NightyParticleLines,
  type NightyParticleTiming,
  type NightyParticleWaveId,
  CONCRETE_QUESTION_TYPES,
  IMAGE_TEMPLATE2_PASTEL_COLORS,
  IMAGE_TEMPLATE2_COVER_SQUIGGLE_ENABLED_DEFAULT,
  IMAGE_TEMPLATE2_APP_FOOTER,
  IMAGE_TEMPLATE2_TOP_LABEL,
  IMAGE_TEMPLATE2_TYPE_LABELS,
  type AutomateQuestionType,
  type ConcreteQuestionType,
} from '@/app/lib/constants';
import { ImageTemplate3ImessageBubble } from '@/app/components/ImageTemplate3ImessageBubble';
import {
  drawImageTemplate2CoverSlide,
  IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
  IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE2_COVER_SUBTITLE_GAP_EM,
  IMAGE_TEMPLATE2_COVER_SUBTITLE_SIZE_RATIO,
  IMAGE_TEMPLATE2_COVER_SUBTITLE_WEIGHT,
  IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO,
  IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
  IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_SRC,
  IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO,
  IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO,
  IMAGE_TEMPLATE2_Q5_TAB_INDEX,
  IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO,
  IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO,
  IMAGE_TEMPLATE2_TEXT_COLOR,
  imageTemplate2Q5PromoLayout,
  formatImageTemplate2CoverSubtitle,
  pickRandomImageTemplate2CoverSubtitle,
} from '@/app/lib/image-template-2-cover';
import {
  drawImageTemplate9Title,
  IMAGE_TEMPLATE9_TITLE_MAX_WIDTH_RATIO,
  IMAGE_TEMPLATE9_TITLE_SIZE_RATIO,
  IMAGE_TEMPLATE9_TITLE_WEIGHT,
  pickImageTemplate9TitleAnchor,
  type ImageTemplate9TitleAnchor,
} from '@/app/lib/image-template-9-cover';
import {
  drawImageTemplate8Q5Banner,
  drawImageTemplate8Q5SearchLabel,
  IMAGE_TEMPLATE8_Q5_BANNER_SRC,
  IMAGE_TEMPLATE8_Q5_BANNER_ASPECT,
  IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_LINES,
  IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
  IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO,
} from '@/app/lib/image-template-8-cover';
import {
  drawImageTemplate10CoverFill,
  IMAGE_TEMPLATE10_COVER_SUBTITLE_SIZE_RATIO,
  IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO,
  IMAGE_TEMPLATE10_LUXURY_PREVIEW_OVERLAY,
  IMAGE_TEMPLATE10_Q_TEXT_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE10_Q_TEXT_MAX_WIDTH_RATIO,
  IMAGE_TEMPLATE10_Q_TEXT_SIZE_RATIO,
  IMAGE_TEMPLATE10_Q_TEXT_WEIGHT,
  pickImageTemplate10QuestionSources,
} from '@/app/lib/image-template-10-cover';
import {
  drawImageTemplate11LuxuryOverlay,
  IMAGE_TEMPLATE11_CSS_FILTER,
} from '@/app/lib/image-template-11-cover';
import {
  IMAGE_TEMPLATE12_FRAME_BG,
  IMAGE_TEMPLATE12_SLIDE_COUNT,
  pickTemplate12Scenes,
} from '@/app/lib/image-template-12-couples';
import { stripImageMetadata } from '@/app/lib/strip-image-metadata';
import {
  IMAGE_TEMPLATE13_BG,
  IMAGE_TEMPLATE13_COVER_SIZE,
  IMAGE_TEMPLATE13_COVER_SRC,
  IMAGE_TEMPLATE13_COVER_TEXTS,
  IMAGE_TEMPLATE13_DEFAULT_SCREEN_TEXT,
  IMAGE_TEMPLATE13_FONT_STACK,
  IMAGE_TEMPLATE13_FONT_WEIGHT,
  IMAGE_TEMPLATE13_LETTER_SPACING,
  IMAGE_TEMPLATE13_PROGRESS_H,
  IMAGE_TEMPLATE13_PROGRESS_INSET,
  IMAGE_TEMPLATE13_PROGRESS_Y,
  IMAGE_TEMPLATE13_QUESTION_SIZE,
  IMAGE_TEMPLATE13_SIDE_PAD,
  IMAGE_TEMPLATE13_SLIDE_COUNT,
  IMAGE_TEMPLATE13_TEXT,
  IMAGE_TEMPLATE13_TEXT_WIDTH,
  drawTemplate13ProgressBar,
  template13ProgressRatio,
  nextTemplate13CoverText,
} from '@/app/lib/image-template-13-cover';
import {
  IMAGE_TEMPLATE14_CARD_INSET_X,
  IMAGE_TEMPLATE14_CARD_INSET_Y,
  IMAGE_TEMPLATE14_CARD_RADIUS_RATIO,
  IMAGE_TEMPLATE14_EDGE_BLUR_RATIO,
  IMAGE_TEMPLATE14_EDGE_SCALE,
  IMAGE_TEMPLATE14_COVER_SIZE_RATIO,
  IMAGE_TEMPLATE14_FONT_STACK,
  IMAGE_TEMPLATE14_FRAME_BG,
  IMAGE_TEMPLATE14_GRAIN_SRC,
  IMAGE_TEMPLATE14_LINE_HEIGHT,
  IMAGE_TEMPLATE14_OPTION_GAP,
  IMAGE_TEMPLATE14_OPTION_LINE_HEIGHT,
  IMAGE_TEMPLATE14_OPTION_SIZE_RATIO,
  IMAGE_TEMPLATE14_OPTION_TOP_RATIO,
  IMAGE_TEMPLATE14_MARK,
  IMAGE_TEMPLATE14_MARK_SIZE_RATIO,
  IMAGE_TEMPLATE14_MARK_Y_RATIO,
  IMAGE_TEMPLATE14_CTA_TEXT_CENTER_RATIO,
  IMAGE_TEMPLATE14_CTA_TEXT_MAX_HEIGHT_RATIO,
  template14QuestionSizeRatio,
  nextTemplate14Color,
  paintTemplate14Slide,
  template14TextForBackground,
} from '@/app/lib/image-template-14-cards';
import { NotesQuestionsPreview } from '@/app/components/NotesQuestionsPreview';
import {
  IMAGE_TEMPLATE16_BG,
  IMAGE_TEMPLATE16_ICON_SRC,
  IMAGE_TEMPLATE16_QUESTION_COUNT,
  IMAGE_TEMPLATE16_SLIDE_COUNT,
  isImageTemplate16Id,
  paintTemplate16Slide,
} from '@/app/lib/image-template-16-notes';
import {
  CHARACTER_IMAGE_QUALITIES,
  type CharacterImageQuality,
} from '@/app/lib/character-generation';
import {
  buildTemplate6TabImageSources,
  IMAGE_TEMPLATE6_BEAR_SRC,
  IMAGE_TEMPLATE6_FRAME_BG,
  IMAGE_TEMPLATE6_HIGHLIGHT_COLOR,
  IMAGE_TEMPLATE6_TEXT_COLOR,
  template6BearImageForTab,
  template6TabSourcesNeedRepair,
} from '@/app/lib/image-template-6-kawaii';
import {
  fetchPinterestCoverImage,
  fetchPinterestSearchImages,
  IMAGE_TEMPLATE7_PINTEREST_QUERY,
  IMAGE_TEMPLATE7_PINTEREST_QUESTION_QUERIES,
  IMAGE_TEMPLATE7_QUESTION_COUNT,
  IMAGE_TEMPLATE7_TAB_COUNT,
  IMAGE_TEMPLATE8_PINTEREST_QUERIES,
  IMAGE_TEMPLATE9_PINTEREST_QUERIES,
  IMAGE_TEMPLATE10_PINTEREST_QUERY,
  IMAGE_TEMPLATE11_PINTEREST_QUERY,
  IMAGE_TEMPLATE11_PINTEREST_QUESTION_QUERIES,
  imageTemplate7SourcesReady,
  pickMixedPinterestQuestionUrls,
  pickDistinctPinterestImageUrls,
  pickRandomPinterestQuery,
  PINTEREST_COVER_CANDIDATE_POOL,
  rememberPinterestCoverUrl,
} from '@/app/lib/pinterest';
import { drawImageTemplate3ImessageSlide } from '@/app/lib/image-template-3-imessage';
import {
  DEFAULT_STUDIO_APP_ID,
  getImageTemplatesForApp,
  getVideoTemplatesForApp,
  resolveStudioAppId,
  type StudioAppId,
} from '@/app/lib/apps';
import { getCharacterById, getCharactersForApp } from '@/app/lib/characters';
import {
  FAB_HEART_MESSAGES,
  FAB_PAPER_COLORS,
  fillFabHeartPaperPrompt,
} from '@/app/lib/fab-prompts';
import {
  splitTitleAroundHighlight,
  squiggleColorForBackground,
  drawTitleHighlight,
  TITLE_HIGHLIGHT_TEXT_COLOR,
  TITLE_HIGHLIGHT_TILT_RAD,
} from '@/app/lib/highlight-word';
import {
  FAB_AFFIRMATION_AMBIENT_SOUNDS,
  FAB_AFFIRMATION_CLIP_COUNT,
  FAB_AFFIRMATION_DEFAULT_AMBIENT,
  FAB_AFFIRMATION_DEFAULT_TTS_PROVIDER,
  FAB_AFFIRMATION_DEFAULT_VIDEO_STYLE,
  FAB_AFFIRMATION_TEXT_COUNT,
  FAB_AFFIRMATION_TTS_PROVIDERS,
  FAB_AFFIRMATION_VIDEO_STYLES,
  FAB_NOTES_MAX_DURATION_SEC,
  FAB_NOTES_PEXELS_QUERIES,
  resolveFabAffirmationAmbientSrc,
  resolveFabAffirmationPexelsQuery,
  type FabAmbientSoundId,
  type FabMontageVideoStyleId,
  type FabTtsProviderId,
} from '@/app/lib/fab-video';
import {
  buildFabAffirmationSegments,
  revokeFabAffirmationSegments,
  type FabAffirmationAudioSegment,
} from '@/app/lib/fab-tts';
import { exportFabNotesVideo } from '@/app/lib/export-fab-notes-video';
import { exportFabAffirmationMontage } from '@/app/lib/export-fab-affirmation-montage';
import { Sidebar } from '@/app/components/Sidebar';
import { CharacterStudio } from '@/app/components/CharacterStudio';
import { CopycatPanel } from '@/app/components/CopycatPanel';
import { splitCopycatQuestionAndOptions } from '@/app/lib/copycat/flamingo-cards';
import { LogoGeneratorPanel } from '@/app/components/LogoGeneratorPanel';
import { StripMetadataPanel } from '@/app/components/StripMetadataPanel';
import { FabNotesOverlay } from '@/app/components/FabNotesOverlay';
import { FabMontagePreview } from '@/app/components/FabMontagePreview';
import { NightyParticleOverlay } from '@/app/components/NightyParticleOverlay';
import { NightyParticleEditor } from '@/app/components/NightyParticleEditor';
import {
  drawNightyParticleCaptionOverlay,
  type NightyParticleCaptionContent,
} from '@/app/lib/nighty-particle-caption';
import { InputsCard } from '@/app/components/InputsCard';
import { PreviewPanel } from '@/app/components/PreviewPanel';
import { DownloadModal } from '@/app/components/DownloadModal';
import { VideoDownloadModal } from '@/app/components/VideoDownloadModal';
import { Toast } from '@/app/components/Toast';
import { sampleCouplesNatureHighlightBackground } from '@/app/lib/couples-nature-color';
import { exportCouplesNatureVideo, warmCouplesNatureExport, warmCouplesNatureVideoBlob } from '@/app/lib/couples-nature/export';
import { fetchRandomCouplesNatureVideo } from '@/app/lib/couples-nature/fetch-video';
import {
  paintVideoTemplate4Overlay,
  pickVideoTemplate4Content,
  VIDEO_TEMPLATE4_COMPETITORS,
  VIDEO_TEMPLATE4_PEXELS_QUERY,
  type VideoTemplate4CompetitorFilter,
} from '@/app/lib/video-template-4-ocean';
import {
  paintVideoTemplate6Overlay,
  VIDEO_TEMPLATE6_PEXELS_QUERIES,
  VIDEO_TEMPLATE6_SEE_DESCRIPTION,
} from '@/app/lib/video-template-6-cinematic';
import {
  pexelsVideoProxySrc,
  PEXELS_PREFER_HEIGHT,
} from '@/app/lib/pexels-video-client';
import { transcodeWebmToMp4 } from '@/app/lib/webm-to-mp4';
import { INSTAGRAM_CAROUSEL_MAX } from '@/app/lib/instagram';
import {
  FreshBakedDonutDetail,
  FreshBakedDonutGallery,
} from '@/app/components/FreshBakedDonutPreview';
import {
  FRESH_BAKED_DONUT_POSTS,
  freshBakedDonutCaptionSource,
  freshBakedDonutSelectedPost,
} from '@/app/lib/video-template-fresh-baked-donut';
import { exportFreshBakedDonutClip } from '@/app/lib/video-template-fresh-baked-donut/export';

type ContentTab =
  | 'image'
  | 'video'
  | 'character'
  | 'copycat'
  | 'logo'
  | 'prompt'
  | 'automate'
  | 'strip-metadata';

type AppUrlState = {
  contentTab: ContentTab;
  selectedAppId: StudioAppId;
  selectedImageTemplateId: number | null;
  selectedVideoTemplateId: number | null;
  selectedCharacterId: string | null;
  selectedImageBrowserTab: number;
};

const CONTENT_TABS: ContentTab[] = [
  'image',
  'video',
  'character',
  'copycat',
  'logo',
  'prompt',
  'automate',
  'strip-metadata',
];

const COPYCAT_COMPETITORS = [
  { id: 'flamingo-cards', label: 'Flamingo cards' },
  { id: 'flamingo-convo', label: 'Flamingo convo' },
  { id: '21-questions', label: '21 Questions' },
  { id: 'its-all-about-loving-you', label: "It's all about loving you" },
  { id: 'try-deepen', label: 'Try deepen' },
  { id: 'couple-cards', label: 'Couple Cards' },
  { id: 'hh-talk', label: 'HH Talk' },
  { id: 'golden-thoughts-daily', label: 'Golden Thoughts Daily' },
  { id: 'lvrsbae', label: '.lvrsbae' },
  { id: 'spill-cards-app', label: 'Spill Cards App' },
] as const;

type CopycatCompetitorId = (typeof COPYCAT_COMPETITORS)[number]['id'];

function pickRandomCopycatCompetitor(exclude?: CopycatCompetitorId): CopycatCompetitorId {
  const ids = COPYCAT_COMPETITORS.map((competitor) => competitor.id).filter(
    (id) => id !== exclude
  );
  const pool = ids.length > 0 ? ids : COPYCAT_COMPETITORS.map((competitor) => competitor.id);
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return pool[buf[0]! % pool.length]!;
}

/** Spill It image templates available inside Copycat. */
const COPYCAT_TEMPLATE_IDS = [1, 2, 6, 13, 14, 15, 16, 17, 18] as const;
type CopycatTemplateId = (typeof COPYCAT_TEMPLATE_IDS)[number];

function isKawaiiStyleTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 1 || templateId === 6;
}

/** Template 1 uses dog art. */
function isDogsKawaiiTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 1;
}

/** Templates 1 and 6 end on Q5. Neither has a full-bleed CTA slide. */
function isKawaiiNoCtaTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 1 || templateId === 6;
}

function isPinterestCoverImageTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 7 || templateId === 10 || templateId === 11;
}

function isImageTemplate12Id(templateId: number | null | undefined): boolean {
  return templateId === 12;
}

function isImageTemplate13Id(templateId: number | null | undefined): boolean {
  return templateId === 13;
}

function isImageTemplate14Id(templateId: number | null | undefined): boolean {
  return templateId === 14;
}

function isGeneratedCoupleSlideTemplateId(templateId: number | null | undefined): boolean {
  return isImageTemplate12Id(templateId);
}

function isCouplesCuteMomentsImageTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 10;
}

function isCelebrityCouplesImageTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 11;
}

function isCouplesSelfieImageTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 8;
}

function isTopDownSelfieImageTemplateId(templateId: number | null | undefined): boolean {
  return templateId === 9;
}

function isPinterestCoverOnlyImageTemplateId(templateId: number | null | undefined): boolean {
  return isCouplesSelfieImageTemplateId(templateId) || isTopDownSelfieImageTemplateId(templateId);
}


function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readAppUrlState(): AppUrlState {
  if (typeof window === 'undefined') {
    return {
      contentTab: 'copycat',
      selectedAppId: DEFAULT_STUDIO_APP_ID,
      selectedImageTemplateId: null,
      selectedVideoTemplateId: null,
      selectedCharacterId: null,
      selectedImageBrowserTab: 0,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const tabRaw = params.get('tab');
  const contentTab = CONTENT_TABS.includes(tabRaw as ContentTab) ? (tabRaw as ContentTab) : 'copycat';
  const appRaw = params.get('app');
  const selectedAppId = resolveStudioAppId(appRaw);

  let selectedImageTemplateId: number | null = null;
  let selectedVideoTemplateId: number | null = null;
  let selectedCharacterId: string | null = null;
  let selectedImageBrowserTab = 0;

  if (contentTab === 'image') {
    const imageId = parsePositiveInt(params.get('imageTemplate'));
    selectedImageTemplateId =
      imageId !== null && getImageTemplatesForApp(selectedAppId).some((c) => c.id === imageId)
        ? imageId
        : null;
    const frameRaw = params.get('frame');
    if (frameRaw !== null) {
      const frame = Number.parseInt(frameRaw, 10);
      if (Number.isFinite(frame)) selectedImageBrowserTab = Math.max(0, Math.min(6, frame));
    }
  }

  if (contentTab === 'video') {
    const videoId = parsePositiveInt(params.get('videoTemplate'));
    selectedVideoTemplateId =
      videoId !== null && getVideoTemplatesForApp(selectedAppId).some((c) => c.id === videoId)
        ? videoId
        : null;
  }

  if (contentTab === 'character') {
    const characterId = params.get('character')?.trim() || null;
    selectedCharacterId =
      characterId && getCharactersForApp(selectedAppId).some((c) => c.id === characterId)
        ? characterId
        : null;
  }

  return {
    contentTab,
    selectedAppId,
    selectedImageTemplateId,
    selectedVideoTemplateId,
    selectedCharacterId,
    selectedImageBrowserTab,
  };
}

function syncAppUrlState(state: AppUrlState) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  params.set('tab', state.contentTab);
  params.set('app', state.selectedAppId);
  params.delete('imageTemplate');
  params.delete('frame');
  params.delete('videoTemplate');
  params.delete('character');

  if (state.contentTab === 'image' && state.selectedImageTemplateId !== null) {
    params.set('imageTemplate', String(state.selectedImageTemplateId));
    params.set('frame', String(state.selectedImageBrowserTab));
  }

  if (state.contentTab === 'video' && state.selectedVideoTemplateId !== null) {
    params.set('videoTemplate', String(state.selectedVideoTemplateId));
  }

  if (state.contentTab === 'character' && state.selectedCharacterId) {
    params.set('character', state.selectedCharacterId);
  }

  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, '', nextUrl);
}

function shuffleCopy<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TIKTOK_SANS_STACK = '"TikTok Sans", system-ui, -apple-system, sans-serif';
/** Kawaii (Template 1) download — one carousel set per zip. */
const KAWAII_DOWNLOAD_SETS = 1;

const TEMPLATE2_COVER_FONT_WEIGHT = 700;

/** Scales with frame width; shared by preview export and canvas burn-in. */
function videoCaptionFontSizePx(frameW: number): number {
  return Math.max(22, Math.min(84, Math.floor(frameW * 0.058)));
}

function template2CoverFontSizePx(frameW: number): number {
  return Math.max(16, Math.min(44, Math.floor(frameW * 0.036)));
}

/** Video template 2 overlay sizes — scale with frame height so export matches preview proportions. */
function videoTemplate2TitleFontSizePx(frameH: number): number {
  // Purely proportional — large absolute floors (e.g. 40) blew up on ~1080p Pexels clips.
  return Math.max(12, Math.floor(frameH * 0.024));
}

function videoTemplate2QuestionFontSizePx(frameH: number): number {
  return Math.max(10, Math.floor(frameH * 0.014));
}

function videoTemplate2FooterFontSizePx(frameH: number): number {
  return Math.max(9, Math.floor(frameH * 0.0125));
}

function videoTemplate2SectionGapPx(frameH: number): number {
  return Math.max(8, Math.floor(frameH * 0.04));
}

/** Gap between title and question list (smaller than list-to-footer gap). */
function videoTemplate2TitleListGapPx(frameH: number): number {
  return Math.max(6, Math.floor(frameH * 0.032));
}

const VIDEO_TEMPLATE2_TITLE_TOP_RATIO = 0.16;
/** Max length for template 2 preview and export (seconds). */
const VIDEO_TEMPLATE2_MAX_DURATION_SEC = 9;
/** Text block width as fraction of frame width — lower = more side padding. */
const VIDEO_TEMPLATE2_CONTENT_MAX_WIDTH_RATIO = 0.72;

const VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES = [
  'Search "Spill It - Couples Questions"',
  'for more questions',
] as const;
const VIDEO_TEMPLATE2_DIM_OVERLAY = 'rgba(0, 0, 0, 0.38)';

function drawVideoTemplate2DimOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = VIDEO_TEMPLATE2_DIM_OVERLAY;
  ctx.fillRect(0, 0, w, h);
}

/** Cinematic cool grade + light mist + soft vignette for Nighty Rain. */
function drawNightyRainMistOverlay(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = NIGHTY_RAIN_MIST_WASH;
  ctx.fillRect(0, 0, w, h);

  const teal = ctx.createLinearGradient(0, 0, w, h);
  teal.addColorStop(0, 'rgba(40, 90, 120, 0.1)');
  teal.addColorStop(0.45, 'rgba(20, 40, 70, 0)');
  teal.addColorStop(1, 'rgba(60, 40, 90, 0.05)');
  ctx.fillStyle = teal;
  ctx.fillRect(0, 0, w, h);

  const top = ctx.createLinearGradient(0, 0, 0, h * 0.5);
  top.addColorStop(0, 'rgba(12, 22, 42, 0.28)');
  top.addColorStop(0.4, 'rgba(30, 50, 80, 0.1)');
  top.addColorStop(1, 'rgba(40, 70, 100, 0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h);

  const bottom = ctx.createLinearGradient(0, h * 0.35, 0, h);
  bottom.addColorStop(0, 'rgba(50, 80, 110, 0)');
  bottom.addColorStop(0.4, 'rgba(25, 45, 75, 0.12)');
  bottom.addColorStop(1, 'rgba(8, 14, 28, 0.3)');
  ctx.fillStyle = bottom;
  ctx.fillRect(0, 0, w, h);

  const bloom = ctx.createRadialGradient(
    w * 0.5,
    h * 0.46,
    0,
    w * 0.5,
    h * 0.46,
    Math.max(w, h) * 0.48
  );
  bloom.addColorStop(0, 'rgba(120, 150, 190, 0.08)');
  bloom.addColorStop(0.4, 'rgba(90, 120, 160, 0.03)');
  bloom.addColorStop(1, 'rgba(60, 90, 130, 0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w * 0.5,
    h * 0.42,
    Math.min(w, h) * 0.1,
    w * 0.5,
    h * 0.42,
    Math.max(w, h) * 0.82
  );
  vignette.addColorStop(0, 'rgba(10, 16, 32, 0)');
  vignette.addColorStop(0.45, 'rgba(10, 18, 36, 0.12)');
  vignette.addColorStop(1, 'rgba(4, 8, 18, 0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

/** Centered main caption + small brand line pinned near the bottom. */
function drawNightyRainCaptionStack(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  subline: string
) {
  const titleText = title.trim();
  const subText = subline.trim();
  if (!titleText && !subText) return;

  const titleSize = Math.max(16, Math.min(40, Math.floor(w * NIGHTY_RAIN_CAPTION_SIZE_RATIO)));
  const subSize = Math.max(12, Math.min(26, Math.floor(w * NIGHTY_RAIN_SUBLINE_SIZE_RATIO)));
  const fontStack = NIGHTY_PARTICLE_CANVAS_FONT_STACK;
  const weight = NIGHTY_RAIN_CAPTION_FONT_WEIGHT;
  const color = NIGHTY_RAIN_CAPTION_COLOR;
  const titleLh = titleSize * 1.25;
  const subLh = subSize * 1.3;
  const cx = w / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;

  if (titleText) {
    const titleLines = layoutTikTokCaption(
      ctx,
      w,
      titleText,
      weight,
      titleSize,
      NIGHTY_RAIN_CAPTION_MAX_WIDTH_RATIO,
      fontStack
    ).lines;
    const titleH = titleLines.length * titleLh;
    let y = h / 2 - titleH / 2 + titleLh / 2;
    ctx.font = `${weight} ${titleSize}px ${fontStack}`;
    for (const ln of titleLines) {
      ctx.fillText(ln, cx, y);
      y += titleLh;
    }
  }

  if (subText) {
    const subLines = layoutTikTokCaption(
      ctx,
      w,
      subText,
      weight,
      subSize,
      NIGHTY_RAIN_CAPTION_MAX_WIDTH_RATIO,
      fontStack
    ).lines;
    let y = h * NIGHTY_RAIN_SUBLINE_Y_RATIO;
    // Center multi-line footer around the anchor
    if (subLines.length > 1) {
      y -= ((subLines.length - 1) * subLh) / 2;
    }
    ctx.font = `${weight} ${subSize}px ${fontStack}`;
    for (const ln of subLines) {
      ctx.fillText(ln, cx, y);
      y += subLh;
    }
  }
}

function pickRandomFunnyQuestions(count: number): string[] {
  return shuffleCopy([...FUNNY_QUESTIONS]).slice(0, count);
}

function pickRandomMixedQuestions(count: number): string[] {
  return shuffleCopy(allQuestionPools()).slice(0, count);
}

function pickQuestionsForType(type: AutomateQuestionType, count: number): string[] {
  if (type === 'random') return pickRandomMixedQuestions(count);
  return shuffleCopy([...questionPoolForType(type)]).slice(0, count);
}

function pickTitleForType(type: AutomateQuestionType, exclude?: string): string {
  if (type === 'random') return pickRandomMixedTitle(exclude);
  const pool = [...templateTitlePoolForType(type)];
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0]!;
  let next = pool[Math.floor(Math.random() * pool.length)]!;
  if (exclude && next === exclude) {
    next = pool.find((t) => t !== exclude) ?? next;
  }
  return next;
}

type TikTokCaptionLayout = {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  blockW: number;
  blockH: number;
};

type NormalizedTextAnchor = { x: number; y: number };

type VideoCaptionPosition = 'center' | 'top';
type VideoCaptionStyle = 'stroke' | 'natural';

function layoutTikTokCaption(
  ctx: CanvasRenderingContext2D,
  w: number,
  text: string,
  fontWeight = 900,
  fontSize = videoCaptionFontSizePx(w),
  maxWidthRatio = 0.7,
  fontStack = TIKTOK_SANS_STACK
): TikTokCaptionLayout {
  const trimmed = text.trim();
  const maxWidth = w * maxWidthRatio;
  ctx.font = `${fontWeight} ${fontSize}px ${fontStack}`;

  const words = trimmed ? trimmed.split(/\s+/) : [];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length === 0) lines.push(trimmed || '');

  const lineHeight = fontSize * 1.18;
  const blockW = Math.max(...lines.map((ln) => ctx.measureText(ln).width), 0);
  const blockH = lines.length * lineHeight;
  return { lines, fontSize, lineHeight, blockW, blockH };
}

type VideoCaptionDrawOptions = {
  anchor?: NormalizedTextAnchor;
  position?: VideoCaptionPosition;
  fontSizePx?: number;
  maxWidthRatio?: number;
  fontWeight?: number;
  shadow?: boolean;
  fontStack?: string;
  fillColor?: string;
};

/** TikTok-style caption for canvas export (white fill, black stroke). */
function drawTikTokCaptionOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  options?: { anchor?: NormalizedTextAnchor; position?: VideoCaptionPosition; maxWidthRatio?: number }
) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const layout = layoutTikTokCaption(
    ctx,
    w,
    trimmed,
    900,
    videoCaptionFontSizePx(w),
    options?.maxWidthRatio ?? 0.7
  );
  const { lines, fontSize, lineHeight, blockH } = layout;
  const cx = (options?.anchor?.x ?? 0.5) * w;
  const position = options?.position ?? 'center';
  ctx.font = `900 ${fontSize}px ${TIKTOK_SANS_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let y =
    position === 'top'
      ? h * 0.08 + lineHeight / 2
      : (options?.anchor?.y ?? 0.5) * h - blockH / 2 + lineHeight / 2;
  const strokeW = Math.max(2.5, fontSize * 0.11);
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  for (const ln of lines) {
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = Math.max(2, fontSize * 0.08);
    ctx.shadowOffsetY = Math.max(1, fontSize * 0.03);
    ctx.strokeText(ln, cx, y);
    ctx.fillText(ln, cx, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    y += lineHeight;
  }
}

/** Plain white caption with soft shadow only (no stroke) — native TikTok overlay look. */
function drawNaturalWhiteCaptionOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  options?: VideoCaptionDrawOptions
) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const fontSize = options?.fontSizePx ?? template2CoverFontSizePx(w);
  const fontWeight = options?.fontWeight ?? TEMPLATE2_COVER_FONT_WEIGHT;
  const fontStack = options?.fontStack ?? TIKTOK_SANS_STACK;
  const useShadow = options?.shadow !== false;
  const fillColor = options?.fillColor ?? '#ffffff';
  const layout = layoutTikTokCaption(
    ctx,
    w,
    trimmed,
    fontWeight,
    fontSize,
    options?.maxWidthRatio ?? 0.7,
    fontStack
  );
  const { lines, lineHeight, blockH } = layout;
  const cx = (options?.anchor?.x ?? 0.5) * w;
  const position = options?.position ?? 'center';
  ctx.font = `${fontWeight} ${fontSize}px ${fontStack}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let y =
    position === 'top'
      ? h * 0.08 + lineHeight / 2
      : (options?.anchor?.y ?? 0.5) * h - blockH / 2 + lineHeight / 2;
  for (const ln of lines) {
    ctx.fillStyle = fillColor;
    if (useShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
      ctx.shadowBlur = Math.max(6, fontSize * 0.14);
      ctx.shadowOffsetY = Math.max(1, fontSize * 0.04);
    }
    ctx.fillText(ln, cx, y);
    if (useShadow) {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    y += lineHeight;
  }
}

/** Draws wrapped white TikTok-style text from a top Y; returns Y after the block. */
function wrapCanvasTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function measureWrappedBlockHeight(lineCount: number, fontSize: number, lineHeightMult: number): number {
  if (lineCount <= 0) return 0;
  return lineCount * fontSize * lineHeightMult;
}

function drawNaturalWhiteWrappedBlock(
  ctx: CanvasRenderingContext2D,
  w: number,
  startY: number,
  text: string,
  options: { fontSizePx: number; maxWidthRatio?: number; lineHeightMult?: number }
): number {
  const trimmed = text.trim();
  if (!trimmed) return startY;

  const fontSize = options.fontSizePx;
  const maxWidth = w * (options.maxWidthRatio ?? 0.84);
  const lineHeight = fontSize * (options.lineHeightMult ?? 1.16);
  ctx.font = `${TEMPLATE2_COVER_FONT_WEIGHT} ${fontSize}px ${TIKTOK_SANS_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapCanvasTextLines(ctx, trimmed, maxWidth);
  if (lines.length === 0) return startY;

  const cx = w / 2;
  let y = startY + lineHeight / 2;
  for (const ln of lines) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
    ctx.shadowBlur = Math.max(6, fontSize * 0.14);
    ctx.shadowOffsetY = Math.max(1, fontSize * 0.04);
    ctx.fillText(ln, cx, y);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    y += lineHeight;
  }
  return y - lineHeight / 2 + lineHeight;
}

function drawNaturalWhiteWrappedBlockWithHighlight(
  ctx: CanvasRenderingContext2D,
  w: number,
  startY: number,
  text: string,
  options: {
    fontSizePx: number;
    maxWidthRatio?: number;
    lineHeightMult?: number;
    highlightWord?: string | null;
    highlightColor?: string;
    /** Nudge marker band vertically (export-only tweaks). Negative = up. */
    highlightYOffsetPx?: number;
  }
): number {
  const trimmed = text.trim();
  if (!trimmed) return startY;

  const fontSize = options.fontSizePx;
  const maxWidth = w * (options.maxWidthRatio ?? 0.84);
  const lineHeight = fontSize * (options.lineHeightMult ?? 1.16);
  ctx.font = `${TEMPLATE2_COVER_FONT_WEIGHT} ${fontSize}px ${TIKTOK_SANS_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapCanvasTextLines(ctx, trimmed, maxWidth);
  if (lines.length === 0) return startY;

  const highlight = options.highlightWord?.trim().toLowerCase() ?? '';
  const highlightColor =
    options.highlightColor ?? squiggleColorForBackground(VIDEO_TEMPLATE2_HIGHLIGHT_BACKGROUND);

  const cx = w / 2;
  let y = startY + lineHeight / 2;
  for (const ln of lines) {
    const idx = highlight ? ln.toLowerCase().indexOf(highlight) : -1;
    if (idx >= 0) {
      const before = ln.slice(0, idx);
      const word = ln.slice(idx, idx + highlight.length);
      const lineWidth = ctx.measureText(ln).width;
      const lineStartX = cx - lineWidth / 2;
      const beforeW = ctx.measureText(before).width;
      const wordX = lineStartX + beforeW;
      const wordW = ctx.measureText(before + word).width - beforeW;

      drawTitleHighlight(
        ctx,
        wordX,
        y + (options.highlightYOffsetPx ?? 0),
        wordW,
        fontSize,
        highlightColor
      );

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
      ctx.shadowBlur = Math.max(6, fontSize * 0.14);
      ctx.shadowOffsetY = Math.max(1, fontSize * 0.04);
      ctx.fillText(ln, cx, y);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.textAlign = 'left';
      ctx.fillStyle = TITLE_HIGHLIGHT_TEXT_COLOR;
      ctx.fillText(word, wordX, y);
      ctx.textAlign = 'center';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.42)';
      ctx.shadowBlur = Math.max(6, fontSize * 0.14);
      ctx.shadowOffsetY = Math.max(1, fontSize * 0.04);
      ctx.fillText(ln, cx, y);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    y += lineHeight;
  }
  return y - lineHeight / 2 + lineHeight;
}

function drawKawaiiCoverTitleWithHighlight(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  yStart: number,
  text: string,
  options: {
    fontSizePx: number;
    maxWidthRatio?: number;
    lineHeightPx: number;
    textColor: string;
    fontFamily: string;
    fontWeight?: string;
    highlightWord?: string | null;
    highlightColor?: string;
    highlightTextColor?: string;
    subtitle?: string | null;
  }
) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const fontSize = options.fontSizePx;
  const maxWidth = frameWidth * (options.maxWidthRatio ?? 0.66);
  const lineHeight = options.lineHeightPx;
  const fontWeight = options.fontWeight ?? 'bold';
  ctx.font = `${fontWeight} ${fontSize}px ${options.fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  const lines = wrapCanvasTextLines(ctx, trimmed, maxWidth);
  if (lines.length === 0) return;

  const highlight = options.highlightWord?.trim().toLowerCase() ?? '';
  const highlightColor =
    options.highlightColor ?? squiggleColorForBackground('#FEFEFE');
  const highlightTextColor = options.highlightTextColor ?? TITLE_HIGHLIGHT_TEXT_COLOR;

  const cx = frameWidth / 2;
  let y = yStart + fontSize / 2;
  for (const ln of lines) {
    const idx = highlight ? ln.toLowerCase().indexOf(highlight) : -1;
    if (idx >= 0) {
      const before = ln.slice(0, idx);
      const word = ln.slice(idx, idx + highlight.length);
      const lineWidth = ctx.measureText(ln).width;
      const lineStartX = cx - lineWidth / 2;
      const beforeW = ctx.measureText(before).width;
      const wordX = lineStartX + beforeW;
      const wordW = ctx.measureText(before + word).width - beforeW;

      drawTitleHighlight(ctx, wordX, y, wordW, fontSize, highlightColor);

      ctx.fillStyle = options.textColor;
      ctx.fillText(ln, cx, y);

      ctx.textAlign = 'left';
      ctx.fillStyle = highlightTextColor;
      ctx.fillText(word, wordX, y);
      ctx.textAlign = 'center';
    } else {
      ctx.fillStyle = options.textColor;
      ctx.fillText(ln, cx, y);
    }
    y += lineHeight;
  }

  const subtitleText = formatImageTemplate2CoverSubtitle(options.subtitle ?? '');
  if (subtitleText) {
    const subtitleSize = Math.round(fontSize * 0.62);
    const gap = fontSize * 0.4;
    const subtitleY = y - lineHeight / 2 + gap + subtitleSize / 2;
    ctx.font = `${fontWeight} ${subtitleSize}px ${options.fontFamily}`;
    ctx.fillStyle = options.textColor;
    ctx.globalAlpha = 0.88;
    ctx.fillText(subtitleText, cx, subtitleY);
    ctx.globalAlpha = 1;
  }
}

function drawVideoTemplate2OverlayOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  questions: string[],
  options?: {
    highlightWord?: string | null;
    highlightBackground?: string;
    highlightYOffsetPx?: number;
  }
) {
  const titleFontSize = videoTemplate2TitleFontSizePx(h);
  const questionFontSize = videoTemplate2QuestionFontSizePx(h);
  const footerFontSize = videoTemplate2FooterFontSizePx(h);
  const questionLineHeightMult = 1.12;
  const footerLineHeightMult = 1.12;
  const questionGap = questionFontSize * 0.28;
  const titleListGap = videoTemplate2TitleListGapPx(h);
  const listFooterGap = videoTemplate2SectionGapPx(h);
  const maxWidthRatio = VIDEO_TEMPLATE2_CONTENT_MAX_WIDTH_RATIO;
  const maxWidth = w * maxWidthRatio;

  const questionEntries = questions
    .map((q, i) => {
      const text = `${i + 1}. ${q.trim()}`;
      ctx.font = `${TEMPLATE2_COVER_FONT_WEIGHT} ${questionFontSize}px ${TIKTOK_SANS_STACK}`;
      return { text, lines: wrapCanvasTextLines(ctx, text, maxWidth) };
    })
    .filter((entry) => entry.lines.length > 0);

  const hasTitle = title.trim().length > 0;
  const hasQuestions = questionEntries.length > 0;
  const hasFooter = VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES.length > 0;

  let y = h * VIDEO_TEMPLATE2_TITLE_TOP_RATIO;

  const highlightBackground =
    options?.highlightBackground ?? VIDEO_TEMPLATE2_HIGHLIGHT_BACKGROUND;

  if (hasTitle) {
    y = drawNaturalWhiteWrappedBlockWithHighlight(ctx, w, y, title, {
      fontSizePx: titleFontSize,
      maxWidthRatio,
      highlightWord: options?.highlightWord,
      highlightColor: squiggleColorForBackground(highlightBackground),
      highlightYOffsetPx: options?.highlightYOffsetPx,
    });
    if (hasQuestions || hasFooter) y += hasQuestions ? titleListGap : listFooterGap;
  }

  for (let i = 0; i < questionEntries.length; i++) {
    y = drawNaturalWhiteWrappedBlock(ctx, w, y, questionEntries[i]!.text, {
      fontSizePx: questionFontSize,
      lineHeightMult: questionLineHeightMult,
      maxWidthRatio,
    });
    if (i < questionEntries.length - 1) y += questionGap;
  }

  if (hasQuestions && hasFooter) y += listFooterGap;

  if (hasFooter) {
    for (const footerLine of VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES) {
      y = drawNaturalWhiteWrappedBlock(ctx, w, y, footerLine, {
        fontSizePx: footerFontSize,
        lineHeightMult: footerLineHeightMult,
        maxWidthRatio,
      });
    }
  }
}

function paintCouplesNatureExportOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: {
    caption: string;
    questions: string[];
    highlightWord: string | null;
    highlightBackground: string;
  }
) {
  drawVideoTemplate2DimOverlay(ctx, w, h);
  drawVideoTemplate2OverlayOnCanvas(ctx, w, h, options.caption, options.questions, {
    highlightWord: options.highlightWord,
    highlightBackground: options.highlightBackground,
    highlightYOffsetPx: -Math.round(videoTemplate2TitleFontSizePx(h) * 0.07),
  });
}

async function buildCouplesNatureVideoBlob(options: {
  videoSrc: string;
  title: string;
  questions: string[];
  posterForHighlight?: string | null;
  highlightWord?: string | null;
  highlightBackground?: string | null;
  onProgress?: (phase: 'frames' | 'encode', current: number, total: number) => void;
}): Promise<Blob> {
  const [highlightWord, highlightBackground] = await Promise.all([
    options.highlightWord !== undefined
      ? Promise.resolve(options.highlightWord)
      : fetchTitleHighlightWord(options.title),
    options.highlightBackground !== undefined && options.highlightBackground !== null
      ? Promise.resolve(options.highlightBackground)
      : sampleCouplesNatureHighlightBackground(options.posterForHighlight),
  ]);
  return exportCouplesNatureVideo({
    videoSrc: options.videoSrc,
    maxDurationSec: VIDEO_TEMPLATE2_MAX_DURATION_SEC,
    paintOverlay: (ctx, w, h) =>
      paintCouplesNatureExportOverlay(ctx, w, h, {
        caption: options.title,
        questions: options.questions,
        highlightWord,
        highlightBackground,
      }),
    onProgress: options.onProgress,
  });
}

/** Ask ChatGPT which title word to marker-highlight (shared by image + video Template 2). */
async function fetchTitleHighlightWord(
  title: string,
  signal?: AbortSignal
): Promise<string | null> {
  const trimmed = title.trim();
  if (!trimmed) return null;
  try {
    const res = await fetch('/api/openai/highlight-word', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: trimmed }),
      signal,
    });
    const data = (await res.json()) as { word?: string; error?: string };
    if (!res.ok || typeof data.word !== 'string' || !data.word.trim()) return null;
    return data.word.trim();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return null;
    return null;
  }
}

function pickMediaRecorderMime(): string {
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

/**
 * Re-encodes video with caption burned in (real-time playback).
 * Chrome records WebM; Safari may record MP4 directly. WebM is transcoded to MP4 on download.
 */
function nightyParticleCanvasFontStack(): string {
  return NIGHTY_PARTICLE_CANVAS_FONT_STACK;
}

function nightyParticleCanvasFontFamilyName(): string {
  const stack = nightyParticleCanvasFontStack();
  const primary = stack.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
  return primary || 'TikTok Sans';
}

async function exportVideoWithCaptionOverlay(
  videoSrc: string,
  caption: string,
  options: {
    position?: VideoCaptionPosition;
    style?: VideoCaptionStyle;
    maxDurationSec?: number;
    maxWidthRatio?: number;
    /** Nighty Particle timed dual-line fade animation. */
    particleAnimated?: boolean;
    particleContent?: NightyParticleCaptionContent;
    /** Bed audio (e.g. triangle wave) mixed into Particle export. */
    particleAudioSrc?: string;
    /** Nighty Rain — 9:16 cover crop, dark scrim, centered white caption. */
    rainTemplate?: boolean;
    /** Bed audio for Rain export (e.g. light rain). */
    rainAudioSrc?: string;
    /** Second line under the main Rain caption. */
    rainSubline?: string;
  } = {}
): Promise<Blob> {
  const captionPosition = options.position ?? 'center';
  const maxDurationSec = options.maxDurationSec;
  const maxWidthRatio = options.maxWidthRatio;
  const particleAnimated = options.particleAnimated === true;
  const particleContent = options.particleContent;
  const particleAudioSrc = options.particleAudioSrc ?? NIGHTY_PARTICLE_AUDIO_SRC;
  const rainTemplate = options.rainTemplate === true;
  const rainAudioSrc = options.rainAudioSrc;
  const rainSubline = options.rainSubline ?? NIGHTY_RAIN_CAPTION_SUBLINE;
  const bedAudioSrc = particleAnimated
    ? particleAudioSrc
    : rainTemplate
      ? rainAudioSrc
      : undefined;
  if (typeof MediaRecorder === 'undefined') throw new Error('MediaRecorder is not supported in this browser');

  const mime = pickMediaRecorderMime();
  if (!mime) throw new Error('No supported video recording format in this browser');

  // Prefetch fully before recording — proxy streaming mid-encode often ends early
  // (short ~1s files) or stutters when Range buffers stall.
  const response = await fetch(videoSrc);
  if (!response.ok) {
    throw new Error(`Failed to download video (${response.status})`);
  }
  const sourceBlob = await response.blob();
  const objectUrl = URL.createObjectURL(sourceBlob);

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  video.muted = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'auto';
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      video.addEventListener('error', () => reject(new Error('Failed to load video')), {
        once: true,
      });
      if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        done();
        return;
      }
      video.addEventListener('canplaythrough', done, { once: true });
      video.addEventListener(
        'loadeddata',
        () => {
          window.setTimeout(done, 250);
        },
        { once: true }
      );
    });

    const srcW = video.videoWidth;
    const srcH = video.videoHeight;
    if (srcW <= 0 || srcH <= 0) throw new Error('Invalid video dimensions');

    // Always export 9:16 @ 1080x1920 so TikTok never has to upscale a smaller
    // Pexels rendition (center-crops anything that isn't already portrait).
    const w = rainTemplate ? NIGHTY_RAIN_EXPORT_WIDTH : NIGHTY_PARTICLE_EXPORT_WIDTH;
    const h = rainTemplate ? NIGHTY_RAIN_EXPORT_HEIGHT : NIGHTY_PARTICLE_EXPORT_HEIGHT;

    const isParticleCaption = particleAnimated;
    const captionFontSize = isParticleCaption
      ? Math.max(16, Math.min(48, Math.floor(w * NIGHTY_PARTICLE_CAPTION_SIZE_RATIO)))
      : rainTemplate
        ? Math.max(16, Math.min(40, Math.floor(w * NIGHTY_RAIN_CAPTION_SIZE_RATIO)))
        : videoCaptionFontSizePx(w);
    const captionFontWeight = isParticleCaption
      ? NIGHTY_PARTICLE_CAPTION_FONT_WEIGHT
      : rainTemplate
        ? NIGHTY_RAIN_CAPTION_FONT_WEIGHT
        : 900;
    if (typeof document !== 'undefined' && document.fonts?.load) {
      try {
        const fontFamilyName = isParticleCaption || rainTemplate
          ? nightyParticleCanvasFontFamilyName()
          : 'TikTok Sans';
        await document.fonts.load(`${captionFontWeight} ${captionFontSize}px "${fontFamilyName}"`);
        // Also try unquoted family (next/font hashed names).
        if (isParticleCaption || rainTemplate) {
          await document.fonts.load(`${captionFontWeight} ${captionFontSize}px ${fontFamilyName}`);
        }
      } catch {
        /* fall back to system font if load fails */
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas not available');

    // Rain mist + captions are static — bake once so each frame is just video + blit.
    let rainOverlayCanvas: HTMLCanvasElement | null = null;
    if (rainTemplate) {
      rainOverlayCanvas = document.createElement('canvas');
      rainOverlayCanvas.width = w;
      rainOverlayCanvas.height = h;
      const overlayCtx = rainOverlayCanvas.getContext('2d');
      if (!overlayCtx) throw new Error('Overlay canvas not available');
      drawNightyRainMistOverlay(overlayCtx, w, h);
      drawNightyRainCaptionStack(overlayCtx, w, h, caption, rainSubline);
    }

    const EXPORT_FPS = rainTemplate ? NIGHTY_RAIN_EXPORT_FPS : 30;
    const FRAME_MS = 1000 / EXPORT_FPS;

    let coverSx = 0;
    let coverSy = 0;
    let coverSw = 0;
    let coverSh = 0;
    let coverReady = false;
    let particleCaptionTimeSec = 0;

    const updateCoverCrop = () => {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw <= 0 || vh <= 0) return;
      const srcAspect = vw / vh;
      const destAspect = w / h;
      if (srcAspect > destAspect) {
        coverSw = vh * destAspect;
        coverSh = vh;
        coverSx = (vw - coverSw) / 2;
        coverSy = 0;
      } else {
        coverSh = vw / destAspect;
        coverSw = vw;
        coverSx = 0;
        coverSy = (vh - coverSh) / 2;
      }
      coverReady = true;
    };

    const paintFrameToCanvas = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
        if (!coverReady) updateCoverCrop();
        ctx.drawImage(video, coverSx, coverSy, coverSw, coverSh, 0, 0, w, h);
        if (particleAnimated) {
          drawNightyParticleCaptionOverlay(
            ctx,
            w,
            h,
            particleCaptionTimeSec,
            nightyParticleCanvasFontStack(),
            particleContent
          );
        } else if (rainTemplate && rainOverlayCanvas) {
          ctx.drawImage(rainOverlayCanvas, 0, 0);
        } else {
          drawTikTokCaptionOnCanvas(ctx, w, h, caption, {
            position: captionPosition,
            maxWidthRatio,
          });
        }
      }
    };

    const chunks: BlobPart[] = [];

    await new Promise<void>((resolve, reject) => {
      let rafId = 0;
      let recorder: MediaRecorder | null = null;
      let finished = false;
      let captureTrack: MediaStreamTrack | null = null;
      let reportCaptureRate: (() => void) | null = null;

      const stopDrawing = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      };

      const paintFrame = () => {
        paintFrameToCanvas();
        const track = captureTrack as MediaStreamTrack & { requestFrame?: () => void };
        track?.requestFrame?.();
      };

      const finishRecording = () => {
        if (finished) return;
        finished = true;
        stopDrawing();
        video.pause();
        video.loop = false;
        window.setTimeout(() => {
          try {
            if (recorder && recorder.state === 'recording') recorder.stop();
          } catch {
            reject(new Error('Failed to finish recording'));
          }
        }, 400);
      };

      const reachedMaxDuration = () =>
        maxDurationSec !== undefined && video.currentTime >= maxDurationSec - 0.05;

      // Particle / Rain use wall-clock stop + looped bg — don't end early on video.ended.
      if (!particleAnimated && !rainTemplate) {
        video.addEventListener('ended', finishRecording, { once: true });
      }

      const run = async () => {
        try {
          video.pause();
          await new Promise<void>((res, rej) => {
            const onSeeked = () => {
              cleanup();
              res();
            };
            const onError = () => {
              cleanup();
              rej(new Error('Failed to seek video'));
            };
            const cleanup = () => {
              video.removeEventListener('seeked', onSeeked);
              video.removeEventListener('error', onError);
            };
            video.addEventListener('seeked', onSeeked, { once: true });
            video.addEventListener('error', onError, { once: true });
            if (video.currentTime === 0) {
              cleanup();
              res();
              return;
            }
            video.currentTime = 0;
          });

          // Particle / Rain: mute + loop bg. Frame-accurate: seek-only (audio muxed later).
          if (particleAnimated || rainTemplate) {
            video.muted = true;
            video.loop = true;
          } else {
            video.muted = false;
          }
          try {
            await video.play();
          } catch {
            video.muted = true;
            await video.play();
          }

          const probeStream = canvas.captureStream(0);
          const probeTrack = probeStream.getVideoTracks()[0] as
            | (MediaStreamTrack & { requestFrame?: () => void })
            | undefined;
          const supportsRequestFrame = typeof probeTrack?.requestFrame === 'function';
          probeStream.getTracks().forEach((t) => t.stop());

          const canvasStream = canvas.captureStream(supportsRequestFrame ? 0 : EXPORT_FPS);
          captureTrack = canvasStream.getVideoTracks()[0] ?? null;

          const outStream = new MediaStream();
          canvasStream.getVideoTracks().forEach((t: MediaStreamTrack) => outStream.addTrack(t));

          let stopParticleBedAudio: (() => void) | null = null;
          let startParticleBedAudio: (() => Promise<void>) | null = null;

          if (bedAudioSrc) {
            // Separate bed audio (not video.captureStream) — avoids the early-stop bug.
            const bed = document.createElement('audio');
            bed.crossOrigin = 'anonymous';
            bed.preload = 'auto';
            bed.src = bedAudioSrc;
            await new Promise<void>((res, rej) => {
              bed.addEventListener('canplaythrough', () => res(), { once: true });
              bed.addEventListener('error', () => rej(new Error('Failed to load bed audio')), {
                once: true,
              });
              bed.load();
            });
            bed.currentTime = 0;

            const mediaCapture =
              (
                bed as HTMLMediaElement & {
                  captureStream?: () => MediaStream;
                  webkitCaptureStream?: () => MediaStream;
                }
              ).captureStream ??
              (
                bed as HTMLMediaElement & {
                  webkitCaptureStream?: () => MediaStream;
                }
              ).webkitCaptureStream;

            if (typeof mediaCapture === 'function') {
              // Must play once so captureStream exposes an audio track; restart at record start.
              await bed.play();
              const bedStream = mediaCapture.call(bed);
              const bedTracks = bedStream.getAudioTracks();
              bedTracks.forEach((t) => outStream.addTrack(t));
              bed.pause();
              bed.currentTime = 0;
              startParticleBedAudio = async () => {
                bed.currentTime = 0;
                await bed.play();
              };
              stopParticleBedAudio = () => {
                bed.pause();
                bedTracks.forEach((t) => {
                  try {
                    outStream.removeTrack(t);
                  } catch {
                    /* ignore */
                  }
                  t.stop();
                });
                bed.removeAttribute('src');
                bed.load();
              };
            } else {
              const AudioCtx =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext?: typeof AudioContext })
                  .webkitAudioContext;
              if (!AudioCtx) throw new Error('AudioContext not supported for bed audio');
              const audioCtx = new AudioCtx();
              const source = audioCtx.createMediaElementSource(bed);
              const dest = audioCtx.createMediaStreamDestination();
              source.connect(dest);
              const bedTracks = dest.stream.getAudioTracks();
              bedTracks.forEach((t) => outStream.addTrack(t));
              startParticleBedAudio = async () => {
                if (audioCtx.state === 'suspended') await audioCtx.resume();
                bed.currentTime = 0;
                await bed.play();
              };
              stopParticleBedAudio = () => {
                bed.pause();
                bedTracks.forEach((t) => {
                  try {
                    outStream.removeTrack(t);
                  } catch {
                    /* ignore */
                  }
                  t.stop();
                });
                void audioCtx.close();
                bed.removeAttribute('src');
                bed.load();
              };
            }
          } else if (!particleAnimated && !rainTemplate) {
            // Prefer capturing source audio when the browser supports it (incl. Safari prefix).
            // If unavailable, fall back to Notes-style canvas-only export (silent).
            const videoCapture =
              (
                video as HTMLVideoElement & {
                  captureStream?: (frameRate?: number) => MediaStream;
                  webkitCaptureStream?: (frameRate?: number) => MediaStream;
                  mozCaptureStream?: (frameRate?: number) => MediaStream;
                }
              ).captureStream ??
              (
                video as HTMLVideoElement & {
                  webkitCaptureStream?: (frameRate?: number) => MediaStream;
                }
              ).webkitCaptureStream ??
              (
                video as HTMLVideoElement & {
                  mozCaptureStream?: (frameRate?: number) => MediaStream;
                }
              ).mozCaptureStream;

            if (typeof videoCapture === 'function') {
              try {
                video.muted = false;
                const videoAudioStream = videoCapture.call(video);
                videoAudioStream
                  .getAudioTracks()
                  .forEach((t: MediaStreamTrack) => outStream.addTrack(t));
              } catch {
                /* canvas-only fallback */
              }
            }
          }

          recorder = new MediaRecorder(outStream, {
            mimeType: mime,
            videoBitsPerSecond: particleAnimated
              ? NIGHTY_PARTICLE_EXPORT_VIDEO_BITRATE
              : rainTemplate
                ? NIGHTY_RAIN_EXPORT_VIDEO_BITRATE
              : 12_000_000,
          });
          recorder.ondataavailable = (e) => {
            if (e.data.size) chunks.push(e.data);
          };
          recorder.onerror = () => {
            stopDrawing();
            stopParticleBedAudio?.();
            video.pause();
            reject(new Error('Recording failed'));
          };
          recorder.onstop = () => {
            stopDrawing();
            stopParticleBedAudio?.();
            video.pause();
            reportCaptureRate?.();
            resolve();
          };

          const particleDurationMs =
            (particleAnimated || rainTemplate) && maxDurationSec !== undefined
              ? Math.max(0.5, maxDurationSec) * 1000
              : null;
          let recordStartedAt = performance.now();
          let nextFrameAt = performance.now();
          // Painting slower than EXPORT_FPS forces the CFR transcode to duplicate
          // frames, which reads as judder once a platform re-encodes the upload.
          let paintedFrames = 0;
          reportCaptureRate = () => {
            const seconds = (performance.now() - recordStartedAt) / 1000;
            if (seconds <= 0) return;
            const achieved = paintedFrames / seconds;
            const label = `[export] ${achieved.toFixed(1)}fps painted (target ${EXPORT_FPS}) at ${w}x${h}`;
            if (achieved < EXPORT_FPS * 0.9) {
              console.warn(`${label} — dropped frames will cause choppy playback after re-encode.`);
            } else {
              console.info(label);
            }
          };

          const tick = (now: number) => {
            if (finished) return;
            if (particleDurationMs !== null) {
              particleCaptionTimeSec = Math.max(0, (now - recordStartedAt) / 1000);
              if (now - recordStartedAt >= particleDurationMs) {
                paintFrame();
                finishRecording();
                return;
              }
            } else if (video.ended || reachedMaxDuration()) {
              paintFrame();
              finishRecording();
              return;
            }
            if (now >= nextFrameAt) {
              paintFrame();
              paintedFrames += 1;
              nextFrameAt += FRAME_MS;
              if (now > nextFrameAt + FRAME_MS * 2) {
                nextFrameAt = now + FRAME_MS;
              }
            }
            rafId = requestAnimationFrame(tick);
          };

          paintFrame();
          if (startParticleBedAudio) {
            await startParticleBedAudio();
          }
          recorder.start(100);
          paintFrame();
          recordStartedAt = performance.now();
          nextFrameAt = recordStartedAt + FRAME_MS;
          rafId = requestAnimationFrame(tick);
        } catch (e) {
          stopDrawing();
          video.pause();
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      };

      void run();
    });

    if (chunks.length === 0) throw new Error('No video data was recorded');

    return new Blob(chunks, { type: mime.includes('mp4') ? 'video/mp4' : 'video/webm' });
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute('src');
    video.load();
  }
}

/** Draws `count` images without replacement within each shuffled pass over `pool`; reshuffles only after every file has been used once. With ≥7 assets, all `count` picks are distinct. */
function pickDogUrlsWithoutReuseUntilDeckExhausted(pool: string[], count: number): string[] {
  if (pool.length === 0) return Array.from({ length: count }, () => '');
  const picked: string[] = [];
  let deck: string[] = [];
  for (let i = 0; i < count; i++) {
    if (deck.length === 0) deck = shuffleCopy(pool);
    picked.push(deck.pop()!);
  }
  return picked;
}

/** Cover + Q1–Q4 each get a dog; Q5 is promo-only; CTA is full-bleed. */
function buildKawaiiTabImageSources(pool: string[], ctaSrc: string): string[] {
  const dogs =
    pool.length > 0 ? pickDogUrlsWithoutReuseUntilDeckExhausted(pool, 6) : Array.from({ length: 6 }, () => '');
  return [
    dogs[0] ?? '',
    dogs[1] ?? '',
    dogs[2] ?? '',
    dogs[3] ?? '',
    dogs[4] ?? '',
    '', // Q5 App Store mock — no dog
    ctaSrc,
  ];
}

const KAWAII_CTA_IMAGE_SRC = '/dog-images/kawaii-cta-tab-v2.png';

const KAWAII_CTA_URLS = new Set([
  '/dog-images/kawaii-cta-tab.png',
  KAWAII_CTA_IMAGE_SRC,
]);

function isKawaiiCtaIllustrationUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  return KAWAII_CTA_URLS.has(url) || url.includes('kawaii-cta-tab');
}

/** Dog art for cover + Q1–Q4; never the CTA asset (guards short/legacy source arrays). */
function kawaiiDogImageForTab(
  tabIndex: number,
  sources: readonly string[],
  pool: readonly string[]
): string {
  if (tabIndex < 0 || tabIndex > 4) return '';
  const slot = sources[tabIndex]?.trim();
  if (slot && !isKawaiiCtaIllustrationUrl(slot)) return slot;
  if (pool.length > 0) return pool[tabIndex % pool.length]!;
  return '';
}

function kawaiiTabSourcesNeedRepair(sources: string[], ctaSrc: string): boolean {
  if (sources.length < 7) return true;
  if (sources[IMAGE_TEMPLATE2_Q5_TAB_INDEX] !== '') return true;
  if (sources[6] !== ctaSrc) return true;
  for (let i = 0; i < 5; i++) {
    const url = sources[i]?.trim();
    if (!url || isKawaiiCtaIllustrationUrl(url)) return true;
  }
  return false;
}

const INITIAL_CANVASES: CanvasData[] = [
  { id: '1', text: '', backgroundColor: '#000000', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
  { id: '3', text: '', backgroundColor: '#000000', textColor: '#000000', textSize: '200', imageSize: '1080x1920' },
  { id: 'end', text: '', backgroundColor: '#000000', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
];

const DAILY_TEMPLATE_TITLES_FUNNY = [
  "Super Super Super Dumb Questions For Him",
  "Super Super Super Dumb Questions For Your Boo",
  "Super Super Super Dumb Questions For Your Boyfriend",
  "Ragebait Your Boyfriend Tonight",
  "5 Impossible Questions To Tease Your Boyfriend Tonight",
  "5 Questions To Ask Your Sweet Heart Tonight",
  "5 Fun Questions To Gaslight Your Boyfriend Tonight",
  "Does He Pass The Good Boyfriend Test?",
  "5 Questions To Test How Well Trained Your Boyfriend Is",
  "5 Impossible Questions To Test Your Boyfriend Tonight",
  "5 Questions To Ask Your Boyfriend When He's Busy Or Tired",
  '5 Dumb Questions To Ragebait Your Boyfriend Tonight',
  "5 Impossible Questions To Ragebait Your Boyfriend Tonight",
  "Questions To Tease Your Boyfriend Tonight",
  "Super Dumb Questions To Tease Your Boyfriend Tonight",
  "Super Dumb Questions To Ragebait Your Boyfriend Tonight",
  "Super Dumb Questions To Gaslight Your Boyfriend Tonight",
  '5 Fun Questions To Tease Your Boyfriend Tonight',
  '5 Dumb Questions To Ask Your Boyfriend Tonight',
  '5 Ragebait Questions To Ask Your Boyfriend Tonight',
  '5 Simple Question To Test Your Boyfriend Tonight',
  '5 Questions Your Boyfriend Will Get Wrong',
  '5 Questions To Tell How Dumb Your Boyfriend Is',
  'Questions To Tell If Your Boyfriend Loves You',
  '5 Niche Conversation Starters To Keep The Spark Alive',
  '5 Fun Questions To Ragebait Your Boo',
  '5 Dumb Questions To Annoy Your Boyfriend',
  'Super Dumb Questions To Ragebait Your Boyfriend Tonight',
  '5 Cute Questions To Fall In Love With You Boyfriend Again',
  '5 Evil Questions To Ask Your Boyfriend',
  '5 Super Evil Questions To Ask Your Boyfriend',
  'Questions I think You Should Ask Your Boyfriend',
  'Super Real Questions To Ask Your Boyfriend',
  'Ragebait Questions To Ask Your Man or Sneaky Link',
] as const;

function pickRandomDailyFunnyTitle(exclude?: string): string {
  const pool = [...DAILY_TEMPLATE_TITLES_FUNNY];
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0]!;
  let next = pool[Math.floor(Math.random() * pool.length)]!;
  if (exclude && next === exclude) {
    next = pool.find((t) => t !== exclude) ?? next;
  }
  return next;
}

const DAILY_TEMPLATE_TITLES_FLIRTY = [
  '5 Dangerous Questions To Ask Your Boyfriend Tonight',
  '5 Flirty Questions That Make Things Hotter',
  '5 Flirty Questions That Make Him Sweat',
  '5 Flirty Questions That Make Things Escalate Fast',
  '5 Flirty Questions That Feels Like Temptation',
  '5 Flirty Questions To Spicy Up Your Date Night',
  '5 Flirty Questions To Make Him Blush Tonight',
  '5 Questions To Turn Date Night Spicy',
  '5 Flirty Questions To Tease Your Boyfriend Tonight',
  '5 Questions To Build Tension With Your Boyfriend',
  '5 Flirty Questions To Keep The Spark Alive',
  '5 Questions To Make Him Want You More Tonight',
  '5 Flirty Questions To Ask Before Bed Tonight',
  '5 Questions To Heat Up Your Night Together',
  '5 Flirty Questions To Make Him Fold First',
  '5 Questions To Ask Your Boyfriend After Dark',
  '5 Low Key Flirty Questions For Your Boyfriend',
] as const;

const DAILY_TEMPLATE_TITLES_BRAVE = [
  'Brave Questions To Ask Your Boyfriend',
  '5 Brave Questions To Ask Your Boyfriend',
  '5 Incredibly Uncomfortable Questions To Ask Your Partner',
  'Brave Questions To Ask In Your Relationship',
  '5 Uncomfortable But Healthy Questions To Ask Your Partner',
  "Things I Want To Know But Don't Wanna Ask",
  '5 Uncomfy But Healthy Questions To Ask Him',
  '5 Questions To Ask Your Boyfriend',
  '5 Questions Every Boyfriend Should Be Able To Answer',
] as const;

function questionPoolForType(type: ConcreteQuestionType): readonly string[] {
  if (type === 'me_or_you') return ME_OR_YOU_QUESTIONS;
  if (type === 'flirty') return FLIRTY_QUESTIONS;
  if (type === 'brave') return BRAVE_QUESTIONS;
  return FUNNY_QUESTIONS;
}

function templateTitlePoolForType(type: ConcreteQuestionType): readonly string[] {
  if (type === 'flirty') return DAILY_TEMPLATE_TITLES_FLIRTY;
  if (type === 'brave') return DAILY_TEMPLATE_TITLES_BRAVE;
  // funny + me_or_you share the funny title pool
  return DAILY_TEMPLATE_TITLES_FUNNY;
}

function resolveQuestionType(type: AutomateQuestionType): ConcreteQuestionType {
  if (type !== 'random') return type;
  return CONCRETE_QUESTION_TYPES[Math.floor(Math.random() * CONCRETE_QUESTION_TYPES.length)]!;
}

/** Random pick that never repeats `current`, so Retry always lands on a new type. */
function pickDifferentRandomQuestionType(
  current: ConcreteQuestionType
): ConcreteQuestionType {
  const others = CONCRETE_QUESTION_TYPES.filter((t) => t !== current);
  const pool = others.length > 0 ? others : CONCRETE_QUESTION_TYPES;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

/** Keep Retry / description aligned with the type label currently shown on the slide. */
function concreteTypeFromImageLabel(label: string): ConcreteQuestionType {
  const entry = (
    Object.entries(IMAGE_TEMPLATE2_TYPE_LABELS) as [ConcreteQuestionType, string][]
  ).find(([, value]) => value === label);
  return entry?.[0] ?? 'funny';
}

function allQuestionPools(): string[] {
  return [
    ...FUNNY_QUESTIONS,
    ...FLIRTY_QUESTIONS,
    ...ME_OR_YOU_QUESTIONS,
    ...BRAVE_QUESTIONS,
  ];
}

function allTemplateTitlePools(): string[] {
  return [
    ...DAILY_TEMPLATE_TITLES_FUNNY,
    ...DAILY_TEMPLATE_TITLES_FLIRTY,
    ...DAILY_TEMPLATE_TITLES_BRAVE,
  ];
}

function pickRandomMixedTitle(exclude?: string): string {
  const pool = allTemplateTitlePools();
  if (pool.length === 0) return '';
  if (pool.length === 1) return pool[0]!;
  let next = pool[Math.floor(Math.random() * pool.length)]!;
  if (exclude && next === exclude) {
    next = pool.find((t) => t !== exclude) ?? next;
  }
  return next;
}

export default function Home() {
  const [canvases, setCanvases] = useState<CanvasData[]>(INITIAL_CANVASES);
  const [currentCanvasId, setCurrentCanvasId] = useState<string>('1');
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textSize, setTextSize] = useState('200');
  const [imageSize, setImageSize] = useState('1080x1920');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [userInfo, setUserInfo] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [automateCount, setAutomateCount] = useState('5');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [postStatus, setPostStatus] = useState<'processing' | 'success' | 'failed' | null>(null);
  const [publishId, setPublishId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postPrivacy, setPostPrivacy] = useState<string>('');
  const [allowComment, setAllowComment] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<{
    privacy_level_options?: string[];
    comment_disabled?: boolean;
    duet_disabled?: boolean;
    stitch_disabled?: boolean;
    max_video_post_duration_sec?: number;
  } | null>(null);
  const [musicUsageConsent, setMusicUsageConsent] = useState(false);
  const [contentDisclosureEnabled, setContentDisclosureEnabled] = useState(false);
  const [isYourBrand, setIsYourBrand] = useState(false);
  const [isBrandedContent, setIsBrandedContent] = useState(false);
  const [levelName, setLevelName] = useState<string>('');
  const [theme, setTheme] = useState<string>('');
  const [mode, setMode] = useState<'plain' | 'video'>('video');
  const [contentTab, setContentTab] = useState<ContentTab>('copycat');
  const [selectedAppId, setSelectedAppId] = useState<StudioAppId>(DEFAULT_STUDIO_APP_ID);
  const [selectedImageTemplateId, setSelectedImageTemplateId] = useState<number | null>(null);
  const [selectedVideoTemplateId, setSelectedVideoTemplateId] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  /** TikTok-style overlay on video templates (white fill, black stroke). */
  const [videoOverlayCaption, setVideoOverlayCaption] = useState('Your text here');
  const [videoTemplate2Questions, setVideoTemplate2Questions] = useState<string[]>([]);
  const [videoTemplate4CompetitorId, setVideoTemplate4CompetitorId] =
    useState<VideoTemplate4CompetitorFilter>('all');
  const [videoTemplate4Content, setVideoTemplate4Content] = useState(() =>
    pickVideoTemplate4Content()
  );
  const videoTemplate4Label = videoTemplate4Content.label;
  const videoTemplate4Questions = videoTemplate4Content.questions;
  const [videoTemplate2QuestionType, setVideoTemplate2QuestionType] =
    useState<AutomateQuestionType>('random');
  const [videoTemplate2Description, setVideoTemplate2Description] = useState('');
  const [videoTemplate2DescriptionError, setVideoTemplate2DescriptionError] = useState<
    string | null
  >(null);
  const [isGeneratingVideoTemplate2Description, setIsGeneratingVideoTemplate2Description] =
    useState(false);
  const [videoTemplate2HighlightWord, setVideoTemplate2HighlightWord] = useState<string | null>(
    null
  );
  const [videoTemplate2PexelsVideoSrc, setVideoTemplate2PexelsVideoSrc] = useState<string | null>(null);
  const [videoTemplate2PexelsPosterSrc, setVideoTemplate2PexelsPosterSrc] = useState<string | null>(null);
  const [videoTemplate2HighlightBg, setVideoTemplate2HighlightBg] = useState<string | null>(null);
  const [isVideoTemplate2VideoLoading, setIsVideoTemplate2VideoLoading] = useState(false);
  const [videoTemplate2VideoError, setVideoTemplate2VideoError] = useState<string | null>(null);
  const nightyParticleVideoRef = useRef<HTMLVideoElement | null>(null);
  const nightyParticleAudioRef = useRef<HTMLAudioElement | null>(null);
  const nightyRainVideoRef = useRef<HTMLVideoElement | null>(null);
  const nightyRainAudioRef = useRef<HTMLAudioElement | null>(null);
  const [nightyParticleLines, setNightyParticleLines] = useState<NightyParticleLines>({
    ...NIGHTY_PARTICLE_DEFAULT_LINES,
  });
  const [nightyParticleTiming, setNightyParticleTiming] = useState<NightyParticleTiming>({
    ...NIGHTY_PARTICLE_TIMING,
  });
  const [nightyParticleAccentColor, setNightyParticleAccentColor] = useState(
    () => pickNightyParticleAccentColor()
  );
  const [nightyParticleWaveId, setNightyParticleWaveId] =
    useState<NightyParticleWaveId>(NIGHTY_PARTICLE_DEFAULT_WAVE);
  const nightyParticleBedAudioSrc = nightyParticleAudioSrc(nightyParticleWaveId);
  const [nightyRainSoundId, setNightyRainSoundId] =
    useState<NightyRainSoundId>(NIGHTY_RAIN_DEFAULT_SOUND);
  const nightyRainBedAudioSrc = nightyRainAudioSrc(nightyRainSoundId);
  const [nightyRainVideoId, setNightyRainVideoId] =
    useState<NightyRainVideoId>(NIGHTY_RAIN_DEFAULT_VIDEO);
  const [nightyRainSubline, setNightyRainSubline] = useState(NIGHTY_RAIN_CAPTION_SUBLINE);
  const nightyParticleMaxDuration = nightyParticleMaxDurationSec(nightyParticleTiming);
  const [fabMontageVideoSrcs, setFabMontageVideoSrcs] = useState<string[]>([]);
  const [fabMontageAffirmations, setFabMontageAffirmations] = useState<string[]>([]);
  const [fabMontageSegments, setFabMontageSegments] = useState<FabAffirmationAudioSegment[]>([]);
  const [reuseFabMontageVideos, setReuseFabMontageVideos] = useState(true);
  const [fabMontageVideoStyle, setFabMontageVideoStyle] = useState<FabMontageVideoStyleId>(
    FAB_AFFIRMATION_DEFAULT_VIDEO_STYLE
  );
  const [fabMontageTtsProvider, setFabMontageTtsProvider] = useState<FabTtsProviderId>(
    FAB_AFFIRMATION_DEFAULT_TTS_PROVIDER
  );
  const [fabMontageAmbientId, setFabMontageAmbientId] = useState<FabAmbientSoundId>(
    FAB_AFFIRMATION_DEFAULT_AMBIENT
  );
  const [isFabMontageLoading, setIsFabMontageLoading] = useState(false);
  const [isFabMontageTtsLoading, setIsFabMontageTtsLoading] = useState(false);
  const [fabMontageError, setFabMontageError] = useState<string | null>(null);
  const [freshBakedDonutSelectedId, setFreshBakedDonutSelectedId] = useState<string | null>(null);
  const [freshBakedDonutPosts, setFreshBakedDonutPosts] = useState(FRESH_BAKED_DONUT_POSTS);
  const [freshBakedDonutDeletingId, setFreshBakedDonutDeletingId] = useState<string | null>(null);
  const [isVideoExporting, setIsVideoExporting] = useState(false);
  const [showVideoDownloadModal, setShowVideoDownloadModal] = useState(false);
  const [videoDownloadCount, setVideoDownloadCount] = useState('1');
  const [videoExportProgress, setVideoExportProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [videoExportDetail, setVideoExportDetail] = useState<string | null>(null);
  const [isImageTemplateDownloading, setIsImageTemplateDownloading] = useState(false);
  const [isImageTemplateUploading, setIsImageTemplateUploading] = useState(false);
  const [instagramAccount, setInstagramAccount] = useState<{ username: string } | null>(null);
  const [instagramError, setInstagramError] = useState<string | null>(null);
  const [isInstagramPosting, setIsInstagramPosting] = useState(false);
  const [videoExportError, setVideoExportError] = useState<string | null>(null);
  const [selectedImageBrowserTab, setSelectedImageBrowserTab] = useState(0);
  const [selectedCopycatCompetitorId, setSelectedCopycatCompetitorId] =
    useState<CopycatCompetitorId>('flamingo-cards');
  const [selectedCopycatTemplateId, setSelectedCopycatTemplateId] =
    useState<CopycatTemplateId>(1);

  useEffect(() => {
    setSelectedCopycatCompetitorId(pickRandomCopycatCompetitor());
  }, []);
  const [imageTabFrameBg, setImageTabFrameBg] = useState('#FEFEFE');
  const [imageTabPastelBgs, setImageTabPastelBgs] = useState<string[]>([]);
  const [imageTabTypeLabel, setImageTabTypeLabel] = useState('Funny Questions');
  const kawaiiCtaImageSrc = KAWAII_CTA_IMAGE_SRC;
  const filterDogIllustrationPool = (urls: string[]) =>
    urls.filter((u) => !isKawaiiCtaIllustrationUrl(u));
  const pastelCtaImageSrc = '/image-templates/template-2-cta-v2.png';
  /** Kawaii image-tab frame: export is 1080×1440; keep preview text in the same ballpark via Tailwind below. */
  const imageFrameExportFontPx = 54;
  const imageFrameExportWrappedLineHeightPx = 70;
  const imageFrameExportFontFamily = '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif';
  const imageFrameExportTextColorDefault = '#2f2a31';
  const imageFrameExportGlowColor = 'rgba(255, 255, 255, 0.9)';
  const pastelCarouselTextColor = IMAGE_TEMPLATE2_TEXT_COLOR;
  const pastelCarouselFontFamily = TIKTOK_SANS_STACK;
  const pastelCarouselExportFontFamily = TIKTOK_SANS_STACK;
  const [imageTabFunnyQuestions, setImageTabFunnyQuestions] = useState<string[]>([]);
  const [imageTabTexts, setImageTabTexts] = useState<string[]>([]);
  const [imageTabSources, setImageTabSources] = useState<string[]>([]);
  const [imageTemplate2QuestionType, setImageTemplate2QuestionType] =
    useState<AutomateQuestionType>('random');
  const [imageTemplate6QuestionType, setImageTemplate6QuestionType] =
    useState<AutomateQuestionType>('random');
  const [imageTemplate2Description, setImageTemplate2Description] = useState('');
  const [isGeneratingImageTemplate2Description, setIsGeneratingImageTemplate2Description] =
    useState(false);
  const [imageTemplate2Error, setImageTemplate2Error] = useState<string | null>(null);
  const [imageTemplate2HighlightWord, setImageTemplate2HighlightWord] = useState<string | null>(
    null
  );
  const [imageTemplate1HighlightWord, setImageTemplate1HighlightWord] = useState<string | null>(null);
  const [imageTemplate2CoverSquiggleEnabled, setImageTemplate2CoverSquiggleEnabled] = useState(
    IMAGE_TEMPLATE2_COVER_SQUIGGLE_ENABLED_DEFAULT
  );
  const [imageTemplate2CoverSubtitle, setImageTemplate2CoverSubtitle] = useState(() =>
    pickRandomImageTemplate2CoverSubtitle()
  );
  const [imageTemplate9TitleAnchor, setImageTemplate9TitleAnchor] =
    useState<ImageTemplate9TitleAnchor>(() => pickImageTemplate9TitleAnchor());
  const [isImageTemplate7CoverLoading, setIsImageTemplate7CoverLoading] = useState(false);
  const [isGeneratingTemplate12, setIsGeneratingTemplate12] = useState(false);
  const [template12Quality, setTemplate12Quality] = useState<CharacterImageQuality>('medium');
  const [template12Status, setTemplate12Status] = useState('');
  const [template12Error, setTemplate12Error] = useState<string | null>(null);
  const template12RunRef = useRef(0);
  /** Alternates Template 13 covers between a generated photo and centered text. */
  const template13CoverModeRef = useRef<'photo' | 'text'>('text');
  const [imageTemplate7CoverError, setImageTemplate7CoverError] = useState<string | null>(null);
  const pinterestCoverAbortRef = useRef<AbortController | null>(null);
  const template8RecentCoverUrlsRef = useRef<string[]>([]);
  const template8LastCoverQueryRef = useRef<string>('');
  const template9RecentCoverUrlsRef = useRef<string[]>([]);
  const template9LastCoverQueryRef = useRef<string>('');
  const [dogImagePool, setDogImagePool] = useState<string[]>([]);
  const [videoBackgroundUrl, setVideoBackgroundUrl] = useState<string | null>(null);
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const [automateDailyResults, setAutomateDailyResults] = useState<string[] | null>(null);
  const [automateDailyRowPrompts, setAutomateDailyRowPrompts] = useState<string[] | null>(null);
  const [automateDailyRowQuestions, setAutomateDailyRowQuestions] = useState<string[] | null>(null);
  const [automateDailyTemplatePromptRaw, setAutomateDailyTemplatePromptRaw] = useState<string | null>(null);
  const [automateDailyVideoTitle, setAutomateDailyVideoTitle] = useState<string | null>(null);
  const [automateDailyTitle, setAutomateDailyTitle] = useState<string | null>(null);
  const [automateDailyTemplatePrompt, setAutomateDailyTemplatePrompt] = useState<string | null>(null);
  /** Text currently filling {x} in the template prompt (for prompt-only / question-only edits) */
  const [automateDailyTemplateReplacementText, setAutomateDailyTemplateReplacementText] = useState<string | null>(
    null
  );
  const [automateDailyIndex, setAutomateDailyIndex] = useState(0);
  const [isGeneratingDailyTikTok, setIsGeneratingDailyTikTok] = useState(false);
  const [isRetryingTemplatePrompt, setIsRetryingTemplatePrompt] = useState(false);
  const [isRetryingTemplateQuestion, setIsRetryingTemplateQuestion] = useState(false);
  const [isRetryingDailyVideoTitle, setIsRetryingDailyVideoTitle] = useState(false);
  const [isRetryingDailyCaption, setIsRetryingDailyCaption] = useState(false);
  const [automateQuestionType, setAutomateQuestionType] = useState<AutomateQuestionType>('random');
  /** Concrete category used for the latest Daily TikTok run (especially when Random is selected). */
  const [automateResolvedQuestionType, setAutomateResolvedQuestionType] =
    useState<ConcreteQuestionType | null>(null);
  const [dailyGenIncludeQuestions, setDailyGenIncludeQuestions] = useState(true);
  const [dailyGenIncludeTitle, setDailyGenIncludeTitle] = useState(true);
  const [dailyGenIncludeCaption, setDailyGenIncludeCaption] = useState(true);
  /** Template hook prompt (image prompt with {x}); labeled “cover image” in the UI */
  const [dailyGenIncludeCoverImage, setDailyGenIncludeCoverImage] = useState(true);

  /** Prompt strings from the previous Daily TikTok run — excluded next time so back-to-back runs rarely repeat */
  const lastDailyPromptRunRef = useRef<Set<string>>(new Set());
  /** Concrete type used for the current/last Daily TikTok run (when UI type is Random). */
  const activeQuestionTypeRef = useRef<ConcreteQuestionType>('funny');

  const isUpdatingFromUserInput = useRef(false);
  const isSyncingFromCanvas = useRef(false);

  const currentCanvas = canvases.find((c) => c.id === currentCanvasId) || canvases[0];
  const firstCard = canvases.find((c) => c.id === '1') || canvases[0];
  const firstCardTextValue = canvases.find((c) => c.id === '1')?.text || '';
  const prevFirstCardTextRef = useRef(firstCardTextValue);

  const imageTemplateCards = getImageTemplatesForApp(selectedAppId).filter(
    (card) => card.id !== 15 && card.id !== 18
  );
  const videoTemplateCards = getVideoTemplatesForApp(selectedAppId);
  const characterCards = getCharactersForApp(selectedAppId);
  const selectedCharacter = getCharacterById(selectedAppId, selectedCharacterId);
  const isKawaiiImageTemplate = selectedAppId === 'spill-it' && selectedImageTemplateId === 1;
  const isBearsKawaiiImageTemplate =
    selectedAppId === 'spill-it' && selectedImageTemplateId === 6;
  const isCouplesDoodleImageTemplate =
    selectedAppId === 'spill-it' && isGeneratedCoupleSlideTemplateId(selectedImageTemplateId);
  const isMaroonLockscreenImageTemplate =
    selectedAppId === 'spill-it' && isImageTemplate13Id(selectedImageTemplateId);
  const isColorCardImageTemplate =
    selectedAppId === 'spill-it' && isImageTemplate14Id(selectedImageTemplateId);
  const isNotesQuestionsImageTemplate =
    selectedAppId === 'spill-it' && isImageTemplate16Id(selectedImageTemplateId);
  const isPinterestCoverImageTemplate =
    selectedAppId === 'spill-it' && isPinterestCoverImageTemplateId(selectedImageTemplateId);
  const isCouplesCuteMomentsImageTemplate =
    selectedAppId === 'spill-it' && isCouplesCuteMomentsImageTemplateId(selectedImageTemplateId);
  const isCelebrityCouplesImageTemplate =
    selectedAppId === 'spill-it' && isCelebrityCouplesImageTemplateId(selectedImageTemplateId);
  const isPinterestCoverOnlyImageTemplate =
    selectedAppId === 'spill-it' && isPinterestCoverOnlyImageTemplateId(selectedImageTemplateId);
  const isCouplesSelfieImageTemplate =
    selectedAppId === 'spill-it' && isCouplesSelfieImageTemplateId(selectedImageTemplateId);
  const isTopDownSelfieImageTemplate =
    selectedAppId === 'spill-it' && isTopDownSelfieImageTemplateId(selectedImageTemplateId);
  const isKawaiiLayoutImageTemplate =
    isKawaiiImageTemplate || isBearsKawaiiImageTemplate;
  const imageFrameExportTextColor = isBearsKawaiiImageTemplate
    ? IMAGE_TEMPLATE6_TEXT_COLOR
    : imageFrameExportTextColorDefault;
  const isPastelCarouselImageTemplate =
    selectedAppId === 'spill-it' && selectedImageTemplateId === 2;
  const imageTemplateQuestionCount = isNotesQuestionsImageTemplate
    ? IMAGE_TEMPLATE16_QUESTION_COUNT
    : 5;
  // Template 1 / 2 / 6 / 7 / 8 / 9 end on Q5 — no CTA.
  const hasImageTemplateCtaTab =
    !isPastelCarouselImageTemplate &&
    !isKawaiiImageTemplate &&
    !isBearsKawaiiImageTemplate &&
    !isPinterestCoverImageTemplate &&
    !isPinterestCoverOnlyImageTemplate &&
    !isCouplesDoodleImageTemplate &&
    !isMaroonLockscreenImageTemplate &&
    !isColorCardImageTemplate &&
    !isNotesQuestionsImageTemplate;
  const imageTemplateCtaTabIndex = hasImageTemplateCtaTab
    ? imageTemplateQuestionCount + 1
    : -1;
  const imageTemplateTabCount =
    imageTemplateQuestionCount + (hasImageTemplateCtaTab ? 2 : 1);
  const isCouplesNatureVideoTemplate = selectedAppId === 'spill-it' && selectedVideoTemplateId === 2;
  const isSpillItNotesVideoTemplate = selectedAppId === 'spill-it' && selectedVideoTemplateId === 3;
  const isOceanSunsetVideoTemplate = selectedAppId === 'spill-it' && selectedVideoTemplateId === 4;
  const isCinematicCoverVideoTemplate =
    selectedAppId === 'spill-it' && selectedVideoTemplateId === 6;
  const isFreshBakedDonutVideoTemplate =
    selectedAppId === 'spill-it' && selectedVideoTemplateId === 5;
  const selectedFreshBakedDonut = freshBakedDonutSelectedPost(
    freshBakedDonutSelectedId,
    freshBakedDonutPosts
  );
  const isFabAffirmationVideoTemplate = selectedAppId === 'fab' && selectedVideoTemplateId === 1;
  const isNightyParticleVideoTemplate = selectedAppId === 'nighty' && selectedVideoTemplateId === 1;
  const isNightyRainVideoTemplate = selectedAppId === 'nighty' && selectedVideoTemplateId === 2;
  const usesPexelsVideoBackground =
    isCouplesNatureVideoTemplate ||
    isSpillItNotesVideoTemplate ||
    isOceanSunsetVideoTemplate ||
    isCinematicCoverVideoTemplate ||
    isNightyParticleVideoTemplate ||
    isNightyRainVideoTemplate;

  const handleSelectedAppIdChange = (appId: StudioAppId) => {
    if (appId === selectedAppId) return;
    setSelectedAppId(appId);
    setSelectedImageTemplateId(null);
    setSelectedVideoTemplateId(null);
    setSelectedCharacterId(null);
    setSelectedImageBrowserTab(0);
    setAutomateDailyResults(null);
    setAutomateDailyRowPrompts(null);
    setAutomateDailyRowQuestions(null);
    setAutomateResolvedQuestionType(null);
    setAutomateDailyTemplatePrompt(null);
    setAutomateDailyTemplatePromptRaw(null);
    setAutomateDailyTemplateReplacementText(null);
    setAutomateDailyVideoTitle(null);
    setAutomateDailyTitle(null);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const urlState = readAppUrlState();
    setContentTab(urlState.contentTab);
    setSelectedAppId(urlState.selectedAppId);
    setSelectedImageTemplateId(urlState.selectedImageTemplateId);
    setSelectedVideoTemplateId(urlState.selectedVideoTemplateId);
    setSelectedCharacterId(urlState.selectedCharacterId);
    setSelectedImageBrowserTab(urlState.selectedImageBrowserTab);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    syncAppUrlState({
      contentTab,
      selectedAppId,
      selectedImageTemplateId,
      selectedVideoTemplateId,
      selectedCharacterId,
      selectedImageBrowserTab,
    });
  }, [
    urlReady,
    contentTab,
    selectedAppId,
    selectedImageTemplateId,
    selectedVideoTemplateId,
    selectedCharacterId,
    selectedImageBrowserTab,
  ]);

  useEffect(() => {
    if (
      (isKawaiiLayoutImageTemplate ||
        isPastelCarouselImageTemplate ||
        isPinterestCoverImageTemplate ||
        isPinterestCoverOnlyImageTemplate ||
        isNotesQuestionsImageTemplate) &&
      selectedImageBrowserTab >= imageTemplateTabCount
    ) {
      setSelectedImageBrowserTab(0);
    }
  }, [
    isKawaiiLayoutImageTemplate,
    isPastelCarouselImageTemplate,
    isPinterestCoverImageTemplate,
    isPinterestCoverOnlyImageTemplate,
    isNotesQuestionsImageTemplate,
    imageTemplateTabCount,
    selectedImageBrowserTab,
  ]);

  useEffect(() => {
    if (isPinterestCoverImageTemplate || isPinterestCoverOnlyImageTemplate) return;
    pinterestCoverAbortRef.current?.abort();
    setIsImageTemplate7CoverLoading(false);
  }, [isPinterestCoverImageTemplate, isPinterestCoverOnlyImageTemplate]);

  const regenerateVideoTemplate2Title = () => {
    setVideoOverlayCaption((current) => pickTitleForType(videoTemplate2QuestionType, current));
  };

  const regenerateVideoTemplate2Content = () => {
    const title = pickTitleForType(videoTemplate2QuestionType);
    const questions = pickQuestionsForType(videoTemplate2QuestionType, 7);
    setVideoOverlayCaption(title);
    setVideoTemplate2Questions(questions);
    return { cover: title, questions };
  };

  const regenerateFabNotesTitle = () => {
    setVideoOverlayCaption((current) => pickTitleForType(videoTemplate2QuestionType, current));
  };

  const regenerateFabNotesContent = () => {
    const title = pickTitleForType(videoTemplate2QuestionType);
    const questions = pickQuestionsForType(videoTemplate2QuestionType, 5);
    setVideoOverlayCaption(title);
    setVideoTemplate2Questions(questions);
    return { cover: title, questions };
  };

  const regenerateVideoTemplate4Content = (
    competitorId: VideoTemplate4CompetitorFilter = videoTemplate4CompetitorId
  ) => {
    const next = pickVideoTemplate4Content(videoTemplate4Content, competitorId);
    setVideoTemplate4Content(next);
    return { cover: next.label, questions: next.questions };
  };

  const regenerateCinematicCoverContent = () => {
    const title = pickTitleForType(videoTemplate2QuestionType);
    const questions = pickQuestionsForType(videoTemplate2QuestionType, 5);
    setVideoOverlayCaption(title);
    setVideoTemplate2Questions(questions);
    return { cover: title, questions };
  };

  const applyVideoTemplate2QuestionType = (type: AutomateQuestionType) => {
    setVideoTemplate2QuestionType(type);
    const title = pickTitleForType(type);
    const questions = pickQuestionsForType(
      type,
      isSpillItNotesVideoTemplate || isCinematicCoverVideoTemplate ? 5 : 7
    );
    setVideoOverlayCaption(title);
    setVideoTemplate2Questions(questions);
    void handleGenerateVideoTemplate2Description({ cover: title, questions });
  };

  const VIDEO_TEMPLATE2_TYPE_CYCLE: AutomateQuestionType[] = [
    'random',
    ...CONCRETE_QUESTION_TYPES,
  ];

  const regenerateVideoTemplate2Type = () => {
    const idx = VIDEO_TEMPLATE2_TYPE_CYCLE.indexOf(videoTemplate2QuestionType);
    const next =
      VIDEO_TEMPLATE2_TYPE_CYCLE[(idx + 1) % VIDEO_TEMPLATE2_TYPE_CYCLE.length] ?? 'random';
    applyVideoTemplate2QuestionType(next);
  };

  const applyImageTemplate2QuestionType = (type: AutomateQuestionType) => {
    setImageTemplate2QuestionType(type);
    // Resolve Random once so label, title, and questions all share the same type.
    const resolved = resolveQuestionType(type);
    const title = pickTitleForType(resolved);
    const questions = pickQuestionsForType(resolved, 5);
    setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS[resolved]);
    setImageTabFunnyQuestions(questions);
    setImageTabTexts([title, ...questions, 'Remember to like, save and share the fun!']);
    setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
  };

  const applyImageTemplate9QuestionType = (_type?: AutomateQuestionType) => {
    const title = pickTitleForType('funny');
    const questions = pickQuestionsForType('funny', 5);
    setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS.funny);
    setImageTabFunnyQuestions(questions);
    setImageTabTexts([title, ...questions]);
    setImageTemplate9TitleAnchor(pickImageTemplate9TitleAnchor());
  };

  const applyImageTemplate8QuestionType = (_type?: AutomateQuestionType) => {
    const title = pickTitleForType('funny');
    const questions = pickQuestionsForType('funny', 5);
    setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS.funny);
    setImageTabFunnyQuestions(questions);
    setImageTabTexts([title, ...questions]);
    setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
  };

  const applyImageTemplate6QuestionType = (type: AutomateQuestionType) => {
    setImageTemplate6QuestionType(type);
    // Resolve Random once so label, title, and questions all share the same type.
    const resolved = resolveQuestionType(type);
    const title = pickTitleForType(resolved);
    const questions = pickQuestionsForType(resolved, 5);
    setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS[resolved]);
    setImageTabFunnyQuestions(questions);
    setImageTabTexts([title, ...questions]);
    setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
  };


  const regenerateImageTemplate2Colors = () => {
    const pastelPool = shuffleCopy([...IMAGE_TEMPLATE2_PASTEL_COLORS]);
    const pastels = Array.from({ length: 6 }, (_, i) => pastelPool[i % pastelPool.length]!);
    setImageTabPastelBgs(pastels);
    setImageTabFrameBg(
      pastels[Math.min(selectedImageBrowserTab, pastels.length - 1)] ?? pastels[0]!
    );
  };


  const handleGenerateImageTemplate2Description = async () => {
    const questions = imageTabTexts
      .slice(1, imageTemplateQuestionCount + 1)
      .map((q) => q.trim())
      .filter(Boolean);
    if (questions.length === 0) {
      setImageTemplate2Error('Add some questions first, then generate a description.');
      return;
    }
    setImageTemplate2Error(null);
    setIsGeneratingImageTemplate2Description(true);
    try {
      const questionType = isBearsKawaiiImageTemplate
        ? imageTemplate6QuestionType
        : isKawaiiImageTemplate ||
            isCouplesDoodleImageTemplate ||
            isMaroonLockscreenImageTemplate ||
            isColorCardImageTemplate ||
            isNotesQuestionsImageTemplate ||
            isPinterestCoverImageTemplate ||
            isCouplesSelfieImageTemplate ||
            isTopDownSelfieImageTemplate
          ? ('funny' as AutomateQuestionType)
          : imageTemplate2QuestionType;
      const type =
        questionType === 'random'
          ? concreteTypeFromImageLabel(imageTabTypeLabel)
          : resolveQuestionType(questionType);
      const res = await fetch('/api/openai/daily-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questions.join('\n'),
          type,
        }),
      });
      const data = (await res.json()) as {
        description?: string;
        text?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate description');
      }
      const description =
        (typeof data.description === 'string' && data.description.trim()) ||
        (typeof data.text === 'string' && data.text.trim()) ||
        '';
      if (!description) {
        throw new Error('No description returned');
      }
      setImageTemplate2Description(description);
    } catch (e) {
      setImageTemplate2Error(e instanceof Error ? e.message : 'Failed to generate description');
    } finally {
      setIsGeneratingImageTemplate2Description(false);
    }
  };

  const handleDeleteFreshBakedDonut = async (id: string) => {
    if (freshBakedDonutDeletingId) return;
    setFreshBakedDonutDeletingId(id);
    setVideoExportError(null);
    try {
      const res = await fetch('/api/fresh-baked-donut/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error || 'Failed to delete clip');
      setFreshBakedDonutPosts((current) => current.filter((post) => post.id !== id));
      if (freshBakedDonutSelectedId === id) setFreshBakedDonutSelectedId(null);
    } catch (e) {
      setVideoExportError(e instanceof Error ? e.message : 'Failed to delete clip');
    } finally {
      setFreshBakedDonutDeletingId(null);
    }
  };

  const getVideoTemplateCaptionSource = () => {
    if (isOceanSunsetVideoTemplate) {
      return {
        cover: videoTemplate4Label.trim(),
        questions: videoTemplate4Questions.map((q) => q.trim()).filter(Boolean),
      };
    }
    if (isCinematicCoverVideoTemplate) {
      return {
        cover: videoOverlayCaption.trim(),
        questions: videoTemplate2Questions.map((q) => q.trim()).filter(Boolean),
      };
    }
    if (isFreshBakedDonutVideoTemplate) {
      return freshBakedDonutCaptionSource(selectedFreshBakedDonut);
    }
    if (isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate) {
      return {
        cover: videoOverlayCaption.trim(),
        questions: videoTemplate2Questions.map((q) => q.trim()).filter(Boolean),
      };
    }
    if (isNightyParticleVideoTemplate) {
      const lines = [
        nightyParticleLines.line1,
        nightyParticleLines.line2,
        nightyParticleLines.line3,
        nightyParticleLines.line4,
        nightyParticleLines.line5,
        nightyParticleLines.line6,
        nightyParticleLines.line7,
        nightyParticleLines.line8,
        nightyParticleLines.line9,
      ]
        .map((line) => line.trim())
        .filter(Boolean);
      return { cover: lines[0] ?? '', questions: lines.slice(1) };
    }
    if (isNightyRainVideoTemplate) {
      return {
        cover: (videoOverlayCaption.trim() || NIGHTY_RAIN_CAPTION).trim(),
        questions: [(nightyRainSubline.trim() || NIGHTY_RAIN_CAPTION_SUBLINE).trim()].filter(
          Boolean
        ),
      };
    }
    if (isFabAffirmationVideoTemplate) {
      const lines = fabMontageAffirmations.map((line) => line.trim()).filter(Boolean);
      return { cover: lines[0] ?? '', questions: lines.slice(1) };
    }
    return {
      cover: videoOverlayCaption.trim(),
      questions: [] as string[],
    };
  };

  const handleGenerateVideoTemplate2Description = async (source?: {
    cover: string;
    questions: string[];
  }) => {
    const { cover, questions } = source ?? getVideoTemplateCaptionSource();
    if (!cover && questions.length === 0) {
      setVideoTemplate2DescriptionError('Add some text first, then generate a caption.');
      return;
    }
    setVideoTemplate2DescriptionError(null);
    setIsGeneratingVideoTemplate2Description(true);
    try {
      const res = await fetch('/api/openai/copycat-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover, questions }),
      });
      const data = (await res.json()) as { caption?: string; error?: string };
      if (!res.ok || !data.caption?.trim()) {
        throw new Error(data.error || 'Failed to generate caption');
      }
      setVideoTemplate2Description(data.caption.trim());
    } catch (e) {
      setVideoTemplate2DescriptionError(
        e instanceof Error ? e.message : 'Failed to generate caption'
      );
    } finally {
      setIsGeneratingVideoTemplate2Description(false);
    }
  };

  const updateVideoTemplate2Question = (index: number, value: string) => {
    setVideoTemplate2Questions((prev) => {
      const next = [...prev];
      while (next.length < 7) next.push('');
      next[index] = value;
      return next;
    });
  };

  const handleRegenerateVideoTemplate2Video = async (
    rainVideoOverride?: NightyRainVideoId
  ) => {
    setIsVideoTemplate2VideoLoading(true);
    setVideoTemplate2VideoError(null);
    try {
      if (isNightyParticleVideoTemplate && NIGHTY_PARTICLE_USE_TEST_VIDEO) {
        setVideoTemplate2PexelsVideoSrc(NIGHTY_PARTICLE_TEST_VIDEO_SRC);
        setVideoTemplate2PexelsPosterSrc(null);
        setNightyParticleAccentColor((prev) => pickNightyParticleAccentColor(prev));
        return;
      }
      const query = isNightyRainVideoTemplate
        ? nightyRainVideoOption(rainVideoOverride ?? nightyRainVideoId).pexelsQuery
        : (() => {
            const queryPool = isNightyParticleVideoTemplate
              ? NIGHTY_PARTICLE_PEXELS_QUERIES
              : isSpillItNotesVideoTemplate
                ? FAB_NOTES_PEXELS_QUERIES
                : isOceanSunsetVideoTemplate
                  ? [VIDEO_TEMPLATE4_PEXELS_QUERY]
                  : isCinematicCoverVideoTemplate
                    ? [...VIDEO_TEMPLATE6_PEXELS_QUERIES]
                    : VIDEO_TEMPLATE2_PEXELS_QUERIES;
            return queryPool[Math.floor(Math.random() * queryPool.length)]!;
          })();
      const page = 1 + Math.floor(Math.random() * 15);
      const res = await fetch(
        `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}&preferHeight=${PEXELS_PREFER_HEIGHT}`
      );
      const data = (await res.json()) as { videoUrl?: string; thumbnailUrl?: string | null; error?: string };
      if (!res.ok || !data.videoUrl) {
        throw new Error(data.error || 'Failed to fetch video');
      }
      setVideoTemplate2PexelsVideoSrc(data.videoUrl);
      setVideoTemplate2PexelsPosterSrc(data.thumbnailUrl ?? null);
      if (isNightyParticleVideoTemplate) {
        setNightyParticleAccentColor((prev) => pickNightyParticleAccentColor(prev));
      }
    } catch (e) {
      setVideoTemplate2VideoError(e instanceof Error ? e.message : 'Failed to fetch video');
    } finally {
      setIsVideoTemplate2VideoLoading(false);
    }
  };

  const pickFabMontageAffirmations = (): string[] =>
    shuffleCopy([...FAB_HEART_MESSAGES]).slice(0, FAB_AFFIRMATION_TEXT_COUNT);

  const refreshFabMontageTts = async (
    texts: string[],
    providerOverride?: FabTtsProviderId
  ) => {
    setIsFabMontageTtsLoading(true);
    setFabMontageError(null);
    try {
      const next = await buildFabAffirmationSegments(
        texts,
        providerOverride ?? fabMontageTtsProvider
      );
      setFabMontageSegments((prev) => {
        revokeFabAffirmationSegments(prev);
        return next;
      });
    } catch (e) {
      setFabMontageError(e instanceof Error ? e.message : 'Failed to generate voice');
      setFabMontageSegments((prev) => {
        revokeFabAffirmationSegments(prev);
        return [];
      });
    } finally {
      setIsFabMontageTtsLoading(false);
    }
  };

  const fetchFabMontageVideos = async (
    force = false,
    styleOverride?: FabMontageVideoStyleId
  ) => {
    if (!force && reuseFabMontageVideos && fabMontageVideoSrcs.length >= FAB_AFFIRMATION_CLIP_COUNT) {
      return;
    }
    const style = styleOverride ?? fabMontageVideoStyle;
    setIsFabMontageLoading(true);
    setFabMontageError(null);
    try {
      const urls: string[] = [];
      for (let i = 0; i < FAB_AFFIRMATION_CLIP_COUNT; i++) {
        const query = resolveFabAffirmationPexelsQuery(style);
        const page = 1 + Math.floor(Math.random() * 15);
        const res = await fetch(
          `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}`
        );
        const data = (await res.json()) as { videoUrl?: string; error?: string };
        if (!res.ok || !data.videoUrl) {
          throw new Error(data.error || 'Failed to fetch video');
        }
        urls.push(data.videoUrl);
      }
      setFabMontageVideoSrcs(urls);
    } catch (e) {
      setFabMontageError(e instanceof Error ? e.message : 'Failed to fetch videos');
    } finally {
      setIsFabMontageLoading(false);
    }
  };

  const regenerateFabMontageContent = () => {
    const texts = pickFabMontageAffirmations();
    setFabMontageAffirmations(texts);
    void refreshFabMontageTts(texts);
    return { cover: texts[0] ?? '', questions: texts.slice(1) };
  };

  useEffect(() => {
    if (isCouplesNatureVideoTemplate) {
      warmCouplesNatureExport();
      const source = regenerateVideoTemplate2Content();
      void handleRegenerateVideoTemplate2Video();
      void handleGenerateVideoTemplate2Description(source);
    } else if (isSpillItNotesVideoTemplate) {
      const source = regenerateFabNotesContent();
      void handleRegenerateVideoTemplate2Video();
      void handleGenerateVideoTemplate2Description(source);
    } else if (isNightyParticleVideoTemplate) {
      setNightyParticleAccentColor((prev) => pickNightyParticleAccentColor(prev));
      setNightyParticleLines((prev) => {
        const next = { ...prev };
        if (prev.line2 === 'try pink noise' || prev.line2 === 'try triangle waves') {
          next.line2 = NIGHTY_PARTICLE_DEFAULT_LINES.line2;
        }
        if (
          prev.line3 ===
          "It's a colored noise that emits soft deep frequencies."
        ) {
          next.line3 = NIGHTY_PARTICLE_DEFAULT_LINES.line3;
        }
        return next;
      });
      setVideoOverlayCaption(nightyParticleLines.line1);
      void handleRegenerateVideoTemplate2Video();
      const lines = [
        nightyParticleLines.line1,
        nightyParticleLines.line2,
        nightyParticleLines.line3,
        nightyParticleLines.line4,
        nightyParticleLines.line5,
        nightyParticleLines.line6,
        nightyParticleLines.line7,
        nightyParticleLines.line8,
        nightyParticleLines.line9,
      ]
        .map((line) => line.trim())
        .filter(Boolean);
      void handleGenerateVideoTemplate2Description({
        cover: lines[0] ?? '',
        questions: lines.slice(1),
      });
    } else if (isNightyRainVideoTemplate) {
      setVideoOverlayCaption(NIGHTY_RAIN_CAPTION);
      setNightyRainSubline(NIGHTY_RAIN_CAPTION_SUBLINE);
      void handleRegenerateVideoTemplate2Video();
      void handleGenerateVideoTemplate2Description({
        cover: NIGHTY_RAIN_CAPTION,
        questions: [NIGHTY_RAIN_CAPTION_SUBLINE],
      });
    } else if (isOceanSunsetVideoTemplate) {
      const source = regenerateVideoTemplate4Content();
      void handleRegenerateVideoTemplate2Video();
      void handleGenerateVideoTemplate2Description(source);
    } else if (isCinematicCoverVideoTemplate) {
      const source = regenerateCinematicCoverContent();
      void handleRegenerateVideoTemplate2Video();
      void handleGenerateVideoTemplate2Description(source);
    } else if (isFreshBakedDonutVideoTemplate) {
      setFreshBakedDonutSelectedId(null);
    } else if (isFabAffirmationVideoTemplate) {
      const source = regenerateFabMontageContent();
      void fetchFabMontageVideos(false);
      void handleGenerateVideoTemplate2Description(source);
    } else {
      setVideoTemplate2PexelsVideoSrc(null);
      setVideoTemplate2PexelsPosterSrc(null);
      setVideoTemplate2VideoError(null);
    }
  }, [
    isCouplesNatureVideoTemplate,
    isSpillItNotesVideoTemplate,
    isNightyParticleVideoTemplate,
    isNightyRainVideoTemplate,
    isOceanSunsetVideoTemplate,
    isCinematicCoverVideoTemplate,
    isFreshBakedDonutVideoTemplate,
    isFabAffirmationVideoTemplate,
    selectedVideoTemplateId,
  ]);

  // Sync triangle-wave bed audio with Particle preview playback.
  useEffect(() => {
    if (!isNightyParticleVideoTemplate) {
      nightyParticleAudioRef.current?.pause();
      return;
    }
    const video = nightyParticleVideoRef.current;
    const audio = nightyParticleAudioRef.current;
    if (!video || !audio) return;

    const syncTime = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > 0.3) {
        try {
          audio.currentTime = video.currentTime;
        } catch {
          /* ignore seek errors while loading */
        }
      }
    };
    const onPlay = () => {
      syncTime();
      void audio.play().catch(() => {});
    };
    const onPause = () => {
      audio.pause();
    };
    const onSeeked = () => {
      try {
        audio.currentTime = video.currentTime;
      } catch {
        /* ignore */
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    if (!video.paused) onPlay();

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      audio.pause();
    };
  }, [isNightyParticleVideoTemplate, videoTemplate2PexelsVideoSrc, nightyParticleBedAudioSrc]);

  // Sync rain bed audio with Rain preview playback.
  useEffect(() => {
    if (!isNightyRainVideoTemplate) {
      nightyRainAudioRef.current?.pause();
      return;
    }
    const video = nightyRainVideoRef.current;
    const audio = nightyRainAudioRef.current;
    if (!video || !audio) return;

    const syncTime = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > 0.3) {
        try {
          audio.currentTime = video.currentTime;
        } catch {
          /* ignore seek errors while loading */
        }
      }
    };
    const onPlay = () => {
      syncTime();
      void audio.play().catch(() => {});
    };
    const onPause = () => {
      audio.pause();
    };
    const onSeeked = () => {
      try {
        audio.currentTime = video.currentTime;
      } catch {
        /* ignore */
      }
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    if (!video.paused) onPlay();

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      audio.pause();
    };
  }, [isNightyRainVideoTemplate, videoTemplate2PexelsVideoSrc, nightyRainBedAudioSrc]);

  // Cycle handled inside FabMontagePreview (keeps all clips mounted).

  useEffect(() => {
    if (mode !== 'video') {
      setVideoBackgroundUrl(null);
      setVideoThumbnailUrl(null);
      return;
    }
    if (!theme.trim()) {
      setVideoBackgroundUrl(null);
      setVideoThumbnailUrl(null);
      setVideoLoading(false);
      return;
    }
    let cancelled = false;
    setVideoLoading(true);
    const page = 1 + Math.floor(Math.random() * 20);
    fetch(`/api/pexels/video?query=${encodeURIComponent(theme)}&page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setVideoBackgroundUrl(null);
          setVideoThumbnailUrl(null);
          return;
        }
        setVideoBackgroundUrl(data.videoUrl ?? null);
        setVideoThumbnailUrl(data.thumbnailUrl ?? null);
        if (data.avgColor) {
          setBackgroundColor(data.avgColor);
          setCanvases((prev) => prev.map((c) => ({ ...c, backgroundColor: data.avgColor })));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVideoBackgroundUrl(null);
          setVideoThumbnailUrl(null);
        }
      })
      .finally(() => {
        if (!cancelled) setVideoLoading(false);
      });
    return () => { cancelled = true; };
  }, [mode, theme]);

  const handleChangeVideo = async () => {
    if (mode !== 'video' || !theme.trim()) return;
    const page = 1 + Math.floor(Math.random() * 20);
    setVideoLoading(true);
    try {
      const r = await fetch(`/api/pexels/video?query=${encodeURIComponent(theme)}&page=${page}`);
      const data = await r.json();
      if (data.error) {
        setVideoBackgroundUrl(null);
        setVideoThumbnailUrl(null);
        return;
      }
      setVideoBackgroundUrl(data.videoUrl ?? null);
      setVideoThumbnailUrl(data.thumbnailUrl ?? null);
      if (data.avgColor) {
        setBackgroundColor(data.avgColor);
        setCanvases((prev) => prev.map((c) => ({ ...c, backgroundColor: data.avgColor })));
      }
    } catch {
      setVideoBackgroundUrl(null);
      setVideoThumbnailUrl(null);
    } finally {
      setVideoLoading(false);
    }
  };

  useEffect(() => {
    if (isUpdatingFromUserInput.current) {
      isUpdatingFromUserInput.current = false;
      prevFirstCardTextRef.current = firstCardTextValue;
      return;
    }
    if (firstCardTextValue !== prevFirstCardTextRef.current && firstCardTextValue !== text) {
      setText(firstCardTextValue);
    }
    prevFirstCardTextRef.current = firstCardTextValue;
  }, [firstCardTextValue]);

  useEffect(() => {
    const canvas = canvases.find((c) => c.id === currentCanvasId) || canvases[0];
    if (!canvas) return;
    isSyncingFromCanvas.current = true;
    if (canvas.backgroundColor !== backgroundColor) setBackgroundColor(canvas.backgroundColor);
    if (canvas.textColor !== textColor) setTextColor(canvas.textColor);
    if (canvas.textSize !== textSize) setTextSize(canvas.textSize);
    if (canvas.imageSize !== imageSize) setImageSize(canvas.imageSize);
    setTimeout(() => { isSyncingFromCanvas.current = false; }, 0);
  }, [currentCanvasId, canvases]);

  useEffect(() => {
    const firstCardInCanvases = canvases.find((c) => c.id === '1');
    if (firstCardInCanvases && firstCardInCanvases.text !== text) {
      isUpdatingFromUserInput.current = true;
      setCanvases((prev) => prev.map((c) => (c.id === '1' ? { ...c, text } : c)));
    }
  }, [text]);

  useEffect(() => {
    if (isSyncingFromCanvas.current) return;
    setCanvases((prev) => {
      const currentCanvasInPrev = prev.find((c) => c.id === currentCanvasId);
      if (!currentCanvasInPrev) return prev;
      const hasChanges =
        currentCanvasInPrev.backgroundColor !== backgroundColor ||
        currentCanvasInPrev.textSize !== textSize ||
        currentCanvasInPrev.imageSize !== imageSize ||
        (currentCanvasId === '1' && currentCanvasInPrev.textColor !== textColor);
      if (!hasChanges) return prev;
      return prev.map((c) =>
        c.id === currentCanvasId
          ? { ...c, backgroundColor, textSize, imageSize, ...(currentCanvasId === '1' ? { textColor } : {}) }
          : c
      );
    });
  }, [backgroundColor, textColor, textSize, imageSize, currentCanvasId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/dog-images');
        if (!res.ok) return;
        const data: unknown = await res.json();
        if (
          cancelled ||
          !data ||
          typeof data !== 'object' ||
          !('urls' in data) ||
          !Array.isArray((data as { urls: unknown }).urls)
        ) {
          return;
        }
        setDogImagePool(filterDogIllustrationPool((data as { urls: string[] }).urls.filter((u) => typeof u === 'string')));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Template 1 can regenerate before dog images load, leaving `['', cta]` — Q1 then shows the CTA art.
  useEffect(() => {
    if (!isKawaiiImageTemplate || dogImagePool.length === 0) return;
    setImageTabSources((prev) => {
      if (!kawaiiTabSourcesNeedRepair(prev, kawaiiCtaImageSrc)) return prev;
      return buildKawaiiTabImageSources(dogImagePool, kawaiiCtaImageSrc);
    });
  }, [isKawaiiImageTemplate, dogImagePool, kawaiiCtaImageSrc]);

  useEffect(() => {
    if (!isBearsKawaiiImageTemplate) return;
    setImageTabSources((prev) => {
      if (!template6TabSourcesNeedRepair(prev)) return prev;
      return buildTemplate6TabImageSources();
    });
  }, [isBearsKawaiiImageTemplate]);


  useEffect(() => {
    if (contentTab !== 'video') {
      setSelectedVideoTemplateId(null);
    }
  }, [contentTab]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authCheck = await fetch('/api/tiktok/auth-check');
        const authData = await authCheck.json();
        if (authData.authenticated && authData.user) {
          setUserInfo(authData.user);
          try {
            const creatorInfoRes = await fetch('/api/tiktok/creator-info');
            const creatorInfoData = await creatorInfoRes.json();
            if (creatorInfoRes.ok && creatorInfoData.creator_info) setCreatorInfo(creatorInfoData.creator_info);
          } catch (err) {
            console.error('Failed to fetch creator info:', err);
          }
        } else {
          setUserInfo(null);
          setCreatorInfo(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tiktok_auth') === 'success') {
      checkAuth();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Instagram uses an env token (no OAuth round-trip) — just verify it works.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/instagram/auth-check');
        const data = (await res.json()) as {
          connected?: boolean;
          user?: { username: string };
          error?: string;
        };
        if (cancelled) return;
        setInstagramAccount(data.connected && data.user ? data.user : null);
        setInstagramError(data.error ?? null);
      } catch {
        if (!cancelled) setInstagramAccount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddCanvas = () => {
    const newId = String(Date.now());
    const newCanvas: CanvasData = { id: newId, text: text || '', backgroundColor: backgroundColor || '#000000', textColor: textColor || '#000000', textSize: textSize || '200', imageSize: imageSize || '1080x1920' };
    const endingCardIndex = canvases.findIndex((c) => c.id === 'end');
    if (endingCardIndex >= 0) {
      const newCanvases = [...canvases];
      newCanvases.splice(endingCardIndex, 0, newCanvas);
      setCanvases(newCanvases);
    } else {
      setCanvases([...canvases, newCanvas]);
    }
    setCurrentCanvasId(newId);
  };

  const handleSelectCanvas = (id: string) => setCurrentCanvasId(id);

  const handleDeleteCanvas = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === '1' || id === 'end' || canvases.length <= 3) return;
    const newCanvases = canvases.filter((c) => c.id !== id);
    setCanvases(newCanvases);
    if (id === currentCanvasId) setCurrentCanvasId(newCanvases[0].id);
  };

  const generateCardImage = async (canvasData: CanvasData): Promise<Blob> =>
    generateCardImageLib({ canvasData, mode, videoThumbnailUrl, card2Texts: [] });

  const randomIndex = (maxExclusive: number): number => {
    if (maxExclusive <= 0) return 0;
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const rand = new Uint32Array(1);
      crypto.getRandomValues(rand);
      return rand[0]! % maxExclusive;
    }
    return Math.floor(Math.random() * maxExclusive);
  };

  const shuffle = <T,>(arr: readonly T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const pickRandom = <T,>(arr: readonly T[]): T => arr[randomIndex(arr.length)]!;
  const activeConcreteQuestionType = (): ConcreteQuestionType =>
    automateQuestionType === 'random' ? activeQuestionTypeRef.current : automateQuestionType;

  const templateTitlePool =
    automateQuestionType === 'random'
      ? allTemplateTitlePools()
      : [...templateTitlePoolForType(automateQuestionType)];
  const pickTemplateHookTitle = (type?: ConcreteQuestionType): string => {
    const pool = type
      ? templateTitlePoolForType(type)
      : automateQuestionType === 'random'
        ? templateTitlePoolForType(activeQuestionTypeRef.current)
        : templateTitlePoolForType(automateQuestionType);
    return pickRandom([...pool]);
  };

  const handleGenerateDailyTikTok = async () => {
    setIsGeneratingDailyTikTok(true);
    try {
      if (selectedAppId === 'fab') {
        setAutomateResolvedQuestionType(null);
        setAutomateDailyTemplatePromptRaw(null);
        setAutomateDailyTemplatePrompt(null);
        setAutomateDailyTemplateReplacementText(null);

        let selectedMessagesThisRun: string[] | null = null;

        if (dailyGenIncludeQuestions) {
          const colors = shuffle([...FAB_PAPER_COLORS]).slice(0, 5);
          const messages = shuffle([...FAB_HEART_MESSAGES]).slice(0, 5);
          // Pad if pools were somehow short (shouldn't happen with 20 each).
          while (colors.length < 5) colors.push(pickRandom(FAB_PAPER_COLORS));
          while (messages.length < 5) messages.push(pickRandom(FAB_HEART_MESSAGES));

          const results = colors.map((color, i) =>
            fillFabHeartPaperPrompt(color, messages[i]!)
          );
          selectedMessagesThisRun = messages;
          // Store paper color in the "prompt" slot and affirmation in the "question" slot for retries.
          setAutomateDailyResults(results);
          setAutomateDailyRowPrompts(colors);
          setAutomateDailyRowQuestions(messages);
        }

        const questionsForApi =
          selectedMessagesThisRun && selectedMessagesThisRun.length === 5
            ? selectedMessagesThisRun.join('\n')
            : automateDailyRowQuestions && automateDailyRowQuestions.length === 5
              ? automateDailyRowQuestions.join('\n')
              : '';

        if ((dailyGenIncludeTitle || dailyGenIncludeCaption) && questionsForApi) {
          try {
            const copyRes = await fetch('/api/openai/daily-video-title', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ questions: questionsForApi, type: 'funny' }),
            });
            const copyData = await copyRes.json();
            if (copyRes.ok) {
              if (dailyGenIncludeTitle && typeof copyData?.title === 'string') {
                setAutomateDailyVideoTitle(copyData.title.trim());
              }
              if (dailyGenIncludeCaption && typeof copyData?.description === 'string') {
                setAutomateDailyTitle(copyData.description.trim());
              }
            }
          } catch {
            // keep previous title/caption
          }
        }

        setAutomateDailyIndex(0);
        return;
      }

      const resolvedType = resolveQuestionType(automateQuestionType);
      activeQuestionTypeRef.current = resolvedType;
      setAutomateResolvedQuestionType(resolvedType);
      const questionPool = questionPoolForType(resolvedType);
      let rawTemplatePromptForCover: string | null = null;
      let selectedQuestionsThisRun: string[] | null = null;

      if (dailyGenIncludeQuestions) {
        const needPrompts = 5;
        const excluded = lastDailyPromptRunRef.current;
        let promptPool = PROMPTS.filter((p) => !excluded.has(p));
        if (promptPool.length < needPrompts) {
          promptPool = [...PROMPTS];
        }
        const shuffledP = shuffle(promptPool);
        const selectedPrompts = shuffledP.slice(0, 5);
        rawTemplatePromptForCover = dailyGenIncludeCoverImage
          ? (() => {
              const used = new Set(selectedPrompts);
              const available = SPILL_IT_TEMPLATE_COVER_PROMPTS.filter((p) => !used.has(p));
              return pickRandom(
                available.length > 0 ? available : [...SPILL_IT_TEMPLATE_COVER_PROMPTS]
              );
            })()
          : null;

        const refSet = new Set<string>(selectedPrompts);
        if (rawTemplatePromptForCover) refSet.add(rawTemplatePromptForCover);
        lastDailyPromptRunRef.current = refSet;

        const qShuffled = shuffle([...questionPool]);
        const selectedQuestions = qShuffled.slice(0, 5);
        selectedQuestionsThisRun = selectedQuestions;
        const results = selectedPrompts.map((p, i) => p.replace(/\{x\}/g, selectedQuestions[i]!));
        setAutomateDailyResults(results);
        setAutomateDailyRowPrompts(selectedPrompts);
        setAutomateDailyRowQuestions(selectedQuestions);
        if (rawTemplatePromptForCover) {
          setAutomateDailyTemplatePromptRaw(rawTemplatePromptForCover);
        }
      } else if (dailyGenIncludeCoverImage) {
        const excluded = lastDailyPromptRunRef.current;
        let pool = SPILL_IT_TEMPLATE_COVER_PROMPTS.filter((p) => !excluded.has(p));
        if (pool.length < 1) pool = [...SPILL_IT_TEMPLATE_COVER_PROMPTS];
        rawTemplatePromptForCover = pickRandom(shuffle(pool));
        setAutomateDailyTemplatePromptRaw(rawTemplatePromptForCover);
        lastDailyPromptRunRef.current = new Set([rawTemplatePromptForCover]);
      }

      // Show cover as soon as prompt is ready (don't wait for title/caption APIs).
      if (dailyGenIncludeCoverImage && rawTemplatePromptForCover) {
        const templateReplacement = pickTemplateHookTitle(resolvedType).trim();
        const templateWithXReplaced = rawTemplatePromptForCover.replace(/\{x\}/g, templateReplacement);
        setAutomateDailyTemplateReplacementText(templateReplacement);
        setAutomateDailyTemplatePrompt(templateWithXReplaced);
      }

      const questionsForApi =
        selectedQuestionsThisRun && selectedQuestionsThisRun.length === 5
          ? selectedQuestionsThisRun.join('\n')
          : automateDailyRowQuestions && automateDailyRowQuestions.length === 5
            ? automateDailyRowQuestions.join('\n')
            : '';

      if ((dailyGenIncludeTitle || dailyGenIncludeCaption) && questionsForApi) {
        try {
          const copyRes = await fetch('/api/openai/daily-video-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: questionsForApi, type: resolvedType }),
          });
          const copyData = await copyRes.json();
          if (copyRes.ok) {
            if (dailyGenIncludeTitle && typeof copyData?.title === 'string') {
              setAutomateDailyVideoTitle(copyData.title.trim());
            }
            if (dailyGenIncludeCaption && typeof copyData?.description === 'string') {
              setAutomateDailyTitle(copyData.description.trim());
            }
          }
        } catch {
          // keep previous title/caption
        }
      }

      setAutomateDailyIndex(0);
    } finally {
      setIsGeneratingDailyTikTok(false);
    }
  };

  const handleRegenerateDailyVideoTitle = async () => {
    if (!automateDailyRowQuestions || automateDailyRowQuestions.length !== 5) return;
    const questionsForApi = automateDailyRowQuestions.join('\n');
    setIsRetryingDailyVideoTitle(true);
    try {
      const videoTitleRes = await fetch('/api/openai/daily-video-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questionsForApi,
          type: activeConcreteQuestionType(),
        }),
      });
      const videoTitleData = await videoTitleRes.json();
      if (videoTitleRes.ok && typeof videoTitleData?.title === 'string') {
        setAutomateDailyVideoTitle(videoTitleData.title.trim());
      } else if (videoTitleRes.ok && typeof videoTitleData?.text === 'string') {
        setAutomateDailyVideoTitle(videoTitleData.text.trim());
      }
    } catch {
      // keep previous title
    } finally {
      setIsRetryingDailyVideoTitle(false);
    }
  };

  const handleRegenerateDailyCaption = async () => {
    if (!automateDailyRowQuestions || automateDailyRowQuestions.length !== 5) return;
    const questionsForApi = automateDailyRowQuestions.join('\n');
    setIsRetryingDailyCaption(true);
    try {
      const captionRes = await fetch('/api/openai/daily-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: questionsForApi,
          type: activeConcreteQuestionType(),
        }),
      });
      const captionData = await captionRes.json();
      if (captionRes.ok && typeof captionData?.description === 'string') {
        setAutomateDailyTitle(captionData.description.trim());
      } else if (captionRes.ok && typeof captionData?.text === 'string') {
        setAutomateDailyTitle(captionData.text.trim());
      }
    } catch {
      // keep previous caption
    } finally {
      setIsRetryingDailyCaption(false);
    }
  };

  const handleGetRandomTemplatePrompt = () => {
    const used = new Set<string>(automateDailyRowPrompts ?? []);
    if (automateDailyTemplatePromptRaw) used.add(automateDailyTemplatePromptRaw);
    const candidates = SPILL_IT_TEMPLATE_COVER_PROMPTS.filter((p) => !used.has(p));
    const prompt =
      candidates.length > 0
        ? pickRandom(candidates)
        : pickRandom([...SPILL_IT_TEMPLATE_COVER_PROMPTS]);
    setAutomateDailyTemplatePromptRaw(prompt);
    setAutomateDailyTemplatePrompt(prompt);
    setAutomateDailyTemplateReplacementText(null);
  };

  const handleRetryTemplatePrompt = async () => {
    setIsRetryingTemplatePrompt(true);
    try {
      const usedPrompts = new Set<string>(automateDailyRowPrompts ?? []);
      if (automateDailyTemplatePromptRaw) usedPrompts.add(automateDailyTemplatePromptRaw);
      const promptCandidates = SPILL_IT_TEMPLATE_COVER_PROMPTS.filter((p) => !usedPrompts.has(p));
      const rawTemplatePrompt =
        promptCandidates.length > 0
          ? pickRandom(promptCandidates)
          : pickRandom([...SPILL_IT_TEMPLATE_COVER_PROMPTS]);
      setAutomateDailyTemplatePromptRaw(rawTemplatePrompt);
      const templateReplacement = pickTemplateHookTitle().trim();
      const templateWithXReplaced = rawTemplatePrompt.replace(/\{x\}/g, templateReplacement);
      setAutomateDailyTemplateReplacementText(templateReplacement);
      setAutomateDailyTemplatePrompt(templateWithXReplaced);
    } finally {
      setIsRetryingTemplatePrompt(false);
    }
  };

  const handleRetryTemplatePromptOnly = () => {
    const raw = automateDailyTemplatePromptRaw;
    const replacement = automateDailyTemplateReplacementText;
    if (!raw?.trim() || !replacement?.trim()) return;

    const usedPrompts = new Set<string>(automateDailyRowPrompts ?? []);
    usedPrompts.add(raw);
    const promptCandidates = SPILL_IT_TEMPLATE_COVER_PROMPTS.filter((p) => !usedPrompts.has(p));
    const newPrompt =
      promptCandidates.length > 0
        ? pickRandom(promptCandidates)
        : pickRandom([...SPILL_IT_TEMPLATE_COVER_PROMPTS]);
    setAutomateDailyTemplatePromptRaw(newPrompt);
    setAutomateDailyTemplatePrompt(newPrompt.replace(/\{x\}/g, replacement));
  };

  const handleRetryTemplateQuestionOnly = async () => {
    const raw = automateDailyTemplatePromptRaw;
    if (!raw?.trim()) return;

    setIsRetryingTemplateQuestion(true);
    try {
      const newReplacement = pickTemplateHookTitle().trim();
      setAutomateDailyTemplateReplacementText(newReplacement);
      setAutomateDailyTemplatePrompt(raw.replace(/\{x\}/g, newReplacement));
    } finally {
      setIsRetryingTemplateQuestion(false);
    }
  };

  const handleSetTemplateQuestion = (question: string) => {
    const raw = automateDailyTemplatePromptRaw;
    if (!raw?.trim()) return;
    setAutomateDailyTemplateReplacementText(question);
    setAutomateDailyTemplatePrompt(raw.replace(/\{x\}/g, question));
  };

  const handleSetTemplatePrompt = (prompt: string) => {
    const replacement = automateDailyTemplateReplacementText;
    if (!prompt?.trim() || !replacement?.trim()) return;
    setAutomateDailyTemplatePromptRaw(prompt);
    setAutomateDailyTemplatePrompt(prompt.replace(/\{x\}/g, replacement));
  };

  const handleEditTemplatePromptText = (text: string) => {
    setAutomateDailyTemplatePrompt(text);
  };

  const handleEditDailyResultText = (index: number, text: string) => {
    setAutomateDailyResults((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = text;
      return next;
    });
  };

  const handleRetryDailyItem = (index: number) => {
    if (selectedAppId === 'fab') {
      if (
        !automateDailyRowPrompts ||
        !automateDailyRowQuestions ||
        automateDailyRowPrompts.length !== 5 ||
        automateDailyRowQuestions.length !== 5
      ) {
        setAutomateDailyResults((prev) => {
          if (!prev) return prev;
          const next = [...prev];
          next[index] = fillFabHeartPaperPrompt(
            pickRandom(FAB_PAPER_COLORS),
            pickRandom(FAB_HEART_MESSAGES)
          );
          return next;
        });
        return;
      }
      const usedColors = new Set(automateDailyRowPrompts.filter((_, i) => i !== index));
      const usedMessages = new Set(automateDailyRowQuestions.filter((_, i) => i !== index));
      const colorCandidates = FAB_PAPER_COLORS.filter((c) => !usedColors.has(c));
      const messageCandidates = FAB_HEART_MESSAGES.filter((m) => !usedMessages.has(m));
      const color = colorCandidates.length > 0 ? pickRandom(colorCandidates) : pickRandom(FAB_PAPER_COLORS);
      const message =
        messageCandidates.length > 0 ? pickRandom(messageCandidates) : pickRandom(FAB_HEART_MESSAGES);
      const nextColors = [...automateDailyRowPrompts];
      const nextMessages = [...automateDailyRowQuestions];
      nextColors[index] = color;
      nextMessages[index] = message;
      setAutomateDailyRowPrompts(nextColors);
      setAutomateDailyRowQuestions(nextMessages);
      setAutomateDailyResults((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next[index] = fillFabHeartPaperPrompt(color, message);
        return next;
      });
      return;
    }

    const questionPool = questionPoolForType(activeConcreteQuestionType());
    if (
      !automateDailyRowPrompts ||
      !automateDailyRowQuestions ||
      automateDailyRowPrompts.length !== 5 ||
      automateDailyRowQuestions.length !== 5
    ) {
      setAutomateDailyResults((prev) => {
        if (!prev) return prev;
        const prompt = pickRandom(PROMPTS);
        const question = pickRandom(questionPool);
        const next = [...prev];
        next[index] = prompt.replace(/\{x\}/g, question);
        return next;
      });
      return;
    }

    const usedPrompts = new Set(automateDailyRowPrompts.filter((_, i) => i !== index));
    if (automateDailyTemplatePromptRaw) usedPrompts.add(automateDailyTemplatePromptRaw);
    const usedQuestions = new Set(automateDailyRowQuestions.filter((_, i) => i !== index));

    const promptCandidates = PROMPTS.filter((p) => !usedPrompts.has(p));
    const questionCandidates = questionPool.filter((q) => !usedQuestions.has(q));
    const prompt = promptCandidates.length > 0 ? pickRandom(promptCandidates) : pickRandom(PROMPTS);
    const question = questionCandidates.length > 0 ? pickRandom(questionCandidates) : pickRandom(questionPool);

    const nextPrompts = [...automateDailyRowPrompts];
    const nextQuestions = [...automateDailyRowQuestions];
    nextPrompts[index] = prompt;
    nextQuestions[index] = question;
    setAutomateDailyRowPrompts(nextPrompts);
    setAutomateDailyRowQuestions(nextQuestions);
    setAutomateDailyResults((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = prompt.replace(/\{x\}/g, question);
      return next;
    });
  };

  const handleRetryDailyPromptOnly = (index: number) => {
    if (
      !automateDailyRowPrompts ||
      !automateDailyRowQuestions ||
      automateDailyRowPrompts.length !== 5 ||
      automateDailyRowQuestions.length !== 5
    ) {
      return;
    }

    if (selectedAppId === 'fab') {
      const currentMessage = automateDailyRowQuestions[index]!;
      const usedColors = new Set(automateDailyRowPrompts.filter((_, i) => i !== index));
      usedColors.add(automateDailyRowPrompts[index]!);
      const colorCandidates = FAB_PAPER_COLORS.filter((c) => !usedColors.has(c));
      const color = colorCandidates.length > 0 ? pickRandom(colorCandidates) : pickRandom(FAB_PAPER_COLORS);
      const nextColors = [...automateDailyRowPrompts];
      nextColors[index] = color;
      setAutomateDailyRowPrompts(nextColors);
      setAutomateDailyResults((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next[index] = fillFabHeartPaperPrompt(color, currentMessage);
        return next;
      });
      return;
    }

    const currentQuestion = automateDailyRowQuestions[index]!;
    const usedPrompts = new Set(automateDailyRowPrompts.filter((_, i) => i !== index));
    usedPrompts.add(automateDailyRowPrompts[index]!);
    if (automateDailyTemplatePromptRaw) usedPrompts.add(automateDailyTemplatePromptRaw);
    const promptCandidates = PROMPTS.filter((p) => !usedPrompts.has(p));
    const prompt = promptCandidates.length > 0 ? pickRandom(promptCandidates) : pickRandom(PROMPTS);

    const nextPrompts = [...automateDailyRowPrompts];
    nextPrompts[index] = prompt;
    setAutomateDailyRowPrompts(nextPrompts);
    setAutomateDailyResults((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = prompt.replace(/\{x\}/g, currentQuestion);
      return next;
    });
  };

  const handleSetDailyPromptAtIndex = (index: number, prompt: string) => {
    if (
      !automateDailyRowPrompts ||
      !automateDailyRowQuestions ||
      automateDailyRowPrompts.length !== 5 ||
      automateDailyRowQuestions.length !== 5
    ) {
      return;
    }
    const currentQuestion = automateDailyRowQuestions[index]!;
    const nextPrompts = [...automateDailyRowPrompts];
    nextPrompts[index] = prompt;
    setAutomateDailyRowPrompts(nextPrompts);
    setAutomateDailyResults((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] =
        selectedAppId === 'fab'
          ? fillFabHeartPaperPrompt(prompt, currentQuestion)
          : prompt.replace(/\{x\}/g, currentQuestion);
      return next;
    });
  };

  const handleRetryDailyQuestionOnly = (index: number) => {
    if (
      !automateDailyRowPrompts ||
      !automateDailyRowQuestions ||
      automateDailyRowPrompts.length !== 5 ||
      automateDailyRowQuestions.length !== 5
    ) {
      return;
    }

    if (selectedAppId === 'fab') {
      const currentColor = automateDailyRowPrompts[index]!;
      const usedMessages = new Set(automateDailyRowQuestions.filter((_, i) => i !== index));
      usedMessages.add(automateDailyRowQuestions[index]!);
      const messageCandidates = FAB_HEART_MESSAGES.filter((m) => !usedMessages.has(m));
      const message =
        messageCandidates.length > 0 ? pickRandom(messageCandidates) : pickRandom(FAB_HEART_MESSAGES);
      const nextMessages = [...automateDailyRowQuestions];
      nextMessages[index] = message;
      setAutomateDailyRowQuestions(nextMessages);
      setAutomateDailyResults((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next[index] = fillFabHeartPaperPrompt(currentColor, message);
        return next;
      });
      return;
    }

    const questionPool = questionPoolForType(activeConcreteQuestionType());
    const currentPrompt = automateDailyRowPrompts[index]!;
    const usedQuestions = new Set(automateDailyRowQuestions.filter((_, i) => i !== index));
    usedQuestions.add(automateDailyRowQuestions[index]!);
    const questionCandidates = questionPool.filter((q) => !usedQuestions.has(q));
    const question = questionCandidates.length > 0 ? pickRandom(questionCandidates) : pickRandom(questionPool);

    const nextQuestions = [...automateDailyRowQuestions];
    nextQuestions[index] = question;
    setAutomateDailyRowQuestions(nextQuestions);
    setAutomateDailyResults((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = currentPrompt.replace(/\{x\}/g, question);
      return next;
    });
  };

  const handleSetDailyQuestionAtIndex = (index: number, question: string) => {
    if (
      !automateDailyRowPrompts ||
      !automateDailyRowQuestions ||
      automateDailyRowPrompts.length !== 5 ||
      automateDailyRowQuestions.length !== 5
    ) {
      return;
    }
    const currentPrompt = automateDailyRowPrompts[index]!;
    const nextQuestions = [...automateDailyRowQuestions];
    nextQuestions[index] = question;
    setAutomateDailyRowQuestions(nextQuestions);
    setAutomateDailyResults((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] =
        selectedAppId === 'fab'
          ? fillFabHeartPaperPrompt(currentPrompt, question)
          : currentPrompt.replace(/\{x\}/g, question);
      return next;
    });
  };

  const pollGeminiBatchCoverImages = async (jobName: string): Promise<Record<string, string>> => {
    const maxAttempts = 360;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetch(`/api/openai/cover-image/batch?jobName=${encodeURIComponent(jobName)}`);
      const data = (await res.json()) as {
        error?: string;
        done?: boolean;
        images?: Record<string, string>;
      };
      if (!res.ok) throw new Error(data.error || 'Batch poll failed');
      if (data.done) {
        if (data.error) throw new Error(data.error);
        if (!data.images || Object.keys(data.images).length === 0) {
          throw new Error('Batch completed with no images');
        }
        return data.images;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
    throw new Error('Batch image generation timed out');
  };

  const fetchCoverImagesBatch = async (
    items: { key: string; questiontext: string }[],
    coverPromptId: string
  ): Promise<Record<string, string>> => {
    const batchRes = await fetch('/api/openai/cover-image/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((it) => ({ key: it.key, questiontext: it.questiontext, promptId: coverPromptId })),
      }),
    });
    const batchData = (await batchRes.json()) as { jobName?: string; error?: string };
    if (batchRes.ok && batchData.jobName) {
      return pollGeminiBatchCoverImages(batchData.jobName);
    }

    const images: Record<string, string> = {};
    for (const item of items) {
      const coverRes = await fetch('/api/openai/cover-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questiontext: item.questiontext, promptId: coverPromptId }),
      });
      const coverData = (await coverRes.json()) as { imageUrl?: string };
      if (coverRes.ok && coverData?.imageUrl) images[item.key] = coverData.imageUrl;
    }
    return images;
  };

  const handleAutoGenerate = async (coverPromptId: string, categories: string[] = []) => {
    const count = Math.min(20, Math.max(1, parseInt(automateCount, 10) || 5));
    setIsAutoGenerating(true);

    const categoriesParam = categories.length > 0 ? `?categories=${encodeURIComponent(categories.join(','))}` : '';
    const existingCard1 = canvases.find((c) => c.id === '1') || canvases[0];
    const endingCard = canvases.find((c) => c.id === 'end');

    type SetMeta = {
      setIndex: number;
      ln: string;
      titleText: string;
      questions: string[];
    };

    const prepareSetMeta = async (setIndex: number): Promise<SetMeta> => {
      const separator = categoriesParam ? '&' : '?';
      const response = await fetch(`/api/levels/random${categoriesParam}${separator}_=${setIndex}-${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch random level');
      const result = await response.json();
      if (!result.success || !result.data) throw new Error('Invalid response from API');
      const { levelName: ln, categoryName, questions } = result.data;
      const contextParts: string[] = [];
      if (ln) contextParts.push(`Level: ${ln}`);
      if (categoryName) contextParts.push(`Category: ${categoryName}`);
      if (Array.isArray(questions) && questions.length) {
        contextParts.push('Questions:');
        questions.forEach((q: string) => contextParts.push(`- ${q}`));
      }
      const context = contextParts.join('\n\n');
      let titleText = categoryName || '';
      try {
        const titleRes = await fetch('/api/openai/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context, level: ln }),
        });
        const titleData = await titleRes.json();
        if (titleRes.ok && titleData?.title?.trim()) titleText = titleData.title.trim();
      } catch {
        /* keep category title */
      }
      return { setIndex, ln: ln || '', titleText, questions: questions || [] };
    };

    const renderSetFiles = async (
      meta: SetMeta,
      thumbnailUrl: string | null
    ): Promise<Array<{ filename: string; blob: Blob }>> => {
      const { setIndex, ln, titleText, questions } = meta;
      let avgColor = backgroundColor || '#000000';
      if (thumbnailUrl) {
        const extracted = await extractDominantColor(thumbnailUrl);
        if (extracted) avgColor = extracted;
        else avgColor = CARD_BG_FALLBACK_PALETTE[setIndex % CARD_BG_FALLBACK_PALETTE.length]!;
      } else if (avgColor === '#000000' || !avgColor?.trim()) {
        avgColor = CARD_BG_FALLBACK_PALETTE[setIndex % CARD_BG_FALLBACK_PALETTE.length]!;
      }

      const questionCards: CanvasData[] = questions.map((q: string) => ({
        id: `set${setIndex}-q-${Date.now()}-${Math.random()}`,
        text: q,
        backgroundColor: avgColor,
        textColor: '#000000',
        textSize: textSize || '200',
        imageSize: imageSize || '1080x1920',
      }));
      let endingCardText = '';
      if (ln && ln.toLowerCase() === 'friends') {
        endingCardText = 'Share it with your friends and see what they say';
      } else if (ln && ln.toLowerCase() === 'couples') {
        endingCardText = 'Share it with your boo and see what they say';
      }
      const newCanvases: CanvasData[] = [
        { ...existingCard1, id: `set${setIndex}-1`, text: titleText, backgroundColor: avgColor },
        ...questionCards,
        endingCard
          ? { ...endingCard, id: `set${setIndex}-end`, text: endingCardText, backgroundColor: avgColor }
          : {
              id: `set${setIndex}-end`,
              text: endingCardText,
              backgroundColor: avgColor,
              textColor: '#FFFFFF',
              textSize: '200',
              imageSize: '1080x1920',
            },
      ];
      const endIdx = newCanvases.findIndex((c) => c.id === `set${setIndex}-end`);
      if (endIdx >= 0) newCanvases[endIdx].text = endingCardText;

      const blobs = await Promise.all(
        newCanvases.map((c, i) => {
          const libId = i === 0 ? '1' : i === newCanvases.length - 1 ? 'end' : '3';
          return generateCardImageLib({
            canvasData: { ...c, id: libId },
            mode: 'video',
            videoThumbnailUrl: i === 0 ? thumbnailUrl : null,
            card2Texts: [],
          });
        })
      );
      return blobs.map((blob, i) => ({ filename: `set-${setIndex + 1}-card-${i + 1}.png`, blob }));
    };

    try {
      const metas = await Promise.all(Array.from({ length: count }, (_, i) => prepareSetMeta(i)));
      const coverItems = metas.map((m) => ({
        key: `set-${m.setIndex}`,
        questiontext: m.titleText,
      }));
      const coverImages = await fetchCoverImagesBatch(coverItems, coverPromptId);
      const allSets = await Promise.all(
        metas.map((meta) => renderSetFiles(meta, coverImages[`set-${meta.setIndex}`] ?? null))
      );
      const zip = new JSZip();
      for (const files of allSets) {
        for (const { filename, blob } of files) {
          zip.file(filename, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bleamies-automate-${count}-sets.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error auto-generating cards:', error);
      alert('Failed to generate cards. Please try again.');
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const imageBlobs: Array<{ blob: Blob; filename: string }> = [];
      for (let i = 0; i < canvases.length; i++) {
        const blob = await generateCardImage(canvases[i]);
        imageBlobs.push({ blob, filename: `tiktok-image-card-${i + 1}.png` });
      }
      const zip = new JSZip();
      imageBlobs.forEach(({ blob, filename }) => zip.file(filename, blob));
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bleameis-cards.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating images:', error);
      alert('Failed to generate images. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePostToTikTok = async () => {
    const canvasText = currentCanvas.text || text;
    if (!canvasText.trim()) { alert('Please enter some text'); return; }
    if (!userInfo) { alert('Please connect your TikTok account first'); return; }
    if (!postTitle.trim()) { alert('Please enter a title for your post'); return; }
    if (!postPrivacy) { alert('Please select a privacy status for your post'); return; }
    if (!musicUsageConsent) {
      alert(contentDisclosureEnabled && isBrandedContent ? "Please agree to TikTok's Branded Content Policy and Music Usage Confirmation before posting" : "Please agree to TikTok's Music Usage Confirmation before posting");
      return;
    }
    if (contentDisclosureEnabled && !isYourBrand && !isBrandedContent) {
      alert('You need to indicate if your content promotes yourself, a third party, or both.');
      return;
    }
    if (contentDisclosureEnabled && isBrandedContent && postPrivacy === 'SELF_ONLY') {
      alert('Branded content visibility cannot be set to private. Please select public or friends visibility.');
      return;
    }
    setIsPosting(true);
    try {
      setShowUserDropdown(false);
      const currentIndex = canvases.findIndex((c) => c.id === currentCanvasId);
      const imageBlob = await generateCardImage(currentCanvas);
      const formData = new FormData();
      formData.append('image', imageBlob, 'card.png');
      formData.append('caption', postTitle);
      formData.append('privacy_level', postPrivacy);
      formData.append('disable_comment', (!allowComment).toString());
      if (contentDisclosureEnabled) {
        formData.append('brand_organic_toggle', isYourBrand.toString());
        formData.append('brand_content_toggle', isBrandedContent.toString());
      }
      const response = await fetch('/api/tiktok/post-photo', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) {
        if (data.rateLimited || response.status === 429) {
          alert(data.error || 'You cannot make more posts at this moment. Please try again later.');
          return;
        }
        if (data.requiresReauth) {
          alert('Please reconnect your TikTok account to grant photo upload permissions.');
          window.location.href = '/api/tiktok/auth';
          return;
        }
        throw new Error(data.error || 'Failed to post to TikTok');
      }
      const currentPublishId = data.data?.publish_id;
      if (currentPublishId) setPublishId(currentPublishId);
      setPostStatus('processing');
      setToastMessage('Your content is being processed. It may take a few minutes to appear on your profile.');
      setShowToast(true);
      if (currentPublishId) pollPostStatus(currentPublishId);
      else {
        setTimeout(() => { setPostStatus('success'); setToastMessage('Posted successfully! It may take a few minutes to appear on your profile.'); }, 2000);
        setTimeout(() => { setShowToast(false); setPostStatus(null); }, 8000);
      }
    } catch (error: unknown) {
      console.error('Error posting to TikTok:', error);
      alert(error instanceof Error ? error.message : 'Failed to post to TikTok. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const pollPostStatus = async (pubId: string) => {
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 3000;
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/tiktok/post-status?publish_id=${encodeURIComponent(pubId)}`);
        const statusData = await response.json();
        if (response.ok && statusData.status) {
          if (statusData.status === 'PUBLISH_COMPLETE') {
            setPostStatus('success');
            setToastMessage('Posted successfully! Your content is now visible on your profile.');
            setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 5000);
            return;
          }
          if (statusData.status === 'FAILED') {
            setPostStatus('failed');
            setToastMessage(statusData.fail_reason || 'Post failed. Please try again.');
            setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 8000);
            return;
          }
          setToastMessage(`Processing... ${statusData.status_msg || 'Your content is being processed.'}`);
        }
        attempts++;
        if (attempts < maxAttempts) setTimeout(checkStatus, pollInterval);
        else {
          setPostStatus('success');
          setToastMessage('Your content has been submitted. It may take a few minutes to appear on your profile.');
          setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 5000);
        }
      } catch {
        setPostStatus('success');
        setToastMessage('Your content has been submitted. It may take a few minutes to appear on your profile.');
        setTimeout(() => { setShowToast(false); setPostStatus(null); setPublishId(null); }, 5000);
      }
    };
    setTimeout(checkStatus, pollInterval);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/tiktok/logout', { method: 'POST' });
      setUserInfo(null);
      setShowUserDropdown(false);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const canPost =
    !!currentCanvas.text.trim() &&
    !!userInfo &&
    !!postTitle.trim() &&
    !!postPrivacy &&
    musicUsageConsent &&
    !(contentDisclosureEnabled && !isYourBrand && !isBrandedContent) &&
    !(contentDisclosureEnabled && isBrandedContent && postPrivacy === 'SELF_ONLY');
const imageFrameTitleLine1 = 'Questions to ask your';
  const imageFrameTitleLine2 = 'boyfriend tonight <3';
  const imageFrameCtaText = 'Remember to like, save and share the fun!';
  const refreshImageTemplate8PinterestCover = async () => {
    pinterestCoverAbortRef.current?.abort();
    const controller = new AbortController();
    pinterestCoverAbortRef.current = controller;
    setIsImageTemplate7CoverLoading(true);
    setImageTemplate7CoverError(null);
    try {
      const query = pickRandomPinterestQuery(
        IMAGE_TEMPLATE8_PINTEREST_QUERIES,
        template8LastCoverQueryRef.current
      );
      const result = await fetchPinterestCoverImage({
        query,
        exclude: [
          ...template8RecentCoverUrlsRef.current,
          imageTabSources[0] ?? '',
        ],
        poolSize: PINTEREST_COVER_CANDIDATE_POOL,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      template8LastCoverQueryRef.current = query;
      template8RecentCoverUrlsRef.current = rememberPinterestCoverUrl(
        template8RecentCoverUrlsRef.current,
        result.originalUrl || result.imageUrl
      );
      setImageTabSources([result.imageUrl]);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setImageTemplate7CoverError(
        e instanceof Error ? e.message : 'Failed to fetch Pinterest image'
      );
    } finally {
      if (pinterestCoverAbortRef.current === controller) {
        setIsImageTemplate7CoverLoading(false);
      }
    }
  };
  const refreshImageTemplate9PinterestCover = async () => {
    pinterestCoverAbortRef.current?.abort();
    const controller = new AbortController();
    pinterestCoverAbortRef.current = controller;
    setIsImageTemplate7CoverLoading(true);
    setImageTemplate7CoverError(null);
    try {
      const query = pickRandomPinterestQuery(
        IMAGE_TEMPLATE9_PINTEREST_QUERIES,
        template9LastCoverQueryRef.current
      );
      const result = await fetchPinterestCoverImage({
        query,
        exclude: [
          ...template9RecentCoverUrlsRef.current,
          imageTabSources[0] ?? '',
        ],
        poolSize: PINTEREST_COVER_CANDIDATE_POOL,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      template9LastCoverQueryRef.current = query;
      template9RecentCoverUrlsRef.current = rememberPinterestCoverUrl(
        template9RecentCoverUrlsRef.current,
        result.originalUrl || result.imageUrl
      );
      setImageTabSources([result.imageUrl]);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setImageTemplate7CoverError(
        e instanceof Error ? e.message : 'Failed to fetch Pinterest image'
      );
    } finally {
      if (pinterestCoverAbortRef.current === controller) {
        setIsImageTemplate7CoverLoading(false);
      }
    }
  };
  const refreshImageTemplate7PinterestCover = async (templateId?: number | null) => {
    pinterestCoverAbortRef.current?.abort();
    const controller = new AbortController();
    pinterestCoverAbortRef.current = controller;
    setIsImageTemplate7CoverLoading(true);
    setImageTemplate7CoverError(null);
    const tid = templateId ?? selectedImageTemplateId;
    const isTemplate10 = isCouplesCuteMomentsImageTemplateId(tid);
    const isTemplate11 = isCelebrityCouplesImageTemplateId(tid);
    const usesSingleQueryPool = isTemplate11;
    const coverQuery = isTemplate10
      ? IMAGE_TEMPLATE10_PINTEREST_QUERY
      : isTemplate11
        ? IMAGE_TEMPLATE11_PINTEREST_QUERY
        : IMAGE_TEMPLATE7_PINTEREST_QUERY;
    const questionQueries = isTemplate11
      ? IMAGE_TEMPLATE11_PINTEREST_QUESTION_QUERIES
      : IMAGE_TEMPLATE7_PINTEREST_QUESTION_QUERIES;
    try {
      if (isTemplate10) {
        const cover = await fetchPinterestSearchImages({
          query: coverQuery,
          count: 1,
          exclude: imageTabSources[0] ?? '',
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const coverUrl = cover.images[0]?.imageUrl?.trim();
        if (!coverUrl) throw new Error('Failed to fetch Pinterest cover image');
        setImageTabSources([
          coverUrl,
          ...pickImageTemplate10QuestionSources(imageTabSources.slice(1)),
        ]);
        return;
      }
      if (usesSingleQueryPool) {
        // One shared search — assign distinct pins to cover + Q1–Q5.
        const pool = await fetchPinterestSearchImages({
          query: coverQuery,
          count: IMAGE_TEMPLATE7_TAB_COUNT + PINTEREST_COVER_CANDIDATE_POOL * 2,
          exclude: imageTabSources,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const urls = pickDistinctPinterestImageUrls(
          pool.images,
          IMAGE_TEMPLATE7_TAB_COUNT
        );
        if (urls.length < IMAGE_TEMPLATE7_TAB_COUNT) {
          throw new Error('Failed to fetch enough unique Pinterest images');
        }
        setImageTabSources(urls);
        return;
      }

      const questionExclude = imageTabSources.slice(1, IMAGE_TEMPLATE7_TAB_COUNT);
      const [cover, ...questionPools] = await Promise.all([
        fetchPinterestSearchImages({
          query: coverQuery,
          count: 1,
          exclude: imageTabSources[0] ?? '',
          signal: controller.signal,
        }),
        ...questionQueries.map((query) =>
          fetchPinterestSearchImages({
            query,
            count: IMAGE_TEMPLATE7_QUESTION_COUNT + PINTEREST_COVER_CANDIDATE_POOL,
            exclude: questionExclude,
            signal: controller.signal,
          }).catch((e) => {
            if (e instanceof DOMException && e.name === 'AbortError') throw e;
            return { images: [], query };
          })
        ),
      ]);
      if (controller.signal.aborted) return;
      const coverUrl = cover.images[0]?.imageUrl?.trim();
      if (!coverUrl) throw new Error('Failed to fetch Pinterest cover image');
      const questionUrls = pickMixedPinterestQuestionUrls(
        questionPools.map((pool) => pool.images),
        IMAGE_TEMPLATE7_QUESTION_COUNT,
        [coverUrl]
      );
      if (questionUrls.length < IMAGE_TEMPLATE7_QUESTION_COUNT) {
        throw new Error('Failed to fetch enough unique Pinterest question images');
      }
      setImageTabSources([
        coverUrl,
        ...questionUrls.slice(0, IMAGE_TEMPLATE7_QUESTION_COUNT),
      ]);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setImageTemplate7CoverError(
        e instanceof Error ? e.message : 'Failed to fetch Pinterest image'
      );
    } finally {
      if (pinterestCoverAbortRef.current === controller) {
        setIsImageTemplate7CoverLoading(false);
      }
    }
  };

  /** Refresh only the currently selected tab’s Pinterest background. */
  const refreshActivePinterestImage = async () => {
    const tid = selectedImageTemplateId;
    if (tid === null) return;

    if (isCouplesSelfieImageTemplateId(tid)) {
      await refreshImageTemplate8PinterestCover();
      return;
    }
    if (isTopDownSelfieImageTemplateId(tid)) {
      await refreshImageTemplate9PinterestCover();
      return;
    }
    if (!isPinterestCoverImageTemplateId(tid)) return;

    const tabIndex = selectedImageBrowserTab;
    if (tabIndex < 0 || tabIndex >= IMAGE_TEMPLATE7_TAB_COUNT) return;

    pinterestCoverAbortRef.current?.abort();
    const controller = new AbortController();
    pinterestCoverAbortRef.current = controller;
    setIsImageTemplate7CoverLoading(true);
    setImageTemplate7CoverError(null);

    const isTemplate10 = isCouplesCuteMomentsImageTemplateId(tid);
    const isTemplate11 = isCelebrityCouplesImageTemplateId(tid);
    if (isTemplate10 && tabIndex >= 1) {
      setImageTabSources((current) => {
        const next = Array.from(
          { length: IMAGE_TEMPLATE7_TAB_COUNT },
          (_, i) => current[i] ?? ''
        );
        const shuffled = pickImageTemplate10QuestionSources(next.slice(1));
        return [next[0] ?? '', ...shuffled];
      });
      return;
    }
    const coverQuery = isTemplate10
      ? IMAGE_TEMPLATE10_PINTEREST_QUERY
      : isTemplate11
        ? IMAGE_TEMPLATE11_PINTEREST_QUERY
        : IMAGE_TEMPLATE7_PINTEREST_QUERY;
    const questionQueries = isTemplate11
      ? IMAGE_TEMPLATE11_PINTEREST_QUESTION_QUERIES
      : IMAGE_TEMPLATE7_PINTEREST_QUESTION_QUERIES;
    const query =
      tabIndex === 0
        ? coverQuery
        : pickRandomPinterestQuery([...questionQueries]);

    try {
      const exclude = imageTabSources.filter((_, i) => i !== tabIndex);
      const result = await fetchPinterestCoverImage({
        query,
        exclude: [...exclude, imageTabSources[tabIndex] ?? ''],
        poolSize: PINTEREST_COVER_CANDIDATE_POOL,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const nextUrl = result.imageUrl?.trim();
      if (!nextUrl) throw new Error('Failed to fetch Pinterest image');
      setImageTabSources((current) => {
        const next = Array.from(
          { length: IMAGE_TEMPLATE7_TAB_COUNT },
          (_, i) => current[i] ?? ''
        );
        next[tabIndex] = nextUrl;
        return next;
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setImageTemplate7CoverError(
        e instanceof Error ? e.message : 'Failed to fetch Pinterest image'
      );
    } finally {
      if (pinterestCoverAbortRef.current === controller) {
        setIsImageTemplate7CoverLoading(false);
      }
    }
  };
  const regenerateImageTemplateContent = (
    templateId?: number,
    options?: { resetTab?: boolean }
  ) => {
    const tid = templateId ?? selectedImageTemplateId;
    const isKawaii = selectedAppId === 'spill-it' && tid === 1;
    const isBearsKawaii = selectedAppId === 'spill-it' && tid === 6;
    const isPinterestCover =
      selectedAppId === 'spill-it' && isPinterestCoverImageTemplateId(tid);
    const isCouplesSelfie =
      selectedAppId === 'spill-it' && isCouplesSelfieImageTemplateId(tid);
    const isTopDownSelfie =
      selectedAppId === 'spill-it' && isTopDownSelfieImageTemplateId(tid);
    const isPastel = selectedAppId === 'spill-it' && tid === 2;
    if (options?.resetTab !== false) {
      setSelectedImageBrowserTab(0);
    }

    if (isPastel) {
      // Resolve Random once so label, title, and questions all share the same type.
      // On Random, avoid repeating the current type so Retry visibly changes it.
      const type =
        imageTemplate2QuestionType === 'random'
          ? pickDifferentRandomQuestionType(concreteTypeFromImageLabel(imageTabTypeLabel))
          : imageTemplate2QuestionType;
      const title = pickTitleForType(type);
      const questions = pickQuestionsForType(type, 5);
      const pastelPool = shuffleCopy([...IMAGE_TEMPLATE2_PASTEL_COLORS]);
      // One distinct pastel per slide, including cover.
      const pastels = Array.from({ length: 6 }, (_, i) => pastelPool[i % pastelPool.length]!);
      setImageTabPastelBgs(pastels);
      setImageTabFrameBg(pastels[0]!);
      setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS[type]);
      setImageTabFunnyQuestions(questions);
      setImageTabTexts([title, ...questions]);
      setImageTabSources(['', '', '', '', '', '']);
      setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
      return;
    }

    if (isTopDownSelfie) {
      const title = pickTitleForType('funny');
      const questions = pickQuestionsForType('funny', 5);
      setImageTabFunnyQuestions(questions);
      setImageTabFrameBg('#000000');
      setImageTabPastelBgs([]);
      setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS.funny);
      setImageTabTexts([title, ...questions]);
      setImageTemplate9TitleAnchor(pickImageTemplate9TitleAnchor());
      setImageTabSources([(imageTabSources[0] ?? '').trim()]);
      void refreshImageTemplate9PinterestCover();
      return;
    }

    if (isCouplesSelfie) {
      const title = pickTitleForType('funny');
      const questions = pickQuestionsForType('funny', 5);
      setImageTabFunnyQuestions(questions);
      setImageTabFrameBg('#000000');
      setImageTabPastelBgs([]);
      setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS.funny);
      setImageTabTexts([title, ...questions]);
      setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
      setImageTabSources([(imageTabSources[0] ?? '').trim()]);
      void refreshImageTemplate8PinterestCover();
      return;
    }

    if (isPinterestCover) {
      const isTemplate10 = isCouplesCuteMomentsImageTemplateId(tid);
      const title = isTemplate10
        ? pickTitleForType('funny')
        : pickRandomDailyFunnyTitle(imageTabTexts[0]);
      const picked = [...FUNNY_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
      setImageTabFunnyQuestions(picked);
      setImageTabFrameBg('#000000');
      setImageTabPastelBgs([]);
      setImageTabTypeLabel(
        isTemplate10 ? IMAGE_TEMPLATE2_TYPE_LABELS.funny : 'Funny Questions'
      );
      setImageTabTexts([title, ...picked]);
      setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
      setImageTabSources(
        isTemplate10
          ? [
              (imageTabSources[0] ?? '').trim(),
              ...pickImageTemplate10QuestionSources(imageTabSources.slice(1)),
            ]
          : Array.from(
              { length: IMAGE_TEMPLATE7_TAB_COUNT },
              (_, i) => imageTabSources[i] ?? ''
            )
      );
      void refreshImageTemplate7PinterestCover(tid);
      return;
    }

    if (isBearsKawaii) {
      const type =
        imageTemplate6QuestionType === 'random'
          ? pickDifferentRandomQuestionType(concreteTypeFromImageLabel(imageTabTypeLabel))
          : imageTemplate6QuestionType;
      const title = pickTitleForType(type);
      const questions = pickQuestionsForType(type, 5);
      setImageTabFrameBg(IMAGE_TEMPLATE6_FRAME_BG);
      setImageTabPastelBgs([]);
      setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS[type]);
      setImageTabFunnyQuestions(questions);
      setImageTabSources(buildTemplate6TabImageSources());
      setImageTabTexts([title, ...questions]);
      setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
      return;
    }

    if (selectedAppId === 'spill-it' && isImageTemplate16Id(tid)) {
      const title = pickTitleForType(
        'funny',
        selectedImageTemplateId === 16 ? imageTabTexts[0] : undefined
      );
      const questions = pickQuestionsForType('funny', IMAGE_TEMPLATE16_QUESTION_COUNT);
      setImageTabFunnyQuestions(questions);
      setImageTabFrameBg(IMAGE_TEMPLATE16_BG);
      setImageTabPastelBgs([]);
      setImageTabTypeLabel('Funny Questions');
      setImageTabSources(Array.from({ length: IMAGE_TEMPLATE16_SLIDE_COUNT }, () => ''));
      setImageTabTexts([title, ...questions]);
      return;
    }

    if (selectedAppId === 'spill-it' && isImageTemplate14Id(tid)) {
      const title = pickTitleForType(
        'funny',
        selectedImageTemplateId === 14 ? imageTabTexts[0] : undefined
      );
      const questions = pickQuestionsForType('funny', 5);
      setImageTabFunnyQuestions(questions);
      setImageTabFrameBg(
        nextTemplate14Color(selectedImageTemplateId === 14 ? imageTabFrameBg : '')
      );
      setImageTabPastelBgs([]);
      setImageTabTypeLabel('Funny Questions');
      setImageTabSources(['', '', '', '', '', '']);
      setImageTabTexts([title, ...questions]);
      return;
    }

    if (selectedAppId === 'spill-it' && isImageTemplate13Id(tid)) {
      template12RunRef.current += 1;
      setIsGeneratingTemplate12(false);
      setTemplate12Status('');
      setTemplate12Error(null);
      const questions = pickQuestionsForType('funny', 5);
      const screenText = nextTemplate13CoverText(
        selectedImageTemplateId === 13 ? imageTabTexts[0] : ''
      );
      const nextCoverMode = template13CoverModeRef.current === 'photo' ? 'text' : 'photo';
      template13CoverModeRef.current = nextCoverMode;
      setImageTabFunnyQuestions(questions);
      setImageTabFrameBg(IMAGE_TEMPLATE13_BG);
      setImageTabPastelBgs([]);
      setImageTabTypeLabel('Funny Questions');
      setImageTabSources([
        nextCoverMode === 'photo' ? IMAGE_TEMPLATE13_COVER_SRC : '',
        '',
        '',
        '',
        '',
        '',
      ]);
      setImageTabTexts([screenText, ...questions]);
      return;
    }

    const isCouplesDoodle = selectedAppId === 'spill-it' && isGeneratedCoupleSlideTemplateId(tid);
    if (isCouplesDoodle) {
      template12RunRef.current += 1;
      setIsGeneratingTemplate12(false);
      setTemplate12Status('');
      setTemplate12Error(null);
      const title = pickRandomDailyFunnyTitle(imageTabTexts[0]);
      const questions = pickQuestionsForType('funny', 5);
      setImageTabFunnyQuestions(questions);
      setImageTabFrameBg(IMAGE_TEMPLATE12_FRAME_BG);
      setImageTabPastelBgs([]);
      setImageTabTypeLabel('Funny Questions');
      setImageTabSources(Array.from({ length: IMAGE_TEMPLATE12_SLIDE_COUNT }, () => ''));
      setImageTabTexts([title, ...questions]);
      return;
    }

    const picked = [...FUNNY_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setImageTabFunnyQuestions(picked);
    setImageTabFrameBg('#FEFEFE');
    setImageTabPastelBgs([]);
    setImageTabTypeLabel('Funny Questions');
    if (isKawaii) {
      const title = pickRandomDailyFunnyTitle(imageTabTexts[0]);
      setImageTabSources(buildKawaiiTabImageSources(dogImagePool, kawaiiCtaImageSrc));
      setImageTabTexts([title, ...picked, imageFrameCtaText]);
      setImageTemplate2CoverSubtitle((current) => pickRandomImageTemplate2CoverSubtitle(current));
    } else {
      setImageTabTexts([`${imageFrameTitleLine1}\n${imageFrameTitleLine2}`, ...picked, imageFrameCtaText]);
      setImageTabSources(dogImagePool.length ? pickDogUrlsWithoutReuseUntilDeckExhausted(dogImagePool, 7) : []);
    }
  };
  const getDefaultImageFrameTextForTab = (tabIndex: number): string =>
    tabIndex === 0
      ? isBearsKawaiiImageTemplate
        ? pickTitleForType(concreteTypeFromImageLabel(imageTabTypeLabel))
        : isCouplesCuteMomentsImageTemplate || isNotesQuestionsImageTemplate
          ? pickTitleForType('funny')
          : isKawaiiLayoutImageTemplate || isPinterestCoverImageTemplate
          ? pickRandomDailyFunnyTitle()
          : `${imageFrameTitleLine1}\n${imageFrameTitleLine2}`
      : tabIndex >= 1 && tabIndex <= 5
        ? imageTabFunnyQuestions[tabIndex - 1] || ''
        : imageFrameCtaText;
  const getImageFrameTextForTab = (tabIndex: number): string =>
    imageTabTexts[tabIndex] ?? getDefaultImageFrameTextForTab(tabIndex);

  const handleStartTemplate12 = async () => {
    if (isGeneratingTemplate12) return;
    const slides = Array.from({ length: IMAGE_TEMPLATE12_SLIDE_COUNT }, (_, index) =>
      getImageFrameTextForTab(index).trim()
    );
    if (slides.some((text) => !text)) {
      setTemplate12Error('Add a cover title and five questions before starting.');
      return;
    }
    const runId = ++template12RunRef.current;
    const scenes = pickTemplate12Scenes(IMAGE_TEMPLATE12_SLIDE_COUNT);
    setIsGeneratingTemplate12(true);
    setTemplate12Error(null);
    setTemplate12Status(`Generating slides… 0 of ${slides.length}`);
    setImageTabSources(Array.from({ length: IMAGE_TEMPLATE12_SLIDE_COUNT }, () => ''));
    try {
      let finished = 0;
      await Promise.all(
        slides.map(async (slideText, index) => {
          const res = await fetch('/api/openai/template-12-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                slideText,
                scene: scenes[index],
                quality: template12Quality,
              }),
            }
          );
          const data = (await res.json()) as { imageUrl?: string; error?: string };
          if (template12RunRef.current !== runId) return;
          if (!res.ok || !data.imageUrl) {
            throw new Error(data.error || 'Failed to generate image');
          }
          finished += 1;
          setTemplate12Status(`Generating slides… ${finished} of ${slides.length}`);
          setImageTabSources((current) => {
            const next = Array.from(
              { length: IMAGE_TEMPLATE12_SLIDE_COUNT },
              (_, slot) => current[slot] ?? ''
            );
            next[index] = data.imageUrl!;
            return next;
          });
        })
      );
    } catch (e) {
      if (template12RunRef.current !== runId) return;
      setTemplate12Error(e instanceof Error ? e.message : 'Failed to generate image');
    } finally {
      if (template12RunRef.current === runId) {
        setIsGeneratingTemplate12(false);
        setTemplate12Status('');
      }
    }
  };
  const handleStartTemplate13Cover = async () => {
    if (isGeneratingTemplate12) return;
    const screenText = (imageTabTexts[0] ?? '').trim() || IMAGE_TEMPLATE13_DEFAULT_SCREEN_TEXT;
    const runId = ++template12RunRef.current;
    setIsGeneratingTemplate12(true);
    setTemplate12Error(null);
    setTemplate12Status('Generating cover…');
    try {
      const res = await fetch('/api/openai/template-13-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenText, quality: template12Quality }),
      });
      const data = (await res.json()) as { imageUrl?: string; error?: string };
      if (template12RunRef.current !== runId) return;
      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || 'Failed to generate the cover');
      }
      setImageTabSources((current) => {
        const next = Array.from({ length: IMAGE_TEMPLATE13_SLIDE_COUNT }, (_, slot) => current[slot] ?? '');
        next[0] = data.imageUrl!;
        return next;
      });
    } catch (e) {
      if (template12RunRef.current !== runId) return;
      setTemplate12Error(e instanceof Error ? e.message : 'Failed to generate the cover');
    } finally {
      if (template12RunRef.current === runId) {
        setIsGeneratingTemplate12(false);
        setTemplate12Status('');
      }
    }
  };
  const getImageSourceForTab = (tabIndex: number): string =>
    imageTabSources[tabIndex] ??
    (dogImagePool.length ? dogImagePool[tabIndex % dogImagePool.length]! : '');
  // URL restores the selected template on refresh, but tab texts live only in memory.
  // Fill them once when empty so question slides don't show blank/`...` placeholders.
  useEffect(() => {
    if (!urlReady) return;
    if (contentTab !== 'image' || selectedImageTemplateId === null) return;
    if (imageTabTexts.length > 0) return;
    regenerateImageTemplateContent(selectedImageTemplateId, { resetTab: false });
  }, [urlReady, contentTab, selectedImageTemplateId, imageTabTexts.length]);

  // Ask ChatGPT which title word to underline (curiosity hook) for Image Template 2 cover.
  useEffect(() => {
    if (!isPastelCarouselImageTemplate) {
      setImageTemplate2HighlightWord(null);
      return;
    }
    if (!imageTemplate2CoverSquiggleEnabled) {
      setImageTemplate2HighlightWord(null);
      return;
    }
    const title = (imageTabTexts[0] ?? '').trim();
    if (!title) {
      setImageTemplate2HighlightWord(null);
      return;
    }

    setImageTemplate2HighlightWord(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch('/api/openai/highlight-word', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
            signal: controller.signal,
          });
          const data = (await res.json()) as { word?: string; error?: string };
          if (!res.ok || typeof data.word !== 'string' || !data.word.trim()) {
            return;
          }
          setImageTemplate2HighlightWord(data.word.trim());
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') return;
        }
      })();
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [isPastelCarouselImageTemplate, imageTemplate2CoverSquiggleEnabled, imageTabTexts[0]]);

  // Template 1 / 7 cover — same highlight-word API as Image Template 2 (not template 10).
  useEffect(() => {
    if (
      (!isKawaiiLayoutImageTemplate && !isPinterestCoverImageTemplate) ||
      isCouplesCuteMomentsImageTemplate
    ) {
      setImageTemplate1HighlightWord(null);
      return;
    }
    const title = (imageTabTexts[0] ?? '').trim();
    if (!title) {
      setImageTemplate1HighlightWord(null);
      return;
    }

    setImageTemplate1HighlightWord(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetchTitleHighlightWord(title, controller.signal).then((word) => {
        if (word) setImageTemplate1HighlightWord(word);
      });
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    isKawaiiLayoutImageTemplate,
    isPinterestCoverImageTemplate,
    isCouplesCuteMomentsImageTemplate,
    imageTabTexts[0],
  ]);

  useEffect(() => {
    setVideoTemplate2HighlightWord(null);
  }, [isCouplesNatureVideoTemplate]);

  const imageFrameTextForActiveTab = getImageFrameTextForTab(selectedImageBrowserTab);
  const imageTemplate2TitleHighlightParts =
    isPastelCarouselImageTemplate &&
    selectedImageBrowserTab === 0 &&
    imageTemplate2CoverSquiggleEnabled
      ? splitTitleAroundHighlight(imageFrameTextForActiveTab, imageTemplate2HighlightWord)
      : null;
  const imageTemplate1SquiggleColor = isBearsKawaiiImageTemplate
    ? IMAGE_TEMPLATE6_HIGHLIGHT_COLOR
    : squiggleColorForBackground(imageTabFrameBg);
  const imageTemplate1HighlightTextColor = TITLE_HIGHLIGHT_TEXT_COLOR;
  const imageTemplate1TitleHighlightParts =
    (isKawaiiLayoutImageTemplate || isPinterestCoverImageTemplate) &&
    !isCouplesCuteMomentsImageTemplate &&
    selectedImageBrowserTab === 0
      ? splitTitleAroundHighlight(imageFrameTextForActiveTab, imageTemplate1HighlightWord)
      : null;
  const isCtaTabSelected = selectedImageBrowserTab === imageTemplateCtaTabIndex;
  const isFullBleedImageTabSelected = isCtaTabSelected;
  const kawaiiIllustrationForActiveTab = isBearsKawaiiImageTemplate
    ? template6BearImageForTab(selectedImageBrowserTab, imageTabSources)
    : kawaiiDogImageForTab(selectedImageBrowserTab, imageTabSources, dogImagePool);
  const imageSourceForActiveTab = isCtaTabSelected
    ? isPastelCarouselImageTemplate
      ? pastelCtaImageSrc
      : kawaiiCtaImageSrc
    : isKawaiiLayoutImageTemplate
      ? kawaiiIllustrationForActiveTab
      : getImageSourceForTab(selectedImageBrowserTab);
  const imageTabLabelForActiveTab =
    selectedImageBrowserTab === 0
      ? 'Cover'
      : selectedImageBrowserTab <= imageTemplateQuestionCount
        ? `Q${selectedImageBrowserTab}`
        : 'CTA';
  const pastelProgressRatio = (selectedImageBrowserTab + 1) / imageTemplateTabCount;
  const activeImageFrameBg = isPastelCarouselImageTemplate
    ? (imageTabPastelBgs[selectedImageBrowserTab] ??
      IMAGE_TEMPLATE2_PASTEL_COLORS[
        selectedImageBrowserTab % IMAGE_TEMPLATE2_PASTEL_COLORS.length
      ]!)
    : imageTabFrameBg;
  const imageTemplate2SquiggleColor = squiggleColorForBackground(activeImageFrameBg);
  const activeVideoTemplate =
    contentTab === 'video' && selectedVideoTemplateId !== null
      ? videoTemplateCards.find((c) => c.id === selectedVideoTemplateId)
      : undefined;
  const template2PlaybackVideoSrc =
    usesPexelsVideoBackground
      ? (videoTemplate2PexelsVideoSrc ?? activeVideoTemplate?.videoSrc ?? null)
      : (activeVideoTemplate?.videoSrc ?? null);
  const template2PlaybackPosterSrc =
    usesPexelsVideoBackground
      ? (videoTemplate2PexelsPosterSrc ?? activeVideoTemplate?.coverSrc)
      : activeVideoTemplate?.coverSrc;
  const template2ExportVideoSrc =
    usesPexelsVideoBackground && videoTemplate2PexelsVideoSrc
      ? pexelsVideoProxySrc(videoTemplate2PexelsVideoSrc)
      : (activeVideoTemplate?.videoSrc ?? null);

  // Pexels Videos API has no avg_color — sample the poster with the same grade + dim as preview.
  useEffect(() => {
    if (!isCouplesNatureVideoTemplate) {
      setVideoTemplate2HighlightBg(null);
      return;
    }
    const poster = template2PlaybackPosterSrc;
    if (!poster) {
      setVideoTemplate2HighlightBg(null);
      return;
    }

    let cancelled = false;
    void sampleCouplesNatureHighlightBackground(poster).then((bg) => {
      if (!cancelled) setVideoTemplate2HighlightBg(bg);
    });
    return () => {
      cancelled = true;
    };
  }, [isCouplesNatureVideoTemplate, template2PlaybackPosterSrc]);

  useEffect(() => {
    if (!isCouplesNatureVideoTemplate) return;
    warmCouplesNatureVideoBlob(template2ExportVideoSrc ?? template2PlaybackVideoSrc);
  }, [isCouplesNatureVideoTemplate, template2ExportVideoSrc, template2PlaybackVideoSrc]);

  const couplesNatureExportExtras = {
    highlightWord: null,
    highlightBackground: videoTemplate2HighlightBg,
  };

  const generateImageFrameExportEntries = async (options?: {
    kawaiiNumSets?: number;
    templateId?: number;
  }): Promise<{
    entries: { path: string; blob: Blob }[];
    isKawaiiTemplate: boolean;
    kawaiiNumSets?: number;
  }> => {
    const KAWAII_DOWNLOAD_NUM_SETS = options?.kawaiiNumSets ?? KAWAII_DOWNLOAD_SETS;
    const exportTemplateId = options?.templateId ?? selectedImageTemplateId;
    if (exportTemplateId === 13) {
      const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5'] as const;
      const frameWidth = 1080;
      const frameHeight = 1440;
      const coverSrc = (imageTabSources[0] ?? '').trim();
      const coverBitmap = coverSrc
        ? await createImageBitmap(await (await fetch(coverSrc)).blob())
        : null;
      const renderSlide = async (tabIndex: number): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to prepare the slide');
        if (tabIndex === 0 && coverBitmap) {
          const scale = Math.max(
            frameWidth / coverBitmap.width,
            frameHeight / coverBitmap.height
          );
          const drawW = coverBitmap.width * scale;
          const drawH = coverBitmap.height * scale;
          ctx.drawImage(
            coverBitmap,
            (frameWidth - drawW) / 2,
            (frameHeight - drawH) / 2,
            drawW,
            drawH
          );
        } else {
          const question = (imageTabTexts[tabIndex] ?? '').trim();
          ctx.fillStyle = IMAGE_TEMPLATE13_BG;
          ctx.fillRect(0, 0, frameWidth, frameHeight);
          drawTemplate13ProgressBar(
            ctx,
            frameWidth,
            frameHeight,
            template13ProgressRatio(tabIndex, IMAGE_TEMPLATE13_SLIDE_COUNT)
          );
          const fontSize = Math.round(
            frameWidth *
              (tabIndex === 0 ? IMAGE_TEMPLATE13_COVER_SIZE : IMAGE_TEMPLATE13_QUESTION_SIZE)
          );
          try {
            await document.fonts.load(`${IMAGE_TEMPLATE13_FONT_WEIGHT} ${fontSize}px "Playfair Display"`);
          } catch {
            /* font may already be ready */
          }
          ctx.font = `${IMAGE_TEMPLATE13_FONT_WEIGHT} ${fontSize}px ${IMAGE_TEMPLATE13_FONT_STACK}`;
          ctx.letterSpacing = IMAGE_TEMPLATE13_LETTER_SPACING;
          ctx.fillStyle = IMAGE_TEMPLATE13_TEXT;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const lines = wrapText(ctx, question, frameWidth * IMAGE_TEMPLATE13_TEXT_WIDTH);
          const lineHeight = fontSize * 1.3;
          const startY = frameHeight / 2 - ((lines.length - 1) * lineHeight) / 2;
          lines.forEach((line, lineIndex) => {
            ctx.fillText(line, frameWidth / 2, startY + lineIndex * lineHeight);
          });
          if (tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX) {
            const searchFontSize = Math.round(frameWidth * IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO);
            try {
              await document.fonts.load(
                `${IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT} ${searchFontSize}px "TikTok Sans"`
              );
            } catch {
              /* font may already be ready */
            }
            drawImageTemplate8Q5SearchLabel(ctx, frameWidth, frameHeight, '"TikTok Sans", system-ui, sans-serif');
            const banner = await new Promise<HTMLImageElement>((resolve, reject) => {
              const el = new Image();
              el.onload = () => resolve(el);
              el.onerror = () => reject(new Error('Failed to load the app banner'));
              el.src = IMAGE_TEMPLATE8_Q5_BANNER_SRC;
            });
            drawImageTemplate8Q5Banner(ctx, frameWidth, frameHeight, banner);
          }
        }
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to export the slide'));
          }, 'image/png');
        });
      };
      const entries = [];
      for (let i = 0; i < IMAGE_TEMPLATE13_SLIDE_COUNT; i++) {
        entries.push({
          path: `template-13-${names[i]}.png`,
          blob: await renderSlide(i),
        });
      }
      coverBitmap?.close();
      return { entries, isKawaiiTemplate: false };
    }
    if (exportTemplateId === 14) {
      const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5'] as const;
      const frameWidth = 1080;
      const frameHeight = 1440;
      const backgroundColor = imageTabFrameBg;
      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Failed to load a Template 14 image'));
          el.src = src;
        });
      const [grain, promo] = await Promise.all([
        loadImage(IMAGE_TEMPLATE14_GRAIN_SRC),
        loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC),
      ]);
      try {
        await document.fonts.load('400 72px "Libre Baskerville"');
        await document.fonts.load('700 48px "TikTok Sans"');
      } catch {
        /* fonts may already be ready */
      }
      const entries = [];
      for (let i = 0; i < names.length; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to prepare the slide');
        paintTemplate14Slide(ctx, frameWidth, frameHeight, {
          backgroundColor,
          text: (imageTabTexts[i] ?? '').trim(),
          tabIndex: i,
          grain,
          promo,
        });
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((next) => {
            if (next) resolve(next);
            else reject(new Error('Failed to export the slide'));
          }, 'image/png');
        });
        entries.push({ path: `template-14-${names[i]}.png`, blob });
      }
      return { entries, isKawaiiTemplate: false };
    }
    if (exportTemplateId === 16) {
      const names = ['cover', 'q1', 'q2', 'q3', 'q4'] as const;
      const frameWidth = 1080;
      const frameHeight = 1440;
      const loadImage = (src: string, label: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error(`Failed to load ${label}`));
          el.src = src;
        });
      const [icon, promo] = await Promise.all([
        loadImage(IMAGE_TEMPLATE16_ICON_SRC, 'the Spill It icon'),
        loadImage(IMAGE_TEMPLATE2_Q5_PROMO_SRC, 'the App Store image'),
      ]);
      const entries = [];
      for (let i = 0; i < IMAGE_TEMPLATE16_SLIDE_COUNT; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to prepare the slide');
        paintTemplate16Slide(ctx, frameWidth, frameHeight, {
          text: (imageTabTexts[i] ?? '').trim(),
          tabIndex: i,
          icon,
          promo: i === IMAGE_TEMPLATE16_QUESTION_COUNT ? promo : null,
        });
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((next) => {
            if (next) resolve(next);
            else reject(new Error('Failed to export the slide'));
          }, 'image/png');
        });
        entries.push({ path: `template-16-${names[i] ?? `q${i}`}.png`, blob });
      }
      return { entries, isKawaiiTemplate: false };
    }
    if (exportTemplateId === 12) {
      const names = ['cover', 'q1', 'q2', 'q3', 'q4', 'q5'] as const;
      const sources = imageTabSources.slice(0, IMAGE_TEMPLATE12_SLIDE_COUNT);
      if (sources.length < IMAGE_TEMPLATE12_SLIDE_COUNT || sources.some((src) => !src?.trim())) {
        throw new Error('Click Start to generate the cover and questions first.');
      }
      const compositeTemplate12Q5Promo = async (source: Blob): Promise<Blob> => {
        const bitmap = await createImageBitmap(source);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to prepare the Q5 image');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const promo = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Failed to load the App Store image'));
          el.src = IMAGE_TEMPLATE2_Q5_PROMO_SRC;
        });
        const promoWidth = canvas.width * IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO;
        const promoHeight = canvas.height * IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO;
        const promoX = (canvas.width - promoWidth) / 2;
        const promoY = canvas.height - promoHeight;
        const scale = Math.max(
          promoWidth / promo.naturalWidth,
          promoHeight / promo.naturalHeight
        );
        const drawW = promo.naturalWidth * scale;
        const drawH = promo.naturalHeight * scale;
        ctx.save();
        ctx.beginPath();
        ctx.rect(promoX, promoY, promoWidth, promoHeight);
        ctx.clip();
        ctx.drawImage(promo, promoX + (promoWidth - drawW) / 2, promoY, drawW, drawH);
        ctx.restore();
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((next) => {
            if (next) resolve(next);
            else reject(new Error('Failed to export the Q5 image'));
          }, 'image/png');
        });
      };
      const generatedEntries: { path: string; blob: Blob }[] = [];
      for (let i = 0; i < IMAGE_TEMPLATE12_SLIDE_COUNT; i++) {
        const response = await fetch(sources[i]!);
        if (!response.ok) throw new Error(`Failed to read the ${names[i]} image`);
        let blob = await response.blob();
        if (exportTemplateId === 12 && i === IMAGE_TEMPLATE2_Q5_TAB_INDEX) {
          blob = await compositeTemplate12Q5Promo(blob);
        }
        blob = await stripImageMetadata(blob);
        generatedEntries.push({
          path: `template-${exportTemplateId}-${names[i]}.jpg`,
          blob,
        });
      }
      return { entries: generatedEntries, isKawaiiTemplate: false };
    }
    type ImageExportSlotData = { tabTexts: string[]; tabSources: string[] };

    const frameWidth = 1080;
    const frameHeight = 1440; // 3:4
    const renderFrameBlob = async (tabIndex: number, slots?: ImageExportSlotData | null): Promise<Blob> => {
      const textForTab = (i: number) =>
        slots?.tabTexts[i] ?? imageTabTexts[i] ?? getDefaultImageFrameTextForTab(i);
      const sourceForTab = (i: number) => {
        if (exportTemplateId === 1) {
          if (i === IMAGE_TEMPLATE2_Q5_TAB_INDEX) return '';
          const merged = slots?.tabSources ?? imageTabSources;
          return kawaiiDogImageForTab(i, merged, dogImagePool);
        }
        if (exportTemplateId === 6) {
          if (i === IMAGE_TEMPLATE2_Q5_TAB_INDEX) return '';
          const merged = slots?.tabSources ?? imageTabSources;
          return template6BearImageForTab(i, merged);
        }
        if (
          exportTemplateId === 7 ||
          exportTemplateId === 8 ||
          exportTemplateId === 9 ||
          exportTemplateId === 10 ||
          exportTemplateId === 11
        ) {
          return slots?.tabSources[i] ?? imageTabSources[i] ?? '';
        }
        return (
          slots?.tabSources[i] ??
          imageTabSources[i] ??
          (dogImagePool.length ? dogImagePool[i % dogImagePool.length]! : '')
        );
      };

      const isPastelExport = exportTemplateId === 2;
      const exportTextColor =
        exportTemplateId === 6 ? IMAGE_TEMPLATE6_TEXT_COLOR : imageFrameExportTextColorDefault;
      // Template 1 / 2 / 6 / 7 / 8 / 9 / 10 / 11 have no CTA slide; their last tab is Q5.
      const exportCtaTabIndex =
        exportTemplateId === 2 ||
        isKawaiiNoCtaTemplateId(exportTemplateId) ||
        exportTemplateId === 7 ||
        exportTemplateId === 8 ||
        exportTemplateId === 9 ||
        exportTemplateId === 10 ||
        exportTemplateId === 11
          ? -1
          : 6;
      /** Cover + questions (+ CTA where the template has one) — drives the progress bar. */
      const exportSlideTotal =
        exportTemplateId === 7 ||
        exportTemplateId === 10 ||
        exportTemplateId === 11
          ? IMAGE_TEMPLATE7_TAB_COUNT
          : exportTemplateId === 2 ||
              exportTemplateId === 8 ||
              exportTemplateId === 9 ||
              isKawaiiNoCtaTemplateId(exportTemplateId)
            ? 6
            : 7;
      const isFullBleedTab = tabIndex === exportCtaTabIndex;
      const frameWidth = 1080;
      const frameHeight = 1440;

      const wrapLines = (
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
      ): string[] => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return [];
        const lines: string[] = [];
        let current = words[0]!;
        for (let i = 1; i < words.length; i++) {
          const next = `${current} ${words[i]}`;
          if (ctx.measureText(next).width <= maxWidth) current = next;
          else {
            lines.push(current);
            current = words[i]!;
          }
        }
        if (current) lines.push(current);
        return lines;
      };

      const canvas = document.createElement('canvas');
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      if (exportTemplateId === 8 || exportTemplateId === 9) {
        if (tabIndex === 0) {
          const coverSource = sourceForTab(0).trim();
          if (!coverSource) {
            throw new Error('Pinterest image is still loading. Wait a moment, then try again.');
          }
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, frameWidth, frameHeight);
          const coverImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.crossOrigin = 'anonymous';
            el.onload = () => {
              if (el.naturalWidth < 1 || el.naturalHeight < 1) {
                reject(new Error('Invalid image dimensions'));
                return;
              }
              resolve(el);
            };
            el.onerror = () =>
              reject(new Error(`Failed to load image: ${coverSource.slice(0, 80)}`));
            el.src = coverSource;
          });
          const coverScale = Math.max(frameWidth / coverImg.width, frameHeight / coverImg.height);
          const coverW = coverImg.width * coverScale;
          const coverH = coverImg.height * coverScale;
          ctx.drawImage(
            coverImg,
            (frameWidth - coverW) / 2,
            (frameHeight - coverH) / 2,
            coverW,
            coverH
          );
          if (exportTemplateId === 8) {
            try {
              await document.fonts.load(
                `${IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT} ${Math.round(frameWidth * IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO)}px "TikTok Sans"`
              );
              await document.fonts.load(
                `${IMAGE_TEMPLATE2_COVER_SUBTITLE_WEIGHT} ${Math.round(frameWidth * IMAGE_TEMPLATE10_COVER_SUBTITLE_SIZE_RATIO)}px "TikTok Sans"`
              );
            } catch {
              /* font may already be ready */
            }
            drawImageTemplate2CoverSlide(ctx, frameWidth, frameHeight, {
              backgroundColor: '#000000',
              skipBackground: true,
              title: textForTab(0),
              highlightWord: null,
              fontFamily: pastelCarouselExportFontFamily,
              textColor: '#FFFFFF',
              showProgress: false,
              footer: '',
              subtitle: imageTemplate2CoverSubtitle,
              maxTextWidthRatio: IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO,
              titleSizeRatio: IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO,
              subtitleSizeRatio: IMAGE_TEMPLATE10_COVER_SUBTITLE_SIZE_RATIO,
            });
          } else {
            try {
              await document.fonts.load(
                `${IMAGE_TEMPLATE9_TITLE_WEIGHT} ${Math.round(frameWidth * IMAGE_TEMPLATE9_TITLE_SIZE_RATIO)}px "TikTok Sans"`
              );
            } catch {
              /* font may already be ready */
            }
            drawImageTemplate9Title(ctx, frameWidth, frameHeight, {
              title: textForTab(0),
              anchor: imageTemplate9TitleAnchor,
              fontFamily: pastelCarouselExportFontFamily,
              textColor: '#FFFFFF',
            });
          }
        } else {
          // Template 8 / 9 Q1–Q5: iMessage thread + Q5 search CTA.
          drawImageTemplate3ImessageSlide(
            ctx,
            frameWidth,
            frameHeight,
            textForTab(tabIndex),
            []
          );
          if (tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX) {
            const searchFontSize = Math.round(
              frameWidth * IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO
            );
            try {
              await document.fonts.load(
                `${IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT} ${searchFontSize}px "TikTok Sans"`
              );
            } catch {
              /* font may already be ready */
            }
            drawImageTemplate8Q5SearchLabel(
              ctx,
              frameWidth,
              frameHeight,
              pastelCarouselExportFontFamily
            );
            const banner = await new Promise<HTMLImageElement>((resolve, reject) => {
              const el = new Image();
              el.onload = () => resolve(el);
              el.onerror = () => reject(new Error('Failed to load Template 8 app banner'));
              el.src = IMAGE_TEMPLATE8_Q5_BANNER_SRC;
            });
            drawImageTemplate8Q5Banner(ctx, frameWidth, frameHeight, banner);
          }
        }
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }

      if (exportTemplateId === 7 || exportTemplateId === 10 || exportTemplateId === 11) {
        const coverSource = sourceForTab(tabIndex).trim();
        if (!coverSource) {
          throw new Error('Pinterest image is still loading. Wait a moment, then try again.');
        }
        const isTemplate10Export = exportTemplateId === 10;
        const isTemplate11Export = exportTemplateId === 11;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, frameWidth, frameHeight);
        const coverImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.crossOrigin = 'anonymous';
          el.onload = () => {
            if (el.naturalWidth < 1 || el.naturalHeight < 1) {
              reject(new Error('Invalid image dimensions'));
              return;
            }
            resolve(el);
          };
          el.onerror = () =>
            reject(new Error(`Failed to load image: ${coverSource.slice(0, 80)}`));
          el.src = coverSource;
        });
        const destH = frameHeight;
        const coverScale = Math.max(frameWidth / coverImg.width, destH / coverImg.height);
        const coverW = coverImg.width * coverScale;
        const coverH = coverImg.height * coverScale;
        if (isTemplate11Export) {
          ctx.filter = IMAGE_TEMPLATE11_CSS_FILTER;
        }
        if (isTemplate10Export) {
          drawImageTemplate10CoverFill(ctx, coverImg, frameWidth, frameHeight);
        } else {
          ctx.drawImage(
            coverImg,
            (frameWidth - coverW) / 2,
            (destH - coverH) / 2,
            coverW,
            coverH
          );
        }
        ctx.filter = 'none';
        if (isTemplate11Export) {
          drawImageTemplate11LuxuryOverlay(ctx, frameWidth, frameHeight);
        }
        const exportFontFamily = pastelCarouselExportFontFamily;
        const titleSizeRatio = isTemplate10Export
          ? IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO
          : IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO;
        const coverSubtitleSizeRatio = isTemplate10Export
          ? IMAGE_TEMPLATE10_COVER_SUBTITLE_SIZE_RATIO
          : IMAGE_TEMPLATE2_COVER_SUBTITLE_SIZE_RATIO;
        const questionSizeRatio = isTemplate10Export
          ? IMAGE_TEMPLATE10_Q_TEXT_SIZE_RATIO
          : 0.05;
        try {
          await document.fonts.load(
            `${IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT} ${Math.round(frameWidth * titleSizeRatio)}px "TikTok Sans"`
          );
          await document.fonts.load(
            `${IMAGE_TEMPLATE2_COVER_SUBTITLE_WEIGHT} ${Math.round(frameWidth * coverSubtitleSizeRatio)}px "TikTok Sans"`
          );
          await document.fonts.load(
            `${isTemplate10Export ? IMAGE_TEMPLATE10_Q_TEXT_WEIGHT : 500} ${Math.round(frameWidth * questionSizeRatio)}px "TikTok Sans"`
          );
        } catch {
          /* font may already be ready */
        }
        if (tabIndex === 0) {
          drawImageTemplate2CoverSlide(ctx, frameWidth, frameHeight, {
            backgroundColor: '#000000',
            skipBackground: true,
            title: textForTab(0),
            highlightWord: isTemplate10Export ? null : imageTemplate1HighlightWord,
            fontFamily: pastelCarouselExportFontFamily,
            textColor: '#FFFFFF',
            progress: 1 / exportSlideTotal,
            footer: '',
            showProgress: false,
            subtitle: imageTemplate2CoverSubtitle,
            ...(isTemplate10Export
              ? {
                  maxTextWidthRatio: IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO,
                  titleSizeRatio: IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO,
                  subtitleSizeRatio: IMAGE_TEMPLATE10_COVER_SUBTITLE_SIZE_RATIO,
                }
              : {}),
          });
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = isTemplate10Export ? 'middle' : 'top';
          ctx.shadowColor = 'rgba(0,0,0,0.45)';
          ctx.shadowBlur = isTemplate10Export ? 8 : 10;
          const fontSize = Math.round(frameWidth * questionSizeRatio);
          ctx.font = `${isTemplate10Export ? IMAGE_TEMPLATE10_Q_TEXT_WEIGHT : 500} ${fontSize}px ${exportFontFamily}`;
          ctx.letterSpacing = IMAGE_TEMPLATE2_COVER_LETTER_SPACING;
          const maxTextWidth = frameWidth * (
            isTemplate10Export ? IMAGE_TEMPLATE10_Q_TEXT_MAX_WIDTH_RATIO : 0.66
          );
          const qLines = wrapLines(ctx, textForTab(tabIndex), maxTextWidth);
          const lineHeight =
            fontSize *
            (isTemplate10Export
              ? IMAGE_TEMPLATE10_Q_TEXT_LINE_HEIGHT_MULT
              : IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT);
          const blockH = qLines.length * lineHeight;
          const textCenterX = frameWidth / 2;
          let y = isTemplate10Export
            ? frameHeight / 2 - blockH / 2 + lineHeight / 2
            : (frameHeight - blockH) / 2;
          for (const line of qLines) {
            ctx.fillText(line, textCenterX, y);
            y += lineHeight;
          }
          ctx.letterSpacing = '0px';
          ctx.shadowBlur = 0;
          if (tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX) {
            if (
              exportTemplateId === 7 ||
              exportTemplateId === 10 ||
              exportTemplateId === 11
            ) {
              const searchFontSize = Math.round(
                frameWidth * IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO
              );
              try {
                await document.fonts.load(
                  `${IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT} ${searchFontSize}px "TikTok Sans"`
                );
              } catch {
                /* font may already be ready */
              }
              drawImageTemplate8Q5SearchLabel(
                ctx,
                frameWidth,
                frameHeight,
                pastelCarouselExportFontFamily
              );
              const banner = await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => reject(new Error('Failed to load Template 8 app banner'));
                el.src = IMAGE_TEMPLATE8_Q5_BANNER_SRC;
              });
              drawImageTemplate8Q5Banner(ctx, frameWidth, frameHeight, banner);
            } else {
              const promo = await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => reject(new Error('Failed to load the App Store image'));
                el.src = IMAGE_TEMPLATE2_Q5_PROMO_SRC;
              });
              const layout = imageTemplate2Q5PromoLayout(frameWidth, frameHeight);
              ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
            }
          }
        }
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }

      if (isPastelExport && !isFullBleedTab) {
        const slideBg =
          imageTabPastelBgs[tabIndex] ??
          IMAGE_TEMPLATE2_PASTEL_COLORS[tabIndex % IMAGE_TEMPLATE2_PASTEL_COLORS.length]!;

        if (tabIndex === 0) {
          try {
            await document.fonts.load(
              `${IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT} ${Math.round(frameWidth * IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO)}px "TikTok Sans"`
            );
          } catch {
            /* font may already be ready */
          }
          drawImageTemplate2CoverSlide(ctx, frameWidth, frameHeight, {
            backgroundColor: slideBg,
            title: textForTab(tabIndex),
            highlightWord: imageTemplate2CoverSquiggleEnabled
              ? imageTemplate2HighlightWord
              : null,
            fontFamily: pastelCarouselExportFontFamily,
            textColor: pastelCarouselTextColor,
            progress: 1 / exportSlideTotal,
            footer: '',
            showProgress: false,
            subtitle: imageTemplate2CoverSubtitle,
            textAlign: 'left',
          });
          ctx.font = `700 ${Math.round(frameWidth * 0.03)}px ${pastelCarouselExportFontFamily}`;
          ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(IMAGE_TEMPLATE2_TOP_LABEL, frameWidth / 2, frameHeight * 0.08);
          return await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create image blob'));
            }, 'image/png');
          });
        }

        ctx.fillStyle = slideBg;
        ctx.fillRect(0, 0, frameWidth, frameHeight);

        ctx.font = `700 ${Math.round(frameWidth * 0.03)}px ${pastelCarouselExportFontFamily}`;
        ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(IMAGE_TEMPLATE2_TOP_LABEL, frameWidth / 2, frameHeight * 0.08);

        const progress = (tabIndex + 1) / exportSlideTotal;
        const barX = frameWidth * 0.08;
        const barW = frameWidth * 0.84;
        const barY = frameHeight * 0.21;
        const barH = Math.max(8, Math.round(frameHeight * 0.007));

        ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
        ctx.font = `700 ${Math.round(frameHeight * 0.032)}px ${pastelCarouselExportFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(imageTabTypeLabel, frameWidth / 2, barY - frameHeight * 0.018);

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(barX, barY, barW * progress, barH);

        const centerText = textForTab(tabIndex);
        const fontSize = Math.round(frameWidth * IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO);
        try {
          await document.fonts.load(`800 ${fontSize}px "TikTok Sans"`);
          await document.fonts.load(`700 ${fontSize}px "TikTok Sans"`);
        } catch {
          /* font may already be ready */
        }
        ctx.font = `800 ${fontSize}px ${pastelCarouselExportFontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = pastelCarouselTextColor;
        const maxTextWidth = frameWidth * 0.6;
        const textX = (frameWidth - maxTextWidth) / 2;
        const lines = wrapLines(ctx, centerText.replace(/\n/g, ' '), maxTextWidth);
        const lineHeight = fontSize * 1.22;
        const blockH = lines.length * lineHeight;
        const textCenterY =
          frameHeight *
          IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO;
        let y = textCenterY - blockH / 2 + lineHeight / 2;
        for (const line of lines) {
          ctx.fillText(line, textX, y);
          y += lineHeight;
        }

        if (tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX) {
          // App Store mock replaces the footer, half of it hanging off the frame.
          const promo = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error('Failed to load the App Store image'));
            el.src = IMAGE_TEMPLATE2_Q5_PROMO_SRC;
          });
          const labelSize = Math.round(
            frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO
          );
          const labelGap = frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
          const layout = imageTemplate2Q5PromoLayout(
            frameWidth,
            frameHeight,
            y - lineHeight / 2 + labelSize + labelGap
          );
          ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);

          ctx.font = `700 ${labelSize}px ${pastelCarouselExportFontFamily}`;
          ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(
            IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
            frameWidth / 2,
            layout.y - labelGap
          );
        } else {
          ctx.font = `700 ${Math.round(frameHeight * 0.03)}px ${pastelCarouselExportFontFamily}`;
          ctx.fillStyle = IMAGE_TEMPLATE2_TEXT_COLOR;
          ctx.textBaseline = 'bottom';
          ctx.fillText(IMAGE_TEMPLATE2_APP_FOOTER, frameWidth / 2, frameHeight * 0.9);
        }

        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }


      const source = isFullBleedTab
        ? isPastelExport
          ? pastelCtaImageSrc
          : kawaiiCtaImageSrc
        : sourceForTab(tabIndex);

      const isKawaiiQ5Export =
        isKawaiiStyleTemplateId(exportTemplateId) &&
        tabIndex === IMAGE_TEMPLATE2_Q5_TAB_INDEX;
      const slideFontFamily = imageFrameExportFontFamily;
      const slideFontWeight = 'bold';
      const slideFontPx = imageFrameExportFontPx;
      const slideLineHeight = imageFrameExportWrappedLineHeightPx;

      if (isKawaiiQ5Export) {
        ctx.fillStyle = exportTemplateId === 12 ? IMAGE_TEMPLATE12_FRAME_BG : imageTabFrameBg;
        ctx.fillRect(0, 0, frameWidth, frameHeight);
        ctx.fillStyle = exportTextColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.font = `${slideFontWeight} ${slideFontPx}px ${slideFontFamily}`;
        const maxTextWidth = frameWidth * 0.66;
        const qLines = wrapLines(ctx, textForTab(tabIndex), maxTextWidth);
        const lineHeight = slideLineHeight;
        const blockH = qLines.length * lineHeight;
        const textCenterY = frameHeight * IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO;
        let textY = textCenterY - blockH / 2;
        for (const line of qLines) {
          ctx.fillText(line, frameWidth / 2, textY);
          textY += lineHeight;
        }
        const textBottom = textCenterY + blockH / 2;

        const promo = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error('Failed to load the App Store image'));
          el.src = IMAGE_TEMPLATE2_Q5_PROMO_SRC;
        });
        const labelSize = Math.round(
          frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO
        );
        const labelGap = frameHeight * IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO;
        const layout = imageTemplate2Q5PromoLayout(
          frameWidth,
          frameHeight,
          textBottom + labelSize + labelGap
        );
        ctx.drawImage(promo, layout.x, layout.y, layout.width, layout.height);
        ctx.font = `${slideFontWeight} ${labelSize}px ${slideFontFamily}`;
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          IMAGE_TEMPLATE2_Q5_PROMO_LABEL,
          frameWidth / 2,
          layout.y - labelGap
        );

        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }

      if (!source.trim()) {
        throw new Error('Missing image URL (dog images may still be loading).');
      }
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.crossOrigin = 'anonymous';
        el.onload = () => {
          if (el.naturalWidth < 1 || el.naturalHeight < 1) {
            reject(new Error('Invalid image dimensions'));
            return;
          }
          resolve(el);
        };
        el.onerror = () => reject(new Error(`Failed to load image: ${source.slice(0, 80)}`));
        el.src = source;
      });

      ctx.fillStyle = exportTemplateId === 12 ? IMAGE_TEMPLATE12_FRAME_BG : imageTabFrameBg;
      ctx.fillRect(0, 0, frameWidth, frameHeight);

      const drawFullBleedImage = () => {
        const coverScale = Math.max(frameWidth / img.width, frameHeight / img.height);
        const coverW = img.width * coverScale;
        const coverH = img.height * coverScale;
        const coverX = (frameWidth - coverW) / 2;
        const coverY = (frameHeight - coverH) / 2;
        ctx.drawImage(img, coverX, coverY, coverW, coverH);
      };

      if (isFullBleedTab) {
        drawFullBleedImage();
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }

      const fullWidthGraphic = exportTemplateId === 12;
      const maxW = fullWidthGraphic ? frameWidth : frameWidth * 0.48;
      const maxH = fullWidthGraphic ? frameHeight : frameHeight * 0.24;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (frameWidth - drawW) / 2;
      const drawY = fullWidthGraphic
        ? frameHeight - drawH
        : frameHeight - drawH - frameHeight * 0.13;
      if (fullWidthGraphic) ctx.drawImage(img, drawX, drawY, drawW, drawH);

      ctx.fillStyle = exportTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = exportTemplateId === 12 ? 'transparent' : imageFrameExportGlowColor;
      ctx.shadowBlur = exportTemplateId === 12 ? 0 : 14;
      ctx.font = `${slideFontWeight} ${slideFontPx}px ${slideFontFamily}`;
      const drawWrapped = (text: string, yStart: number, maxWidth: number, lineHeight: number) => {
        const lines = wrapLines(ctx, text, maxWidth);
        lines.forEach((line, idx) => ctx.fillText(line, frameWidth / 2, yStart + idx * lineHeight));
      };
      if (tabIndex >= 1 && tabIndex <= 6) {
        drawWrapped(
          textForTab(tabIndex),
          frameHeight * 0.21,
          frameWidth * 0.66,
          slideLineHeight
        );
      } else {
        const coverTitle = textForTab(0).trim() || pickRandomDailyFunnyTitle();
        if (isKawaiiStyleTemplateId(exportTemplateId)) {
          const exportHighlightColor =
            exportTemplateId === 6
              ? IMAGE_TEMPLATE6_HIGHLIGHT_COLOR
              : imageTemplate1SquiggleColor;
          const exportHighlightTextColor = TITLE_HIGHLIGHT_TEXT_COLOR;
          drawKawaiiCoverTitleWithHighlight(ctx, frameWidth, frameHeight * 0.21, coverTitle, {
            fontSizePx: slideFontPx,
            maxWidthRatio: 0.66,
            lineHeightPx: slideLineHeight,
            textColor: exportTextColor,
            fontFamily: slideFontFamily,
            fontWeight: slideFontWeight,
            highlightWord: imageTemplate1HighlightWord,
            highlightColor: exportHighlightColor,
            highlightTextColor: exportHighlightTextColor,
            subtitle:
              exportTemplateId === 1 || exportTemplateId === 6 || exportTemplateId === 12
                ? imageTemplate2CoverSubtitle
                : null,
          });
        } else {
          drawWrapped(
            coverTitle,
            frameHeight * 0.21,
            frameWidth * 0.66,
            imageFrameExportWrappedLineHeightPx
          );
        }
      }
      ctx.shadowBlur = 0;
      if (!fullWidthGraphic) ctx.drawImage(img, drawX, drawY, drawW, drawH);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/png');
      });
    };

    const entries: { path: string; blob: Blob }[] = [];
    const isKawaiiTemplate = isKawaiiStyleTemplateId(exportTemplateId);

    const buildSixTabSourcesForKawaiiSet = (): string[] => {
      if (exportTemplateId === 6) {
        return buildTemplate6TabImageSources();
      }
      const fromPool = buildKawaiiTabImageSources(dogImagePool, kawaiiCtaImageSrc).slice(0, 6);
      if (dogImagePool.length > 0) {
        return fromPool;
      }
      const fromUi = imageTabSources.filter(
        (u) => typeof u === 'string' && u.length > 0 && !isKawaiiCtaIllustrationUrl(u)
      );
      if (fromUi.length > 0) {
        const dogs = fromUi.slice(0, 5);
        while (dogs.length < 5) {
          dogs.push(fromUi[dogs.length % fromUi.length]!);
        }
        return [...dogs, ''];
      }
      return fromPool;
    };

    if (isKawaiiTemplate) {
      const probe = buildSixTabSourcesForKawaiiSet();
      if (
        isDogsKawaiiTemplateId(exportTemplateId) &&
        (probe.length < 6 || probe.slice(0, 5).some((u) => !u?.trim()))
      ) {
        throw new Error('Dog images are still loading. Wait a few seconds, then try again.');
      }
      for (let setIdx = 0; setIdx < KAWAII_DOWNLOAD_NUM_SETS; setIdx++) {
        const exportType =
          exportTemplateId === 6
            ? imageTemplate6QuestionType === 'random'
              ? concreteTypeFromImageLabel(imageTabTypeLabel)
              : imageTemplate6QuestionType
            : 'funny';
        const picked = pickQuestionsForType(exportType, 5);
        const coverTitle =
          (imageTabTexts[0] ?? '').trim() ||
          (exportTemplateId === 6
            ? pickTitleForType(exportType)
            : pickRandomDailyFunnyTitle());
        let tabTexts = isKawaiiNoCtaTemplateId(exportTemplateId)
          ? [coverTitle, ...picked]
          : [coverTitle, ...picked, imageFrameCtaText];
        // Single-set Template 6 download matches the on-screen title + questions.
        if (
          KAWAII_DOWNLOAD_NUM_SETS === 1 &&
          exportTemplateId === 6 &&
          imageTabTexts.length >= 6
        ) {
          tabTexts = imageTabTexts.slice(0, 6);
        }
        const tabSources = buildSixTabSourcesForKawaiiSet();
        // Single-set download matches the on-screen cover + question illustrations.
        if (KAWAII_DOWNLOAD_NUM_SETS === 1 && isDogsKawaiiTemplateId(exportTemplateId)) {
          for (let i = 0; i < 5; i++) {
            const previewUrl = kawaiiDogImageForTab(i, imageTabSources, dogImagePool);
            if (previewUrl) tabSources[i] = previewUrl;
          }
        }
        if (KAWAII_DOWNLOAD_NUM_SETS === 1 && exportTemplateId === 6) {
          for (let i = 0; i < 5; i++) {
            tabSources[i] = template6BearImageForTab(i, imageTabSources);
          }
        }
        const setPrefix =
          KAWAII_DOWNLOAD_NUM_SETS > 1 ? `set-${setIdx + 1}/` : '';
        const kawaiiExportTabCount = isKawaiiNoCtaTemplateId(exportTemplateId) ? 6 : 7;
        for (let tabIndex = 0; tabIndex < kawaiiExportTabCount; tabIndex++) {
          const blob = await renderFrameBlob(tabIndex, { tabTexts, tabSources });
          const tabName = tabIndex === 0 ? 'cover' : tabIndex <= 5 ? `q${tabIndex}` : 'cta';
          entries.push({
            path: `${setPrefix}template-${exportTemplateId}-${tabName}.png`,
            blob,
          });
        }
      }
      return { entries, isKawaiiTemplate, kawaiiNumSets: KAWAII_DOWNLOAD_NUM_SETS };
    }

    const exportQuestionCount = 5;
    const exportTabCount = isPinterestCoverOnlyImageTemplateId(exportTemplateId)
      ? 6
      : isPinterestCoverImageTemplateId(exportTemplateId)
        ? IMAGE_TEMPLATE7_TAB_COUNT
        : exportQuestionCount +
          (exportTemplateId === 2 ||
          isKawaiiNoCtaTemplateId(exportTemplateId)
            ? 1
            : 2);

    for (let tabIndex = 0; tabIndex < exportTabCount; tabIndex++) {
      const blob = await renderFrameBlob(tabIndex, null);
      const tabName =
        tabIndex === 0 ? 'cover' : tabIndex <= exportQuestionCount ? `q${tabIndex}` : 'cta';
      entries.push({ path: `template-${exportTemplateId}-${tabName}.png`, blob });
    }
    return { entries, isKawaiiTemplate };
  };

  const handleDownloadImageFrame = async () => {
    const scheduleRevokeObjectUrl = (url: string) => {
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    };

    setIsImageTemplateDownloading(true);
    try {
      const { entries, isKawaiiTemplate, kawaiiNumSets } =
        await generateImageFrameExportEntries({
          kawaiiNumSets: KAWAII_DOWNLOAD_SETS,
        });
      const zip = new JSZip();
      for (const { path, blob } of entries) {
        zip.file(path, blob);
      }

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'STORE',
      });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download =
        isKawaiiTemplate && (kawaiiNumSets ?? 1) > 1
          ? `template-${selectedImageTemplateId}-kawaii-${kawaiiNumSets}-sets.zip`
          : `template-${selectedImageTemplateId}-all-tabs.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      scheduleRevokeObjectUrl(url);
    } catch (e) {
      console.error('Failed to download image frame:', e);
      alert(e instanceof Error ? e.message : 'Download failed. Check the console for details.');
    } finally {
      setIsImageTemplateDownloading(false);
    }
  };

  /** Posts the current image template's tabs as one Instagram carousel. */
  const handlePostImageTemplateToInstagram = async () => {
    if (!instagramAccount) {
      alert(
        instagramError ||
          'Instagram is not connected. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to .env.local.'
      );
      return;
    }
    const caption = window.prompt('Instagram caption', imageTabTexts[0] ?? '');
    if (caption === null) return;

    setIsInstagramPosting(true);
    try {
      const { entries } = await generateImageFrameExportEntries();
      // Carousels cap at 10 slides; the templates render 7.
      const slides = entries.slice(0, INSTAGRAM_CAROUSEL_MAX);
      const formData = new FormData();
      formData.append('caption', caption);
      for (const [i, { blob }] of slides.entries()) {
        formData.append('files', blob, `slide-${i + 1}.png`);
      }

      const res = await fetch('/api/instagram/post', { method: 'POST', body: formData });
      const data = (await res.json()) as { permalink?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to post to Instagram');
      alert(data.permalink ? `Posted to Instagram:\n${data.permalink}` : 'Posted to Instagram.');
    } catch (e) {
      console.error('Failed to post to Instagram:', e);
      alert(e instanceof Error ? e.message : 'Failed to post to Instagram');
    } finally {
      setIsInstagramPosting(false);
    }
  };

  const handleUploadImageTemplateToFolder = async (
    templateId: number,
    folderIds: string | readonly string[],
    options?: { kawaiiNumSets?: number }
  ) => {
    // Normalize: a plain string must not be spread (that turns the ID into characters, e.g. "1").
    const targetFolderId = (() => {
      if (typeof folderIds === 'string') return folderIds.trim();
      const ids = folderIds.map((id) => id.trim()).filter(Boolean);
      return ids[0] ?? '';
    })();
    if (!targetFolderId) {
      alert('Missing Google Drive folder ID for this template.');
      return;
    }

    setIsImageTemplateUploading(true);
    try {
      const statusRes = await fetch('/api/drive/status');
      const status = (await statusRes.json()) as { oauthConfigured?: boolean; connected?: boolean };
      if (!status.oauthConfigured) {
        alert('Google Drive is not configured. Add OAuth credentials to .env.local (see GOOGLE_DRIVE_SETUP.md).');
        return;
      }
      if (!status.connected) {
        if (window.confirm('Connect Google Drive to upload images to your folder?')) {
          window.location.href = '/api/drive/auth';
        }
        return;
      }

      const clearRes = await fetch('/api/drive/clear-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: targetFolderId }),
      });
      const clearData = (await clearRes.json()) as { error?: string };
      if (!clearRes.ok) {
        throw new Error(
          clearData.error ||
            `Cannot access Drive folder ${targetFolderId}. Reconnect Google Drive and try again.`
        );
      }

      const { entries } =
        selectedAppId === 'spill-it' && isKawaiiStyleTemplateId(templateId)
          ? await generateImageFrameExportEntries({
              kawaiiNumSets: options?.kawaiiNumSets ?? 1,
              templateId,
            })
          : await generateImageFrameExportEntries({ templateId });

      for (const { path, blob } of entries) {
        const filename = path.replace(/\//g, '-');
        const formData = new FormData();
        formData.append('file', blob, filename);
        formData.append('folderId', targetFolderId);
        const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${filename}`);
        }
      }
    } catch (e) {
      console.error('Failed to upload image template to Drive:', e);
      alert(e instanceof Error ? e.message : 'Upload failed. Check the console for details.');
    } finally {
      setIsImageTemplateUploading(false);
    }
  };

  const handleUploadCouplesNatureVideoToFolder = async () => {
    if (!isCouplesNatureVideoTemplate) return;

    setVideoExportError(null);
    setIsImageTemplateUploading(true);
    try {
      const statusRes = await fetch('/api/drive/status');
      const status = (await statusRes.json()) as { oauthConfigured?: boolean; connected?: boolean };
      if (!status.oauthConfigured) {
        alert('Google Drive is not configured. Add OAuth credentials to .env.local (see GOOGLE_DRIVE_SETUP.md).');
        return;
      }
      if (!status.connected) {
        if (window.confirm('Connect Google Drive to upload video to your folder?')) {
          window.location.href = '/api/drive/auth';
        }
        return;
      }

      const clearDriveFolder = async (folderId?: string) => {
        const clearRes = await fetch('/api/drive/clear-folder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(folderId ? { folderId } : {}),
        });
        const clearData = (await clearRes.json()) as { error?: string };
        if (!clearRes.ok) {
          const msg = clearData.error || 'Failed to clear Google Drive folder';
          if (!/not found/i.test(msg)) {
            throw new Error(msg);
          }
          return false;
        }
        return true;
      };

      const preferredFolderId = COUPLES_NATURE_DRIVE_FOLDER_ID;
      const preferredCleared = await clearDriveFolder(preferredFolderId);
      const uploadFolderId = preferredCleared ? preferredFolderId : undefined;
      if (!preferredCleared) {
        await clearDriveFolder(undefined);
      }

      const title = videoOverlayCaption.trim() || pickRandomDailyFunnyTitle();
      const questions =
        videoTemplate2Questions.length > 0
          ? videoTemplate2Questions
          : pickRandomFunnyQuestions(7);
      const videoSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
      if (!videoSrc) {
        throw new Error('No video available to export. Wait for the background to load, then try again.');
      }

      setIsVideoExporting(true);
      setVideoExportDetail(null);
      let blob: Blob;
      try {
        blob = await buildCouplesNatureVideoBlob({
          videoSrc,
          title,
          questions,
          posterForHighlight: template2PlaybackPosterSrc,
          ...couplesNatureExportExtras,
          onProgress: (phase, current, total) => {
            setVideoExportDetail(
              phase === 'frames'
                ? `Rendering ${current}/${total} frames…`
                : 'Encoding MP4…'
            );
          },
        });
      } finally {
        setIsVideoExporting(false);
        setVideoExportDetail(null);
      }

      const filename = `couples-nature-${new Date().toISOString().slice(0, 10)}.mp4`;
      const formData = new FormData();
      formData.append('file', blob, filename);
      if (uploadFolderId) formData.append('folderId', uploadFolderId);
      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload video');
      }
    } catch (e) {
      console.error('Failed to upload Couples Nature video to Drive:', e);
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setVideoExportError(msg);
      alert(msg);
    } finally {
      setIsImageTemplateUploading(false);
      setIsVideoExporting(false);
    }
  };

  const handleConfirmVideoDownload = async (count: number) => {
    if (!isCouplesNatureVideoTemplate) return;

    setVideoExportError(null);
    setIsVideoExporting(true);
    setVideoExportProgress({ current: 0, total: count });
    setVideoExportDetail(null);

    const scheduleRevokeObjectUrl = (url: string) => {
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    };

    try {
      const zip = new JSZip();

      for (let i = 0; i < count; i++) {
        setVideoExportProgress({ current: i + 1, total: count });

        // Single download uses the on-screen preview; batch downloads get fresh random content.
        const usePreview = count === 1;
        const title = usePreview
          ? videoOverlayCaption.trim() || pickRandomDailyFunnyTitle()
          : pickRandomDailyFunnyTitle();
        const questions = usePreview
          ? (videoTemplate2Questions.length > 0
              ? videoTemplate2Questions
              : pickRandomFunnyQuestions(7))
          : pickRandomFunnyQuestions(7);
        let videoSrc: string | null;
        let posterForHighlight: string | null;
        if (usePreview) {
          videoSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
          posterForHighlight = template2PlaybackPosterSrc ?? null;
        } else {
          const fetched = await fetchRandomCouplesNatureVideo();
          videoSrc = fetched.videoUrl;
          posterForHighlight = fetched.thumbnailUrl;
        }
        if (!videoSrc) {
          throw new Error('No video available to export. Wait for the background to load, then try again.');
        }
        const blob = await buildCouplesNatureVideoBlob({
          videoSrc,
          title,
          questions,
          posterForHighlight,
          ...(usePreview ? couplesNatureExportExtras : {}),
          onProgress: (phase, current, total) => {
            setVideoExportDetail(
              phase === 'frames'
                ? `Rendering ${current}/${total} frames…`
                : 'Encoding MP4…'
            );
          },
        });

        if (count === 1) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'template-2-video.mp4';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          scheduleRevokeObjectUrl(url);
          setShowVideoDownloadModal(false);
          return;
        }

        zip.file(`template-2-video-${i + 1}.mp4`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-2-videos-${count}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      scheduleRevokeObjectUrl(url);
      setShowVideoDownloadModal(false);
    } catch (e) {
      console.error('Failed to download video template batch:', e);
      const msg = e instanceof Error ? e.message : 'Download failed';
      setVideoExportError(msg);
    } finally {
      setIsVideoExporting(false);
      setVideoExportProgress(null);
      setVideoExportDetail(null);
    }
  };

  /**
   * Renders the active video template to a single file. Shared by the download
   * button and the Instagram Reel post, so both always ship identical output.
   * Throws on failure; callers own the exporting/error UI state.
   */
  const buildVideoTemplateExport = async (): Promise<{
    blob: Blob;
    extension: 'mp4' | 'webm';
    baseName: string;
  } | null> => {
    if (!activeVideoTemplate || selectedVideoTemplateId === null) return null;

    const today = new Date().toISOString().slice(0, 10);
    const requireVideoSrc = () => {
      const src = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
      if (!src) {
        throw new Error('No video available to export. Wait for the background to load, then try again.');
      }
      return src;
    };
    /** Safari records MP4 directly; Chrome gives WebM and needs ffmpeg.wasm. */
    const toMp4 = async (
      recorded: Blob,
      { allowWebmFallback = false }: { allowWebmFallback?: boolean } = {}
    ): Promise<{ blob: Blob; extension: 'mp4' | 'webm' }> => {
      if (recorded.type.includes('mp4')) return { blob: recorded, extension: 'mp4' };
      if (!allowWebmFallback) return { blob: await transcodeWebmToMp4(recorded), extension: 'mp4' };
      try {
        return { blob: await transcodeWebmToMp4(recorded), extension: 'mp4' };
      } catch (transcodeErr) {
        console.warn(
          'MP4 transcode unavailable (often Turbopack + ffmpeg.wasm). Falling back to WebM.',
          transcodeErr
        );
        return { blob: recorded, extension: 'webm' };
      }
    };

    if (isFreshBakedDonutVideoTemplate) {
      const selected = selectedFreshBakedDonut;
      if (!selected) {
        throw new Error('Select a video first.');
      }
      const blob = await exportFreshBakedDonutClip(selected);
      return {
        blob,
        extension: 'mp4',
        baseName: `fresh-baked-donut-${selected.id}-${today}`,
      };
    }

    if (isOceanSunsetVideoTemplate) {
      const videoSrc = requireVideoSrc();
      try {
        await document.fonts.load('800 48px "TikTok Sans"');
        await document.fonts.load('700 48px "TikTok Sans"');
      } catch {
        /* font may already be ready */
      }
      const blob = await exportCouplesNatureVideo({
        videoSrc,
        maxDurationSec: VIDEO_TEMPLATE2_MAX_DURATION_SEC,
        backgroundFilter: 'none',
        paintOverlay: (ctx, w, h) =>
          paintVideoTemplate4Overlay(ctx, w, h, {
            label: videoTemplate4Label,
            questions: videoTemplate4Questions,
          }),
      });
      return { blob, extension: 'mp4', baseName: `ocean-sunset-${today}` };
    }

    if (isCinematicCoverVideoTemplate) {
      const videoSrc = requireVideoSrc();
      try {
        await document.fonts.load('700 48px "TikTok Sans"');
        await document.fonts.load('600 48px "TikTok Sans"');
      } catch {
        /* font may already be ready */
      }
      const blob = await exportCouplesNatureVideo({
        videoSrc,
        maxDurationSec: VIDEO_TEMPLATE2_MAX_DURATION_SEC,
        backgroundFilter: 'none',
        paintOverlay: (ctx, w, h) =>
          paintVideoTemplate6Overlay(ctx, w, h, {
            text: videoOverlayCaption.trim(),
          }),
      });
      return { blob, extension: 'mp4', baseName: `cinematic-${today}` };
    }

    if (isSpillItNotesVideoTemplate) {
      const videoSrc = requireVideoSrc();
      const title = videoOverlayCaption.trim() || pickRandomDailyFunnyTitle();
      const questions =
        videoTemplate2Questions.filter((q) => q.trim()).length > 0
          ? videoTemplate2Questions.filter((q) => q.trim()).slice(0, 5)
          : pickRandomFunnyQuestions(5);
      const recorded = await exportFabNotesVideo(
        videoSrc,
        title,
        questions,
        FAB_NOTES_MAX_DURATION_SEC
      );
      return { ...(await toMp4(recorded, { allowWebmFallback: true })), baseName: `iphone-notes-${today}` };
    }

    if (isNightyParticleVideoTemplate) {
      const videoSrc = requireVideoSrc();
      const recorded = await exportVideoWithCaptionOverlay(videoSrc, nightyParticleLines.line1, {
        particleAnimated: true,
        particleContent: {
          lines: nightyParticleLines,
          timing: nightyParticleTiming,
          accentColor: nightyParticleAccentColor,
        },
        particleAudioSrc: nightyParticleBedAudioSrc,
        maxDurationSec: nightyParticleMaxDuration,
      });
      return { ...(await toMp4(recorded)), baseName: `nighty-particle-${today}` };
    }

    if (isNightyRainVideoTemplate) {
      const videoSrc = requireVideoSrc();
      const caption = videoOverlayCaption.trim() || NIGHTY_RAIN_CAPTION;
      const recorded = await exportVideoWithCaptionOverlay(videoSrc, caption, {
        rainTemplate: true,
        rainAudioSrc: nightyRainBedAudioSrc,
        rainSubline: nightyRainSubline.trim() || NIGHTY_RAIN_CAPTION_SUBLINE,
        maxDurationSec: NIGHTY_RAIN_MAX_DURATION_SEC,
        maxWidthRatio: NIGHTY_RAIN_CAPTION_MAX_WIDTH_RATIO,
      });
      return { ...(await toMp4(recorded)), baseName: `nighty-rain-${today}` };
    }

    if (isFabAffirmationVideoTemplate) {
      if (fabMontageVideoSrcs.length < FAB_AFFIRMATION_CLIP_COUNT) {
        throw new Error('No montage videos loaded. Turn off Reuse videos and regenerate, then try again.');
      }
      const affirmations =
        fabMontageAffirmations.filter((a) => a.trim()).length > 0
          ? fabMontageAffirmations.filter((a) => a.trim()).slice(0, FAB_AFFIRMATION_TEXT_COUNT)
          : pickFabMontageAffirmations();
      const textsMatch =
        fabMontageSegments.length === affirmations.length &&
        fabMontageSegments.every(
          (s, i) => s.text === affirmations[i] && s.provider === fabMontageTtsProvider
        );
      let segments = fabMontageSegments;
      if (!textsMatch) {
        segments = await buildFabAffirmationSegments(affirmations, fabMontageTtsProvider);
        setFabMontageSegments((prev) => {
          revokeFabAffirmationSegments(prev);
          return segments;
        });
        setFabMontageAffirmations(affirmations);
      }
      if (segments.some((s) => s.provider === 'browser')) {
        // Browser mode exports timed text with silent audio placeholders.
        console.info(
          '[fab-montage] Exporting with Browser (free) voice — download audio is silent; switch to ElevenLabs for real TTS in the file.'
        );
      }
      const proxied = fabMontageVideoSrcs.map((src) => pexelsVideoProxySrc(src));
      const ambientSrc = resolveFabAffirmationAmbientSrc(fabMontageAmbientId);
      const recorded = await exportFabAffirmationMontage(proxied, segments, undefined, ambientSrc);
      return {
        ...(await toMp4(recorded, { allowWebmFallback: true })),
        baseName: `fab-affirmation-${today}`,
      };
    }

    const baseName =
      activeVideoTemplate.title
        .replace(/[^\w\d-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || `template-${selectedVideoTemplateId}`;

    if (isCouplesNatureVideoTemplate) {
      const videoSrc = requireVideoSrc();
      const title = videoOverlayCaption.trim() || pickRandomDailyFunnyTitle();
      const questions =
        videoTemplate2Questions.length > 0 ? videoTemplate2Questions : pickRandomFunnyQuestions(7);
      const recorded = await buildCouplesNatureVideoBlob({
        videoSrc,
        title,
        questions,
        posterForHighlight: template2PlaybackPosterSrc,
        ...couplesNatureExportExtras,
        onProgress: (phase, current, total) => {
          setVideoExportDetail(
            phase === 'frames'
              ? `Rendering ${current}/${total} frames…`
              : 'Encoding MP4…'
          );
        },
      });
      return { blob: recorded, extension: 'mp4', baseName: `${baseName}-caption` };
    }

    if (!template2PlaybackVideoSrc) return null;

    const captionTrimmed = videoOverlayCaption.trim();
    if (captionTrimmed) {
      const recorded = await exportVideoWithCaptionOverlay(requireVideoSrc(), captionTrimmed, {
        position: 'center',
        style: 'stroke',
      });
      return { ...(await toMp4(recorded)), baseName: `${baseName}-caption` };
    }

    const res = await fetch(template2ExportVideoSrc ?? template2PlaybackVideoSrc);
    if (!res.ok) throw new Error('Failed to fetch video');
    return { blob: await res.blob(), extension: 'mp4', baseName };
  };

  const handleDownloadVideoTemplate = async () => {
    if (!activeVideoTemplate || selectedVideoTemplateId === null) return;
    if (isCouplesNatureVideoTemplate) {
      setShowVideoDownloadModal(true);
      return;
    }

    setVideoExportError(null);
    const triggerDownload = (blob: Blob, filename: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    };

    setIsVideoExporting(true);
    try {
      const result = await buildVideoTemplateExport();
      if (result) {
        triggerDownload(result.blob, `${result.baseName}.${result.extension}`);
        return;
      }
      if (activeVideoTemplate.coverSrc) {
        const baseName =
          activeVideoTemplate.title
            .replace(/[^\w\d-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase() || `template-${selectedVideoTemplateId}`;
        const res = await fetch(activeVideoTemplate.coverSrc);
        if (!res.ok) throw new Error('Failed to fetch cover image');
        triggerDownload(await res.blob(), `${baseName}.png`);
      }
    } catch (e) {
      console.error('Failed to download video template:', e);
      setVideoExportError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setIsVideoExporting(false);
    }
  };

  /** Posts the current video template to Instagram as a Reel. */
  const handlePostVideoTemplateToInstagram = async () => {
    if (!instagramAccount) {
      alert(
        instagramError ||
          'Instagram is not connected. Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID to .env.local.'
      );
      return;
    }
    const caption = window.prompt('Instagram caption', videoOverlayCaption.trim());
    if (caption === null) return;

    setVideoExportError(null);
    setIsInstagramPosting(true);
    try {
      const result = await buildVideoTemplateExport();
      if (!result) throw new Error('No video available to post. Generate a video first.');
      if (result.extension !== 'mp4') {
        throw new Error('Instagram only accepts MP4 Reels, and the MP4 transcode failed. Try again in Safari.');
      }

      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('files', result.blob, `${result.baseName}.mp4`);

      const res = await fetch('/api/instagram/post', { method: 'POST', body: formData });
      const data = (await res.json()) as { permalink?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Failed to post to Instagram');
      alert(data.permalink ? `Posted to Instagram:\n${data.permalink}` : 'Posted to Instagram.');
    } catch (e) {
      console.error('Failed to post Reel to Instagram:', e);
      const msg = e instanceof Error ? e.message : 'Failed to post to Instagram';
      setVideoExportError(msg);
      alert(msg);
    } finally {
      setIsInstagramPosting(false);
    }
  };

  return (
    <div className="h-dvh overflow-hidden overflow-x-hidden bg-zinc-50 font-sans dark:bg-black flex flex-col lg:flex-row">
      <Sidebar
        contentTab={contentTab}
        onContentTabChange={setContentTab}
        selectedAppId={selectedAppId}
        onSelectedAppIdChange={handleSelectedAppIdChange}
        userInfo={userInfo}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        onLogout={handleLogout}
      />
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-0 lg:h-dvh ml-0 lg:ml-56 overflow-x-hidden pt-14 lg:pt-0 ${
          contentTab === 'prompt' ? 'pb-[4.75rem] lg:pb-0' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto w-full min-w-0 flex flex-col flex-1 min-h-0">
          <div
            className={`grid grid-cols-1 gap-3 sm:gap-4 flex-1 min-h-0 min-w-0 px-3 pb-3 pt-3 lg:pt-0 overflow-x-hidden ${
              contentTab === 'prompt'
                ? 'overflow-y-auto lg:overflow-y-hidden lg:grid-cols-[320px_minmax(0,1fr)] lg:items-stretch'
                : 'overflow-y-auto lg:overflow-y-hidden lg:grid-cols-[400px_minmax(0,1fr)]'
            }`}
          >
            {contentTab === 'prompt' && (
              <InputsCard
                contentTab={contentTab}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                theme={theme}
                setTheme={setTheme}
                mode={mode}
                setMode={setMode}
                videoLoading={videoLoading}
                onChangeVideo={handleChangeVideo}
                text={text}
                setText={setText}
                firstCard={firstCard}
                canvases={canvases}
                setCanvases={setCanvases}
                textSize={textSize}
                setTextSize={setTextSize}
                onAddCanvas={handleAddCanvas}
                onDeleteCanvas={handleDeleteCanvas}
                userInfo={userInfo}
                postTitle={postTitle}
                setPostTitle={setPostTitle}
                postPrivacy={postPrivacy}
                setPostPrivacy={setPostPrivacy}
                creatorInfo={creatorInfo}
                allowComment={allowComment}
                setAllowComment={setAllowComment}
                contentDisclosureEnabled={contentDisclosureEnabled}
                setContentDisclosureEnabled={setContentDisclosureEnabled}
                isYourBrand={isYourBrand}
                setIsYourBrand={setIsYourBrand}
                isBrandedContent={isBrandedContent}
                setIsBrandedContent={setIsBrandedContent}
                musicUsageConsent={musicUsageConsent}
                setMusicUsageConsent={setMusicUsageConsent}
                automateCount={automateCount}
                setAutomateCount={setAutomateCount}
                onAutomateDownload={handleAutoGenerate}
                isAutoGenerating={isAutoGenerating}
                onGenerateDailyTikTok={handleGenerateDailyTikTok}
                isGeneratingDailyTikTok={isGeneratingDailyTikTok}
                automateQuestionType={automateQuestionType}
                setAutomateQuestionType={setAutomateQuestionType}
                dailyGenIncludeQuestions={dailyGenIncludeQuestions}
                setDailyGenIncludeQuestions={setDailyGenIncludeQuestions}
                dailyGenIncludeTitle={dailyGenIncludeTitle}
                setDailyGenIncludeTitle={setDailyGenIncludeTitle}
                dailyGenIncludeCaption={dailyGenIncludeCaption}
                setDailyGenIncludeCaption={setDailyGenIncludeCaption}
                dailyGenIncludeCoverImage={dailyGenIncludeCoverImage}
                setDailyGenIncludeCoverImage={setDailyGenIncludeCoverImage}
                selectedAppId={selectedAppId}
              />
            )}
            {contentTab === 'prompt' && (
              <PreviewPanel
                canvases={canvases}
                currentCanvasId={currentCanvasId}
                currentCanvas={currentCanvas}
                firstCard={firstCard}
                onSelectCanvas={handleSelectCanvas}
                onAddCanvas={handleAddCanvas}
                onDeleteCanvas={handleDeleteCanvas}
                backgroundColor={backgroundColor}
                imageSize={imageSize}
                textSize={textSize}
                mode={mode}
                videoBackgroundUrl={videoBackgroundUrl}
                videoThumbnailUrl={videoThumbnailUrl}
                mounted={mounted}
                automateDailyResults={contentTab === 'prompt' ? automateDailyResults : undefined}
                automateDailyVideoTitle={contentTab === 'prompt' ? automateDailyVideoTitle : undefined}
                automateDailyTitle={contentTab === 'prompt' ? automateDailyTitle : undefined}
                automateDailyTemplatePrompt={contentTab === 'prompt' ? automateDailyTemplatePrompt : undefined}
                automateDailyIndex={automateDailyIndex}
                onAutomateDailyIndexChange={setAutomateDailyIndex}
                onRetryDailyItem={handleRetryDailyItem}
                onRetryDailyPromptOnly={handleRetryDailyPromptOnly}
                onSetDailyPrompt={handleSetDailyPromptAtIndex}
                onRetryDailyQuestionOnly={handleRetryDailyQuestionOnly}
                automateDailyPrompts={contentTab === 'prompt' ? automateDailyRowPrompts : undefined}
                automateDailyQuestions={contentTab === 'prompt' ? automateDailyRowQuestions : undefined}
                automateQuestionOptions={
                  selectedAppId === 'fab'
                    ? [...FAB_HEART_MESSAGES]
                    : automateQuestionType === 'random'
                      ? allQuestionPools()
                      : [...questionPoolForType(automateQuestionType)]
                }
                automatePromptOptions={
                  selectedAppId === 'fab' ? [...FAB_PAPER_COLORS] : [...PROMPTS]
                }
                automateTemplatePromptOptions={[...SPILL_IT_TEMPLATE_COVER_PROMPTS]}
                automateTemplateQuestionOptions={[...templateTitlePool]}
                automateResolvedQuestionType={
                  contentTab === 'prompt' ? automateResolvedQuestionType : null
                }
                onSetDailyQuestion={handleSetDailyQuestionAtIndex}
                onRetryTemplatePrompt={handleRetryTemplatePrompt}
                isRetryingTemplatePrompt={isRetryingTemplatePrompt}
                onRetryTemplatePromptOnly={handleRetryTemplatePromptOnly}
                onRetryTemplateQuestionOnly={handleRetryTemplateQuestionOnly}
                isRetryingTemplateQuestion={isRetryingTemplateQuestion}
                automateTemplateReplacementText={
                  contentTab === 'prompt' ? automateDailyTemplateReplacementText : undefined
                }
                onSetTemplateQuestion={handleSetTemplateQuestion}
                automateTemplatePromptRaw={
                  contentTab === 'prompt' ? automateDailyTemplatePromptRaw : undefined
                }
                onSetTemplatePrompt={handleSetTemplatePrompt}
                onEditTemplatePromptText={handleEditTemplatePromptText}
                onEditDailyResultText={handleEditDailyResultText}
                onRegenerateDailyVideoTitle={handleRegenerateDailyVideoTitle}
                onRegenerateDailyCaption={handleRegenerateDailyCaption}
                isRetryingDailyVideoTitle={isRetryingDailyVideoTitle}
                isRetryingDailyCaption={isRetryingDailyCaption}
                isAutomateNanaMode={contentTab === 'prompt'}
              />
            )}
            {contentTab === 'logo' && <LogoGeneratorPanel />}
            {contentTab === 'strip-metadata' && <StripMetadataPanel />}
            {contentTab === 'copycat' && (
              <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
                <div className="mb-4 flex flex-col gap-4 sm:mb-6">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      Copycat
                    </h2>
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      Pull posts from a competitor and recreate them.
                    </p>
                  </div>
                  <div className="flex w-full min-w-0 flex-col items-start gap-3">
                    <div className="w-full max-w-md text-left">
                      <label
                        htmlFor="copycat-competitor"
                        className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
                      >
                        Competitor
                      </label>
                      <select
                        id="copycat-competitor"
                        value={selectedCopycatCompetitorId}
                        onChange={(e) =>
                          setSelectedCopycatCompetitorId(e.target.value as CopycatCompetitorId)
                        }
                        className="w-full min-w-0 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 md:min-w-[10.5rem] md:w-auto md:py-2"
                      >
                        {COPYCAT_COMPETITORS.map((competitor) => (
                          <option key={competitor.id} value={competitor.id}>
                            {competitor.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full text-left">
                      <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Template
                      </p>
                      <div className="grid grid-cols-3 gap-2 md:grid-cols-8">
                        {COPYCAT_TEMPLATE_IDS.map((templateId) => {
                          const card = getImageTemplatesForApp('spill-it').find(
                            (c) => c.id === templateId
                          );
                          const selected = selectedCopycatTemplateId === templateId;
                          return (
                            <button
                              key={templateId}
                              type="button"
                              onClick={() => {
                                if (selectedCopycatTemplateId !== templateId) {
                                  setSelectedCopycatCompetitorId((competitor) =>
                                    pickRandomCopycatCompetitor(competitor)
                                  );
                                }
                                setSelectedCopycatTemplateId(templateId);
                              }}
                              title={card?.title ?? `Template ${templateId}`}
                              className={`min-w-0 rounded-lg border p-1.5 text-left transition-colors sm:p-1 ${
                                selected
                                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800'
                                  : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-zinc-400 dark:hover:border-zinc-500'
                              }`}
                            >
                              <div className="aspect-3/4 w-full overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-700">
                                {card?.coverSrc ? (
                                  <img
                                    src={card.coverSrc}
                                    alt={card.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                                    {templateId}
                                  </div>
                                )}
                              </div>
                              <p className="mt-1 truncate text-center text-[11px] font-medium text-zinc-700 dark:text-zinc-300 sm:text-[10px]">
                                {templateId}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <CopycatPanel
                  competitorId={selectedCopycatCompetitorId}
                  templateId={selectedCopycatTemplateId}
                  onNewRandomPost={() =>
                    setSelectedCopycatCompetitorId((current) =>
                      pickRandomCopycatCompetitor(current)
                    )
                  }
                />
              </div>
            )}
            {contentTab === 'automate' && (
              <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 p-6 flex items-center justify-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                  Batch automation tools will live here. Connect Google Drive in Settings (gear icon) to sync uploads to your phone.
                </p>
              </div>
            )}
            {contentTab === 'character' && (
              <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-1">
                {selectedCharacter === null ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Pick a character
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {characterCards.length === 0
                          ? 'No characters for this app yet.'
                          : 'Select one to start.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                      {characterCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setSelectedCharacterId(card.id)}
                          className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-2 md:p-3 text-left hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className="aspect-3/4 w-full rounded-lg mb-3 overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-600/80">
                            {card.coverSrc ? (
                              <img
                                src={card.coverSrc}
                                alt={`${card.name} preview`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-b from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {card.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <CharacterStudio
                    character={selectedCharacter}
                    selectedAppId={selectedAppId}
                    onBack={() => setSelectedCharacterId(null)}
                  />
                )}
              </div>
            )}
            {contentTab === 'image' && (
              <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-1">
                {selectedImageTemplateId === null ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pick a template</h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {imageTemplateCards.length === 0
                          ? 'No image templates for this app yet.'
                          : 'Select one to start.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                      {imageTemplateCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => {
                            setSelectedImageTemplateId(card.id);
                            regenerateImageTemplateContent(card.id);
                          }}
                          className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-2 md:p-3 text-left hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className="aspect-3/4 w-full rounded-lg mb-3 overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-600/80">
                            {card.coverSrc ? (
                              <img
                                src={card.coverSrc}
                                alt={`${card.title} preview`}
                                className="w-full h-full object-cover"
                              />
                            ) : selectedAppId === 'spill-it' &&
                              (card.id === 1 || card.id === 6) ? (
                              <div
                                className="w-full h-full relative"
                                style={{
                                  backgroundColor:
                                    card.id === 6 ? IMAGE_TEMPLATE6_FRAME_BG : '#FEFEFE',
                                }}
                              >
                                {(() => {
                                  const previewIllustration =
                                    card.id === 6
                                      ? IMAGE_TEMPLATE6_BEAR_SRC
                                      : dogImagePool[0];
                                  return previewIllustration ? (
                                    <img
                                      src={previewIllustration}
                                      alt="Cover template preview"
                                      className="absolute left-1/2 -translate-x-1/2 bottom-[6%] max-w-[42%] max-h-[24%] object-contain"
                                    />
                                  ) : null;
                                })()}
                              </div>
                            ) : (
                              <div className="w-full h-full bg-linear-to-b from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{card.title}</p>
                          {card.subtitle ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.subtitle}</p> : null}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    className="w-full min-w-0 max-w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
                    style={{ fontFamily: '"Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif' }}
                  >
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedImageTemplateId(null)}
                        className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Back
                      </button>
                      <p className="order-3 w-full text-xs font-medium text-zinc-800 dark:text-zinc-200 sm:order-0 sm:w-auto sm:text-sm">
                        Template {selectedImageTemplateId}
                      </p>
                      <div className="order-2 ml-auto flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                        {isKawaiiLayoutImageTemplate ||
                        isCouplesDoodleImageTemplate ||
                        isMaroonLockscreenImageTemplate ||
                        isColorCardImageTemplate ||
                        isNotesQuestionsImageTemplate ||
                        isPastelCarouselImageTemplate ||
                        isPinterestCoverImageTemplate ||
                        isPinterestCoverOnlyImageTemplate ? (
                          <button
                            type="button"
                            onClick={() => regenerateImageTemplateContent(selectedImageTemplateId!)}
                            disabled={
                              isImageTemplateDownloading ||
                              isImageTemplateUploading ||
                              isImageTemplate7CoverLoading ||
                              isGeneratingTemplate12
                            }
                            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {(isPinterestCoverImageTemplate || isPinterestCoverOnlyImageTemplate) &&
                            isImageTemplate7CoverLoading
                              ? 'Loading…'
                              : 'Retry'}
                          </button>
                        ) : null}
                        {isCouplesDoodleImageTemplate ||
                        (isMaroonLockscreenImageTemplate && (imageTabSources[0] ?? '').trim()) ? (
                          <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                            <span>Quality</span>
                            <select
                              value={template12Quality}
                              onChange={(e) =>
                                setTemplate12Quality(e.target.value as CharacterImageQuality)
                              }
                              disabled={isGeneratingTemplate12}
                              className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 sm:py-1 text-sm sm:text-xs text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
                            >
                              {CHARACTER_IMAGE_QUALITIES.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                        {isCouplesDoodleImageTemplate ||
                        (isMaroonLockscreenImageTemplate && (imageTabSources[0] ?? '').trim()) ? (
                          <button
                            type="button"
                            onClick={() =>
                              void (isMaroonLockscreenImageTemplate
                                ? handleStartTemplate13Cover()
                                : handleStartTemplate12())
                            }
                            disabled={isGeneratingTemplate12 || isImageTemplateDownloading}
                            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingTemplate12 ? 'Generating…' : 'Start'}
                          </button>
                        ) : null}
                        {isPinterestCoverImageTemplate || isPinterestCoverOnlyImageTemplate ? (
                          <button
                            type="button"
                            onClick={() => void refreshActivePinterestImage()}
                            disabled={
                              isImageTemplateDownloading ||
                              isImageTemplateUploading ||
                              isImageTemplate7CoverLoading
                            }
                            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isImageTemplate7CoverLoading ? 'Loading…' : 'Retry image'}
                          </button>
                        ) : null}
                        {isPastelCarouselImageTemplate ? (
                          <>
                            <button
                              type="button"
                              onClick={regenerateImageTemplate2Colors}
                              disabled={
                            isImageTemplateDownloading ||
                            isImageTemplateUploading
                          }
                              className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Change color
                            </button>
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleDownloadImageFrame}
                          disabled={
                            isImageTemplateDownloading ||
                            isImageTemplateUploading ||
                            isImageTemplate7CoverLoading ||
                            isGeneratingTemplate12 ||
                            (isCouplesDoodleImageTemplate &&
                              imageTabSources
                                .slice(0, IMAGE_TEMPLATE12_SLIDE_COUNT)
                                .filter((src) => src.trim()).length < IMAGE_TEMPLATE12_SLIDE_COUNT) ||
                            (isPinterestCoverImageTemplate &&
                              !imageTemplate7SourcesReady(imageTabSources)) ||
                            (isPinterestCoverOnlyImageTemplate && !(imageTabSources[0] ?? '').trim())
                          }
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isImageTemplateDownloading ? (
                            <>
                              <svg
                                className="h-4 w-4 shrink-0 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>Downloading…</span>
                            </>
                          ) : (
                            'Download'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handlePostImageTemplateToInstagram()}
                          disabled={
                            !instagramAccount ||
                            isInstagramPosting ||
                            isImageTemplateDownloading ||
                            isImageTemplateUploading ||
                            isImageTemplate7CoverLoading ||
                            (isPinterestCoverImageTemplate &&
                              !imageTemplate7SourcesReady(imageTabSources)) ||
                            (isPinterestCoverOnlyImageTemplate && !(imageTabSources[0] ?? '').trim())
                          }
                          title={
                            instagramAccount
                              ? `Post carousel as @${instagramAccount.username}`
                              : instagramError ?? 'Instagram not configured'
                          }
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isInstagramPosting ? (
                            <>
                              <svg
                                className="h-4 w-4 shrink-0 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>Posting…</span>
                            </>
                          ) : (
                            'Post to Instagram'
                          )}
                        </button>
                        {isKawaiiLayoutImageTemplate ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleUploadImageTemplateToFolder(
                                selectedImageTemplateId,
                                KAWAII_DRIVE_FOLDER_ID
                              )
                            }
                            disabled={
                            isImageTemplateDownloading ||
                            isImageTemplateUploading
                          }
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isImageTemplateUploading ? (
                              <>
                                <svg
                                  className="h-4 w-4 shrink-0 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  aria-hidden
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                <span>Uploading…</span>
                              </>
                            ) : (
                              'Upload to folder'
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex gap-1 p-2 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto min-w-0 max-w-full">
                      {Array.from({ length: imageTemplateTabCount }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedImageBrowserTab(i)}
                          className={`px-2.5 md:px-3 py-1.5 rounded-md text-xs md:text-sm whitespace-nowrap transition-colors ${
                            selectedImageBrowserTab === i
                              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {i === 0
                            ? 'Cover'
                            : i <= imageTemplateQuestionCount
                              ? `Q${i}`
                              : 'CTA'}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 sm:p-4 md:p-6 w-full min-w-0 max-w-full box-border">
                      <div className="flex flex-col md:flex-row items-start gap-4 min-w-0 w-full">
                        <div
                          className={`@container relative w-full max-w-sm mx-auto md:mx-0 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden min-w-0 ${
                            isCouplesDoodleImageTemplate
                              ? 'aspect-[2/3]'
                              : 'aspect-3/4'
                          }`}
                          style={{
                            backgroundColor: isColorCardImageTemplate
                              ? IMAGE_TEMPLATE14_FRAME_BG
                              : isNotesQuestionsImageTemplate
                              ? IMAGE_TEMPLATE16_BG
                              : isMaroonLockscreenImageTemplate
                              ? IMAGE_TEMPLATE13_BG
                              : isCouplesDoodleImageTemplate
                              ? IMAGE_TEMPLATE12_FRAME_BG
                              : isPinterestCoverOnlyImageTemplate
                              ? '#000000'
                              : activeImageFrameBg,
                          }}
                        >
                          {isNotesQuestionsImageTemplate ? (
                            <NotesQuestionsPreview
                              text={imageFrameTextForActiveTab}
                              tabIndex={selectedImageBrowserTab}
                            />
                          ) : isColorCardImageTemplate ? (
                            <>
                            <div
                              className="pointer-events-none absolute"
                              style={{
                                left: `${IMAGE_TEMPLATE14_CARD_INSET_X * 100}%`,
                                top: `${IMAGE_TEMPLATE14_CARD_INSET_Y * 100}%`,
                                width: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_X * 2) * 100}%`,
                                height: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_Y * 2) * 100}%`,
                                borderRadius: `${IMAGE_TEMPLATE14_CARD_RADIUS_RATIO * 100}cqw`,
                                backgroundColor: activeImageFrameBg,
                                transform: `scale(${IMAGE_TEMPLATE14_EDGE_SCALE})`,
                                filter: `blur(${IMAGE_TEMPLATE14_EDGE_BLUR_RATIO * 100}cqw)`,
                              }}
                              aria-hidden
                            />
                            <div
                              className="pointer-events-none absolute overflow-hidden"
                              style={{
                                left: `${IMAGE_TEMPLATE14_CARD_INSET_X * 100}%`,
                                top: `${IMAGE_TEMPLATE14_CARD_INSET_Y * 100}%`,
                                width: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_X * 2) * 100}%`,
                                height: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_Y * 2) * 100}%`,
                                borderRadius: `${IMAGE_TEMPLATE14_CARD_RADIUS_RATIO * 100}cqw`,
                                backgroundColor: activeImageFrameBg,
                              }}
                              aria-hidden
                            >
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: `url(${IMAGE_TEMPLATE14_GRAIN_SRC})`,
                                  backgroundSize: '80px',
                                  opacity: 0.85,
                                  mixBlendMode: 'multiply',
                                }}
                              />
                            </div>
                            <div
                              className="absolute z-10"
                              style={{
                                left: `${IMAGE_TEMPLATE14_CARD_INSET_X * 100}%`,
                                top: `${IMAGE_TEMPLATE14_CARD_INSET_Y * 100}%`,
                                width: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_X * 2) * 100}%`,
                                height: `${(1 - IMAGE_TEMPLATE14_CARD_INSET_Y * 2) * 100}%`,
                              }}
                            >
                              {(() => {
                                const isCoverTab = selectedImageBrowserTab === 0;
                                const { question, options } = isCoverTab
                                  ? { question: imageFrameTextForActiveTab, options: '' }
                                  : splitCopycatQuestionAndOptions(imageFrameTextForActiveTab);
                                const hasOptions = Boolean(options);
                                return (
                              <div
                                className={`absolute z-10 w-[78%] whitespace-pre-wrap wrap-break-word ${
                                  hasOptions
                                    ? 'left-[11%] text-left'
                                    : 'left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'
                                }`}
                                style={{
                                  top: `${
                                    (hasOptions
                                      ? IMAGE_TEMPLATE14_OPTION_TOP_RATIO
                                      : selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX
                                        ? IMAGE_TEMPLATE14_CTA_TEXT_CENTER_RATIO
                                        : 0.5) * 100
                                  }%`,
                                  color: template14TextForBackground(activeImageFrameBg),
                                  fontFamily: IMAGE_TEMPLATE14_FONT_STACK,
                                  maxHeight:
                                    selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX
                                      ? `${IMAGE_TEMPLATE14_CTA_TEXT_MAX_HEIGHT_RATIO * 100}%`
                                      : undefined,
                                  overflow:
                                    selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX
                                      ? 'hidden'
                                      : undefined,
                                }}
                              >
                                <p
                                  className="m-0"
                                  style={{
                                    fontSize: `${
                                      (isCoverTab
                                        ? IMAGE_TEMPLATE14_COVER_SIZE_RATIO
                                        : template14QuestionSizeRatio(
                                            question,
                                            selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX
                                          )) * 100
                                    }cqw`,
                                    fontWeight: 400,
                                    lineHeight: IMAGE_TEMPLATE14_LINE_HEIGHT,
                                  }}
                                >
                                  {question}
                                </p>
                                {hasOptions ? (
                                  <p
                                    className="m-0"
                                    style={{
                                      marginTop: `${IMAGE_TEMPLATE14_OPTION_GAP}em`,
                                      fontSize: `${IMAGE_TEMPLATE14_OPTION_SIZE_RATIO * 100}cqw`,
                                      fontWeight: 400,
                                      lineHeight: IMAGE_TEMPLATE14_OPTION_LINE_HEIGHT,
                                    }}
                                  >
                                    {options}
                                  </p>
                                ) : null}
                              </div>
                                );
                              })()}
                              {selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? null : (
                                <p
                                  className="absolute inset-x-[8%] z-10 text-center"
                                  style={{
                                    top: `${IMAGE_TEMPLATE14_MARK_Y_RATIO * 100}%`,
                                    color: template14TextForBackground(activeImageFrameBg),
                                    fontFamily: IMAGE_TEMPLATE14_FONT_STACK,
                                    fontSize: `${IMAGE_TEMPLATE14_MARK_SIZE_RATIO * 100}cqw`,
                                  }}
                                >
                                  {IMAGE_TEMPLATE14_MARK}
                                </p>
                              )}
                            </div>
                            {selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? (
                              <>
                                <p
                                  className="absolute inset-x-[6%] z-20 text-center font-bold text-white"
                                  style={{
                                    fontFamily: pastelCarouselFontFamily,
                                    fontSize: `${IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO * (4 / 3) * 100}cqw`,
                                    bottom: `${(IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO + IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO) * 100}%`,
                                  }}
                                >
                                  {IMAGE_TEMPLATE2_Q5_PROMO_LABEL}
                                </p>
                                <img
                                  src={IMAGE_TEMPLATE2_Q5_PROMO_SRC}
                                  alt="Spill It on the App Store"
                                  className="absolute left-1/2 z-20 -translate-x-1/2"
                                  style={{
                                    width: `${IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO * 100}%`,
                                    maxWidth: 'none',
                                    top: `${(1 - IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO) * 100}%`,
                                  }}
                                />
                              </>
                            ) : null}
                            </>
                          ) : isMaroonLockscreenImageTemplate ? (
                            selectedImageBrowserTab === 0 && (imageTabSources[0] ?? '').trim() ? (
                              <>
                                <img
                                  src={(imageTabSources[0] ?? '').trim()}
                                  alt="Template 13 cover"
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                                {isGeneratingTemplate12 ? (
                                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 px-6 text-center text-sm font-medium text-white">
                                    {template12Status || 'Generating cover…'}
                                  </div>
                                ) : null}
                                {template12Error ? (
                                  <div className="absolute inset-x-3 bottom-3 z-20 rounded-md bg-red-600/90 px-3 py-2 text-xs text-white">
                                    {template12Error}
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <>
                                <div
                                  className="absolute z-20 overflow-hidden rounded-full"
                                  style={{
                                    left: `${IMAGE_TEMPLATE13_PROGRESS_INSET * 100}%`,
                                    right: `${IMAGE_TEMPLATE13_PROGRESS_INSET * 100}%`,
                                    top: `${IMAGE_TEMPLATE13_PROGRESS_Y * 100}%`,
                                    height: `${IMAGE_TEMPLATE13_PROGRESS_H * 100}%`,
                                    backgroundColor: 'rgba(255,255,255,0.35)',
                                  }}
                                >
                                  <div
                                    className="h-full bg-white"
                                    style={{
                                      width: `${template13ProgressRatio(selectedImageBrowserTab, imageTemplateTabCount) * 100}%`,
                                    }}
                                  />
                                </div>
                            {selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? (
                              <>
                                <div
                                  className="absolute inset-0 flex items-center justify-center text-center"
                                  style={{ paddingLeft: `${IMAGE_TEMPLATE13_SIDE_PAD * 100}%`, paddingRight: `${IMAGE_TEMPLATE13_SIDE_PAD * 100}%` }}
                                >
                                  <p
                                    className="w-full wrap-break-word text-white"
                                    style={{
                                    fontFamily: IMAGE_TEMPLATE13_FONT_STACK,
                                    fontSize: `${IMAGE_TEMPLATE13_QUESTION_SIZE * 100}cqw`,
                                    fontWeight: IMAGE_TEMPLATE13_FONT_WEIGHT,
                                      letterSpacing: IMAGE_TEMPLATE13_LETTER_SPACING,
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {imageFrameTextForActiveTab}
                                  </p>
                                </div>
                                <div
                                  className="absolute left-0 right-0 z-20 flex flex-col items-center px-[6%]"
                                  style={{ top: `${IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO * 100}%` }}
                                >
                                  <p
                                    className="w-full text-center text-white wrap-break-word"
                                    style={{
                                      fontFamily: pastelCarouselFontFamily,
                                      fontSize: `${IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO * 100}cqw`,
                                      fontWeight: IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
                                      lineHeight: IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
                                      textShadow: '0 1px 8px rgba(0,0,0,0.55)',
                                    }}
                                  >
                                    {IMAGE_TEMPLATE8_Q5_SEARCH_LINES.map((line) => (
                                      <span key={line} className="block">
                                        {line}
                                      </span>
                                    ))}
                                  </p>
                                  <img
                                    src={IMAGE_TEMPLATE8_Q5_BANNER_SRC}
                                    alt="Spill It - Couples Questions"
                                    className="overflow-hidden"
                                    style={{
                                      width: `${IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO * 100}%`,
                                      marginTop: `${IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO * 100}%`,
                                      borderRadius: `${(
                                        (IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO *
                                          IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO) /
                                        IMAGE_TEMPLATE8_Q5_BANNER_ASPECT
                                      ) * 100}cqw`,
                                    }}
                                  />
                                </div>
                              </>
                            ) : (
                              <div
                                className="absolute inset-0 flex items-center justify-center text-center"
                                style={{
                                  paddingLeft: `${IMAGE_TEMPLATE13_SIDE_PAD * 100}%`,
                                  paddingRight: `${IMAGE_TEMPLATE13_SIDE_PAD * 100}%`,
                                }}
                              >
                                <p
                                  className="w-full wrap-break-word text-white"
                                  style={{
                                    fontFamily: IMAGE_TEMPLATE13_FONT_STACK,
                                    fontSize: `${
                                      (selectedImageBrowserTab === 0
                                        ? IMAGE_TEMPLATE13_COVER_SIZE
                                        : IMAGE_TEMPLATE13_QUESTION_SIZE) * 100
                                    }cqw`,
                                    fontWeight: IMAGE_TEMPLATE13_FONT_WEIGHT,
                                    letterSpacing: IMAGE_TEMPLATE13_LETTER_SPACING,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {imageFrameTextForActiveTab}
                                </p>
                              </div>
                            )}
                              </>
                            )
                          ) : isCouplesDoodleImageTemplate ? (
                            <>
                              {(imageTabSources[selectedImageBrowserTab] ?? '').trim() ? (
                                <img
                                  src={imageTabSources[selectedImageBrowserTab]}
                                  alt={`${imageTabLabelForActiveTab} preview`}
                                  className="absolute inset-0 h-full w-full object-contain"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                                  <p className="text-sm text-zinc-600">
                                    {isGeneratingTemplate12
                                      ? template12Status || 'Generating…'
                                      : 'Click Start to generate this slide'}
                                  </p>
                                </div>
                              )}
                              {isImageTemplate12Id(selectedImageTemplateId) &&
                              selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? (
                                <img
                                  src={IMAGE_TEMPLATE2_Q5_PROMO_SRC}
                                  alt="Spill It on the App Store"
                                  className="absolute bottom-0 left-1/2 z-10 max-w-none -translate-x-1/2 object-cover object-top"
                                  style={{
                                    width: `${IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO * 100}%`,
                                    height: `${IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO * 100}%`,
                                  }}
                                />
                              ) : null}
                              {isGeneratingTemplate12 ? (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 px-6 text-center text-sm font-medium text-white">
                                  {template12Status || 'Generating…'}
                                </div>
                              ) : null}
                              {template12Error ? (
                                <div className="absolute inset-x-3 bottom-3 z-20 rounded-md bg-red-600/90 px-3 py-2 text-xs text-white">
                                  {template12Error}
                                </div>
                              ) : null}
                            </>
                          ) : isTopDownSelfieImageTemplate ? (
                            selectedImageBrowserTab === 0 ? (
                            <>
                              {imageSourceForActiveTab ? (
                                <img
                                  src={imageSourceForActiveTab}
                                  alt={`${imageTabLabelForActiveTab} preview`}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                              {(imageTabTexts[0] ?? '').trim() ? (
                                <div
                                  className="absolute z-10 pointer-events-none"
                                  style={{
                                    left: `${imageTemplate9TitleAnchor.x * 100}%`,
                                    top: `${imageTemplate9TitleAnchor.y * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: `${IMAGE_TEMPLATE9_TITLE_MAX_WIDTH_RATIO * 100}%`,
                                  }}
                                >
                                  <p
                                    className="w-full text-center text-white wrap-break-word"
                                    style={{
                                      fontFamily: pastelCarouselFontFamily,
                                      fontSize: `${IMAGE_TEMPLATE9_TITLE_SIZE_RATIO * 100}cqw`,
                                      fontWeight: IMAGE_TEMPLATE9_TITLE_WEIGHT,
                                      letterSpacing: IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
                                      lineHeight: IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
                                      textShadow: '0 1px 8px rgba(0,0,0,0.45)',
                                    }}
                                  >
                                    {imageFrameTextForActiveTab}
                                  </p>
                                </div>
                              ) : null}
                            </>
                            ) : (
                              <>
                                <ImageTemplate3ImessageBubble
                                  question={imageFrameTextForActiveTab}
                                  replies={[]}
                                />
                                {selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? (
                                  <div
                                    className="absolute left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-[6%]"
                                    style={{
                                      top: `${IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO * 100}%`,
                                    }}
                                  >
                                    <p
                                      className="w-full text-center text-white wrap-break-word"
                                      style={{
                                        fontFamily: pastelCarouselFontFamily,
                                        fontSize: `${IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO * 100}cqw`,
                                        fontWeight: IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
                                        lineHeight: IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
                                        textShadow: '0 1px 8px rgba(0,0,0,0.55)',
                                      }}
                                    >
                                      {IMAGE_TEMPLATE8_Q5_SEARCH_LINES.map((line) => (
                                        <span key={line} className="block">
                                          {line}
                                        </span>
                                      ))}
                                    </p>
                                    <img
                                      src={IMAGE_TEMPLATE8_Q5_BANNER_SRC}
                                      alt="Spill It - Couples Questions"
                                      className="overflow-hidden"
                                      style={{
                                        width: `${IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO * 100}%`,
                                        marginTop: `${IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO * 100}%`,
                                        borderRadius: `${(
                                          (IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO *
                                            IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO) /
                                          IMAGE_TEMPLATE8_Q5_BANNER_ASPECT
                                        ) * 100}cqw`,
                                      }}
                                    />
                                  </div>
                                ) : null}
                              </>
                            )
                          ) : isCouplesSelfieImageTemplate ? (
                            selectedImageBrowserTab === 0 ? (
                            <>
                              {imageSourceForActiveTab ? (
                                <img
                                  src={imageSourceForActiveTab}
                                  alt={`${imageTabLabelForActiveTab} preview`}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                              {(imageTabTexts[0] ?? '').trim() ? (
                                <div
                                  className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                                  style={{
                                    paddingLeft: `${((1 - IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO) / 2) * 100}%`,
                                    paddingRight: `${((1 - IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO) / 2) * 100}%`,
                                  }}
                                >
                                  <div className="flex w-full flex-col items-center">
                                    <p
                                      className="w-full text-center text-white wrap-break-word"
                                      style={{
                                        fontFamily: pastelCarouselFontFamily,
                                        fontSize: `${IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO * 100}cqw`,
                                        fontWeight: IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
                                        letterSpacing: IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
                                        lineHeight: IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
                                        textShadow: '0 1px 8px rgba(0,0,0,0.45)',
                                      }}
                                    >
                                      {imageFrameTextForActiveTab}
                                    </p>
                                    {formatImageTemplate2CoverSubtitle(
                                      imageTemplate2CoverSubtitle
                                    ) ? (
                                      <p
                                        className="w-full text-center text-white/90 wrap-break-word"
                                        style={{
                                          fontFamily: pastelCarouselFontFamily,
                                          fontSize: `${IMAGE_TEMPLATE10_COVER_SUBTITLE_SIZE_RATIO * 100}cqw`,
                                          fontWeight: IMAGE_TEMPLATE2_COVER_SUBTITLE_WEIGHT,
                                          marginTop: `${IMAGE_TEMPLATE2_COVER_SUBTITLE_GAP_EM * IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO * 100}cqw`,
                                          lineHeight: 1.2,
                                          textShadow: '0 1px 8px rgba(0,0,0,0.45)',
                                        }}
                                      >
                                        {formatImageTemplate2CoverSubtitle(
                                          imageTemplate2CoverSubtitle
                                        )}
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              ) : null}
                            </>
                            ) : (
                              <>
                                <ImageTemplate3ImessageBubble
                                  question={imageFrameTextForActiveTab}
                                  replies={[]}
                                />
                                {selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? (
                                  <div
                                    className="absolute left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-[6%]"
                                    style={{
                                      top: `${IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO * 100}%`,
                                    }}
                                  >
                                    <p
                                      className="w-full text-center text-white wrap-break-word"
                                      style={{
                                        fontFamily: pastelCarouselFontFamily,
                                        fontSize: `${IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO * 100}cqw`,
                                        fontWeight: IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
                                        lineHeight: IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
                                        textShadow: '0 1px 8px rgba(0,0,0,0.55)',
                                      }}
                                    >
                                      {IMAGE_TEMPLATE8_Q5_SEARCH_LINES.map((line) => (
                                        <span key={line} className="block">
                                          {line}
                                        </span>
                                      ))}
                                    </p>
                                    <img
                                      src={IMAGE_TEMPLATE8_Q5_BANNER_SRC}
                                      alt="Spill It - Couples Questions"
                                      className="overflow-hidden"
                                      style={{
                                        width: `${IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO * 100}%`,
                                        marginTop: `${IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO * 100}%`,
                                        borderRadius: `${(
                                          (IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO *
                                            IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO) /
                                          IMAGE_TEMPLATE8_Q5_BANNER_ASPECT
                                        ) * 100}cqw`,
                                      }}
                                    />
                                  </div>
                                ) : null}
                              </>
                            )
                          ) : isFullBleedImageTabSelected ? (
                            imageSourceForActiveTab ? (
                              <img
                                src={imageSourceForActiveTab}
                                alt={`${imageTabLabelForActiveTab} preview`}
                                className="w-full h-full object-cover"
                              />
                            ) : null
                          ) : isPastelCarouselImageTemplate ? (
                            selectedImageBrowserTab === 0 ? (
                              <>
                              <p
                                className="absolute inset-x-[8%] top-[8%] z-10 text-center font-bold"
                                style={{
                                  color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                  fontFamily: pastelCarouselFontFamily,
                                  fontSize: '3cqw',
                                }}
                              >
                                {IMAGE_TEMPLATE2_TOP_LABEL}
                              </p>
                              <div className="absolute inset-0 z-10 flex items-center justify-center px-[20%] pointer-events-none">
                                <div className="flex w-full flex-col items-start">
                                <p
                                  className="w-full text-left wrap-break-word"
                                  style={{
                                    color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                    fontFamily: pastelCarouselFontFamily,
                                    fontSize: `${IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO * 100}cqw`,
                                    fontWeight: IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
                                    letterSpacing: IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
                                    lineHeight: IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
                                  }}
                                >
                                {imageTemplate2TitleHighlightParts ? (
                                  <>
                                    {imageTemplate2TitleHighlightParts.before}
                                    <span
                                      className="inline-block rounded-[0.08em] px-[0.12em] py-[0.1em]"
                                      style={{
                                        backgroundColor: imageTemplate2SquiggleColor,
                                        color: TITLE_HIGHLIGHT_TEXT_COLOR,
                                        transform: `rotate(${TITLE_HIGHLIGHT_TILT_RAD}rad)`,
                                      }}
                                    >
                                      {imageTemplate2TitleHighlightParts.word}
                                    </span>
                                    {imageTemplate2TitleHighlightParts.after}
                                  </>
                                ) : (
                                  imageFrameTextForActiveTab
                                )}
                                </p>
                                {formatImageTemplate2CoverSubtitle(imageTemplate2CoverSubtitle) ? (
                                  <p
                                    className="w-full text-left wrap-break-word"
                                    style={{
                                      color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                      opacity: 0.88,
                                      fontFamily: pastelCarouselFontFamily,
                                      fontSize: `${IMAGE_TEMPLATE2_COVER_SUBTITLE_SIZE_RATIO * 100}cqw`,
                                      fontWeight: IMAGE_TEMPLATE2_COVER_SUBTITLE_WEIGHT,
                                      marginTop: `${IMAGE_TEMPLATE2_COVER_SUBTITLE_GAP_EM * IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO * 100}cqw`,
                                      lineHeight: 1.2,
                                    }}
                                  >
                                    {formatImageTemplate2CoverSubtitle(imageTemplate2CoverSubtitle)}
                                  </p>
                                ) : null}
                                </div>
                              </div>
                              </>
                            ) : (
                            <>
                              <p
                                className="absolute inset-x-[8%] top-[8%] z-10 text-center font-bold"
                                style={{
                                  color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                  fontFamily: pastelCarouselFontFamily,
                                  fontSize: '3cqw',
                                }}
                              >
                                {IMAGE_TEMPLATE2_TOP_LABEL}
                              </p>
                              <div className="absolute inset-x-[8%] top-[21%] z-10">
                                <p
                                  className="mb-2 text-center text-[11px] sm:text-xs font-bold tracking-wide"
                                  style={{
                                    color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                    fontFamily: pastelCarouselFontFamily,
                                  }}
                                >
                                  {imageTabTypeLabel}
                                </p>
                                <div className="h-1.5 w-full rounded-full bg-white/35 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-white transition-[width] duration-200"
                                    style={{ width: `${pastelProgressRatio * 100}%` }}
                                  />
                                </div>
                              </div>
                              <p
                                className="absolute left-[20%] z-10 w-[60%] -translate-y-1/2 text-left font-extrabold leading-snug wrap-break-word"
                                style={{
                                  color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                  fontFamily: pastelCarouselFontFamily,
                                  fontSize: `${IMAGE_TEMPLATE2_QUESTION_SIZE_RATIO * 100}cqw`,
                                  top: `${
                                    IMAGE_TEMPLATE2_QUESTION_CENTER_RATIO * 100
                                  }%`,
                                }}
                              >
                                {imageFrameTextForActiveTab}
                              </p>
                              {selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? (
                                <>
                                <p
                                  className="absolute inset-x-[6%] z-10 text-center font-bold"
                                  style={{
                                    color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                    fontFamily: pastelCarouselFontFamily,
                                    // Ratio is frame-height based; the container query unit is width.
                                    fontSize: `${IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO * (4 / 3) * 100}cqw`,
                                    bottom: `${(IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO + IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO) * 100}%`,
                                  }}
                                >
                                  {IMAGE_TEMPLATE2_Q5_PROMO_LABEL}
                                </p>
                                <img
                                  src={IMAGE_TEMPLATE2_Q5_PROMO_SRC}
                                  alt="Spill It on the App Store"
                                  className="absolute left-1/2 z-10 -translate-x-1/2"
                                  style={{
                                    width: `${IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO * 100}%`,
                                    maxWidth: 'none',
                                    top: `${(1 - IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO) * 100}%`,
                                  }}
                                />
                                </>
                              ) : (
                                <p
                                  className="absolute inset-x-[8%] bottom-[9%] z-10 text-center text-[11px] sm:text-xs font-bold"
                                  style={{
                                    color: IMAGE_TEMPLATE2_TEXT_COLOR,
                                    fontFamily: pastelCarouselFontFamily,
                                  }}
                                >
                                  {IMAGE_TEMPLATE2_APP_FOOTER}
                                </p>
                              )}
                            </>
                            )
                          ) : (
                            <>
                              {isPinterestCoverImageTemplate && imageSourceForActiveTab ? (
                                <img
                                  src={imageSourceForActiveTab}
                                  alt={`${imageTabLabelForActiveTab} preview`}
                                  className={`absolute inset-0 z-0 h-full w-full object-cover object-center ${
                                    isCouplesCuteMomentsImageTemplate
                                      ? 'min-h-full min-w-full'
                                      : ''
                                  }`}
                                  style={
                                    isCelebrityCouplesImageTemplate
                                      ? { filter: IMAGE_TEMPLATE11_CSS_FILTER }
                                      : undefined
                                  }
                                />
                              ) : null}
                              {isCelebrityCouplesImageTemplate ? (
                                <div
                                  className="absolute inset-0 z-[1] pointer-events-none"
                                  style={{
                                    background: IMAGE_TEMPLATE10_LUXURY_PREVIEW_OVERLAY,
                                  }}
                                  aria-hidden
                                />
                              ) : null}
                              <div
                                className={`absolute z-10 pointer-events-none ${
                                  isCouplesCuteMomentsImageTemplate &&
                                  selectedImageBrowserTab >= 1 &&
                                  selectedImageBrowserTab <= 5
                                    ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
                                    : isCouplesCuteMomentsImageTemplate &&
                                        selectedImageBrowserTab === 0
                                      ? 'inset-0 flex flex-col items-center justify-center'
                                      : `left-1/2 w-full -translate-x-1/2 ${
                                        isPinterestCoverImageTemplate
                                          ? 'top-1/2 max-w-none -translate-y-1/2 px-[20%]'
                                          : `max-w-[98%] px-2 sm:px-4 ${
                                              isKawaiiLayoutImageTemplate &&
                                              selectedImageBrowserTab ===
                                                IMAGE_TEMPLATE2_Q5_TAB_INDEX
                                                ? '-translate-y-1/2'
                                                : ''
                                            }`
                                      }`
                                }`}
                                style={
                                  isCouplesCuteMomentsImageTemplate &&
                                  selectedImageBrowserTab >= 1 &&
                                  selectedImageBrowserTab <= 5
                                    ? {
                                        width: `${IMAGE_TEMPLATE10_Q_TEXT_MAX_WIDTH_RATIO * 100}%`,
                                      }
                                    : isCouplesCuteMomentsImageTemplate &&
                                        selectedImageBrowserTab === 0
                                      ? {
                                          paddingLeft: `${((1 - IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO) / 2) * 100}%`,
                                          paddingRight: `${((1 - IMAGE_TEMPLATE8_TITLE_MAX_WIDTH_RATIO) / 2) * 100}%`,
                                        }
                                    : isPinterestCoverImageTemplate
                                      ? undefined
                                      : {
                                          top:
                                            isKawaiiLayoutImageTemplate &&
                                            selectedImageBrowserTab ===
                                              IMAGE_TEMPLATE2_Q5_TAB_INDEX
                                              ? `${IMAGE_TEMPLATE2_Q5_TEXT_CENTER_RATIO * 100}%`
                                              : '21%',
                                        }
                                }
                              >
                              <p
                                className={`text-center wrap-break-word ${
                                  isPinterestCoverImageTemplate || isCouplesDoodleImageTemplate
                                    ? 'w-full whitespace-pre-line'
                                    : 'text-base sm:text-xl md:text-2xl font-semibold leading-snug whitespace-pre-line'
                                }`}
                                style={
                                  isCouplesCuteMomentsImageTemplate &&
                                  selectedImageBrowserTab !== 0
                                    ? {
                                        color: '#FFFFFF',
                                        fontFamily: pastelCarouselFontFamily,
                                        fontSize: `${IMAGE_TEMPLATE10_Q_TEXT_SIZE_RATIO * 100}cqw`,
                                        fontWeight: IMAGE_TEMPLATE10_Q_TEXT_WEIGHT,
                                        letterSpacing: IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
                                        lineHeight: IMAGE_TEMPLATE10_Q_TEXT_LINE_HEIGHT_MULT,
                                        textShadow: '0 1px 8px rgba(0,0,0,0.45)',
                                      }
                                    : isPinterestCoverImageTemplate
                                    ? {
                                        color: '#FFFFFF',
                                        fontFamily: pastelCarouselFontFamily,
                                        fontSize: `${
                                          (selectedImageBrowserTab === 0
                                            ? isCouplesCuteMomentsImageTemplate
                                              ? IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO
                                              : IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO
                                            : 0.05) * 100
                                        }cqw`,
                                        fontWeight:
                                          selectedImageBrowserTab === 0
                                            ? IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT
                                            : IMAGE_TEMPLATE2_COVER_SUBTITLE_WEIGHT,
                                        letterSpacing: IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
                                        lineHeight: IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
                                        textShadow: '0 1px 10px rgba(0,0,0,0.45)',
                                      }
                                    : {
                                        color: imageFrameExportTextColor,
                                        textShadow: 'none',
                                        letterSpacing: '0.01em',
                                        fontFamily:
                                          '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif',
                                      }
                                }
                              >
                                {imageTemplate1TitleHighlightParts ? (
                                  <>
                                    {imageTemplate1TitleHighlightParts.before}
                                    <span
                                      className="inline-block rounded-[0.08em] px-[0.12em] py-[0.1em]"
                                      style={{
                                        backgroundColor: imageTemplate1SquiggleColor,
                                        color: imageTemplate1HighlightTextColor,
                                        transform: `rotate(${TITLE_HIGHLIGHT_TILT_RAD}rad)`,
                                      }}
                                    >
                                      {imageTemplate1TitleHighlightParts.word}
                                    </span>
                                    {imageTemplate1TitleHighlightParts.after}
                                  </>
                                ) : (
                                  imageFrameTextForActiveTab
                                )}
                              </p>
                              {(isKawaiiImageTemplate ||
                                isBearsKawaiiImageTemplate ||
                                isCouplesDoodleImageTemplate ||
                                isPinterestCoverImageTemplate) &&
                              selectedImageBrowserTab === 0 &&
                              formatImageTemplate2CoverSubtitle(imageTemplate2CoverSubtitle) ? (
                                <p
                                  className={`text-center wrap-break-word ${
                                    isPinterestCoverImageTemplate || isCouplesDoodleImageTemplate
                                      ? 'w-full'
                                      : 'mt-2 text-sm sm:text-base md:text-lg font-semibold'
                                  }`}
                                  style={
                                    isPinterestCoverImageTemplate
                                      ? {
                                          color: '#FFFFFF',
                                          fontFamily: pastelCarouselFontFamily,
                                          fontSize: `${
                                            (isCouplesCuteMomentsImageTemplate
                                              ? IMAGE_TEMPLATE10_COVER_SUBTITLE_SIZE_RATIO
                                              : IMAGE_TEMPLATE2_COVER_SUBTITLE_SIZE_RATIO) * 100
                                          }cqw`,
                                          fontWeight: IMAGE_TEMPLATE2_COVER_SUBTITLE_WEIGHT,
                                          marginTop: `${
                                            IMAGE_TEMPLATE2_COVER_SUBTITLE_GAP_EM *
                                            (isCouplesCuteMomentsImageTemplate
                                              ? IMAGE_TEMPLATE10_COVER_TITLE_SIZE_RATIO
                                              : IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO) *
                                            100
                                          }cqw`,
                                          lineHeight: 1.2,
                                          opacity: 0.9,
                                          textShadow: '0 1px 10px rgba(0,0,0,0.45)',
                                        }
                                      : {
                                          color: imageFrameExportTextColor,
                                          opacity: 0.88,
                                          fontFamily:
                                            '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif',
                                        }
                                  }
                                >
                                  {formatImageTemplate2CoverSubtitle(imageTemplate2CoverSubtitle)}
                                </p>
                              ) : null}
                              </div>
                              {(isKawaiiLayoutImageTemplate || isPinterestCoverImageTemplate) &&
                              selectedImageBrowserTab === IMAGE_TEMPLATE2_Q5_TAB_INDEX ? (
                                isPinterestCoverImageTemplate ? (
                                  <div
                                    className="absolute left-0 right-0 z-20 flex flex-col items-center pointer-events-none px-[6%]"
                                    style={{
                                      top: `${IMAGE_TEMPLATE8_Q5_SEARCH_TOP_RATIO * 100}%`,
                                    }}
                                  >
                                    <p
                                      className="w-full text-center text-white wrap-break-word"
                                      style={{
                                        fontFamily: pastelCarouselFontFamily,
                                        fontSize: `${IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO * 100}cqw`,
                                        fontWeight: IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
                                        lineHeight: IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
                                        textShadow: '0 1px 8px rgba(0,0,0,0.55)',
                                      }}
                                    >
                                      {IMAGE_TEMPLATE8_Q5_SEARCH_LINES.map((line) => (
                                        <span key={line} className="block">
                                          {line}
                                        </span>
                                      ))}
                                    </p>
                                    <img
                                      src={IMAGE_TEMPLATE8_Q5_BANNER_SRC}
                                      alt="Spill It - Couples Questions"
                                      className="overflow-hidden"
                                      style={{
                                        width: `${IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO * 100}%`,
                                        marginTop: `${IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO * 100}%`,
                                        borderRadius: `${(
                                          (IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO *
                                            IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO) /
                                          IMAGE_TEMPLATE8_Q5_BANNER_ASPECT
                                        ) * 100}cqw`,
                                      }}
                                    />
                                  </div>
                                ) : (
                                <>
                                  <p
                                    className="absolute inset-x-[6%] z-20 text-center font-bold"
                                    style={{
                                      color: imageFrameExportTextColor,
                                      fontFamily:
                                        '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif',
                                      fontSize: `${IMAGE_TEMPLATE2_Q5_PROMO_LABEL_SIZE_RATIO * (4 / 3) * 100}cqw`,
                                      bottom: `${(IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO + IMAGE_TEMPLATE2_Q5_PROMO_LABEL_GAP_RATIO) * 100}%`,
                                    }}
                                  >
                                    {IMAGE_TEMPLATE2_Q5_PROMO_LABEL}
                                  </p>
                                  <img
                                    src={IMAGE_TEMPLATE2_Q5_PROMO_SRC}
                                    alt="Spill It on the App Store"
                                    className="absolute left-1/2 z-20 -translate-x-1/2"
                                    style={{
                                      width: `${IMAGE_TEMPLATE2_Q5_PROMO_WIDTH_RATIO * 100}%`,
                                      maxWidth: 'none',
                                      top: `${(1 - IMAGE_TEMPLATE2_Q5_PROMO_VISIBLE_RATIO) * 100}%`,
                                    }}
                                  />
                                </>
                                )
                              ) : !isPinterestCoverImageTemplate && imageSourceForActiveTab ? (
                                <img
                                  src={imageSourceForActiveTab}
                                  alt={`Template ${selectedImageTemplateId} preview`}
                                  className="absolute left-1/2 -translate-x-1/2 bottom-[13%] max-w-[48%] max-h-[28%] object-contain"
                                />
                              ) : null}
                            </>
                          )}
                          {((isPinterestCoverImageTemplate || isPinterestCoverOnlyImageTemplate) &&
                            isImageTemplate7CoverLoading) ? (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 text-sm font-medium text-white">
                              Loading Pinterest image…
                            </div>
                          ) : null}
                          {(isPinterestCoverImageTemplate || isPinterestCoverOnlyImageTemplate) &&
                          imageTemplate7CoverError ? (
                            <div className="absolute inset-x-3 bottom-3 z-20 rounded-md bg-red-600/90 px-3 py-2 text-xs text-white">
                              {imageTemplate7CoverError}
                            </div>
                          ) : null}
                        </div>
                        {!isFullBleedImageTabSelected ||
                        isPastelCarouselImageTemplate ||
                        isKawaiiImageTemplate ||
                        isCouplesDoodleImageTemplate ||
                        isMaroonLockscreenImageTemplate ||
                        isNotesQuestionsImageTemplate ||
                        isCouplesSelfieImageTemplate ||
                        isTopDownSelfieImageTemplate ? (
                          <div className="w-full md:w-80 md:self-start space-y-4">
                            {!isFullBleedImageTabSelected ||
                            isCouplesSelfieImageTemplate ||
                            isTopDownSelfieImageTemplate ? (
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  Frame text
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                  {isPastelCarouselImageTemplate || isBearsKawaiiImageTemplate ? (
                                    <select
                                      value={
                                        isBearsKawaiiImageTemplate
                                          ? imageTemplate6QuestionType
                                          : imageTemplate2QuestionType
                                      }
                                      onChange={(e) => {
                                        const next = e.target.value as AutomateQuestionType;
                                        if (isBearsKawaiiImageTemplate) {
                                          applyImageTemplate6QuestionType(next);
                                        } else {
                                          applyImageTemplate2QuestionType(next);
                                        }
                                      }}
                                      className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 sm:py-1 text-sm sm:text-xs text-zinc-800 dark:text-zinc-200"
                                      aria-label="Question type"
                                    >
                                      <option value="random">Random</option>
                                      <option value="funny">Funny</option>
                                      <option value="flirty">Flirty</option>
                                      <option value="me_or_you">Me or you</option>
                                      <option value="brave">Brave</option>
                                    </select>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        isPastelCarouselImageTemplate ||
                                        isBearsKawaiiImageTemplate ||
                                        isCouplesSelfieImageTemplate ||
                                        isTopDownSelfieImageTemplate
                                      ) {
                                        const contentType =
                                          isCouplesSelfieImageTemplate ||
                                          isTopDownSelfieImageTemplate
                                            ? 'funny'
                                            : (() => {
                                                const selectedType = isBearsKawaiiImageTemplate
                                                  ? imageTemplate6QuestionType
                                                  : imageTemplate2QuestionType;
                                                return selectedType === 'random'
                                                  ? concreteTypeFromImageLabel(imageTabTypeLabel)
                                                  : selectedType;
                                              })();
                                        if (selectedImageBrowserTab === 0) {
                                          const nextTitle = pickTitleForType(
                                            contentType,
                                            imageFrameTextForActiveTab
                                          );
                                          const next = [...imageTabTexts];
                                          next[0] = nextTitle;
                                          setImageTabTexts(next);
                                          if (isTopDownSelfieImageTemplate) {
                                            setImageTemplate9TitleAnchor(
                                              pickImageTemplate9TitleAnchor()
                                            );
                                          }
                                          if (
                                            isPastelCarouselImageTemplate ||
                                            isBearsKawaiiImageTemplate ||
                                            isCouplesSelfieImageTemplate
                                          ) {
                                            setImageTemplate2CoverSubtitle((current) =>
                                              pickRandomImageTemplate2CoverSubtitle(current)
                                            );
                                          }
                                          return;
                                        }
                                        const pool = questionPoolForType(contentType);
                                        const current = imageFrameTextForActiveTab;
                                        let nextQuestion =
                                          pool[Math.floor(Math.random() * pool.length)] || current;
                                        if (pool.length > 1 && nextQuestion === current) {
                                          nextQuestion =
                                            pool.find((q) => q !== current) || nextQuestion;
                                        }
                                        const next = [...imageTabTexts];
                                        next[selectedImageBrowserTab] = nextQuestion;
                                        if (
                                          selectedImageBrowserTab >= 1 &&
                                          selectedImageBrowserTab <= 5
                                        ) {
                                          const qs = [...imageTabFunnyQuestions];
                                          qs[selectedImageBrowserTab - 1] = nextQuestion;
                                          setImageTabFunnyQuestions(qs);
                                        }
                                        setImageTabTexts(next);
                                        return;
                                      }
                                      const pool = [...FUNNY_QUESTIONS];
                                      const current = imageFrameTextForActiveTab;
                                      if (
                                        (isColorCardImageTemplate ||
                                          isNotesQuestionsImageTemplate) &&
                                        selectedImageBrowserTab === 0
                                      ) {
                                        const next = [...imageTabTexts];
                                        next[0] = pickTitleForType('funny', current);
                                        setImageTabTexts(next);
                                        return;
                                      }
                                      if (
                                        isMaroonLockscreenImageTemplate &&
                                        selectedImageBrowserTab === 0
                                      ) {
                                        const titles = IMAGE_TEMPLATE13_COVER_TEXTS.filter(
                                          (line) => line !== current.trim()
                                        );
                                        const titlePool =
                                          titles.length > 0 ? titles : IMAGE_TEMPLATE13_COVER_TEXTS;
                                        const next = [...imageTabTexts];
                                        next[0] =
                                          titlePool[Math.floor(Math.random() * titlePool.length)]!;
                                        setImageTabTexts(next);
                                        return;
                                      }
                                      if (
                                        isCouplesDoodleImageTemplate &&
                                        selectedImageBrowserTab === 0
                                      ) {
                                        const next = [...imageTabTexts];
                                        next[0] = pickRandomDailyFunnyTitle(current);
                                        setImageTabTexts(next);
                                        return;
                                      }
                                      if (
                                        isPinterestCoverImageTemplate &&
                                        selectedImageBrowserTab === 0
                                      ) {
                                        const next = [...imageTabTexts];
                                        next[0] = isCouplesCuteMomentsImageTemplate
                                          ? pickTitleForType('funny', current)
                                          : pickRandomDailyFunnyTitle(current);
                                        setImageTabTexts(next);
                                        setImageTemplate2CoverSubtitle((subtitle) =>
                                          pickRandomImageTemplate2CoverSubtitle(subtitle)
                                        );
                                        return;
                                      }
                                      let nextQuestion =
                                        pool[Math.floor(Math.random() * pool.length)] || current;
                                      if (pool.length > 1 && nextQuestion === current) {
                                        nextQuestion =
                                          pool.find((q) => q !== current) || nextQuestion;
                                      }
                                      const next = [...imageTabTexts];
                                      next[selectedImageBrowserTab] = nextQuestion;
                                      setImageTabTexts(next);
                                    }}
                                    className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  >
                                    {isPastelCarouselImageTemplate || isBearsKawaiiImageTemplate
                                      ? 'Retry'
                                      : 'Random question'}
                                  </button>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={imageFrameTextForActiveTab}
                                onChange={(e) => {
                                  const next = [...imageTabTexts];
                                  next[selectedImageBrowserTab] = e.target.value;
                                  setImageTabTexts(next);
                                }}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                              />
                              {isPastelCarouselImageTemplate && selectedImageBrowserTab === 0 ? (
                                <label className="mt-3 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={imageTemplate2CoverSquiggleEnabled}
                                    onChange={(e) =>
                                      setImageTemplate2CoverSquiggleEnabled(e.target.checked)
                                    }
                                    className="rounded border-zinc-300 dark:border-zinc-600"
                                  />
                                  Cover squiggle (uses AI to pick highlight word)
                                </label>
                              ) : null}
                            </div>
                            ) : null}
                            {isPastelCarouselImageTemplate ||
                            isBearsKawaiiImageTemplate ||
                            isKawaiiImageTemplate ||
                            isCouplesDoodleImageTemplate ||
                            isMaroonLockscreenImageTemplate ||
                            isColorCardImageTemplate ||
                            isNotesQuestionsImageTemplate ||
                            isPinterestCoverImageTemplate ||
                            isCouplesSelfieImageTemplate ||
                            isTopDownSelfieImageTemplate ? (
                              <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                    Description
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => void handleGenerateImageTemplate2Description()}
                                      disabled={
                                        isGeneratingImageTemplate2Description ||
                                        imageTabTexts
                                          .slice(1, imageTemplateQuestionCount + 1)
                                          .every((q) => !q.trim())
                                      }
                                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isGeneratingImageTemplate2Description
                                        ? 'Generating…'
                                        : 'Generate description'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const text = imageTemplate2Description.trim();
                                        if (!text) return;
                                        void navigator.clipboard.writeText(text).catch(() => {});
                                      }}
                                      disabled={!imageTemplate2Description.trim()}
                                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </div>
                                <textarea
                                  value={imageTemplate2Description}
                                  onChange={(e) => setImageTemplate2Description(e.target.value)}
                                  placeholder="TikTok caption / description will appear here…"
                                  rows={5}
                                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-[6rem]"
                                />
                                {imageTemplate2Error ? (
                                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                    {imageTemplate2Error}
                                  </p>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
                        {imageTabLabelForActiveTab}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {contentTab === 'video' && (
              <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-1">
                {selectedVideoTemplateId === null ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pick a template</h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {videoTemplateCards.length === 0
                          ? 'No video templates for this app yet.'
                          : 'Select one to start.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      {videoTemplateCards.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setSelectedVideoTemplateId(card.id)}
                          className="group rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 p-2 md:p-3 text-left hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <div className="aspect-3/4 w-full rounded-lg mb-3 overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-600/80">
                            {card.coverSrc ? (
                              <img src={card.coverSrc} alt={card.title} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{card.title}</p>
                          {card.subtitle ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.subtitle}</p> : null}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full min-w-0 max-w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isFreshBakedDonutVideoTemplate && freshBakedDonutSelectedId) {
                            setFreshBakedDonutSelectedId(null);
                            return;
                          }
                          setSelectedVideoTemplateId(null);
                        }}
                        className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Back
                      </button>
                      <p className="order-3 w-full text-xs font-medium text-zinc-800 dark:text-zinc-200 sm:order-0 sm:w-auto sm:text-sm">
                        {activeVideoTemplate?.title ?? `Template ${selectedVideoTemplateId}`}
                      </p>
                      <div className="order-2 ml-auto flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:items-center">
                        {isFabAffirmationVideoTemplate ? (
                          <>
                            <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                              <span className="sr-only sm:not-sr-only sm:inline">Style</span>
                              <select
                                value={fabMontageVideoStyle}
                                onChange={(e) => {
                                  const next = e.target.value as FabMontageVideoStyleId;
                                  setFabMontageVideoStyle(next);
                                  void fetchFabMontageVideos(true, next);
                                }}
                                disabled={isFabMontageLoading || isVideoExporting}
                                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 sm:py-1 text-sm sm:text-xs text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
                              >
                                {FAB_AFFIRMATION_VIDEO_STYLES.map((style) => (
                                  <option key={style.id} value={style.id}>
                                    {style.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                              <span className="sr-only sm:not-sr-only sm:inline">Voice</span>
                              <select
                                value={fabMontageTtsProvider}
                                onChange={(e) => {
                                  const next = e.target.value as FabTtsProviderId;
                                  setFabMontageTtsProvider(next);
                                  void refreshFabMontageTts(fabMontageAffirmations, next);
                                }}
                                disabled={isFabMontageTtsLoading || isVideoExporting}
                                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 sm:py-1 text-sm sm:text-xs text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
                              >
                                {FAB_AFFIRMATION_TTS_PROVIDERS.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                              <span className="sr-only sm:not-sr-only sm:inline">Sound</span>
                              <select
                                value={fabMontageAmbientId}
                                onChange={(e) =>
                                  setFabMontageAmbientId(e.target.value as FabAmbientSoundId)
                                }
                                disabled={isVideoExporting}
                                className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 sm:py-1 text-sm sm:text-xs text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
                              >
                                {FAB_AFFIRMATION_AMBIENT_SOUNDS.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 px-1">
                              <input
                                type="checkbox"
                                checked={reuseFabMontageVideos}
                                onChange={(e) => setReuseFabMontageVideos(e.target.checked)}
                                className="rounded border-zinc-300 dark:border-zinc-600"
                              />
                              Reuse videos
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                regenerateFabMontageContent();
                                void fetchFabMontageVideos(!reuseFabMontageVideos);
                              }}
                              disabled={isFabMontageLoading || isFabMontageTtsLoading || isVideoExporting}
                              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isFabMontageLoading ? 'Loading…' : 'Regenerate'}
                            </button>
                          </>
                        ) : null}
                        {usesPexelsVideoBackground ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void handleRegenerateVideoTemplate2Video()}
                              disabled={isVideoTemplate2VideoLoading || isVideoExporting}
                              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isVideoTemplate2VideoLoading ? (
                                <>
                                  <svg
                                    className="h-4 w-4 shrink-0 animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    aria-hidden
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span>Loading…</span>
                                </>
                              ) : (
                                'Regenerate video'
                              )}
                            </button>
                            {isCouplesNatureVideoTemplate ||
                            isSpillItNotesVideoTemplate ||
                            isCinematicCoverVideoTemplate ? (
                              <button
                                type="button"
                                onClick={regenerateVideoTemplate2Type}
                                disabled={isVideoExporting}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Regenerate type
                              </button>
                            ) : null}
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleDownloadVideoTemplate}
                          disabled={
                            isFreshBakedDonutVideoTemplate
                              ? isVideoExporting ||
                                !selectedFreshBakedDonut
                              : isFabAffirmationVideoTemplate
                              ? isVideoExporting ||
                                isFabMontageLoading ||
                                isFabMontageTtsLoading ||
                                fabMontageVideoSrcs.length < FAB_AFFIRMATION_CLIP_COUNT ||
                                fabMontageSegments.length === 0
                              : usesPexelsVideoBackground
                                ? isVideoExporting || isVideoTemplate2VideoLoading || !template2PlaybackVideoSrc
                                : (!template2PlaybackVideoSrc && !activeVideoTemplate?.coverSrc) ||
                                  isVideoExporting
                          }
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVideoExporting ? (
                            <>
                              <svg
                                className="h-4 w-4 shrink-0 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>
                                {videoExportDetail ??
                                  (videoExportProgress
                                    ? `Exporting ${videoExportProgress.current}/${videoExportProgress.total}…`
                                    : 'Exporting…')}
                              </span>
                            </>
                          ) : (
                            'Download'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handlePostVideoTemplateToInstagram()}
                          disabled={
                            !instagramAccount ||
                            isInstagramPosting ||
                            isVideoExporting ||
                            isVideoTemplate2VideoLoading ||
                            (isFreshBakedDonutVideoTemplate
                              ? !selectedFreshBakedDonut
                              : isFabAffirmationVideoTemplate
                              ? isFabMontageLoading ||
                                isFabMontageTtsLoading ||
                                fabMontageVideoSrcs.length < FAB_AFFIRMATION_CLIP_COUNT ||
                                fabMontageSegments.length === 0
                              : !template2PlaybackVideoSrc)
                          }
                          title={
                            instagramAccount
                              ? `Post Reel as @${instagramAccount.username}`
                              : instagramError ?? 'Instagram not configured'
                          }
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isInstagramPosting ? (
                            <>
                              <svg
                                className="h-4 w-4 shrink-0 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                aria-hidden
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              <span>Posting…</span>
                            </>
                          ) : (
                            'Post to Instagram'
                          )}
                        </button>
                        {isCouplesNatureVideoTemplate ? (
                          <button
                            type="button"
                            onClick={() => void handleUploadCouplesNatureVideoToFolder()}
                            disabled={
                              isImageTemplateUploading || isVideoExporting || isVideoTemplate2VideoLoading
                            }
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isImageTemplateUploading ? (
                              <>
                                <svg
                                  className="h-4 w-4 shrink-0 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  aria-hidden
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                <span>Uploading…</span>
                              </>
                            ) : (
                              'Upload to folder'
                            )}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {videoExportError || videoTemplate2VideoError || fabMontageError ? (
                      <p className="px-3 pb-2 text-xs text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-700">
                        {videoExportError ?? videoTemplate2VideoError ?? fabMontageError}
                      </p>
                    ) : null}
                    <div className="p-3 sm:p-4 md:p-6 w-full min-w-0 max-w-full box-border">
                      {isFreshBakedDonutVideoTemplate ? (
                        selectedFreshBakedDonut ? (
                        <div className="flex flex-col md:flex-row items-start gap-4 min-w-0 w-full">
                          <FreshBakedDonutDetail
                            post={selectedFreshBakedDonut}
                          />
                          <div className="flex-1 min-w-0 w-full space-y-3">
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                              Clip details
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Download this clip, or go back to pick another from the grid.
                            </p>
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  Description
                                </label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void handleGenerateVideoTemplate2Description()}
                                    disabled={isGeneratingVideoTemplate2Description}
                                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isGeneratingVideoTemplate2Description
                                      ? 'Generating…'
                                      : videoTemplate2Description
                                        ? 'Regenerate'
                                        : 'Generate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const text = videoTemplate2Description.trim();
                                      if (!text) return;
                                      void navigator.clipboard.writeText(text).catch(() => {});
                                    }}
                                    disabled={!videoTemplate2Description.trim()}
                                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                              <textarea
                                value={videoTemplate2Description}
                                onChange={(e) => setVideoTemplate2Description(e.target.value)}
                                placeholder="lazy gen z caption shows up here…"
                                rows={3}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-[4.5rem]"
                              />
                              {videoTemplate2DescriptionError ? (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                  {videoTemplate2DescriptionError}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        ) : (
                          <FreshBakedDonutGallery
                            posts={freshBakedDonutPosts}
                            deletingId={freshBakedDonutDeletingId}
                            disabled={isVideoExporting}
                            onDelete={(id) => void handleDeleteFreshBakedDonut(id)}
                            onSelect={(id) => {
                              setFreshBakedDonutSelectedId(id);
                              void handleGenerateVideoTemplate2Description(
                                freshBakedDonutCaptionSource(
                                  freshBakedDonutSelectedPost(id, freshBakedDonutPosts)
                                )
                              );
                            }}
                          />
                        )
                      ) : isFabAffirmationVideoTemplate ? (
                        <div className="flex flex-col md:flex-row items-start gap-4 min-w-0 w-full">
                          <FabMontagePreview
                            videoSrcs={fabMontageVideoSrcs}
                            segments={fabMontageSegments}
                            ambientSrc={resolveFabAffirmationAmbientSrc(fabMontageAmbientId)}
                            isLoading={isFabMontageLoading}
                            isTtsLoading={isFabMontageTtsLoading}
                          />
                          <div className="flex-1 min-w-0 w-full space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                Affirmations
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => void refreshFabMontageTts(fabMontageAffirmations)}
                                  disabled={isFabMontageTtsLoading}
                                  className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                                >
                                  {isFabMontageTtsLoading ? 'Voice…' : 'Update voice'}
                                </button>
                                <button
                                  type="button"
                                  onClick={regenerateFabMontageContent}
                                  className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  Shuffle texts
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              Background clips switch every 0.5s. Text stays until TTS finishes, then clears before the next line.
                              {fabMontageTtsProvider === 'browser'
                                ? ' Browser voice is free (system TTS). Downloads are silent until you switch to ElevenLabs.'
                                : ' ElevenLabs uses your API credits.'}
                              {reuseFabMontageVideos
                                ? ' Reuse videos is on — Regenerate only reshuffles text unless you turn the switch off.'
                                : ' Reuse videos is off — Regenerate fetches 5 new Pexels clips.'}
                            </p>
                            <ol className="space-y-2 list-none">
                              {Array.from({ length: FAB_AFFIRMATION_TEXT_COUNT }, (_, i) => (
                                <li key={i}>
                                  <input
                                    type="text"
                                    value={fabMontageAffirmations[i] ?? ''}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setFabMontageAffirmations((prev) => {
                                        const next = [...prev];
                                        while (next.length < FAB_AFFIRMATION_TEXT_COUNT) next.push('');
                                        next[i] = value;
                                        return next;
                                      });
                                    }}
                                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                                  />
                                </li>
                              ))}
                            </ol>
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  Description
                                </label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void handleGenerateVideoTemplate2Description()}
                                    disabled={
                                      isGeneratingVideoTemplate2Description ||
                                      fabMontageAffirmations.every((line) => !line.trim())
                                    }
                                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isGeneratingVideoTemplate2Description
                                      ? 'Generating…'
                                      : videoTemplate2Description
                                        ? 'Regenerate'
                                        : 'Generate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const text = videoTemplate2Description.trim();
                                      if (!text) return;
                                      void navigator.clipboard.writeText(text).catch(() => {});
                                    }}
                                    disabled={!videoTemplate2Description.trim()}
                                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                              <textarea
                                value={videoTemplate2Description}
                                onChange={(e) => setVideoTemplate2Description(e.target.value)}
                                placeholder="lazy gen z caption shows up here…"
                                rows={3}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-[4.5rem]"
                              />
                              {videoTemplate2DescriptionError ? (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                  {videoTemplate2DescriptionError}
                                </p>
                              ) : (
                                <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                                  Under 10 words, plus #couplesgoals #datenightideas
                                  #relationshipgoals #coupleschallenge.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : activeVideoTemplate?.videoSrc ||
                      template2PlaybackVideoSrc ||
                      usesPexelsVideoBackground ? (
                        <div className="flex flex-col md:flex-row items-start gap-4 min-w-0 w-full">
                          <div className="relative w-full max-w-sm mx-auto md:mx-0 aspect-9/16 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-black min-w-0">
                            {template2PlaybackVideoSrc ? (
                              <>
                              <video
                              ref={
                                isNightyParticleVideoTemplate
                                  ? nightyParticleVideoRef
                                  : isNightyRainVideoTemplate
                                    ? nightyRainVideoRef
                                    : undefined
                              }
                              key={template2PlaybackVideoSrc ?? undefined}
                              src={template2PlaybackVideoSrc || undefined}
                              controls
                              playsInline
                              muted={
                                isSpillItNotesVideoTemplate ||
                                isNightyParticleVideoTemplate ||
                                isNightyRainVideoTemplate
                              }
                              onTimeUpdate={
                                usesPexelsVideoBackground
                                  ? (e) => {
                                      const el = e.currentTarget;
                                      const maxSec = isSpillItNotesVideoTemplate
                                        ? FAB_NOTES_MAX_DURATION_SEC
                                        : isNightyParticleVideoTemplate
                                          ? nightyParticleMaxDuration
                                          : isNightyRainVideoTemplate
                                            ? NIGHTY_RAIN_MAX_DURATION_SEC
                                          : VIDEO_TEMPLATE2_MAX_DURATION_SEC;
                                      if (el.currentTime >= maxSec) {
                                        el.currentTime = 0;
                                        if (
                                          isNightyParticleVideoTemplate &&
                                          nightyParticleAudioRef.current
                                        ) {
                                          nightyParticleAudioRef.current.currentTime = 0;
                                        }
                                        if (
                                          isNightyRainVideoTemplate &&
                                          nightyRainAudioRef.current
                                        ) {
                                          nightyRainAudioRef.current.currentTime = 0;
                                        }
                                      }
                                    }
                                  : undefined
                              }
                              className="absolute inset-0 z-0 h-full w-full min-w-0 object-cover"
                              style={
                                isCouplesNatureVideoTemplate
                                  ? { filter: COUPLES_NATURE_VIDEO_FILTER }
                                  : undefined
                              }
                              poster={template2PlaybackPosterSrc || undefined}
                            />
                              {isNightyParticleVideoTemplate ? (
                                <audio
                                  ref={nightyParticleAudioRef}
                                  key={nightyParticleBedAudioSrc}
                                  src={nightyParticleBedAudioSrc}
                                  preload="auto"
                                  playsInline
                                />
                              ) : isNightyRainVideoTemplate ? (
                                <audio
                                  ref={nightyRainAudioRef}
                                  key={nightyRainBedAudioSrc}
                                  src={nightyRainBedAudioSrc}
                                  preload="auto"
                                  playsInline
                                />
                              ) : null}
                            </>
                            ) : (
                              <div className="absolute inset-0 z-0 flex items-center justify-center bg-zinc-900">
                                <p className="text-xs text-zinc-400">
                                  {isVideoTemplate2VideoLoading ? 'Loading video…' : 'No video yet'}
                                </p>
                              </div>
                            )}
                            {isCouplesNatureVideoTemplate ? (
                              <div
                                className="absolute inset-0 z-5 bg-black/40 pointer-events-none"
                                aria-hidden
                              />
                            ) : isNightyRainVideoTemplate ? (
                              <div className="absolute inset-0 z-5 pointer-events-none" aria-hidden>
                                <div
                                  className="absolute inset-0"
                                  style={{ background: NIGHTY_RAIN_MIST_WASH }}
                                />
                                <div
                                  className="absolute inset-0"
                                  style={{ background: NIGHTY_RAIN_MIST_TEAL }}
                                />
                                <div
                                  className="absolute inset-0"
                                  style={{ background: NIGHTY_RAIN_MIST_TOP }}
                                />
                                <div
                                  className="absolute inset-0"
                                  style={{ background: NIGHTY_RAIN_MIST_BOTTOM }}
                                />
                                <div
                                  className="absolute inset-0"
                                  style={{ background: NIGHTY_RAIN_MIST_BLOOM }}
                                />
                                <div
                                  className="absolute inset-0"
                                  style={{ background: NIGHTY_RAIN_MIST_VIGNETTE }}
                                />
                              </div>
                            ) : null}
                            {isSpillItNotesVideoTemplate ? (
                              <FabNotesOverlay
                                title={videoOverlayCaption}
                                questions={videoTemplate2Questions}
                              />
                            ) : isNightyParticleVideoTemplate ? (
                              <NightyParticleOverlay
                                videoRef={nightyParticleVideoRef}
                                lines={nightyParticleLines}
                                timing={nightyParticleTiming}
                                accentColor={nightyParticleAccentColor}
                              />
                            ) : isNightyRainVideoTemplate ? (
                              <div className="absolute inset-0 z-10 pointer-events-none">
                                <div className="absolute inset-0 flex items-center justify-center px-[14%]">
                                  <p
                                    className="w-full max-w-[72%] text-center text-sm leading-[1.25] tracking-[-0.02em] wrap-break-word font-medium sm:text-base md:text-lg"
                                    style={{
                                      fontFamily: NIGHTY_PARTICLE_FONT_STACK,
                                      color: NIGHTY_RAIN_CAPTION_COLOR,
                                    }}
                                  >
                                    {videoOverlayCaption.trim() || NIGHTY_RAIN_CAPTION}
                                  </p>
                                </div>
                                <p
                                  className="absolute inset-x-[14%] top-[75%] -translate-y-1/2 text-center text-[11px] leading-snug tracking-[-0.02em] wrap-break-word font-medium sm:text-xs md:text-[13px]"
                                  style={{
                                    fontFamily: NIGHTY_PARTICLE_FONT_STACK,
                                    color: NIGHTY_RAIN_CAPTION_COLOR,
                                  }}
                                >
                                  {nightyRainSubline.trim() || NIGHTY_RAIN_CAPTION_SUBLINE}
                                </p>
                              </div>
                            ) : isOceanSunsetVideoTemplate ? (
                              <div className="absolute inset-0 z-10 pointer-events-none">
                                <div
                                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,142,64,0.26)_0%,rgba(255,112,56,0.14)_28%,rgba(210,72,58,0.08)_55%,rgba(120,32,48,0.14)_78%,rgba(68,14,36,0.24)_100%)]"
                                  aria-hidden
                                />
                                <div
                                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.08)_62%,rgba(0,0,0,0.28)_100%)]"
                                  aria-hidden
                                />
                                <div className="absolute inset-x-[11%] top-[16%] z-10 flex flex-col items-start text-left text-white">
                                  <p
                                    className="w-full text-xl leading-[1.15] sm:text-2xl md:text-3xl"
                                    style={{
                                      fontFamily: TIKTOK_SANS_STACK,
                                      fontWeight: 800,
                                      textShadow:
                                        '0 1px 2px rgba(0,0,0,0.85), 0 4px 18px rgba(0,0,0,0.7)',
                                    }}
                                  >
                                    {videoTemplate4Label}
                                  </p>
                                  {videoTemplate4Questions.length > 0 ? (
                                    <ol className="mt-5 w-full list-none space-y-2.5 text-sm leading-[1.25] sm:text-[15px] md:text-base">
                                      {videoTemplate4Questions.map((question, i) => (
                                        <li
                                          key={`${i}-${question.slice(0, 16)}`}
                                          style={{
                                            fontFamily: TIKTOK_SANS_STACK,
                                            fontWeight: 700,
                                            textShadow:
                                              '0 1px 2px rgba(0,0,0,0.85), 0 4px 18px rgba(0,0,0,0.7)',
                                          }}
                                        >
                                          {i + 1}. {question}
                                        </li>
                                      ))}
                                    </ol>
                                  ) : null}
                                </div>
                                <div
                                  className="absolute inset-x-[8%] bottom-[22%] z-10 flex flex-col items-center text-center text-white/95"
                                  style={{
                                    fontFamily: TIKTOK_SANS_STACK,
                                    textShadow:
                                      '0 1px 2px rgba(0,0,0,0.8), 0 3px 14px rgba(0,0,0,0.65)',
                                  }}
                                >
                                  <span className="mb-1 text-sm leading-none tracking-[0.12em] sm:text-base">
                                    ♥ ♥ ♥
                                  </span>
                                  <span className="text-xs font-bold sm:text-sm">Spill It</span>
                                </div>
                              </div>
                            ) : isCinematicCoverVideoTemplate ? (
                              <div className="absolute inset-0 z-10 pointer-events-none">
                                <div className="absolute inset-0 bg-black/20" aria-hidden />
                                <div
                                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.1)_68%,rgba(0,0,0,0.48)_100%)]"
                                  aria-hidden
                                />
                                <div className="absolute inset-0 flex items-center justify-center px-[11%]">
                                  <p
                                    className="w-full text-center text-xl leading-[1.15] text-white sm:text-2xl md:text-3xl"
                                    style={{
                                      fontFamily: TIKTOK_SANS_STACK,
                                      fontWeight: 700,
                                      textShadow:
                                        '0 1px 2px rgba(0,0,0,0.75), 0 4px 18px rgba(0,0,0,0.65)',
                                    }}
                                  >
                                    {videoOverlayCaption}
                                  </p>
                                </div>
                                <div
                                  className="absolute inset-x-0 bottom-[8%] z-10 flex flex-col items-center text-white"
                                  style={{
                                    fontFamily: TIKTOK_SANS_STACK,
                                    textShadow:
                                      '0 1px 2px rgba(0,0,0,0.7), 0 3px 14px rgba(0,0,0,0.55)',
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    className="h-7 w-7 sm:h-8 sm:w-8"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                  >
                                    <path d="M12 4v14" />
                                    <path d="m6 13 6 6 6-6" />
                                  </svg>
                                  <span className="mt-1 text-[11px] font-semibold tracking-wide sm:text-xs">
                                    {VIDEO_TEMPLATE6_SEE_DESCRIPTION}
                                  </span>
                                </div>
                              </div>
                            ) : (videoOverlayCaption.trim() ||
                              (isCouplesNatureVideoTemplate && videoTemplate2Questions.length > 0)) ? (
                              isCouplesNatureVideoTemplate ? (
                                <div className="absolute inset-x-0 top-[16%] z-10 flex flex-col items-center px-8 pointer-events-none sm:px-10">
                                  {videoOverlayCaption.trim() ? (
                                    <p
                                      className="template2-cover-caption mb-4 w-full max-w-[72%] text-center text-lg leading-[1.12] tracking-[-0.02em] wrap-break-word sm:mb-5 sm:text-xl md:text-2xl"
                                      style={{
                                        color: '#ffffff',
                                        textShadow: '0 2px 14px rgba(0, 0, 0, 0.45)',
                                      }}
                                    >
                                      {videoOverlayCaption}
                                    </p>
                                  ) : null}
                                  {videoTemplate2Questions.length > 0 ? (
                                    <ol className="template2-cover-caption mb-5 w-full max-w-[72%] list-none space-y-1 text-center text-[11px] leading-snug sm:mb-6 sm:space-y-1.5 sm:text-xs md:text-sm">
                                      {videoTemplate2Questions.map((q, i) => (
                                        <li
                                          key={`${i}-${q.slice(0, 16)}`}
                                          style={{ textShadow: '0 2px 14px rgba(0, 0, 0, 0.45)' }}
                                        >
                                          {i + 1}. {q}
                                        </li>
                                      ))}
                                    </ol>
                                  ) : null}
                                  {videoTemplate2Questions.length > 0 ? (
                                    <p
                                      className="template2-cover-caption w-full max-w-[72%] text-center text-[10px] leading-snug sm:text-[11px] md:text-xs"
                                      style={{ textShadow: '0 2px 14px rgba(0, 0, 0, 0.45)' }}
                                    >
                                      {VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES[0]}
                                      <br />
                                      {VIDEO_TEMPLATE2_SEARCH_FOOTER_LINES[1]}
                                    </p>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="absolute inset-0 z-10 flex items-center justify-center px-3 pointer-events-none">
                                  <p
                                    className="video-overlay-caption w-full max-w-[78%] text-center text-2xl leading-[1.12] tracking-[-0.02em] wrap-break-word sm:max-w-52 sm:text-3xl md:max-w-56 md:text-4xl"
                                    style={{
                                      color: '#ffffff',
                                      WebkitTextStroke: '2.5px #000000',
                                      paintOrder: 'stroke fill',
                                      textShadow:
                                        '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 8px rgba(0,0,0,0.35)',
                                    }}
                                  >
                                    {videoOverlayCaption}
                                  </p>
                                </div>
                              )
                            ) : null}
                          </div>
                          <div className="w-full md:w-80 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto md:self-start space-y-4 thin-scrollbar pr-1">
                            {isNightyParticleVideoTemplate ? (
                              <NightyParticleEditor
                                lines={nightyParticleLines}
                                timing={nightyParticleTiming}
                                accentColor={nightyParticleAccentColor}
                                waveId={nightyParticleWaveId}
                                onLinesChange={setNightyParticleLines}
                                onTimingChange={setNightyParticleTiming}
                                onAccentColorChange={setNightyParticleAccentColor}
                                onWaveChange={setNightyParticleWaveId}
                              />
                            ) : isNightyRainVideoTemplate ? (
                              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                    Video
                                  </label>
                                  <select
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                    value={nightyRainVideoId}
                                    onChange={(e) => {
                                      const next = e.target.value as NightyRainVideoId;
                                      setNightyRainVideoId(next);
                                      setNightyRainSoundId((prev) => {
                                        const allowed = nightyRainSoundsForVideo(next);
                                        if (allowed.some((s) => s.id === prev)) return prev;
                                        return nightyRainDefaultSoundForVideo(next);
                                      });
                                      void handleRegenerateVideoTemplate2Video(next);
                                    }}
                                  >
                                    {NIGHTY_RAIN_VIDEO_OPTIONS.map((v) => (
                                      <option key={v.id} value={v.id}>
                                        {v.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                                    Background sound
                                  </label>
                                  <select
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                    value={nightyRainSoundId}
                                    onChange={(e) =>
                                      setNightyRainSoundId(e.target.value as NightyRainSoundId)
                                    }
                                  >
                                    {nightyRainSoundsForVideo(nightyRainVideoId).map((s) => (
                                      <option key={s.id} value={s.id}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Caption
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-[4rem]"
                                    rows={3}
                                    value={videoOverlayCaption}
                                    onChange={(e) => setVideoOverlayCaption(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    Subline
                                  </label>
                                  <input
                                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                    value={nightyRainSubline}
                                    onChange={(e) => setNightyRainSubline(e.target.value)}
                                  />
                                </div>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  Background from Pexels (
                                  {nightyRainVideoOption(nightyRainVideoId).pexelsQuery}). Cinematic mist
                                  grade with centered white text.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setVideoOverlayCaption(NIGHTY_RAIN_CAPTION);
                                    setNightyRainSubline(NIGHTY_RAIN_CAPTION_SUBLINE);
                                  }}
                                  className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                  Reset caption
                                </button>
                              </div>
                            ) : (
                              <>
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  {isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate
                                    ? 'Title text'
                                    : isOceanSunsetVideoTemplate
                                      ? 'Question'
                                      : isCinematicCoverVideoTemplate
                                        ? 'Cover text'
                                        : 'Frame text'}
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                  {isCouplesNatureVideoTemplate ||
                                  isSpillItNotesVideoTemplate ||
                                  isCinematicCoverVideoTemplate ? (
                                    <select
                                      value={videoTemplate2QuestionType}
                                      onChange={(e) =>
                                        applyVideoTemplate2QuestionType(
                                          e.target.value as AutomateQuestionType
                                        )
                                      }
                                      className="rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1.5 sm:py-1 text-sm sm:text-xs text-zinc-800 dark:text-zinc-200"
                                      aria-label="Question type"
                                    >
                                      <option value="random">Random</option>
                                      <option value="funny">Funny</option>
                                      <option value="flirty">Flirty</option>
                                      <option value="me_or_you">Me or you</option>
                                      <option value="brave">Brave</option>
                                    </select>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isCouplesNatureVideoTemplate) {
                                        regenerateVideoTemplate2Title();
                                        return;
                                      }
                                      if (isOceanSunsetVideoTemplate) {
                                        regenerateVideoTemplate4Content();
                                        void handleRegenerateVideoTemplate2Video();
                                        return;
                                      }
                                      if (isCinematicCoverVideoTemplate) {
                                        const source = regenerateCinematicCoverContent();
                                        void handleRegenerateVideoTemplate2Video();
                                        void handleGenerateVideoTemplate2Description(source);
                                        return;
                                      }
                                      if (isSpillItNotesVideoTemplate) {
                                        regenerateFabNotesTitle();
                                        return;
                                      }
                                      const pool = [...FUNNY_QUESTIONS];
                                      const current = videoOverlayCaption;
                                      let next = pool[Math.floor(Math.random() * pool.length)] ?? current;
                                      if (pool.length > 1 && next === current) {
                                        next = pool.find((q) => q !== current) ?? next;
                                      }
                                      setVideoOverlayCaption(next);
                                    }}
                                    className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  >
                                    {isCouplesNatureVideoTemplate ||
                                    isSpillItNotesVideoTemplate ||
                                    isOceanSunsetVideoTemplate ||
                                    isCinematicCoverVideoTemplate
                                      ? 'Retry'
                                      : 'Random question'}
                                  </button>
                                </div>
                              </div>
                              {isOceanSunsetVideoTemplate ? (
                                <div className="space-y-3">
                                  <div>
                                    <label
                                      htmlFor="ocean-sunset-competitor"
                                      className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
                                    >
                                      Competitor
                                    </label>
                                    <select
                                      id="ocean-sunset-competitor"
                                      value={videoTemplate4CompetitorId}
                                      onChange={(e) => {
                                        const next = e.target.value as VideoTemplate4CompetitorFilter;
                                        setVideoTemplate4CompetitorId(next);
                                        regenerateVideoTemplate4Content(next);
                                      }}
                                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200"
                                    >
                                      <option value="all">All competitors</option>
                                      {VIDEO_TEMPLATE4_COMPETITORS.map((competitor) => (
                                        <option key={competitor.id} value={competitor.id}>
                                          {competitor.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <p className="text-sm text-zinc-800 dark:text-zinc-200">
                                    {videoTemplate4Label}
                                  </p>
                                  <div className="space-y-2">
                                    {videoTemplate4Questions.map((question, i) => (
                                      <div key={i}>
                                        <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                          Q{i + 1}
                                        </label>
                                        <input
                                          type="text"
                                          value={question}
                                          onChange={(e) =>
                                            setVideoTemplate4Content((current) => {
                                              const questions = [...current.questions];
                                              questions[i] = e.target.value;
                                              return { ...current, questions };
                                            })
                                          }
                                          placeholder={`Question ${i + 1}…`}
                                          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                              <input
                                type="text"
                                value={videoOverlayCaption}
                                onChange={(e) => setVideoOverlayCaption(e.target.value)}
                                placeholder="Type your on-video text…"
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                              />
                              )}
                            </div>
                            {isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate ? (
                              <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                    Questions
                                  </label>
                                  {isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setVideoTemplate2Questions(
                                          pickQuestionsForType(
                                            videoTemplate2QuestionType,
                                            isSpillItNotesVideoTemplate ? 5 : 7
                                          )
                                        )
                                      }
                                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                      Retry
                                    </button>
                                  ) : null}
                                </div>
                                <div className="space-y-2">
                                  {Array.from(
                                    { length: isSpillItNotesVideoTemplate ? 5 : 7 },
                                    (_, i) => (
                                    <div key={i}>
                                      <label className="mb-1 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                        Q{i + 1}
                                      </label>
                                      <input
                                        type="text"
                                        value={videoTemplate2Questions[i] ?? ''}
                                        onChange={(e) => updateVideoTemplate2Question(i, e.target.value)}
                                        placeholder={`Question ${i + 1}…`}
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                                      />
                                    </div>
                                  )
                                  )}
                                </div>
                              </div>
                            ) : null}
                              </>
                            )}
                            <div>
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  Description
                                </label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => void handleGenerateVideoTemplate2Description()}
                                    disabled={
                                      isGeneratingVideoTemplate2Description ||
                                      (!getVideoTemplateCaptionSource().cover &&
                                        getVideoTemplateCaptionSource().questions.length === 0)
                                    }
                                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isGeneratingVideoTemplate2Description
                                      ? 'Generating…'
                                      : videoTemplate2Description
                                        ? 'Regenerate'
                                        : 'Generate'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const text = videoTemplate2Description.trim();
                                      if (!text) return;
                                      void navigator.clipboard.writeText(text).catch(() => {});
                                    }}
                                    disabled={!videoTemplate2Description.trim()}
                                    className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                              <textarea
                                value={videoTemplate2Description}
                                onChange={(e) => setVideoTemplate2Description(e.target.value)}
                                placeholder="lazy gen z caption shows up here…"
                                rows={3}
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-[4.5rem]"
                              />
                              {videoTemplate2DescriptionError ? (
                                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                                  {videoTemplate2DescriptionError}
                                </p>
                              ) : (
                                <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                                  Under 10 words, plus #couplesgoals #datenightideas
                                  #relationshipgoals #coupleschallenge.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : activeVideoTemplate?.coverSrc ? (
                        <div className="relative w-full max-w-sm mx-auto aspect-3/4 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                          <img
                            src={activeVideoTemplate.coverSrc}
                            alt={activeVideoTemplate.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full max-w-sm mx-auto aspect-3/4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900/80 flex flex-col items-center justify-center gap-2 px-4">
                          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 text-center">Blank video template</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 text-center">Content for this template will go here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <DownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} onConfirm={handleGenerate} isGenerating={isGenerating} />
      <VideoDownloadModal
        isOpen={showVideoDownloadModal}
        onClose={() => !isVideoExporting && setShowVideoDownloadModal(false)}
        onConfirm={handleConfirmVideoDownload}
        isExporting={isVideoExporting}
        videoCount={videoDownloadCount}
        setVideoCount={setVideoDownloadCount}
        exportProgress={videoExportProgress}
      />
      {showToast && <Toast message={toastMessage} status={postStatus} onClose={() => { setShowToast(false); setPostStatus(null); setPublishId(null); }} />}
    </div>
  );
}
