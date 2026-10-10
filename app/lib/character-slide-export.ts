import {
  IMAGE_TEMPLATE2_COVER_LETTER_SPACING,
  IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE2_COVER_MAX_TEXT_WIDTH_RATIO,
  IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO,
  IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT,
} from '@/app/lib/image-template-2-cover';
import {
  IMAGE_TEMPLATE8_Q5_BANNER_ASPECT,
  IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO,
  IMAGE_TEMPLATE8_Q5_BANNER_SRC,
  IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT,
  IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO,
  IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT,
} from '@/app/lib/image-template-8-cover';

const COVER_W = 1080;
const COVER_H = 1440;
/** iOS lock-screen notification floor for a title plus one body line, in 393pt units. */
export const CHARACTER_NOTIFICATION_MIN_HEIGHT = 84;
const PHONE_W = 1080;
const PHONE_H = Math.round((PHONE_W * 852) / 393);
const FONT = '"TikTok Sans", system-ui, sans-serif';
const SF = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const STROKE = 0.11;
export const CHARACTER_COVER_TITLE_SIZE_RATIO = IMAGE_TEMPLATE2_COVER_TITLE_SIZE_RATIO * 0.75;
export const CHARACTER_COVER_STROKE = `${STROKE}em`;
export const CHARACTER_Q5_CTA = 'Search "Spill It Couples Questions" to ragebait him more!';
const MESSAGES_BUBBLE_PATH =
  'M20 5.2c8.7 0 15.8 5.55 15.8 12.4S28.7 30.05 20 30.05c-1.28 0-2.52-.12-3.7-.36l-6.15 2.62c-.6.26-1.24-.37-1.04-.98l1.72-5.55C7.55 24.15 4.2 20.15 4.2 17.6 4.2 10.75 11.3 5.2 20 5.2Z';

const WORLD_CLOCKS = [
  { code: 'NYC', timeZone: 'America/New_York' },
  { code: 'AUS', timeZone: 'Australia/Sydney' },
  { code: 'BEI', timeZone: 'Asia/Shanghai' },
] as const;

function px(n: number, width: number) {
  return (n / 393) * width;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for download'));
    img.src = src;
  });
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode slide'))), 'image/png');
  });
}

function coverFit(img: HTMLImageElement, frameWidth: number, frameHeight: number) {
  const scale = Math.max(frameWidth / img.width, frameHeight / img.height);
  const width = img.width * scale;
  const height = img.height * scale;
  return { x: (frameWidth - width) / 2, y: (frameHeight - height) / 2, width, height };
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
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
}

function strokeFill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fill: string
) {
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.lineWidth = Math.max(2, fontSize * STROKE);
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = fill;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function drawCoverTitle(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  title: string,
  anchorX = 0.5,
  anchorY = 0.5
) {
  const fontSize = Math.round(frameWidth * CHARACTER_COVER_TITLE_SIZE_RATIO);
  ctx.font = `${IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT} ${fontSize}px ${FONT}`;
  ctx.letterSpacing = IMAGE_TEMPLATE2_COVER_LETTER_SPACING;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapLines(ctx, title, frameWidth * IMAGE_TEMPLATE2_COVER_MAX_TEXT_WIDTH_RATIO);
  const lineHeight = fontSize * IMAGE_TEMPLATE2_COVER_LINE_HEIGHT_MULT;
  const blockH = lines.length * lineHeight;
  const blockW = lines.reduce((widest, line) => Math.max(widest, ctx.measureText(line).width), 0);
  const pad = fontSize * STROKE;
  const halfW = blockW / 2 + pad;
  const halfH = blockH / 2 + pad;
  const minX = Math.min(halfW, frameWidth / 2);
  const maxX = Math.max(minX, frameWidth - halfW);
  const minY = Math.min(halfH, frameHeight / 2);
  const maxY = Math.max(minY, frameHeight - halfH);
  const cx = Math.min(maxX, Math.max(minX, anchorX * frameWidth));
  const cy = Math.min(maxY, Math.max(minY, anchorY * frameHeight));
  let y = cy - blockH / 2 + lineHeight / 2;

  for (const line of lines) {
    strokeFill(ctx, line, cx, y, fontSize, '#FFFFFF');
    y += lineHeight;
  }
  ctx.letterSpacing = '0px';
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawGlass(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  placed: { x: number; y: number; width: number; height: number },
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.filter = 'blur(28px)';
  ctx.drawImage(image, placed.x, placed.y, placed.width, placed.height);
  ctx.filter = 'none';
  ctx.fillStyle = 'rgba(28, 28, 30, 0.22)';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawMessagesIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  roundRect(ctx, x, y, size, size, size * (8.6 / 38));
  const green = ctx.createLinearGradient(x, y, x, y + size);
  green.addColorStop(0, '#64ED80');
  green.addColorStop(1, '#1FC855');
  ctx.fillStyle = green;
  ctx.fill();
  ctx.clip();
  ctx.translate(x, y);
  ctx.scale(size / 40, size / 40);
  ctx.translate(1.1, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fill(new Path2D(MESSAGES_BUBBLE_PATH));
  ctx.restore();
}

function drawQuestionSlide(
  ctx: CanvasRenderingContext2D,
  background: HTMLImageElement,
  banner: HTMLImageElement | null,
  question: string,
  showCta: boolean,
  now: Date
) {
  const w = PHONE_W;
  const h = PHONE_H;
  const placed = coverFit(background, w, h);
  ctx.drawImage(background, placed.x, placed.y, placed.width, placed.height);

  ctx.fillStyle = '#fff';
  ctx.font = `600 ${px(20, w)}px ${SF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const date = now
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .replace(',', '');
  ctx.fillText(date, w / 2, px(84, w));
  const time = now
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s?(AM|PM)$/i, '');
  ctx.font = `200 ${px(104, w)}px ${SF}`;
  ctx.fillStyle = 'rgba(255,255,255,0.58)';
  ctx.fillText(time, w / 2, px(155, w));

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = `400 ${px(16, w)}px ${SF}`;
  ctx.textBaseline = 'alphabetic';
  WORLD_CLOCKS.forEach((clock, index) => {
    const clockTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: clock.timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    const local = Date.parse(now.toLocaleString('en-US'));
    const there = Date.parse(now.toLocaleString('en-US', { timeZone: clock.timeZone }));
    const diff = Math.round((there - local) / 3_600_000);
    const y = px(220, w) + index * px(22, w);
    ctx.fillText(`${clock.code}   ${clockTime} ${diff > 0 ? `+${diff}` : diff}`, px(28, w), y);
  });

  const cardX = px(16, w);
  const cardY = px(282, w);
  const cardW = w - cardX * 2;
  ctx.font = `400 ${px(15, w)}px ${SF}`;
  const lines = wrapLines(ctx, question.trim() || 'Your question', cardW - px(80, w));
  const lineH = px(18, w);
  const contentH = px(59, w) + Math.max(0, lines.length - 1) * lineH;
  const cardH = Math.max(px(CHARACTER_NOTIFICATION_MIN_HEIGHT, w), contentH);
  const contentTop = cardY + (cardH - contentH) / 2;
  drawGlass(ctx, background, placed, cardX, cardY, cardW, cardH, px(24, w));

  const icon = px(38, w);
  const iconX = cardX + px(10, w);
  const iconY = cardY + (cardH - icon) / 2;
  drawMessagesIcon(ctx, iconX, iconY, icon);

  ctx.fillStyle = '#fff';
  ctx.font = `600 ${px(15, w)}px ${SF}`;
  ctx.textBaseline = 'top';
  ctx.fillText('Dumbo bf ❤️', iconX + icon + px(10, w), contentTop + px(12, w));
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `400 ${px(13, w)}px ${SF}`;
  ctx.fillText('now', cardX + cardW - px(12, w), contentTop + px(13, w));
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `400 ${px(15, w)}px ${SF}`;
  lines.forEach((line, index) => {
    ctx.fillText(line, iconX + icon + px(10, w), contentTop + px(34, w) + index * lineH);
  });

  if (showCta) {
    const searchSize = w * IMAGE_TEMPLATE8_Q5_SEARCH_SIZE_RATIO;
    const searchTop = cardY + cardH + px(18, w);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = `${IMAGE_TEMPLATE8_Q5_SEARCH_WEIGHT} ${searchSize}px ${FONT}`;
    const searchLines = wrapLines(ctx, CHARACTER_Q5_CTA, w * 0.88);
    searchLines.forEach((line, index) => {
      ctx.fillText(line, w / 2, searchTop + index * searchSize * IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT);
    });
    if (banner) {
      const bannerW = w * IMAGE_TEMPLATE8_Q5_BANNER_WIDTH_RATIO;
      const bannerH = bannerW / IMAGE_TEMPLATE8_Q5_BANNER_ASPECT;
      const bannerX = (w - bannerW) / 2;
      const bannerY =
        searchTop +
        searchLines.length * searchSize * IMAGE_TEMPLATE8_Q5_SEARCH_LINE_HEIGHT_MULT +
        h * IMAGE_TEMPLATE8_Q5_BANNER_GAP_RATIO;
      ctx.save();
      roundRect(ctx, bannerX, bannerY, bannerW, bannerH, bannerH * IMAGE_TEMPLATE8_Q5_BANNER_RADIUS_RATIO);
      ctx.clip();
      ctx.drawImage(banner, bannerX, bannerY, bannerW, bannerH);
      ctx.restore();
    }
  }
}

export async function exportCharacterSlides(options: {
  coverSrc: string;
  questionBackgroundSrc: string;
  title: string;
  titleX?: number;
  titleY?: number;
  questions: string[];
  now?: Date;
}) {
  const now = options.now ?? new Date();
  await document.fonts.load(
    `${IMAGE_TEMPLATE2_COVER_TITLE_WEIGHT} ${Math.round(COVER_W * CHARACTER_COVER_TITLE_SIZE_RATIO)}px "TikTok Sans"`
  );
  const [coverImg, background, banner] = await Promise.all([
    loadImage(options.coverSrc),
    loadImage(options.questionBackgroundSrc),
    loadImage(IMAGE_TEMPLATE8_Q5_BANNER_SRC).catch(() => null),
  ]);

  const cover = document.createElement('canvas');
  cover.width = COVER_W;
  cover.height = COVER_H;
  const coverCtx = cover.getContext('2d');
  if (!coverCtx) throw new Error('Canvas unavailable');
  const placed = coverFit(coverImg, COVER_W, COVER_H);
  coverCtx.drawImage(coverImg, placed.x, placed.y, placed.width, placed.height);
  drawCoverTitle(
    coverCtx,
    COVER_W,
    COVER_H,
    options.title,
    options.titleX ?? 0.5,
    options.titleY ?? 0.5
  );

  const entries: { path: string; blob: Blob }[] = [{ path: 'cover.png', blob: await canvasBlob(cover) }];
  for (let i = 0; i < options.questions.length; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = PHONE_W;
    canvas.height = PHONE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    drawQuestionSlide(ctx, background, banner, options.questions[i] ?? '', i === 4, now);
    entries.push({ path: `q${i + 1}.png`, blob: await canvasBlob(canvas) });
  }
  return entries;
}
