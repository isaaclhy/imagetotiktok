'use client';

import { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import type { CanvasData } from '@/app/lib/types';
import { generateCardImage as generateCardImageLib } from '@/app/lib/generate-card-image';
import { extractDominantColor } from '@/app/lib/canvas-utils';
import {
  CARD_BG_FALLBACK_PALETTE,
  PROMPTS,
  FUNNY_QUESTIONS,
  FLIRTY_QUESTIONS,
  ME_OR_YOU_QUESTIONS,
  KAWAII_DRIVE_FOLDER_ID,
  COUPLES_NATURE_DRIVE_FOLDER_ID,
  COUPLES_NATURE_VIDEO_FILTER,
  VIDEO_TEMPLATE2_PEXELS_QUERIES,
} from '@/app/lib/constants';
import { Sidebar } from '@/app/components/Sidebar';
import { InputsCard } from '@/app/components/InputsCard';
import { PreviewPanel } from '@/app/components/PreviewPanel';
import { DownloadModal } from '@/app/components/DownloadModal';
import { VideoDownloadModal } from '@/app/components/VideoDownloadModal';
import { Toast } from '@/app/components/Toast';
import { transcodeWebmToMp4 } from '@/app/lib/webm-to-mp4';

type ContentTab = 'image' | 'video' | 'prompt' | 'automate';

type AppUrlState = {
  contentTab: ContentTab;
  selectedImageTemplateId: number | null;
  selectedVideoTemplateId: number | null;
  selectedImageBrowserTab: number;
};

const CONTENT_TABS: ContentTab[] = ['image', 'video', 'prompt', 'automate'];

function pexelsVideoProxySrc(directUrl: string): string {
  return `/api/pexels/video-proxy?url=${encodeURIComponent(directUrl)}`;
}

async function fetchRandomPexelsVideoUrlForExport(): Promise<string> {
  const query =
    VIDEO_TEMPLATE2_PEXELS_QUERIES[Math.floor(Math.random() * VIDEO_TEMPLATE2_PEXELS_QUERIES.length)]!;
  const page = 1 + Math.floor(Math.random() * 15);
  const res = await fetch(
    `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}`
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
      selectedImageTemplateId: null,
      selectedVideoTemplateId: null,
      selectedImageBrowserTab: 0,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const tabRaw = params.get('tab');
  const contentTab = CONTENT_TABS.includes(tabRaw as ContentTab) ? (tabRaw as ContentTab) : 'image';

  let selectedImageTemplateId: number | null = null;
  let selectedVideoTemplateId: number | null = null;
  let selectedImageBrowserTab = 0;

  if (contentTab === 'image') {
    selectedImageTemplateId = parsePositiveInt(params.get('imageTemplate'));
    const frameRaw = params.get('frame');
    if (frameRaw !== null) {
      const frame = Number.parseInt(frameRaw, 10);
      if (Number.isFinite(frame)) selectedImageBrowserTab = Math.max(0, Math.min(6, frame));
    }
  }

  if (contentTab === 'video') {
    selectedVideoTemplateId = parsePositiveInt(params.get('videoTemplate'));
  }

  return {
    contentTab,
    selectedImageTemplateId,
    selectedVideoTemplateId,
    selectedImageBrowserTab,
  };
}

function syncAppUrlState(state: AppUrlState) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  params.set('tab', state.contentTab);
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
  return Math.max(40, Math.floor(frameH * 0.024));
}

function videoTemplate2QuestionFontSizePx(frameH: number): number {
  return Math.max(25, Math.floor(frameH * 0.014));
}

function videoTemplate2FooterFontSizePx(frameH: number): number {
  return Math.max(22, Math.floor(frameH * 0.0125));
}

function videoTemplate2SectionGapPx(frameH: number): number {
  return Math.max(20, Math.floor(frameH * 0.04));
}

/** Gap between title and question list (smaller than list-to-footer gap). */
function videoTemplate2TitleListGapPx(frameH: number): number {
  return Math.max(14, Math.floor(frameH * 0.032));
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

function pickRandomFunnyQuestions(count: number): string[] {
  return shuffleCopy([...FUNNY_QUESTIONS]).slice(0, count);
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
  fontSize = videoCaptionFontSizePx(w)
): TikTokCaptionLayout {
  const trimmed = text.trim();
  const maxWidth = w * 0.7;
  ctx.font = `${fontWeight} ${fontSize}px ${TIKTOK_SANS_STACK}`;

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
};

/** TikTok-style caption for canvas export (white fill, black stroke). */
function drawTikTokCaptionOnCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  text: string,
  options?: { anchor?: NormalizedTextAnchor; position?: VideoCaptionPosition }
) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const layout = layoutTikTokCaption(ctx, w, trimmed);
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
  const layout = layoutTikTokCaption(ctx, w, trimmed, TEMPLATE2_COVER_FONT_WEIGHT, fontSize);
  const { lines, lineHeight, blockH } = layout;
  const cx = (options?.anchor?.x ?? 0.5) * w;
  const position = options?.position ?? 'center';
  ctx.font = `${TEMPLATE2_COVER_FONT_WEIGHT} ${fontSize}px ${TIKTOK_SANS_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let y =
    position === 'top'
      ? h * 0.08 + lineHeight / 2
      : (options?.anchor?.y ?? 0.5) * h - blockH / 2 + lineHeight / 2;
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
async function exportVideoWithCaptionOverlay(
  videoSrc: string,
  caption: string,
  options: {
    position?: VideoCaptionPosition;
    style?: VideoCaptionStyle;
    numberedQuestions?: string[];
    maxDurationSec?: number;
  } = {}
): Promise<Blob> {
  const captionPosition = options.position ?? 'center';
  const captionStyle = options.style ?? 'stroke';
  const numberedQuestions = options.numberedQuestions ?? [];
  const maxDurationSec = options.maxDurationSec;
  if (typeof MediaRecorder === 'undefined') throw new Error('MediaRecorder is not supported in this browser');

  const mime = pickMediaRecorderMime();
  if (!mime) throw new Error('No supported video recording format in this browser');

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'auto';
  video.src = videoSrc;

  await new Promise<void>((resolve, reject) => {
    video.addEventListener(
      'loadeddata',
      () => resolve(),
      { once: true }
    );
    video.addEventListener(
      'error',
      () => reject(new Error('Failed to load video')),
      { once: true }
    );
  });

  const w = video.videoWidth;
  const h = video.videoHeight;
  if (w <= 0 || h <= 0) throw new Error('Invalid video dimensions');

  const captionFontSize =
    captionStyle === 'natural' ? videoTemplate2TitleFontSizePx(h) : videoCaptionFontSizePx(w);
  const questionFontSize = videoTemplate2QuestionFontSizePx(h);
  const footerFontSize = videoTemplate2FooterFontSizePx(h);
  const captionFontWeight = captionStyle === 'natural' ? TEMPLATE2_COVER_FONT_WEIGHT : 900;
  if (typeof document !== 'undefined' && document.fonts?.load) {
    try {
      await document.fonts.load(`${captionFontWeight} ${captionFontSize}px "TikTok Sans"`);
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
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  const chunks: BlobPart[] = [];

  await new Promise<void>((resolve, reject) => {
    let rafId = 0;
    let recorder: MediaRecorder | null = null;
    let finished = false;

    const stopDrawing = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const finishRecording = () => {
      if (finished) return;
      finished = true;
      stopDrawing();
      video.pause();
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

    const draw = () => {
      if (video.ended || reachedMaxDuration()) {
        if (reachedMaxDuration()) finishRecording();
        return;
      }
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const useMagicalGrade = captionStyle === 'natural' && numberedQuestions.length > 0;
        if (useMagicalGrade) {
          ctx.filter = COUPLES_NATURE_VIDEO_FILTER;
        }
        ctx.drawImage(video, 0, 0, w, h);
        if (useMagicalGrade) {
          ctx.filter = 'none';
        }
        if (captionStyle === 'natural' && numberedQuestions.length > 0) {
          drawVideoTemplate2DimOverlay(ctx, w, h);
          drawVideoTemplate2OverlayOnCanvas(ctx, w, h, caption, numberedQuestions);
        } else if (captionStyle === 'natural') {
          drawVideoTemplate2DimOverlay(ctx, w, h);
          drawNaturalWhiteCaptionOnCanvas(ctx, w, h, caption, {
            position: captionPosition,
            fontSizePx: videoTemplate2TitleFontSizePx(h),
          });
        } else {
          drawTikTokCaptionOnCanvas(ctx, w, h, caption, { position: captionPosition });
        }
      }
      if (!video.ended && !reachedMaxDuration()) rafId = requestAnimationFrame(draw);
    };

    video.addEventListener('ended', finishRecording, { once: true });

    const run = async () => {
      try {
        video.pause();
        video.currentTime = 0;
        video.muted = false;

        const canvasStream = canvas.captureStream(30);
        const videoWithCapture = video as HTMLVideoElement & { captureStream?: () => MediaStream };
        if (typeof videoWithCapture.captureStream !== 'function') {
          throw new Error('Video captureStream is not supported in this browser');
        }
        const videoAudioStream = videoWithCapture.captureStream();
        const outStream = new MediaStream();
        canvasStream.getVideoTracks().forEach((t: MediaStreamTrack) => outStream.addTrack(t));
        videoAudioStream.getAudioTracks().forEach((t: MediaStreamTrack) => outStream.addTrack(t));

        recorder = new MediaRecorder(outStream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
        recorder.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        recorder.onerror = () => {
          stopDrawing();
          video.pause();
          reject(new Error('Recording failed'));
        };
        recorder.onstop = () => {
          stopDrawing();
          video.pause();
          resolve();
        };

        recorder.start(200);
        try {
          await video.play();
        } catch {
          video.muted = true;
          await video.play();
        }
        draw();
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

type VideoTemplateCard = {
  id: number;
  title: string;
  subtitle: string;
  coverSrc?: string;
  videoSrc?: string;
};

const VIDEO_TEMPLATE_CARDS: VideoTemplateCard[] = [
  {
    id: 2,
    title: 'Couples Nature',
    subtitle: '',
    coverSrc: '/video-templates/template-2-cover.jpg',
    videoSrc: '/video-template-2/15402243_2160_3840_30fps.mp4',
  },
  { id: 3, title: 'Template 3', subtitle: '' },
  { id: 4, title: 'Template 4', subtitle: '' },
];

const DAILY_TEMPLATE_TITLES_FUNNY = [
  "5 Impossible Questions To Tease Your Boyfriend Tonight",
  "5 Questions To Ask Your Sweet Heart Tonight",
  "5 Fun Questions To Gaslight Your Boyfriend Tonight",
  "Does he pass the good boyfriend test?",
  "5 Questions To Test How Well Trained Your Boyfriend Is",
  "5 Impossible Questions To Test Your Boyfriend Tonight",
  "5 Questions Every Boyfriend Must Answer Tonight If He Loves You",
  "5 Questions To Test If Your Boyfriend Is The One",
  "5 Impossible QuestionS To Test If Your Boyfriend Is Husband Material",
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
  'Does Your boyfriend Pass The Loyalty Test?',
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
] as const;

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
  const [selectedImageTemplateId, setSelectedImageTemplateId] = useState<number | null>(null);
  const [selectedVideoTemplateId, setSelectedVideoTemplateId] = useState<number | null>(null);
  /** TikTok-style overlay on video templates (white fill, black stroke). */
  const [videoOverlayCaption, setVideoOverlayCaption] = useState('Your text here');
  const [videoTemplate2Questions, setVideoTemplate2Questions] = useState<string[]>([]);
  const [videoTemplate2PexelsVideoSrc, setVideoTemplate2PexelsVideoSrc] = useState<string | null>(null);
  const [videoTemplate2PexelsPosterSrc, setVideoTemplate2PexelsPosterSrc] = useState<string | null>(null);
  const [isVideoTemplate2VideoLoading, setIsVideoTemplate2VideoLoading] = useState(false);
  const [videoTemplate2VideoError, setVideoTemplate2VideoError] = useState<string | null>(null);
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
  const imageTabFrameBg = '#FEFEFE';
  const kawaiiCtaImageSrc = '/dog-images/kawaii-cta-tab.png';
  /** Kawaii image-tab frame: export is 1080×1440; keep preview text in the same ballpark via Tailwind below. */
  const imageFrameExportFontPx = 54;
  const imageFrameExportWrappedLineHeightPx = 70;
  const imageFrameExportCoverLineGapPx = 64;
  const imageFrameExportFontFamily = '"Comic Sans MS", "Marker Felt", "Chalkboard SE", "Trebuchet MS", sans-serif';
  const imageFrameExportTextColor = '#2f2a31';
  const imageFrameExportGlowColor = 'rgba(255, 255, 255, 0.9)';
  const [imageTabFunnyQuestions, setImageTabFunnyQuestions] = useState<string[]>([]);
  const [imageTabTexts, setImageTabTexts] = useState<string[]>([]);
  const [imageTabSources, setImageTabSources] = useState<string[]>([]);
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
  const [automateQuestionType, setAutomateQuestionType] = useState<'funny' | 'flirty' | 'me_or_you'>('funny');
  const [dailyGenIncludeQuestions, setDailyGenIncludeQuestions] = useState(true);
  const [dailyGenIncludeTitle, setDailyGenIncludeTitle] = useState(true);
  const [dailyGenIncludeCaption, setDailyGenIncludeCaption] = useState(true);
  /** Template hook prompt (image prompt with {x}); labeled “cover image” in the UI */
  const [dailyGenIncludeCoverImage, setDailyGenIncludeCoverImage] = useState(true);

  useEffect(() => {
    if (automateQuestionType !== 'flirty') return;
    setDailyGenIncludeTitle(false);
    setDailyGenIncludeCaption(false);
  }, [automateQuestionType]);

  /** Prompt strings from the previous Daily TikTok run — excluded next time so back-to-back runs rarely repeat */
  const lastDailyPromptRunRef = useRef<Set<string>>(new Set());

  const isUpdatingFromUserInput = useRef(false);
  const isSyncingFromCanvas = useRef(false);

  const currentCanvas = canvases.find((c) => c.id === currentCanvasId) || canvases[0];
  const firstCard = canvases.find((c) => c.id === '1') || canvases[0];
  const firstCardTextValue = canvases.find((c) => c.id === '1')?.text || '';
  const prevFirstCardTextRef = useRef(firstCardTextValue);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const urlState = readAppUrlState();
    setContentTab(urlState.contentTab);
    setSelectedImageTemplateId(urlState.selectedImageTemplateId);
    const videoId = urlState.selectedVideoTemplateId;
    setSelectedVideoTemplateId(
      videoId !== null && VIDEO_TEMPLATE_CARDS.some((c) => c.id === videoId) ? videoId : null
    );
    setSelectedImageBrowserTab(urlState.selectedImageBrowserTab);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    syncAppUrlState({
      contentTab,
      selectedImageTemplateId,
      selectedVideoTemplateId,
      selectedImageBrowserTab,
    });
  }, [urlReady, contentTab, selectedImageTemplateId, selectedVideoTemplateId, selectedImageBrowserTab]);

  useEffect(() => {
    if (selectedImageTemplateId === 1 && selectedImageBrowserTab > 6) {
      setSelectedImageBrowserTab(0);
    }
  }, [selectedImageTemplateId, selectedImageBrowserTab]);

  const regenerateVideoTemplate2Title = () => {
    setVideoOverlayCaption((current) => pickRandomDailyFunnyTitle(current));
  };

  const regenerateVideoTemplate2Content = () => {
    regenerateVideoTemplate2Title();
    setVideoTemplate2Questions(pickRandomFunnyQuestions(7));
  };

  const updateVideoTemplate2Question = (index: number, value: string) => {
    setVideoTemplate2Questions((prev) => {
      const next = [...prev];
      while (next.length < 7) next.push('');
      next[index] = value;
      return next;
    });
  };

  const handleRegenerateVideoTemplate2Video = async () => {
    setIsVideoTemplate2VideoLoading(true);
    setVideoTemplate2VideoError(null);
    try {
      const query =
        VIDEO_TEMPLATE2_PEXELS_QUERIES[Math.floor(Math.random() * VIDEO_TEMPLATE2_PEXELS_QUERIES.length)]!;
      const page = 1 + Math.floor(Math.random() * 15);
      const res = await fetch(
        `/api/pexels/random-video?query=${encodeURIComponent(query)}&page=${page}`
      );
      const data = (await res.json()) as { videoUrl?: string; thumbnailUrl?: string | null; error?: string };
      if (!res.ok || !data.videoUrl) {
        throw new Error(data.error || 'Failed to fetch video');
      }
      setVideoTemplate2PexelsVideoSrc(data.videoUrl);
      setVideoTemplate2PexelsPosterSrc(data.thumbnailUrl ?? null);
    } catch (e) {
      setVideoTemplate2VideoError(e instanceof Error ? e.message : 'Failed to fetch video');
    } finally {
      setIsVideoTemplate2VideoLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVideoTemplateId === 2) {
      regenerateVideoTemplate2Content();
      void handleRegenerateVideoTemplate2Video();
    } else {
      setVideoTemplate2PexelsVideoSrc(null);
      setVideoTemplate2PexelsPosterSrc(null);
      setVideoTemplate2VideoError(null);
    }
  }, [selectedVideoTemplateId]);

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
  const templateTitlePool =
    automateQuestionType === 'flirty' ? DAILY_TEMPLATE_TITLES_FLIRTY : DAILY_TEMPLATE_TITLES_FUNNY;
  const pickTemplateHookTitle = (): string => pickRandom(templateTitlePool);

  const handleGenerateDailyTikTok = async () => {
    setIsGeneratingDailyTikTok(true);
    try {
      const questionPool =
        automateQuestionType === 'me_or_you'
          ? ME_OR_YOU_QUESTIONS
          : automateQuestionType === 'flirty'
            ? FLIRTY_QUESTIONS
            : FUNNY_QUESTIONS;
      let rawTemplatePromptForCover: string | null = null;
      let selectedQuestionsThisRun: string[] | null = null;

      if (dailyGenIncludeQuestions) {
        const needPrompts = dailyGenIncludeCoverImage ? 6 : 5;
        const excluded = lastDailyPromptRunRef.current;
        let promptPool = PROMPTS.filter((p) => !excluded.has(p));
        if (promptPool.length < needPrompts) {
          promptPool = [...PROMPTS];
        }
        const shuffledP = shuffle(promptPool);
        const selectedPrompts = shuffledP.slice(0, 5);
        rawTemplatePromptForCover = dailyGenIncludeCoverImage
          ? shuffledP.length >= 6
            ? shuffledP[5]!
            : (() => {
                const remaining = promptPool.filter((p) => !selectedPrompts.includes(p));
                return remaining.length > 0 ? pickRandom(remaining) : pickRandom(PROMPTS);
              })()
          : null;

        const refSet = new Set<string>(selectedPrompts);
        if (rawTemplatePromptForCover) refSet.add(rawTemplatePromptForCover);
        lastDailyPromptRunRef.current = refSet;

        const qShuffled = shuffle(questionPool);
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
        let pool = PROMPTS.filter((p) => !excluded.has(p));
        if (pool.length < 1) pool = [...PROMPTS];
        rawTemplatePromptForCover = pickRandom(shuffle(pool));
        setAutomateDailyTemplatePromptRaw(rawTemplatePromptForCover);
        lastDailyPromptRunRef.current = new Set([rawTemplatePromptForCover]);
      }

      // Show cover as soon as prompt is ready (don't wait for title/caption APIs).
      if (dailyGenIncludeCoverImage && rawTemplatePromptForCover) {
        const templateReplacement = pickTemplateHookTitle().trim();
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

      if (dailyGenIncludeTitle && questionsForApi) {
        try {
          const videoTitleRes = await fetch('/api/openai/daily-video-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: questionsForApi }),
          });
          const videoTitleData = await videoTitleRes.json();
          if (videoTitleRes.ok && typeof videoTitleData?.text === 'string') {
            setAutomateDailyVideoTitle(videoTitleData.text.trim());
          }
        } catch {
          // keep previous title
        }
      }

      if (dailyGenIncludeCaption && questionsForApi) {
        try {
          const captionRes = await fetch('/api/openai/daily-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: questionsForApi }),
          });
          const captionData = await captionRes.json();
          if (captionRes.ok && typeof captionData?.text === 'string') {
            setAutomateDailyTitle(captionData.text.trim());
          }
        } catch {
          // keep previous caption
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
        body: JSON.stringify({ questions: questionsForApi }),
      });
      const videoTitleData = await videoTitleRes.json();
      if (videoTitleRes.ok && typeof videoTitleData?.text === 'string') {
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
        body: JSON.stringify({ questions: questionsForApi }),
      });
      const captionData = await captionRes.json();
      if (captionRes.ok && typeof captionData?.text === 'string') {
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
    const candidates = PROMPTS.filter((p) => !used.has(p));
    const prompt = candidates.length > 0 ? pickRandom(candidates) : pickRandom(PROMPTS);
    setAutomateDailyTemplatePromptRaw(prompt);
    setAutomateDailyTemplatePrompt(prompt);
    setAutomateDailyTemplateReplacementText(null);
  };

  const handleRetryTemplatePrompt = async () => {
    setIsRetryingTemplatePrompt(true);
    try {
      const usedPrompts = new Set<string>(automateDailyRowPrompts ?? []);
      if (automateDailyTemplatePromptRaw) usedPrompts.add(automateDailyTemplatePromptRaw);
      const promptCandidates = PROMPTS.filter((p) => !usedPrompts.has(p));
      const rawTemplatePrompt =
        promptCandidates.length > 0 ? pickRandom(promptCandidates) : pickRandom(PROMPTS);
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
    const promptCandidates = PROMPTS.filter((p) => !usedPrompts.has(p));
    const newPrompt = promptCandidates.length > 0 ? pickRandom(promptCandidates) : pickRandom(PROMPTS);
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
    const questionPool =
      automateQuestionType === 'me_or_you'
        ? ME_OR_YOU_QUESTIONS
        : automateQuestionType === 'flirty'
          ? FLIRTY_QUESTIONS
          : FUNNY_QUESTIONS;
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
      next[index] = prompt.replace(/\{x\}/g, currentQuestion);
      return next;
    });
  };

  const handleRetryDailyQuestionOnly = (index: number) => {
    const questionPool =
      automateQuestionType === 'me_or_you'
        ? ME_OR_YOU_QUESTIONS
        : automateQuestionType === 'flirty'
          ? FLIRTY_QUESTIONS
          : FUNNY_QUESTIONS;
    if (
      !automateDailyRowPrompts ||
      !automateDailyRowQuestions ||
      automateDailyRowPrompts.length !== 5 ||
      automateDailyRowQuestions.length !== 5
    ) {
      return;
    }
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
      next[index] = currentPrompt.replace(/\{x\}/g, question);
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
  const imageTemplateCards = Array.from({ length: 3 }, (_, i) => ({
    id: i === 0 ? 1 : i + 1,
    title: i === 0 ? 'Kawaii' : `Template ${i + 1}`,
    subtitle: '',
  }));
  const imageFrameTitleLine1 = 'Questions to ask your';
  const imageFrameTitleLine2 = 'boyfriend tonight <3';
  const imageFrameCtaText = 'Remember to like, save and share the fun!';
  const regenerateImageTemplateContent = (templateId?: number) => {
    const tid = templateId ?? selectedImageTemplateId;
    const isKawaii = tid === 1;
    setSelectedImageBrowserTab(0);
    const picked = [...FUNNY_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setImageTabFunnyQuestions(picked);
    if (isKawaii) {
      setImageTabTexts([`${imageFrameTitleLine1}\n${imageFrameTitleLine2}`, ...picked, imageFrameCtaText]);
      const dogSources = dogImagePool.length ? pickDogUrlsWithoutReuseUntilDeckExhausted(dogImagePool, 6) : [];
      setImageTabSources([...dogSources, kawaiiCtaImageSrc]);
    } else {
      setImageTabTexts([`${imageFrameTitleLine1}\n${imageFrameTitleLine2}`, ...picked, imageFrameCtaText]);
      setImageTabSources(dogImagePool.length ? pickDogUrlsWithoutReuseUntilDeckExhausted(dogImagePool, 7) : []);
    }
  };
  const getDefaultImageFrameTextForTab = (tabIndex: number): string =>
    tabIndex === 0
      ? `${imageFrameTitleLine1}\n${imageFrameTitleLine2}`
      : tabIndex >= 1 && tabIndex <= 5
        ? imageTabFunnyQuestions[tabIndex - 1] || '...'
        : imageFrameCtaText;
  const getImageFrameTextForTab = (tabIndex: number): string =>
    imageTabTexts[tabIndex] ?? getDefaultImageFrameTextForTab(tabIndex);
  const getImageSourceForTab = (tabIndex: number): string =>
    imageTabSources[tabIndex] ??
    (dogImagePool.length ? dogImagePool[tabIndex % dogImagePool.length]! : '');
  const imageFrameTextForActiveTab = getImageFrameTextForTab(selectedImageBrowserTab);
  const isCtaTabSelected = selectedImageBrowserTab === 6;
  const isFullBleedImageTabSelected = isCtaTabSelected;
  const imageSourceForActiveTab = isCtaTabSelected
    ? kawaiiCtaImageSrc
    : getImageSourceForTab(selectedImageBrowserTab);
  const imageTabLabelForActiveTab =
    selectedImageBrowserTab === 0 ? 'Cover' : selectedImageBrowserTab <= 5 ? `Q${selectedImageBrowserTab}` : 'CTA';
  const imageTemplateTabCount = 7;
  const activeVideoTemplate =
    contentTab === 'video' && selectedVideoTemplateId !== null
      ? VIDEO_TEMPLATE_CARDS.find((c) => c.id === selectedVideoTemplateId)
      : undefined;
  const template2PlaybackVideoSrc =
    selectedVideoTemplateId === 2
      ? (videoTemplate2PexelsVideoSrc ?? activeVideoTemplate?.videoSrc ?? null)
      : (activeVideoTemplate?.videoSrc ?? null);
  const template2PlaybackPosterSrc =
    selectedVideoTemplateId === 2
      ? (videoTemplate2PexelsPosterSrc ?? activeVideoTemplate?.coverSrc)
      : activeVideoTemplate?.coverSrc;
  const template2ExportVideoSrc =
    selectedVideoTemplateId === 2 && videoTemplate2PexelsVideoSrc
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

      const isFullBleedTab = tabIndex === 6;
      const source = isFullBleedTab ? kawaiiCtaImageSrc : sourceForTab(tabIndex);
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
      const canvas = document.createElement('canvas');
      canvas.width = frameWidth;
      canvas.height = frameHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

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
        const words = text.trim().split(/\s+/);
        const lines: string[] = [];
        let current = words[0] ?? '';
        for (let i = 1; i < words.length; i++) {
          const next = `${current} ${words[i]}`;
          if (ctx.measureText(next).width <= maxWidth) current = next;
          else {
            lines.push(current);
            current = words[i] ?? '';
          }
        }
        if (current) lines.push(current);
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

    for (let tabIndex = 0; tabIndex < 7; tabIndex++) {
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
        templateId === 1
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
    if (selectedVideoTemplateId !== 2) return;

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
    if (selectedVideoTemplateId !== 2) return;

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
    if (selectedVideoTemplateId === 2) {
      setShowVideoDownloadModal(true);
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
          (selectedVideoTemplateId === 2 && videoTemplate2Questions.length > 0);
        if (shouldBurnCaption) {
          setIsVideoExporting(true);
          try {
            const exportSrc = template2ExportVideoSrc ?? template2PlaybackVideoSrc;
            const recordedBlob = await exportVideoWithCaptionOverlay(exportSrc, captionTrimmed, {
              position: selectedVideoTemplateId === 2 ? 'top' : 'center',
              style: selectedVideoTemplateId === 2 ? 'natural' : 'stroke',
              numberedQuestions: selectedVideoTemplateId === 2 ? videoTemplate2Questions : undefined,
              maxDurationSec:
                selectedVideoTemplateId === 2 ? VIDEO_TEMPLATE2_MAX_DURATION_SEC : undefined,
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
    <div className="h-screen overflow-hidden overflow-x-hidden bg-zinc-50 font-sans dark:bg-black flex">
      <Sidebar
        contentTab={contentTab}
        onContentTabChange={setContentTab}
        userInfo={userInfo}
        showUserDropdown={showUserDropdown}
        setShowUserDropdown={setShowUserDropdown}
        showSettingsMenu={showSettingsMenu}
        setShowSettingsMenu={setShowSettingsMenu}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0 h-screen ml-56 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full min-w-0 flex flex-col flex-1 min-h-0">
          <div
            className={`grid grid-cols-1 gap-4 flex-1 min-h-0 min-w-0 px-3 pb-3 pt-0 overflow-x-hidden overflow-y-hidden ${
              contentTab === 'prompt' ? 'lg:grid-cols-[320px_minmax(0,1fr)]' : 'lg:grid-cols-[400px_minmax(0,1fr)]'
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
                  automateQuestionType === 'me_or_you'
                    ? [...ME_OR_YOU_QUESTIONS]
                    : automateQuestionType === 'flirty'
                      ? [...FLIRTY_QUESTIONS]
                      : [...FUNNY_QUESTIONS]
                }
                automatePromptOptions={[...PROMPTS]}
                automateTemplateQuestionOptions={[...templateTitlePool]}
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
              <div className="lg:col-span-2 h-full min-h-0 min-w-0 p-6 flex items-center justify-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                  Batch automation tools will live here. Connect Google Drive in Settings (gear icon) to sync uploads to your phone.
                </p>
              </div>
            )}
            {contentTab === 'image' && (
              <div className="lg:col-span-2 h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-1">
                {selectedImageTemplateId === null ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pick a template</h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Select one to start. Placeholder templates for now.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
                          <div className="aspect-3/4 w-full rounded-lg mb-3 overflow-hidden">
                            {card.id === 1 ? (
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
                        {selectedImageTemplateId === 1 ? (
                          <button
                            type="button"
                            onClick={() => regenerateImageTemplateContent(selectedImageTemplateId!)}
                            disabled={isImageTemplateDownloading || isImageTemplateUploading}
                            className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Retry
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleDownloadImageFrame}
                          disabled={isImageTemplateDownloading || isImageTemplateUploading}
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
                        {selectedImageTemplateId === 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleUploadImageTemplateToFolder(
                                selectedImageTemplateId,
                                KAWAII_DRIVE_FOLDER_ID
                              )
                            }
                            disabled={isImageTemplateDownloading || isImageTemplateUploading}
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
                          className="relative w-full max-w-sm mx-auto md:mx-0 aspect-3/4 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden min-w-0"
                          style={{ backgroundColor: imageTabFrameBg }}
                        >
                          {isFullBleedImageTabSelected ? (
                            imageSourceForActiveTab ? (
                              <img
                                src={imageSourceForActiveTab}
                                alt="CTA preview"
                                className="w-full h-full object-cover"
                              />
                            ) : null
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
                        {!isFullBleedImageTabSelected ? (
                          <div className="w-full md:w-80 md:self-start">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                Frame text
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const pool = [...FUNNY_QUESTIONS];
                                  const current = imageFrameTextForActiveTab;
                                  let nextQuestion = pool[Math.floor(Math.random() * pool.length)] || current;
                                  if (pool.length > 1 && nextQuestion === current) {
                                    nextQuestion = pool.find((q) => q !== current) || nextQuestion;
                                  }
                                  const next = [...imageTabTexts];
                                  next[selectedImageBrowserTab] = nextQuestion;
                                  setImageTabTexts(next);
                                }}
                                className="w-full sm:w-auto text-sm sm:text-xs px-3 py-2 sm:px-2 sm:py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                Random question
                              </button>
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
              <div className="lg:col-span-2 h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-1">
                {selectedVideoTemplateId === null ? (
                  <>
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Pick a template</h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">Blank placeholders for now.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                      {VIDEO_TEMPLATE_CARDS.map((card) => (
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
                      <div className="order-2 ml-auto flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                        {selectedVideoTemplateId === 2 ? (
                          <button
                            type="button"
                            onClick={handleRegenerateVideoTemplate2Video}
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
                        ) : null}
                        <button
                          type="button"
                          onClick={handleDownloadVideoTemplate}
                          disabled={
                            (selectedVideoTemplateId === 2
                              ? isVideoExporting
                              : (!template2PlaybackVideoSrc && !activeVideoTemplate?.coverSrc) ||
                                isVideoExporting)
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
                        {selectedVideoTemplateId === 2 ? (
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
                    {videoExportError || videoTemplate2VideoError ? (
                      <p className="px-3 pb-2 text-xs text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-700">
                        {videoExportError ?? videoTemplate2VideoError}
                      </p>
                    ) : null}
                    <div className="p-3 sm:p-4 md:p-6 w-full min-w-0 max-w-full box-border">
                      {activeVideoTemplate?.videoSrc || template2PlaybackVideoSrc ? (
                        <div className="flex flex-col md:flex-row items-start gap-4 min-w-0 w-full">
                          <div className="relative w-full max-w-sm mx-auto md:mx-0 aspect-9/16 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-black min-w-0">
                            <video
                              key={template2PlaybackVideoSrc ?? undefined}
                              src={template2PlaybackVideoSrc || undefined}
                              controls
                              playsInline
                              onTimeUpdate={
                                selectedVideoTemplateId === 2
                                  ? (e) => {
                                      const el = e.currentTarget;
                                      if (el.currentTime >= VIDEO_TEMPLATE2_MAX_DURATION_SEC) {
                                        el.currentTime = 0;
                                      }
                                    }
                                  : undefined
                              }
                              className="absolute inset-0 z-0 h-full w-full min-w-0 object-cover"
                              style={
                                selectedVideoTemplateId === 2
                                  ? { filter: COUPLES_NATURE_VIDEO_FILTER }
                                  : undefined
                              }
                              poster={template2PlaybackPosterSrc || undefined}
                            />
                            {selectedVideoTemplateId === 2 ? (
                              <div
                                className="absolute inset-0 z-5 bg-black/40 pointer-events-none"
                                aria-hidden
                              />
                            ) : null}
                            {(videoOverlayCaption.trim() ||
                              (selectedVideoTemplateId === 2 && videoTemplate2Questions.length > 0)) ? (
                              selectedVideoTemplateId === 2 ? (
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
                          <div className="w-full md:w-80 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto md:self-start space-y-4">
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  {selectedVideoTemplateId === 2 ? 'Title text' : 'Frame text'}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (selectedVideoTemplateId === 2) {
                                      regenerateVideoTemplate2Title();
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
                                  {selectedVideoTemplateId === 2 ? 'Retry' : 'Random question'}
                                </button>
                              </div>
                              <input
                                type="text"
                                value={videoOverlayCaption}
                                onChange={(e) => setVideoOverlayCaption(e.target.value)}
                                placeholder="Type your on-video text…"
                                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-400"
                              />
                            </div>
                            {selectedVideoTemplateId === 2 ? (
                              <div>
                                <label className="mb-2 block text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                  Questions
                                </label>
                                <div className="space-y-2">
                                  {Array.from({ length: 7 }, (_, i) => (
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
                                  ))}
                                </div>
                              </div>
                            ) : null}
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
