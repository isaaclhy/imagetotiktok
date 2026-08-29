'use client';

import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import type { CanvasData } from '@/app/lib/types';
import { generateCardImage as generateCardImageLib } from '@/app/lib/generate-card-image';
import { extractDominantColor } from '@/app/lib/canvas-utils';
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
  IMAGE_TEMPLATE2_TYPE_LABELS,
  IMAGE_TEMPLATE3_TYPE_PILL_LABELS,
  type AutomateQuestionType,
  type ConcreteQuestionType,
} from '@/app/lib/constants';
import {
  drawImageTemplate3CoverOverlay,
  imageTemplate3CoverTitleFontSizePx,
  imageTemplate3CoverTypeLabelFontSizePx,
  IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT,
  IMAGE_TEMPLATE3_COVER_TYPE_LABEL_FONT_WEIGHT,
} from '@/app/lib/image-template-3-cover-overlay';
import { ImageTemplate3CoverOverlay } from '@/app/components/ImageTemplate3CoverOverlay';
import { ImageTemplate3ImessageBubble } from '@/app/components/ImageTemplate3ImessageBubble';
import {
  drawImageTemplate2CoverSlide,
  IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
  IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO,
  IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
} from '@/app/lib/image-template-2-cover';
import { imageTemplate3CoverDisplaySrc } from '@/app/lib/image-template-3-cover';
import { drawImageTemplate3ImessageSlide } from '@/app/lib/image-template-3-imessage';
import {
  DEFAULT_STUDIO_APP_ID,
  getImageTemplatesForApp,
  getVideoTemplatesForApp,
  resolveStudioAppId,
  type StudioAppId,
} from '@/app/lib/apps';
import {
  FAB_HEART_MESSAGES,
  FAB_PAPER_COLORS,
  fillFabHeartPaperPrompt,
} from '@/app/lib/fab-prompts';
import {
  splitTitleAroundHighlight,
  squiggleColorForBackground,
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
import { transcodeWebmToMp4 } from '@/app/lib/webm-to-mp4';

type ContentTab = 'image' | 'video' | 'prompt' | 'automate';

type AppUrlState = {
  contentTab: ContentTab;
  selectedAppId: StudioAppId;
  selectedImageTemplateId: number | null;
  selectedVideoTemplateId: number | null;
  selectedImageBrowserTab: number;
};

const CONTENT_TABS: ContentTab[] = ['image', 'video', 'prompt', 'automate'];

function pexelsVideoProxySrc(directUrl: string): string {
  // Local / relative assets don't need the Pexels proxy.
  if (directUrl.startsWith('/') || !/^https?:\/\//i.test(directUrl)) {
    return directUrl;
  }
  return `/api/pexels/video-proxy?url=${encodeURIComponent(directUrl)}`;
}

async function fetchRandomPexelsVideoUrlForExport(): Promise<string> {
  const query =
    VIDEO_TEMPLATE2_PEXELS_QUERIES[Math.floor(Math.random() * VIDEO_TEMPLATE2_PEXELS_QUERIES.length)]!;
  const page = 1 + Math.floor(Math.random() * 15);
  const res = await fetch(
    `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}&preferHeight=1080`
  );
  const data = (await res.json()) as { videoUrl?: string; error?: string };
  if (!res.ok || !data.videoUrl) {
    throw new Error(data.error || 'Failed to fetch video');
  }
  return pexelsVideoProxySrc(data.videoUrl);
}

function parsePositiveInt(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function readAppUrlState(): AppUrlState {
  if (typeof window === 'undefined') {
    return {
      contentTab: 'image',
      selectedAppId: DEFAULT_STUDIO_APP_ID,
      selectedImageTemplateId: null,
      selectedVideoTemplateId: null,
      selectedImageBrowserTab: 0,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const tabRaw = params.get('tab');
  const contentTab = CONTENT_TABS.includes(tabRaw as ContentTab) ? (tabRaw as ContentTab) : 'image';
  const appRaw = params.get('app');
  const selectedAppId = resolveStudioAppId(appRaw);

  let selectedImageTemplateId: number | null = null;
  let selectedVideoTemplateId: number | null = null;
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

  return {
    contentTab,
    selectedAppId,
    selectedImageTemplateId,
    selectedVideoTemplateId,
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

  if (state.contentTab === 'image' && state.selectedImageTemplateId !== null) {
    params.set('imageTemplate', String(state.selectedImageTemplateId));
    params.set('frame', String(state.selectedImageBrowserTab));
  }

  if (state.contentTab === 'video' && state.selectedVideoTemplateId !== null) {
    params.set('videoTemplate', String(state.selectedVideoTemplateId));
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

function drawVideoTemplate2OverlayOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  questions: string[]
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

  if (hasTitle) {
    y = drawNaturalWhiteWrappedBlock(ctx, w, y, title, {
      fontSizePx: titleFontSize,
      maxWidthRatio,
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
  if (typeof document === 'undefined') return NIGHTY_PARTICLE_CANVAS_FONT_STACK;
  const fromVar = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-inter')
    .trim();
  if (fromVar) return `${fromVar}, system-ui, -apple-system, sans-serif`;
  return NIGHTY_PARTICLE_CANVAS_FONT_STACK;
}

function nightyParticleCanvasFontFamilyName(): string {
  const stack = nightyParticleCanvasFontStack();
  const primary = stack.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
  return primary || 'Inter';
}

async function exportVideoWithCaptionOverlay(
  videoSrc: string,
  caption: string,
  options: {
    position?: VideoCaptionPosition;
    style?: VideoCaptionStyle;
    numberedQuestions?: string[];
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
  const captionStyle = options.style ?? 'stroke';
  const numberedQuestions = options.numberedQuestions ?? [];
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
  const forcePortrait916 = particleAnimated || rainTemplate;
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

    // Particle / Rain: always export 9:16 @ 1080x1920 (center-crop landscape sources).
    const w = forcePortrait916
      ? rainTemplate
        ? NIGHTY_RAIN_EXPORT_WIDTH
        : NIGHTY_PARTICLE_EXPORT_WIDTH
      : srcW;
    const h = forcePortrait916
      ? rainTemplate
        ? NIGHTY_RAIN_EXPORT_HEIGHT
        : NIGHTY_PARTICLE_EXPORT_HEIGHT
      : srcH;

    const isParticleCaption = particleAnimated;
    const captionFontSize = isParticleCaption
      ? Math.max(16, Math.min(48, Math.floor(w * NIGHTY_PARTICLE_CAPTION_SIZE_RATIO)))
      : rainTemplate
        ? Math.max(16, Math.min(40, Math.floor(w * NIGHTY_RAIN_CAPTION_SIZE_RATIO)))
      : captionStyle === 'natural'
        ? videoTemplate2TitleFontSizePx(h)
        : videoCaptionFontSizePx(w);
    const questionFontSize = videoTemplate2QuestionFontSizePx(h);
    const footerFontSize = videoTemplate2FooterFontSizePx(h);
    const captionFontWeight = isParticleCaption
      ? NIGHTY_PARTICLE_CAPTION_FONT_WEIGHT
      : rainTemplate
        ? NIGHTY_RAIN_CAPTION_FONT_WEIGHT
      : captionStyle === 'natural'
        ? TEMPLATE2_COVER_FONT_WEIGHT
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
        if (numberedQuestions.length > 0) {
          await document.fonts.load(`${captionFontWeight} ${questionFontSize}px "TikTok Sans"`);
          await document.fonts.load(`${captionFontWeight} ${footerFontSize}px "TikTok Sans"`);
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

    const chunks: BlobPart[] = [];
    const EXPORT_FPS = rainTemplate ? NIGHTY_RAIN_EXPORT_FPS : 30;
    const FRAME_MS = 1000 / EXPORT_FPS;

    await new Promise<void>((resolve, reject) => {
      let rafId = 0;
      let recorder: MediaRecorder | null = null;
      let finished = false;
      let captureTrack: MediaStreamTrack | null = null;

      const stopDrawing = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      };

      // Particle captions follow wall-clock so a stalled/short decode can't truncate the export.
      let particleCaptionTimeSec = 0;
      let coverSx = 0;
      let coverSy = 0;
      let coverSw = 0;
      let coverSh = 0;
      let coverReady = false;

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

      const paintFrame = () => {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          const useMagicalGrade = captionStyle === 'natural' && numberedQuestions.length > 0;
          if (useMagicalGrade) {
            ctx.filter = COUPLES_NATURE_VIDEO_FILTER;
          }
          if (forcePortrait916) {
            if (!coverReady) updateCoverCrop();
            ctx.drawImage(video, coverSx, coverSy, coverSw, coverSh, 0, 0, w, h);
          } else {
            ctx.drawImage(video, 0, 0, w, h);
          }
          if (useMagicalGrade) {
            ctx.filter = 'none';
          }
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
          } else if (captionStyle === 'natural' && numberedQuestions.length > 0) {
            drawVideoTemplate2DimOverlay(ctx, w, h);
            drawVideoTemplate2OverlayOnCanvas(ctx, w, h, caption, numberedQuestions);
          } else if (captionStyle === 'natural') {
            drawVideoTemplate2DimOverlay(ctx, w, h);
            drawNaturalWhiteCaptionOnCanvas(ctx, w, h, caption, {
              position: captionPosition,
              fontSizePx: videoTemplate2TitleFontSizePx(h),
              maxWidthRatio: maxWidthRatio ?? 0.7,
              fontWeight: TEMPLATE2_COVER_FONT_WEIGHT,
              shadow: true,
              fontStack: TIKTOK_SANS_STACK,
            });
          } else {
            drawTikTokCaptionOnCanvas(ctx, w, h, caption, {
              position: captionPosition,
              maxWidthRatio,
            });
          }
        }
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

          // Particle / Rain: mute + loop bg. Unmuting + video.captureStream() often ends
          // MediaRecorder early (~1s) under heavy decode.
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
              : 2_500_000,
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
            resolve();
          };

          const particleDurationMs =
            (particleAnimated || rainTemplate) && maxDurationSec !== undefined
              ? Math.max(0.5, maxDurationSec) * 1000
              : null;
          let recordStartedAt = performance.now();
          let nextFrameAt = performance.now();
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

const INITIAL_CANVASES: CanvasData[] = [
  { id: '1', text: '', backgroundColor: '#000000', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
  { id: '3', text: '', backgroundColor: '#000000', textColor: '#000000', textSize: '200', imageSize: '1080x1920' },
  { id: 'end', text: '', backgroundColor: '#000000', textColor: '#FFFFFF', textSize: '200', imageSize: '1080x1920' },
];

const DAILY_TEMPLATE_TITLES_FUNNY = [
  "5 Impossible Questions To Tease Your Boyfriend Tonight",
  "5 Questions To Ask Your Sweet Heart Tonight",
  "5 Fun Questions To Gaslight Your Boyfriend Tonight",
  "Does He Pass The Good Boyfriend Test?",
  "5 Questions To Test How Well Trained Your Boyfriend Is",
  "5 Impossible Questions To Test Your Boyfriend Tonight",
  "5 Questions Every Boyfriend Must Answer Tonight If He Loves You",
  "5 Questions To Test If Your Boyfriend Is The One",
  "5 Impossible Questions To Test If Your Boyfriend Is Husband Material",
  "5 Questions For Internation Rage Bait Boyfriend Day",
  "5 Questions To Ask Your Boyfriend When He's Busy Or Tired",
  '5 Questions Every Girlfriends Should Ask Their Boyfriend',
  '5 Questions To Make Your Boyfriend Take A Deep Breath',
  '5 Risky Questions To Ask Your Boyfriend Tonight',
  '5 Dumb Questions To Ragebait Your Boyfriend Tonight',
  '5 Fun Questions To Tease Your Boyfriend Tonight',
  '5 Cute Questions To Ask Your Boyfriend Before Moving In Together',
  '5 Dumb Questions To Ask Your Boyfriend Tonight',
  '5 Dumb Questions To Ask Your Boyfriend To Make Sure He Loves You',
  '5 Ragebait Questions To Ask Your Boyfriend Tonight',
  '5 Fun Questions To See How Much Does Your Boyfriend Loves You',
  '5 Simple Question To Test Your Boyfriend Tonight',
  '5 Cute Questions Every Boyfriend Must Answer Tonight',
  '5 Questions Every Boyfriend Gets Wrong',
  'Does Your Boyfriend Pass The Jealousy Test?',
  'Does Your Boyfriend Pass The Loyalty Test?',
  '5 Cute Questions To Fall In Love With Your Boyfriend',
  '5 Questions A Good Boyfriend Should Get Right',
  '5 Cute Questions All Boyfriends Must Answer Tonight',
  '5 Questions Every Boyfriend Must Answer Tonight If They Love You',
  "5 Very Important Questions Your Boyfriend Need To Answer Tonight",
  '5 Niche Conversation Starters To Keep The Spark Alive',
  '5 Fun Questions To Check How Much Does He Love You',
  '5 Fun Questions To Ragebait Your Boo',
  'Does He Pass The Boyfriend Test',
  '5 Impossible Questions To Ask Your Boyfriend Tonight',
  '5 Dumb Questions To Annoy Your Boyfriend',
  '5 Cute Questions To Fall In Love With You Boyfriend Again',
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
  const [contentTab, setContentTab] = useState<ContentTab>('image');
  const [selectedAppId, setSelectedAppId] = useState<StudioAppId>(DEFAULT_STUDIO_APP_ID);
  const [selectedImageTemplateId, setSelectedImageTemplateId] = useState<number | null>(null);
  const [selectedVideoTemplateId, setSelectedVideoTemplateId] = useState<number | null>(null);
  /** TikTok-style overlay on video templates (white fill, black stroke). */
  const [videoOverlayCaption, setVideoOverlayCaption] = useState('Your text here');
  const [videoTemplate2Questions, setVideoTemplate2Questions] = useState<string[]>([]);
  const [videoTemplate2QuestionType, setVideoTemplate2QuestionType] =
    useState<AutomateQuestionType>('random');
  const [videoTemplate2Description, setVideoTemplate2Description] = useState('');
  const [isGeneratingVideoTemplate2Description, setIsGeneratingVideoTemplate2Description] =
    useState(false);
  const [videoTemplate2PexelsVideoSrc, setVideoTemplate2PexelsVideoSrc] = useState<string | null>(null);
  const [videoTemplate2PexelsPosterSrc, setVideoTemplate2PexelsPosterSrc] = useState<string | null>(null);
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
  const [isVideoExporting, setIsVideoExporting] = useState(false);
  const [showVideoDownloadModal, setShowVideoDownloadModal] = useState(false);
  const [videoDownloadCount, setVideoDownloadCount] = useState('1');
  const [videoExportProgress, setVideoExportProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [isImageTemplateDownloading, setIsImageTemplateDownloading] = useState(false);
  const [isImageTemplateUploading, setIsImageTemplateUploading] = useState(false);
  const [videoExportError, setVideoExportError] = useState<string | null>(null);
  const [selectedImageBrowserTab, setSelectedImageBrowserTab] = useState(0);
  const [imageTabFrameBg, setImageTabFrameBg] = useState('#FEFEFE');
  const [imageTabPastelBgs, setImageTabPastelBgs] = useState<string[]>([]);
  const [imageTabTypeLabel, setImageTabTypeLabel] = useState('Funny Questions');
  const kawaiiCtaImageSrc = '/dog-images/kawaii-cta-tab-v2.png';
  const pastelCtaImageSrc = '/image-templates/template-2-cta.jpg';
  /** Kawaii image-tab frame: export is 1080×1440; keep preview text in the same ballpark via Tailwind below. */
  const imageFrameExportFontPx = 54;
  const imageFrameExportWrappedLineHeightPx = 70;
  const imageFrameExportCoverLineGapPx = 64;
  const imageFrameExportFontFamily = '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif';
  const imageFrameExportTextColor = '#2f2a31';
  const imageFrameExportGlowColor = 'rgba(255, 255, 255, 0.9)';
  const pastelCarouselTextColor = '#FFFFFF';
  /** Rounded geometric sans — free stand-in for Omnes (Breeze brand font). */
  const pastelCarouselFontFamily =
    'var(--font-nunito), Nunito, ui-rounded, system-ui, sans-serif';
  /** Canvas can't resolve CSS variables — use the real family name for export. */
  const pastelCarouselExportFontFamily = 'Nunito, ui-rounded, system-ui, sans-serif';
  const [imageTabFunnyQuestions, setImageTabFunnyQuestions] = useState<string[]>([]);
  const [imageTabTexts, setImageTabTexts] = useState<string[]>([]);
  const [imageTabSources, setImageTabSources] = useState<string[]>([]);
  const [imageTemplate2QuestionType, setImageTemplate2QuestionType] =
    useState<AutomateQuestionType>('random');
  const [imageTemplate3QuestionType, setImageTemplate3QuestionType] =
    useState<AutomateQuestionType>('random');
  const [imageTemplate2Description, setImageTemplate2Description] = useState('');
  const [isGeneratingImageTemplate2Description, setIsGeneratingImageTemplate2Description] =
    useState(false);
  const [imageTemplate2Error, setImageTemplate2Error] = useState<string | null>(null);
  const [imageTemplate2HighlightWord, setImageTemplate2HighlightWord] = useState<string | null>(
    null
  );
  const [imageTemplate2CoverSquiggleEnabled, setImageTemplate2CoverSquiggleEnabled] = useState(
    IMAGE_TEMPLATE2_COVER_SQUIGGLE_ENABLED_DEFAULT
  );
  const [isImageTemplate3CoverLoading, setIsImageTemplate3CoverLoading] = useState(false);
  const [imageTemplate3CoverError, setImageTemplate3CoverError] = useState<string | null>(null);
  const [imageTemplate3Replies, setImageTemplate3Replies] = useState<string[][]>([
    [],
    [],
    [],
    [],
    [],
  ]);
  /** Q index (0–4) that is “Read” with no boyfriend reply; null until Start. */
  const [imageTemplate3ReadOnlyIndex, setImageTemplate3ReadOnlyIndex] = useState<number | null>(
    null
  );
  const [imageTemplate3RepliesLoading, setImageTemplate3RepliesLoading] = useState(false);
  const [imageTemplate3ReplyError, setImageTemplate3ReplyError] = useState<string | null>(null);
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

  const imageTemplateCards = getImageTemplatesForApp(selectedAppId);
  const videoTemplateCards = getVideoTemplatesForApp(selectedAppId);
  const isKawaiiImageTemplate = selectedAppId === 'spill-it' && selectedImageTemplateId === 1;
  const isPastelCarouselImageTemplate =
    selectedAppId === 'spill-it' && selectedImageTemplateId === 2;
  const isTikTokReactionImageTemplate =
    selectedAppId === 'spill-it' && selectedImageTemplateId === 3;
  const isCouplesNatureVideoTemplate = selectedAppId === 'spill-it' && selectedVideoTemplateId === 2;
  const isSpillItNotesVideoTemplate = selectedAppId === 'spill-it' && selectedVideoTemplateId === 3;
  const isFabAffirmationVideoTemplate = selectedAppId === 'fab' && selectedVideoTemplateId === 1;
  const isNightyParticleVideoTemplate = selectedAppId === 'nighty' && selectedVideoTemplateId === 1;
  const isNightyRainVideoTemplate = selectedAppId === 'nighty' && selectedVideoTemplateId === 2;
  const usesPexelsVideoBackground =
    isCouplesNatureVideoTemplate ||
    isSpillItNotesVideoTemplate ||
    isNightyParticleVideoTemplate ||
    isNightyRainVideoTemplate;

  const handleSelectedAppIdChange = (appId: StudioAppId) => {
    if (appId === selectedAppId) return;
    setSelectedAppId(appId);
    setSelectedImageTemplateId(null);
    setSelectedVideoTemplateId(null);
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
      selectedImageBrowserTab,
    });
  }, [
    urlReady,
    contentTab,
    selectedAppId,
    selectedImageTemplateId,
    selectedVideoTemplateId,
    selectedImageBrowserTab,
  ]);

  useEffect(() => {
    if (
      (isKawaiiImageTemplate ||
        isPastelCarouselImageTemplate ||
        isTikTokReactionImageTemplate) &&
      selectedImageBrowserTab > 6
    ) {
      setSelectedImageBrowserTab(0);
    }
  }, [
    isKawaiiImageTemplate,
    isPastelCarouselImageTemplate,
    isTikTokReactionImageTemplate,
    selectedImageBrowserTab,
  ]);

  const regenerateVideoTemplate2Title = () => {
    setVideoOverlayCaption((current) => pickTitleForType(videoTemplate2QuestionType, current));
  };

  const regenerateVideoTemplate2Content = () => {
    regenerateVideoTemplate2Title();
    setVideoTemplate2Questions(pickQuestionsForType(videoTemplate2QuestionType, 7));
  };

  const regenerateFabNotesTitle = () => {
    setVideoOverlayCaption((current) => pickTitleForType(videoTemplate2QuestionType, current));
  };

  const regenerateFabNotesContent = () => {
    regenerateFabNotesTitle();
    setVideoTemplate2Questions(pickQuestionsForType(videoTemplate2QuestionType, 5));
  };

  const applyVideoTemplate2QuestionType = (type: AutomateQuestionType) => {
    setVideoTemplate2QuestionType(type);
    setVideoOverlayCaption((current) => pickTitleForType(type, current));
    setVideoTemplate2Questions(
      pickQuestionsForType(type, isSpillItNotesVideoTemplate ? 5 : 7)
    );
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
  };

  const applyImageTemplate3QuestionType = (type: AutomateQuestionType) => {
    setImageTemplate3QuestionType(type);
    const resolved = resolveQuestionType(type);
    const title = pickTitleForType(resolved);
    const questions = pickQuestionsForType(resolved, 5);
    setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS[resolved]);
    setImageTabFunnyQuestions(questions);
    setImageTabTexts([title, ...questions, 'Remember to like, save and share the fun!']);
    // Replies generate only on Start (with the cover) to save API cost.
    setImageTemplate3Replies([[], [], [], [], []]);
    setImageTemplate3ReadOnlyIndex(null);
    setImageTemplate3ReplyError(null);
  };

  const fetchImageTemplate3ImessageReply = async (question: string): Promise<string[]> => {
    const res = await fetch('/api/openai/imessage-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = (await res.json()) as { replies?: string[]; reply?: string; error?: string };
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate boyfriend reply');
    }
    if (Array.isArray(data.replies) && data.replies.length > 0) {
      return data.replies
        .filter((r): r is string => typeof r === 'string')
        .map((r) => r.trim())
        .filter(Boolean);
    }
    // Back-compat if an older response shape slips through
    if (typeof data.reply === 'string' && data.reply.trim()) {
      return [data.reply.trim()];
    }
    throw new Error(data.error || 'Failed to generate boyfriend reply');
  };

  const refreshImageTemplate3Replies = async (questions: string[]) => {
    setImageTemplate3RepliesLoading(true);
    setImageTemplate3ReplyError(null);
    try {
      // One random Q is “Read / no reply” — skip OpenAI for that slot to save cost.
      const skipIndex = Math.floor(Math.random() * Math.min(5, Math.max(1, questions.length)));
      const replies = await Promise.all(
        questions.map(async (q, i) => {
          if (i === skipIndex) return [] as string[];
          const trimmed = q.trim();
          if (!trimmed) return [] as string[];
          return fetchImageTemplate3ImessageReply(trimmed);
        })
      );
      setImageTemplate3Replies(Array.from({ length: 5 }, (_, i) => replies[i] ?? []));
      setImageTemplate3ReadOnlyIndex(skipIndex);
    } catch (e) {
      setImageTemplate3ReplyError(
        e instanceof Error ? e.message : 'Failed to generate boyfriend replies'
      );
    } finally {
      setImageTemplate3RepliesLoading(false);
    }
  };

  const imageTemplate3TypePillLabel = (): string => {
    const type: ConcreteQuestionType =
      imageTemplate3QuestionType === 'random'
        ? concreteTypeFromImageLabel(imageTabTypeLabel)
        : imageTemplate3QuestionType;
    return IMAGE_TEMPLATE3_TYPE_PILL_LABELS[type];
  };

  const regenerateImageTemplate2Type = () => {
    const idx = VIDEO_TEMPLATE2_TYPE_CYCLE.indexOf(imageTemplate2QuestionType);
    const next =
      VIDEO_TEMPLATE2_TYPE_CYCLE[(idx + 1) % VIDEO_TEMPLATE2_TYPE_CYCLE.length] ?? 'random';
    applyImageTemplate2QuestionType(next);
  };

  const regenerateImageTemplate2Colors = () => {
    const pastelPool = shuffleCopy([...IMAGE_TEMPLATE2_PASTEL_COLORS]);
    const pastels = Array.from({ length: 6 }, (_, i) => pastelPool[i % pastelPool.length]!);
    setImageTabPastelBgs(pastels);
    setImageTabFrameBg(
      pastels[Math.min(selectedImageBrowserTab, pastels.length - 1)] ?? pastels[0]!
    );
  };

  const fetchImageTemplate3Cover = async (): Promise<string> => {
    const res = await fetch('/api/gemini/template-3-cover', { method: 'POST' });
    const data = (await res.json()) as { imageUrl?: string; error?: string };
    if (!res.ok || !data.imageUrl) {
      throw new Error(data.error || 'Failed to generate cover image');
    }
    return data.imageUrl;
  };

  const regenerateImageTemplate3Cover = async () => {
    setIsImageTemplate3CoverLoading(true);
    setImageTemplate3CoverError(null);
    setImageTemplate3ReplyError(null);
    const questions = imageTabTexts.slice(1, 6).map((q) => (q ?? '').trim());
    try {
      const [coverUrl] = await Promise.all([
        fetchImageTemplate3Cover(),
        refreshImageTemplate3Replies(questions),
      ]);
      setImageTabSources((prev) => {
        const next =
          prev.length >= 7
            ? [...prev]
            : ['', '', '', '', '', '', pastelCtaImageSrc];
        next[0] = coverUrl;
        return next;
      });
    } catch (e) {
      setImageTemplate3CoverError(e instanceof Error ? e.message : 'Failed to generate cover');
    } finally {
      setIsImageTemplate3CoverLoading(false);
    }
  };

  const handleGenerateImageTemplate2Description = async () => {
    const questions = imageTabTexts
      .slice(1, 6)
      .map((q) => q.trim())
      .filter(Boolean);
    if (questions.length === 0) {
      setImageTemplate2Error('Add some questions first, then generate a description.');
      return;
    }
    setImageTemplate2Error(null);
    setIsGeneratingImageTemplate2Description(true);
    try {
      const questionType = isTikTokReactionImageTemplate
        ? imageTemplate3QuestionType
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

  const handleGenerateVideoTemplate2Description = async () => {
    const questions = videoTemplate2Questions.map((q) => q.trim()).filter(Boolean);
    if (questions.length === 0) {
      setVideoExportError('Add some questions first, then generate a description.');
      return;
    }
    setVideoExportError(null);
    setIsGeneratingVideoTemplate2Description(true);
    try {
      const type = resolveQuestionType(videoTemplate2QuestionType);
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
      setVideoTemplate2Description(description);
    } catch (e) {
      setVideoExportError(e instanceof Error ? e.message : 'Failed to generate description');
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
                : VIDEO_TEMPLATE2_PEXELS_QUERIES;
            return queryPool[Math.floor(Math.random() * queryPool.length)]!;
          })();
      const page = 1 + Math.floor(Math.random() * 15);
      const res = await fetch(
        `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}&preferHeight=1080`
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
  };

  useEffect(() => {
    if (isCouplesNatureVideoTemplate) {
      regenerateVideoTemplate2Content();
      void handleRegenerateVideoTemplate2Video();
    } else if (isSpillItNotesVideoTemplate) {
      regenerateFabNotesContent();
      void handleRegenerateVideoTemplate2Video();
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
    } else if (isNightyRainVideoTemplate) {
      setVideoOverlayCaption(NIGHTY_RAIN_CAPTION);
      setNightyRainSubline(NIGHTY_RAIN_CAPTION_SUBLINE);
      void handleRegenerateVideoTemplate2Video();
    } else if (isFabAffirmationVideoTemplate) {
      regenerateFabMontageContent();
      void fetchFabMontageVideos(false);
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
        setDogImagePool((data as { urls: string[] }).urls.filter((u) => typeof u === 'string'));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
  const regenerateImageTemplateContent = (
    templateId?: number,
    options?: { resetTab?: boolean }
  ) => {
    const tid = templateId ?? selectedImageTemplateId;
    const isKawaii = selectedAppId === 'spill-it' && tid === 1;
    const isPastel = selectedAppId === 'spill-it' && tid === 2;
    const isTikTokReaction = selectedAppId === 'spill-it' && tid === 3;
    if (options?.resetTab !== false) {
      setSelectedImageBrowserTab(0);
    }

    if (isPastel) {
      // Resolve Random once so label, title, and questions all share the same type.
      const type = resolveQuestionType(imageTemplate2QuestionType);
      const title = pickTitleForType(type);
      const questions = pickQuestionsForType(type, 5);
      const pastelPool = shuffleCopy([...IMAGE_TEMPLATE2_PASTEL_COLORS]);
      // One distinct pastel per slide, including cover.
      const pastels = Array.from({ length: 6 }, (_, i) => pastelPool[i % pastelPool.length]!);
      setImageTabPastelBgs(pastels);
      setImageTabFrameBg(pastels[0]!);
      setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS[type]);
      setImageTabFunnyQuestions(questions);
      setImageTabTexts([title, ...questions, imageFrameCtaText]);
      setImageTabSources(['', '', '', '', '', '', pastelCtaImageSrc]);
      return;
    }

    const picked = [...FUNNY_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setImageTabFunnyQuestions(picked);
    setImageTabFrameBg('#FEFEFE');
    setImageTabPastelBgs([]);
    setImageTabTypeLabel('Funny Questions');
    if (isKawaii) {
      setImageTabTexts([`${imageFrameTitleLine1}\n${imageFrameTitleLine2}`, ...picked, imageFrameCtaText]);
      const dogSources = dogImagePool.length ? pickDogUrlsWithoutReuseUntilDeckExhausted(dogImagePool, 6) : [];
      setImageTabSources([...dogSources, kawaiiCtaImageSrc]);
    } else if (isTikTokReaction) {
      setImageTemplate3CoverError(null);
      setImageTemplate3ReplyError(null);
      const type = resolveQuestionType(imageTemplate3QuestionType);
      const title = pickTitleForType(type);
      const questions = pickQuestionsForType(type, 5);
      setImageTabTypeLabel(IMAGE_TEMPLATE2_TYPE_LABELS[type]);
      setImageTabFunnyQuestions(questions);
      setImageTabTexts([title, ...questions, imageFrameCtaText]);
      // Cover + replies empty until Start; Q1–Q5 are iMessage (no dog art); CTA matches Template 2.
      setImageTabSources(['', '', '', '', '', '', pastelCtaImageSrc]);
      setImageTemplate3Replies([[], [], [], [], []]);
      setImageTemplate3ReadOnlyIndex(null);
    } else {
      setImageTabTexts([`${imageFrameTitleLine1}\n${imageFrameTitleLine2}`, ...picked, imageFrameCtaText]);
      setImageTabSources(dogImagePool.length ? pickDogUrlsWithoutReuseUntilDeckExhausted(dogImagePool, 7) : []);
    }
  };
  const getDefaultImageFrameTextForTab = (tabIndex: number): string =>
    tabIndex === 0
      ? `${imageFrameTitleLine1}\n${imageFrameTitleLine2}`
      : tabIndex >= 1 && tabIndex <= 5
        ? imageTabFunnyQuestions[tabIndex - 1] || ''
        : imageFrameCtaText;
  const getImageFrameTextForTab = (tabIndex: number): string =>
    imageTabTexts[tabIndex] ?? getDefaultImageFrameTextForTab(tabIndex);
  const getImageSourceForTab = (tabIndex: number): string =>
    imageTabSources[tabIndex] ??
    (dogImagePool.length ? dogImagePool[tabIndex % dogImagePool.length]! : '');
  const imageTemplate3CoverSrc = (imageTabSources[0] ?? '').trim();
  const imageTemplate3CoverReady = imageTemplate3CoverSrc.length > 0;
  const imageTemplate3CoverPreviewSrc = imageTemplate3CoverDisplaySrc(imageTemplate3CoverSrc);

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

  const imageFrameTextForActiveTab = getImageFrameTextForTab(selectedImageBrowserTab);
  const imageTemplate2TitleHighlightParts =
    isPastelCarouselImageTemplate &&
    selectedImageBrowserTab === 0 &&
    imageTemplate2CoverSquiggleEnabled
      ? splitTitleAroundHighlight(imageFrameTextForActiveTab, imageTemplate2HighlightWord)
      : null;
  const isCtaTabSelected = selectedImageBrowserTab === 6;
  const isFullBleedImageTabSelected = isCtaTabSelected;
  const imageSourceForActiveTab = isCtaTabSelected
    ? isPastelCarouselImageTemplate || isTikTokReactionImageTemplate
      ? pastelCtaImageSrc
      : kawaiiCtaImageSrc
    : getImageSourceForTab(selectedImageBrowserTab);
  const imageTabLabelForActiveTab =
    selectedImageBrowserTab === 0 ? 'Cover' : selectedImageBrowserTab <= 5 ? `Q${selectedImageBrowserTab}` : 'CTA';
  const imageTemplateTabCount = 7;
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

  const generateImageFrameExportEntries = async (options?: {
    kawaiiNumSets?: number;
    templateId?: number;
  }): Promise<{
    entries: { path: string; blob: Blob }[];
    isKawaiiTemplate: boolean;
    kawaiiNumSets?: number;
  }> => {
    const KAWAII_DOWNLOAD_NUM_SETS = options?.kawaiiNumSets ?? 5;
    const exportTemplateId = options?.templateId ?? selectedImageTemplateId;
    type ImageExportSlotData = { tabTexts: string[]; tabSources: string[] };

    const frameWidth = 1080;
    const frameHeight = 1440; // 3:4
    const renderFrameBlob = async (tabIndex: number, slots?: ImageExportSlotData | null): Promise<Blob> => {
      const textForTab = (i: number) =>
        slots?.tabTexts[i] ?? imageTabTexts[i] ?? getDefaultImageFrameTextForTab(i);
      const sourceForTab = (i: number) =>
        slots?.tabSources[i] ??
        imageTabSources[i] ??
        (dogImagePool.length ? dogImagePool[i % dogImagePool.length]! : '');

      const isPastelExport = exportTemplateId === 2;
      const isTemplate3CoverExport = exportTemplateId === 3 && tabIndex === 0;
      const isFullBleedTab = tabIndex === 6;
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

      if (isPastelExport && !isFullBleedTab) {
        const slideBg =
          imageTabPastelBgs[tabIndex] ??
          IMAGE_TEMPLATE2_PASTEL_COLORS[tabIndex % IMAGE_TEMPLATE2_PASTEL_COLORS.length]!;

        if (tabIndex === 0) {
          try {
            await document.fonts.load(
              `${IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT} ${Math.round(frameWidth * IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO)}px Nunito`
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
            typeLabel: imageTabTypeLabel,
            progress: 1 / 7,
            footer: IMAGE_TEMPLATE2_APP_FOOTER,
          });
          return await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to create image blob'));
            }, 'image/png');
          });
        }

        ctx.fillStyle = slideBg;
        ctx.fillRect(0, 0, frameWidth, frameHeight);

        const progress = (tabIndex + 1) / 7;
        const barX = frameWidth * 0.08;
        const barW = frameWidth * 0.84;
        const barY = frameHeight * 0.21;
        const barH = Math.max(8, Math.round(frameHeight * 0.007));

        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = `700 ${Math.round(frameHeight * 0.032)}px ${pastelCarouselExportFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(imageTabTypeLabel, frameWidth / 2, barY - frameHeight * 0.018);

        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(barX, barY, barW * progress, barH);

        const centerText = textForTab(tabIndex);
        const fontSize = Math.round(frameWidth * 0.05);
        try {
          await document.fonts.load(`800 ${fontSize}px Nunito`);
          await document.fonts.load(`700 ${fontSize}px Nunito`);
        } catch {
          /* font may already be ready */
        }
        ctx.font = `800 ${fontSize}px ${pastelCarouselExportFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = pastelCarouselTextColor;
        const maxTextWidth = frameWidth * 0.8;
        const lines = wrapLines(ctx, centerText.replace(/\n/g, ' '), maxTextWidth);
        const lineHeight = fontSize * 1.22;
        const blockH = lines.length * lineHeight;
        let y = frameHeight / 2 - blockH / 2 + lineHeight / 2;
        for (const line of lines) {
          ctx.fillText(line, frameWidth / 2, y);
          y += lineHeight;
        }

        ctx.font = `700 ${Math.round(frameHeight * 0.03)}px ${pastelCarouselExportFontFamily}`;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.textBaseline = 'bottom';
        ctx.fillText(IMAGE_TEMPLATE2_APP_FOOTER, frameWidth / 2, frameHeight * 0.9);

        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }

      if (isTemplate3CoverExport) {
        const coverSource = imageTemplate3CoverDisplaySrc(sourceForTab(0));
        // Canvas ignores CSS @font-face until the face is loaded in this document.
        if (document.fonts?.load) {
          try {
            const titleSize = imageTemplate3CoverTitleFontSizePx(frameWidth);
            const labelSize = imageTemplate3CoverTypeLabelFontSizePx(frameWidth);
            await Promise.all([
              document.fonts.load(
                `${IMAGE_TEMPLATE3_COVER_TITLE_FONT_WEIGHT} ${titleSize}px "TikTok Sans"`
              ),
              document.fonts.load(
                `${IMAGE_TEMPLATE3_COVER_TYPE_LABEL_FONT_WEIGHT} ${labelSize}px "TikTok Sans"`
              ),
            ]);
          } catch {
            /* fall back to system font */
          }
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
            el.onerror = () => reject(new Error(`Failed to load image: ${coverSource.slice(0, 80)}`));
            el.src = coverSource;
          });
        const coverScale = Math.max(frameWidth / coverImg.width, frameHeight / coverImg.height);
        const coverW = coverImg.width * coverScale;
        const coverH = coverImg.height * coverScale;
        const coverX = (frameWidth - coverW) / 2;
        const coverY = (frameHeight - coverH) / 2;
        ctx.drawImage(coverImg, coverX, coverY, coverW, coverH);
        drawImageTemplate3CoverOverlay(
          ctx,
          frameWidth,
          frameHeight,
          textForTab(0),
          imageTemplate3TypePillLabel()
        );
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }

      const isTemplate3QuestionExport =
        exportTemplateId === 3 && tabIndex >= 1 && tabIndex <= 5;
      if (isTemplate3QuestionExport) {
        drawImageTemplate3ImessageSlide(
          ctx,
          frameWidth,
          frameHeight,
          textForTab(tabIndex),
          imageTemplate3Replies[tabIndex - 1] ?? [],
          imageTemplate3ReadOnlyIndex === tabIndex - 1 ? 'Read' : 'Delivered'
        );
        return await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob'));
          }, 'image/png');
        });
      }

      const source = isFullBleedTab
        ? isPastelExport || exportTemplateId === 3
          ? pastelCtaImageSrc
          : kawaiiCtaImageSrc
        : sourceForTab(tabIndex);
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

      ctx.fillStyle = imageTabFrameBg;
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

      const maxW = frameWidth * 0.48;
      const maxH = frameHeight * 0.24;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (frameWidth - drawW) / 2;
      const drawY = frameHeight - drawH - frameHeight * 0.13;

      ctx.fillStyle = imageFrameExportTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = imageFrameExportGlowColor;
      ctx.shadowBlur = 14;
      ctx.font = `bold ${imageFrameExportFontPx}px ${imageFrameExportFontFamily}`;
      const drawWrapped = (text: string, yStart: number, maxWidth: number, lineHeight: number) => {
        const lines = wrapLines(ctx, text, maxWidth);
        lines.forEach((line, idx) => ctx.fillText(line, frameWidth / 2, yStart + idx * lineHeight));
      };
      if (tabIndex >= 1 && tabIndex <= 6) {
        drawWrapped(
          textForTab(tabIndex),
          frameHeight * 0.21,
          frameWidth * 0.66,
          imageFrameExportWrappedLineHeightPx
        );
      } else {
        const coverY = frameHeight * 0.21;
        const coverLineGap = imageFrameExportCoverLineGapPx;
        const coverBlock = textForTab(0).trim();
        const coverParts = coverBlock
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
        const coverLine1 = coverParts[0] ?? imageFrameTitleLine1;
        const coverLine2 = coverParts[1] ?? imageFrameTitleLine2;
        ctx.fillText(coverLine1, frameWidth / 2, coverY);
        ctx.fillText(coverLine2, frameWidth / 2, coverY + coverLineGap);
      }
      ctx.shadowBlur = 0;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/png');
      });
    };

    const entries: { path: string; blob: Blob }[] = [];
    const isKawaiiTemplate = exportTemplateId === 1;

    const buildSixTabSourcesForKawaiiSet = (): string[] => {
      if (dogImagePool.length > 0) {
        return pickDogUrlsWithoutReuseUntilDeckExhausted(dogImagePool, 6);
      }
      const fromUi = imageTabSources.filter((u) => typeof u === 'string' && u.length > 0);
      if (fromUi.length > 0) {
        return Array.from({ length: 6 }, (_, i) => fromUi[i % fromUi.length]!);
      }
      return [];
    };

    if (isKawaiiTemplate) {
      const probe = buildSixTabSourcesForKawaiiSet();
      if (probe.length < 6 || probe.some((u) => !u?.trim())) {
        throw new Error('Dog images are still loading. Wait a few seconds, then try again.');
      }
      for (let setIdx = 0; setIdx < KAWAII_DOWNLOAD_NUM_SETS; setIdx++) {
        const funnyPool = Array.from(FUNNY_QUESTIONS) as string[];
        const picked = shuffleCopy(funnyPool).slice(0, 5);
        const tabTexts = [`${imageFrameTitleLine1}\n${imageFrameTitleLine2}`, ...picked, imageFrameCtaText];
        const tabSources = buildSixTabSourcesForKawaiiSet();
        const setPrefix = `set-${setIdx + 1}`;
        for (let tabIndex = 0; tabIndex < 7; tabIndex++) {
          const blob = await renderFrameBlob(tabIndex, { tabTexts, tabSources });
          const tabName = tabIndex === 0 ? 'cover' : tabIndex <= 5 ? `q${tabIndex}` : 'cta';
          entries.push({
            path: `${setPrefix}/template-${exportTemplateId}-${tabName}.png`,
            blob,
          });
        }
      }
      return { entries, isKawaiiTemplate, kawaiiNumSets: KAWAII_DOWNLOAD_NUM_SETS };
    }

    const exportTabCount = 7;

    for (let tabIndex = 0; tabIndex < exportTabCount; tabIndex++) {
      const blob = await renderFrameBlob(tabIndex, null);
      const tabName = tabIndex === 0 ? 'cover' : tabIndex <= 5 ? `q${tabIndex}` : 'cta';
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
      const { entries, isKawaiiTemplate, kawaiiNumSets } = await generateImageFrameExportEntries();
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
      a.download = isKawaiiTemplate
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
        selectedAppId === 'spill-it' && templateId === 1
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
      let blob: Blob;
      try {
        const recordedBlob = await exportVideoWithCaptionOverlay(videoSrc, title, {
          position: 'top',
          style: 'natural',
          numberedQuestions: questions,
          maxDurationSec: VIDEO_TEMPLATE2_MAX_DURATION_SEC,
        });
        blob =
          recordedBlob.type.includes('mp4') ? recordedBlob : await transcodeWebmToMp4(recordedBlob);
      } finally {
        setIsVideoExporting(false);
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
        const videoSrc = usePreview
          ? (template2ExportVideoSrc ?? template2PlaybackVideoSrc)
          : await fetchRandomPexelsVideoUrlForExport();
        if (!videoSrc) {
          throw new Error('No video available to export. Wait for the background to load, then try again.');
        }
        const recordedBlob = await exportVideoWithCaptionOverlay(videoSrc, title, {
          position: 'top',
          style: 'natural',
          numberedQuestions: questions,
          maxDurationSec: VIDEO_TEMPLATE2_MAX_DURATION_SEC,
        });
        const blob =
          recordedBlob.type.includes('mp4') ? recordedBlob : await transcodeWebmToMp4(recordedBlob);

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
    }
  };

  const handleDownloadVideoTemplate = async () => {
    if (!activeVideoTemplate || selectedVideoTemplateId === null) return;
    if (isCouplesNatureVideoTemplate) {
      setShowVideoDownloadModal(true);
      return;
    }

    if (isSpillItNotesVideoTemplate) {
      setVideoExportError(null);
      const videoSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
      if (!videoSrc) {
        setVideoExportError('No video available to export. Wait for the background to load, then try again.');
        return;
      }
      const title = videoOverlayCaption.trim() || pickRandomDailyFunnyTitle();
      const questions =
        videoTemplate2Questions.filter((q) => q.trim()).length > 0
          ? videoTemplate2Questions.filter((q) => q.trim()).slice(0, 5)
          : pickRandomFunnyQuestions(5);
      setIsVideoExporting(true);
      try {
        const recordedBlob = await exportFabNotesVideo(
          videoSrc,
          title,
          questions,
          FAB_NOTES_MAX_DURATION_SEC
        );
        let blob = recordedBlob;
        let extension = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
        if (!recordedBlob.type.includes('mp4')) {
          try {
            blob = await transcodeWebmToMp4(recordedBlob);
            extension = 'mp4';
          } catch (transcodeErr) {
            console.warn(
              'MP4 transcode unavailable (often Turbopack + ffmpeg.wasm). Downloading WebM instead.',
              transcodeErr
            );
          }
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iphone-notes-${new Date().toISOString().slice(0, 10)}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      } catch (e) {
        console.error('Failed to export Fab Notes video:', e);
        setVideoExportError(e instanceof Error ? e.message : 'Export failed');
      } finally {
        setIsVideoExporting(false);
      }
      return;
    }

    if (isNightyParticleVideoTemplate) {
      setVideoExportError(null);
      const videoSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
      if (!videoSrc) {
        setVideoExportError('No video available to export. Wait for the background to load, then try again.');
        return;
      }
      setIsVideoExporting(true);
      try {
        const recordedBlob = await exportVideoWithCaptionOverlay(videoSrc, nightyParticleLines.line1, {
          particleAnimated: true,
          particleContent: {
            lines: nightyParticleLines,
            timing: nightyParticleTiming,
            accentColor: nightyParticleAccentColor,
          },
          particleAudioSrc: nightyParticleBedAudioSrc,
          maxDurationSec: nightyParticleMaxDuration,
        });
        const blob =
          recordedBlob.type.includes('mp4') ? recordedBlob : await transcodeWebmToMp4(recordedBlob);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nighty-particle-${new Date().toISOString().slice(0, 10)}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      } catch (e) {
        console.error('Failed to export Nighty Particle video:', e);
        setVideoExportError(e instanceof Error ? e.message : 'Export failed');
      } finally {
        setIsVideoExporting(false);
      }
      return;
    }

    if (isNightyRainVideoTemplate) {
      setVideoExportError(null);
      const videoSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
      if (!videoSrc) {
        setVideoExportError('No video available to export. Wait for the background to load, then try again.');
        return;
      }
      setIsVideoExporting(true);
      try {
        const caption = videoOverlayCaption.trim() || NIGHTY_RAIN_CAPTION;
        const recordedBlob = await exportVideoWithCaptionOverlay(videoSrc, caption, {
          rainTemplate: true,
          rainAudioSrc: nightyRainBedAudioSrc,
          rainSubline: nightyRainSubline.trim() || NIGHTY_RAIN_CAPTION_SUBLINE,
          maxDurationSec: NIGHTY_RAIN_MAX_DURATION_SEC,
          maxWidthRatio: NIGHTY_RAIN_CAPTION_MAX_WIDTH_RATIO,
        });
        const blob =
          recordedBlob.type.includes('mp4') ? recordedBlob : await transcodeWebmToMp4(recordedBlob);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nighty-rain-${new Date().toISOString().slice(0, 10)}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      } catch (e) {
        console.error('Failed to export Nighty Rain video:', e);
        setVideoExportError(e instanceof Error ? e.message : 'Export failed');
      } finally {
        setIsVideoExporting(false);
      }
      return;
    }

    if (isFabAffirmationVideoTemplate) {
      setVideoExportError(null);
      if (fabMontageVideoSrcs.length < FAB_AFFIRMATION_CLIP_COUNT) {
        setVideoExportError('No montage videos loaded. Turn off Reuse videos and regenerate, then try again.');
        return;
      }
      const affirmations =
        fabMontageAffirmations.filter((a) => a.trim()).length > 0
          ? fabMontageAffirmations.filter((a) => a.trim()).slice(0, FAB_AFFIRMATION_TEXT_COUNT)
          : pickFabMontageAffirmations();
      setIsVideoExporting(true);
      try {
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
        const recordedBlob = await exportFabAffirmationMontage(
          proxied,
          segments,
          undefined,
          ambientSrc
        );
        let blob = recordedBlob;
        let extension = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
        if (!recordedBlob.type.includes('mp4')) {
          try {
            blob = await transcodeWebmToMp4(recordedBlob);
            extension = 'mp4';
          } catch (transcodeErr) {
            console.warn(
              'MP4 transcode unavailable (often Turbopack + ffmpeg.wasm). Downloading WebM instead.',
              transcodeErr
            );
          }
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fab-affirmation-${new Date().toISOString().slice(0, 10)}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      } catch (e) {
        console.error('Failed to export Fab affirmation montage:', e);
        setVideoExportError(e instanceof Error ? e.message : 'Export failed');
      } finally {
        setIsVideoExporting(false);
      }
      return;
    }

    setVideoExportError(null);
    const baseName =
      activeVideoTemplate.title
        .replace(/[^\w\d-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || `template-${selectedVideoTemplateId}`;
    try {
      if (template2PlaybackVideoSrc) {
        const captionTrimmed = videoOverlayCaption.trim();
        const shouldBurnCaption =
          captionTrimmed ||
          (isCouplesNatureVideoTemplate && videoTemplate2Questions.length > 0);
        if (shouldBurnCaption) {
          setIsVideoExporting(true);
          try {
            const exportSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
            const recordedBlob = await exportVideoWithCaptionOverlay(exportSrc, captionTrimmed, {
              position: isCouplesNatureVideoTemplate ? 'top' : 'center',
              style: isCouplesNatureVideoTemplate ? 'natural' : 'stroke',
              numberedQuestions: isCouplesNatureVideoTemplate ? videoTemplate2Questions : undefined,
              maxDurationSec:
                isCouplesNatureVideoTemplate ? VIDEO_TEMPLATE2_MAX_DURATION_SEC : undefined,
            });
            const blob =
              recordedBlob.type.includes('mp4') ? recordedBlob : await transcodeWebmToMp4(recordedBlob);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${baseName}-caption.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.setTimeout(() => URL.revokeObjectURL(url), 2500);
          } finally {
            setIsVideoExporting(false);
          }
          return;
        }
        const mainVideoSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
        const res = await fetch(mainVideoSrc);
        if (!res.ok) throw new Error('Failed to fetch video');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 2500);
        return;
      }
      if (activeVideoTemplate.coverSrc) {
        const res = await fetch(activeVideoTemplate.coverSrc);
        if (!res.ok) throw new Error('Failed to fetch cover image');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 2500);
      }
    } catch (e) {
      console.error('Failed to download video template:', e);
      const msg = e instanceof Error ? e.message : 'Download failed';
      setVideoExportError(msg);
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
            {contentTab === 'automate' && (
              <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 p-6 flex items-center justify-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                  Batch automation tools will live here. Connect Google Drive in Settings (gear icon) to sync uploads to your phone.
                </p>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                            ) : selectedAppId === 'spill-it' && card.id === 1 ? (
                              <div
                                className="w-full h-full relative"
                                style={{ backgroundColor: '#FEFEFE' }}
                              >
                                {dogImagePool[0] ? (
                                  <img
                                    src={dogImagePool[0]}
                                    alt="Cover template preview"
                                    className="absolute left-1/2 -translate-x-1/2 bottom-[6%] max-w-[42%] max-h-[24%] object-contain"
                                  />
                                ) : null}
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
                        {isKawaiiImageTemplate || isPastelCarouselImageTemplate ? (
                          <button
                            type="button"
                            onClick={() => regenerateImageTemplateContent(selectedImageTemplateId!)}
                            disabled={
                              isImageTemplateDownloading ||
                              isImageTemplateUploading ||
                              isImageTemplate3CoverLoading
                            }
                            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Retry
                          </button>
                        ) : null}
                        {isTikTokReactionImageTemplate && !imageTemplate3CoverReady ? (
                          <button
                            type="button"
                            onClick={() => void regenerateImageTemplate3Cover()}
                            disabled={
                              isImageTemplateDownloading ||
                              isImageTemplateUploading ||
                              isImageTemplate3CoverLoading ||
                              imageTemplate3RepliesLoading
                            }
                            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                          >
                            {isImageTemplate3CoverLoading || imageTemplate3RepliesLoading
                              ? 'Generating…'
                              : 'Start'}
                          </button>
                        ) : null}
                        {isTikTokReactionImageTemplate && imageTemplate3CoverReady ? (
                          <button
                            type="button"
                            onClick={() => void regenerateImageTemplate3Cover()}
                            disabled={
                              isImageTemplateDownloading ||
                              isImageTemplateUploading ||
                              isImageTemplate3CoverLoading ||
                              imageTemplate3RepliesLoading
                            }
                            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isImageTemplate3CoverLoading || imageTemplate3RepliesLoading
                              ? 'Generating…'
                              : 'Regenerate cover & replies'}
                          </button>
                        ) : null}
                        {isPastelCarouselImageTemplate ? (
                          <>
                            <button
                              type="button"
                              onClick={regenerateImageTemplate2Type}
                              disabled={
                            isImageTemplateDownloading ||
                            isImageTemplateUploading ||
                            isImageTemplate3CoverLoading ||
                            (isTikTokReactionImageTemplate && !imageTemplate3CoverReady)
                          }
                              className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Regenerate type
                            </button>
                            <button
                              type="button"
                              onClick={regenerateImageTemplate2Colors}
                              disabled={
                            isImageTemplateDownloading ||
                            isImageTemplateUploading ||
                            isImageTemplate3CoverLoading ||
                            (isTikTokReactionImageTemplate && !imageTemplate3CoverReady)
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
                            isImageTemplate3CoverLoading
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
                        {isKawaiiImageTemplate ? (
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
                            isImageTemplateUploading ||
                            isImageTemplate3CoverLoading ||
                            (isTikTokReactionImageTemplate && !imageTemplate3CoverReady)
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
                          {i === 0 ? 'Cover' : i <= 5 ? `Q${i}` : 'CTA'}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 sm:p-4 md:p-6 w-full min-w-0 max-w-full box-border">
                      <div className="flex flex-col md:flex-row items-start gap-4 min-w-0 w-full">
                        <div
                          className="@container relative w-full max-w-sm mx-auto md:mx-0 aspect-3/4 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden min-w-0"
                          style={{
                            backgroundColor:
                              isTikTokReactionImageTemplate &&
                              (selectedImageBrowserTab === 0 ||
                                (selectedImageBrowserTab >= 1 && selectedImageBrowserTab <= 5))
                                ? '#000000'
                                : activeImageFrameBg,
                          }}
                        >
                          {isFullBleedImageTabSelected ? (
                            imageSourceForActiveTab ? (
                              <img
                                src={imageSourceForActiveTab}
                                alt="CTA preview"
                                className="w-full h-full object-cover"
                              />
                            ) : null
                          ) : isPastelCarouselImageTemplate ? (
                            selectedImageBrowserTab === 0 ? (
                              <>
                              <div className="absolute inset-x-[8%] top-[21%] z-10">
                                <p
                                  className="mb-2 text-center text-[11px] sm:text-xs font-bold tracking-wide text-white"
                                  style={{ fontFamily: pastelCarouselFontFamily }}
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
                              <div className="absolute inset-0 z-10 flex items-center justify-center px-[10%] pointer-events-none">
                                <p
                                  className="w-full text-center text-white wrap-break-word"
                                  style={{
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
                                    <span className="relative inline-block px-[0.02em] pb-[0.5em]">
                                      {imageTemplate2TitleHighlightParts.word}
                                      <svg
                                        className="pointer-events-none absolute left-[-2%] right-[-2%] bottom-0 h-[0.48em] w-[104%]"
                                        viewBox="0 0 100 28"
                                        preserveAspectRatio="none"
                                        aria-hidden
                                      >
                                        <path
                                          d="M3 15 Q 15 3 27 19 Q 39 3 51 17 Q 63 4 75 19 Q 87 4 97 14"
                                          fill="none"
                                          stroke={imageTemplate2SquiggleColor}
                                          strokeWidth="9"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </span>
                                    {imageTemplate2TitleHighlightParts.after}
                                  </>
                                ) : (
                                  imageFrameTextForActiveTab
                                )}
                                </p>
                              </div>
                              <p
                                className="absolute inset-x-[8%] bottom-[9%] z-10 text-center text-[11px] sm:text-xs font-bold text-white/95"
                                style={{ fontFamily: pastelCarouselFontFamily }}
                              >
                                {IMAGE_TEMPLATE2_APP_FOOTER}
                              </p>
                              </>
                            ) : (
                            <>
                              <div className="absolute inset-x-[8%] top-[21%] z-10">
                                <p
                                  className="mb-2 text-center text-[11px] sm:text-xs font-bold tracking-wide text-white"
                                  style={{ fontFamily: pastelCarouselFontFamily }}
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
                                className="absolute left-1/2 top-1/2 z-10 w-[80%] -translate-x-1/2 -translate-y-1/2 text-center text-base sm:text-lg md:text-xl font-extrabold leading-snug text-white wrap-break-word"
                                style={{
                                  fontFamily: pastelCarouselFontFamily,
                                }}
                              >
                                {imageFrameTextForActiveTab}
                              </p>
                              <p
                                className="absolute inset-x-[8%] bottom-[9%] z-10 text-center text-[11px] sm:text-xs font-bold text-white/95"
                                style={{ fontFamily: pastelCarouselFontFamily }}
                              >
                                {IMAGE_TEMPLATE2_APP_FOOTER}
                              </p>
                            </>
                            )
                          ) : isTikTokReactionImageTemplate && selectedImageBrowserTab === 0 ? (
                            <>
                              <img
                                src={imageTemplate3CoverPreviewSrc}
                                alt="Cover preview"
                                className="absolute inset-0 z-0 h-full w-full object-cover"
                              />
                              <ImageTemplate3CoverOverlay
                                title={imageFrameTextForActiveTab}
                                typeLabel={imageTemplate3TypePillLabel()}
                              />
                            </>
                          ) : isTikTokReactionImageTemplate &&
                            selectedImageBrowserTab >= 1 &&
                            selectedImageBrowserTab <= 5 ? (
                            <ImageTemplate3ImessageBubble
                              question={imageFrameTextForActiveTab}
                              replies={
                                imageTemplate3Replies[selectedImageBrowserTab - 1] ?? []
                              }
                              deliveryStatus={
                                imageTemplate3ReadOnlyIndex === selectedImageBrowserTab - 1
                                  ? 'Read'
                                  : 'Delivered'
                              }
                              replyLoading={imageTemplate3RepliesLoading}
                            />
                          ) : (
                            <>
                              <p
                                className="absolute top-[21%] left-1/2 -translate-x-1/2 text-center text-base sm:text-xl md:text-2xl font-semibold px-2 sm:px-4 leading-snug max-w-[98%] whitespace-pre-line wrap-break-word"
                                style={{
                                  color: '#2f2a31',
                                  textShadow: 'none',
                                  letterSpacing: '0.01em',
                                  fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif',
                                }}
                              >
                                {imageFrameTextForActiveTab}
                              </p>
                              {imageSourceForActiveTab ? (
                                <img
                                  src={imageSourceForActiveTab}
                                  alt={`Template ${selectedImageTemplateId} preview`}
                                  className="absolute left-1/2 -translate-x-1/2 bottom-[13%] max-w-[48%] max-h-[28%] object-contain"
                                />
                              ) : null}
                            </>
                          )}
                        </div>
                        {!isFullBleedImageTabSelected ||
                        isPastelCarouselImageTemplate ||
                        isTikTokReactionImageTemplate ? (
                          <div className="w-full md:w-80 md:self-start space-y-4">
                            {!isFullBleedImageTabSelected ? (
                            <div>
                              {isTikTokReactionImageTemplate ? (
                                <>
                                  <div className="mb-3">
                                    <label className="mb-2 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                      Question type
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={imageTemplate3QuestionType}
                                        onChange={(e) =>
                                          applyImageTemplate3QuestionType(
                                            e.target.value as AutomateQuestionType
                                          )
                                        }
                                        disabled={
                                          isImageTemplate3CoverLoading ||
                                          imageTemplate3RepliesLoading
                                        }
                                        className="min-w-0 flex-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 disabled:opacity-50"
                                        aria-label="Question type"
                                      >
                                        <option value="random">Random</option>
                                        <option value="funny">Funny</option>
                                        <option value="flirty">Flirty</option>
                                        <option value="me_or_you">Me or you</option>
                                        <option value="brave">Brave</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          regenerateImageTemplateContent(selectedImageTemplateId!)
                                        }
                                        disabled={
                                          isImageTemplateDownloading ||
                                          isImageTemplateUploading ||
                                          isImageTemplate3CoverLoading ||
                                          imageTemplate3RepliesLoading
                                        }
                                        className="shrink-0 text-sm px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Retry
                                      </button>
                                    </div>
                                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                      Sets the cover title and all Q1–Q5 questions. Click Start to
                                      generate the cover image and boyfriend replies.
                                    </p>
                                  </div>
                                  {selectedImageBrowserTab === 0 && !imageTemplate3CoverReady ? (
                                    <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                      {isImageTemplate3CoverLoading || imageTemplate3RepliesLoading
                                        ? 'Generating cover + boyfriend replies…'
                                        : 'Click Start in the toolbar to generate the cover and Q1–Q5 boyfriend replies.'}
                                    </p>
                                  ) : null}
                                  {selectedImageBrowserTab >= 1 &&
                                  selectedImageBrowserTab <= 5 &&
                                  !imageTemplate3CoverReady &&
                                  !(imageTemplate3Replies[selectedImageBrowserTab - 1]?.length >
                                    0) ? (
                                    <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                      {imageTemplate3RepliesLoading
                                        ? 'Generating boyfriend replies…'
                                        : 'Boyfriend replies generate when you click Start (with the cover).'}
                                    </p>
                                  ) : null}
                                  {imageTemplate3CoverError ? (
                                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                      {imageTemplate3CoverError}
                                    </p>
                                  ) : null}
                                  {imageTemplate3ReplyError ? (
                                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                      {imageTemplate3ReplyError}
                                    </p>
                                  ) : null}
                                </>
                              ) : (
                                <>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  Frame text
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                  {isPastelCarouselImageTemplate ? (
                                    <select
                                      value={imageTemplate2QuestionType}
                                      onChange={(e) =>
                                        applyImageTemplate2QuestionType(
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
                                      if (isPastelCarouselImageTemplate) {
                                        const contentType =
                                          imageTemplate2QuestionType === 'random'
                                            ? concreteTypeFromImageLabel(imageTabTypeLabel)
                                            : imageTemplate2QuestionType;
                                        if (selectedImageBrowserTab === 0) {
                                          const nextTitle = pickTitleForType(
                                            contentType,
                                            imageFrameTextForActiveTab
                                          );
                                          const next = [...imageTabTexts];
                                          next[0] = nextTitle;
                                          setImageTabTexts(next);
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
                                    {isPastelCarouselImageTemplate
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
                                </>
                              )}
                            </div>
                            ) : null}
                            {isPastelCarouselImageTemplate || isTikTokReactionImageTemplate ? (
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
                                        imageTabTexts.slice(1, 6).every((q) => !q.trim())
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
                        onClick={() => setSelectedVideoTemplateId(null)}
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
                            {isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate ? (
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
                            isFabAffirmationVideoTemplate
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
                                {videoExportProgress
                                  ? `Exporting ${videoExportProgress.current}/${videoExportProgress.total}…`
                                  : 'Exporting…'}
                              </span>
                            </>
                          ) : (
                            'Download'
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
                      {isFabAffirmationVideoTemplate ? (
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
                                    : 'Frame text'}
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                  {isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate ? (
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
                                    {isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate
                                      ? 'Retry'
                                      : 'Random question'}
                                  </button>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={videoOverlayCaption}
                                onChange={(e) => setVideoOverlayCaption(e.target.value)}
                                placeholder="Type your on-video text…"
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                              />
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
                            {isCouplesNatureVideoTemplate || isSpillItNotesVideoTemplate ? (
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
                                        videoTemplate2Questions.every((q) => !q.trim())
                                      }
                                      className="text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isGeneratingVideoTemplate2Description
                                        ? 'Generating…'
                                        : 'Generate description'}
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
                                  placeholder="TikTok caption / description will appear here…"
                                  rows={5}
                                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-y min-h-[6rem]"
                                />
                              </div>
                            ) : null}
                              </>
                            )}
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
