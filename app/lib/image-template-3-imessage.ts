/** Template 3 Q slides — dark iMessage question + boyfriend reply. */

export const IMAGE_TEMPLATE3_IMESSAGE_BG = '#000000';
export const IMAGE_TEMPLATE3_IMESSAGE_BUBBLE = '#0A84FF';
/** Dark-mode incoming bubble. */
export const IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE = '#3A3A3C';
export const IMAGE_TEMPLATE3_IMESSAGE_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE3_IMESSAGE_HEADER = '#8E8E93';
export const IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';

/** Messages chrome — status bar, contact header, input bar. */
export const IMAGE_TEMPLATE3_IMESSAGE_CONTACT_NAME = 'Boyfriend';
export const IMAGE_TEMPLATE3_IMESSAGE_STATUS_TIME = '3:50';
export const IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON = '#8E8E93';
export const IMAGE_TEMPLATE3_IMESSAGE_AVATAR_BG = '#5A5A5E';
export const IMAGE_TEMPLATE3_IMESSAGE_SEPARATOR = '#1C1C1E';
export const IMAGE_TEMPLATE3_IMESSAGE_INPUT_BORDER = '#3A3A3C';
export const IMAGE_TEMPLATE3_IMESSAGE_ACCENT = '#0A84FF';
/** Fractions of frame height reserved for each chrome band. */
export const IMAGE_TEMPLATE3_IMESSAGE_STATUS_BAR_RATIO = 0.042;
export const IMAGE_TEMPLATE3_IMESSAGE_HEADER_RATIO = 0.115;
export const IMAGE_TEMPLATE3_IMESSAGE_INPUT_BAR_RATIO = 0.085;

export const IMAGE_TEMPLATE3_IMESSAGE_MAX_BUBBLE_WIDTH_RATIO = 0.72;
/** ~31px at 1080 — matches real Messages body size in phone screenshots. */
export const IMAGE_TEMPLATE3_IMESSAGE_FONT_SIZE_RATIO = 0.0285;
/** Focused Q + reply bubbles on export — larger than the blurred thread. */
export const IMAGE_TEMPLATE3_IMESSAGE_FOCUS_FONT_SIZE_RATIO = 0.04;
export const IMAGE_TEMPLATE3_IMESSAGE_FOCUS_MAX_BUBBLE_WIDTH_RATIO = 0.78;
export const IMAGE_TEMPLATE3_IMESSAGE_LINE_HEIGHT_MULT = 1.28;
/** Padding / radius are font-relative so bubbles don’t look inflated on tall frames. */
export const IMAGE_TEMPLATE3_IMESSAGE_PAD_X_EM = 0.85;
export const IMAGE_TEMPLATE3_IMESSAGE_PAD_Y_EM = 0.62;
export const IMAGE_TEMPLATE3_IMESSAGE_RADIUS_EM = 1.15;
export const IMAGE_TEMPLATE3_IMESSAGE_DELIVERED_SIZE_RATIO = 0.017;

/**
 * Reply-focus look: earlier thread and chrome are blurred behind a scrim while the
 * current exchange stays sharp, the way Messages dims the screen when you reply
 * inline. Filler lines only exist to give the blur something to smear.
 */
export const IMAGE_TEMPLATE3_IMESSAGE_BLUR_RATIO = 0.034;
export const IMAGE_TEMPLATE3_IMESSAGE_SCRIM = 'rgba(0, 0, 0, 0.7)';

export type ImessageContextLine = { text: string; outgoing: boolean };

/** Varied lengths / sides so blurred filler doesn’t look like a repeating stack. */
export const IMAGE_TEMPLATE3_IMESSAGE_CONTEXT_POOL: ReadonlyArray<ImessageContextLine> = [
  { text: 'wait what did you say', outgoing: false },
  { text: 'ok but be honest with me', outgoing: true },
  { text: 'hahaha stop', outgoing: false },
  { text: 'i have a question for you', outgoing: true },
  { text: 'you never answer these', outgoing: false },
  { text: 'lol ok fine', outgoing: true },
  { text: 'where are you rn', outgoing: false },
  { text: 'on my way, give me like 10', outgoing: true },
  { text: 'no rush', outgoing: false },
  { text: 'do you actually mean that', outgoing: true },
  { text: 'yes??', outgoing: false },
  { text: 'bro', outgoing: true },
  { text: 'i was literally about to text you', outgoing: false },
  { text: 'ok wait hear me out', outgoing: true },
  { text: 'this better be good', outgoing: false },
  { text: 'are you free later', outgoing: true },
  { text: 'depends… what for', outgoing: false },
  { text: 'nothing weird i promise', outgoing: true },
  { text: 'that already sounds weird', outgoing: false },
  { text: 'haha fair', outgoing: true },
  { text: 'send it', outgoing: false },
  { text: 'one sec', outgoing: true },
  { text: 'ok i’m listening', outgoing: false },
  { text: 'don’t leave me on read', outgoing: true },
  { text: 'i would never', outgoing: false },
  { text: 'you already have three times', outgoing: true },
  { text: 'that was different', outgoing: false },
  { text: 'sure jan', outgoing: true },
  { text: 'anyway', outgoing: false },
  { text: 'so about earlier…', outgoing: true },
];

/** @deprecated Prefer IMAGE_TEMPLATE3_IMESSAGE_CONTEXT_POOL + pickImessageContextThread. */
export const IMAGE_TEMPLATE3_IMESSAGE_CONTEXT_LINES = IMAGE_TEMPLATE3_IMESSAGE_CONTEXT_POOL.slice(
  0,
  5
);

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic before/after filler so preview and export stay stable for a question. */
export function pickImessageContextThread(seed: string): {
  before: ImessageContextLine[];
  after: ImessageContextLine[];
} {
  const rand = mulberry32(hashSeed(seed || 'imessage'));
  const pool = [...IMAGE_TEMPLATE3_IMESSAGE_CONTEXT_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  const beforeCount = 4 + Math.floor(rand() * 3); // 4–6
  const afterCount = 3 + Math.floor(rand() * 3); // 3–5
  const before = pool.slice(0, beforeCount).map((line) => ({ ...line }));
  const after = pool.slice(beforeCount, beforeCount + afterCount).map((line) => ({ ...line }));
  // Nudge sides so it doesn’t alternate too perfectly.
  for (const line of [...before, ...after]) {
    if (rand() < 0.18) line.outgoing = !line.outgoing;
  }
  return { before, after };
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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

type BubbleMetrics = {
  lines: string[];
  bubbleW: number;
  bubbleH: number;
  lineHeight: number;
  padX: number;
  padY: number;
  radius: number;
  fontSize: number;
};

function measureBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  frameWidth: number,
  _frameHeight: number,
  options?: {
    fontSizeRatio?: number;
    maxBubbleWidthRatio?: number;
  }
): BubbleMetrics {
  const fontSizeRatio =
    options?.fontSizeRatio ?? IMAGE_TEMPLATE3_IMESSAGE_FONT_SIZE_RATIO;
  const maxBubbleWidthRatio =
    options?.maxBubbleWidthRatio ?? IMAGE_TEMPLATE3_IMESSAGE_MAX_BUBBLE_WIDTH_RATIO;
  const fontSize = Math.max(24, Math.round(frameWidth * fontSizeRatio));
  const padX = Math.max(14, Math.round(fontSize * IMAGE_TEMPLATE3_IMESSAGE_PAD_X_EM));
  const padY = Math.max(10, Math.round(fontSize * IMAGE_TEMPLATE3_IMESSAGE_PAD_Y_EM));
  const radius = Math.max(16, Math.round(fontSize * IMAGE_TEMPLATE3_IMESSAGE_RADIUS_EM));
  const maxBubbleW = frameWidth * maxBubbleWidthRatio;
  const maxBubbleInner = Math.max(40, maxBubbleW - padX * 2);
  ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  const lines = wrapLines(ctx, text, maxBubbleInner);
  const lineHeight = fontSize * IMAGE_TEMPLATE3_IMESSAGE_LINE_HEIGHT_MULT;
  const textBlockW = Math.max(...lines.map((l) => ctx.measureText(l).width), 0);
  // Slight extra so last glyph doesn’t kiss the edge
  const bubbleW = Math.min(maxBubbleW, Math.ceil(textBlockW) + padX * 2 + 2);
  const textBlockH = Math.max(lineHeight, lines.length * lineHeight);
  const bubbleH = Math.ceil(textBlockH + padY * 2);
  return { lines, bubbleW, bubbleH, lineHeight, padX, padY, radius, fontSize };
}

/**
 * Continuous outgoing bubble + tail (SwiftUI BubbleShape). One path, one fill —
 * no detached nub / cutout artifacts.
 */
function outgoingBubblePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  corner: number
) {
  const u = corner / 15;
  const width = w;
  const height = h;
  ctx.beginPath();
  ctx.moveTo(x + width - 20 * u, y + height);
  ctx.lineTo(x + 15 * u, y + height);
  ctx.bezierCurveTo(
    x + 8 * u,
    y + height,
    x,
    y + height - 8 * u,
    x,
    y + height - 15 * u
  );
  ctx.lineTo(x, y + 15 * u);
  ctx.bezierCurveTo(x, y + 8 * u, x + 8 * u, y, x + 15 * u, y);
  ctx.lineTo(x + width - 20 * u, y);
  ctx.bezierCurveTo(
    x + width - 12 * u,
    y,
    x + width - 5 * u,
    y + 8 * u,
    x + width - 5 * u,
    y + 15 * u
  );
  ctx.lineTo(x + width - 5 * u, y + height - 12 * u);
  ctx.bezierCurveTo(
    x + width - 5 * u,
    y + height - 1 * u,
    x + width,
    y + height,
    x + width,
    y + height
  );
  ctx.lineTo(x + width + 1 * u, y + height);
  ctx.bezierCurveTo(
    x + width - 4 * u,
    y + height + 1 * u,
    x + width - 8 * u,
    y + height - 1 * u,
    x + width - 12 * u,
    y + height - 4 * u
  );
  ctx.bezierCurveTo(
    x + width - 15 * u,
    y + height,
    x + width - 20 * u,
    y + height,
    x + width - 20 * u,
    y + height
  );
  ctx.closePath();
}

/** Continuous incoming bubble + tail — mirror of outgoing. */
function incomingBubblePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  corner: number
) {
  const u = corner / 15;
  const width = w;
  const height = h;
  ctx.beginPath();
  ctx.moveTo(x + 20 * u, y + height);
  ctx.lineTo(x + width - 15 * u, y + height);
  ctx.bezierCurveTo(
    x + width - 8 * u,
    y + height,
    x + width,
    y + height - 8 * u,
    x + width,
    y + height - 15 * u
  );
  ctx.lineTo(x + width, y + 15 * u);
  ctx.bezierCurveTo(
    x + width,
    y + 8 * u,
    x + width - 8 * u,
    y,
    x + width - 15 * u,
    y
  );
  ctx.lineTo(x + 20 * u, y);
  ctx.bezierCurveTo(x + 12 * u, y, x + 5 * u, y + 8 * u, x + 5 * u, y + 15 * u);
  ctx.lineTo(x + 5 * u, y + height - 10 * u);
  ctx.bezierCurveTo(
    x + 5 * u,
    y + height - 1 * u,
    x,
    y + height,
    x,
    y + height
  );
  ctx.lineTo(x - 1 * u, y + height);
  ctx.bezierCurveTo(
    x + 4 * u,
    y + height + 1 * u,
    x + 8 * u,
    y + height - 1 * u,
    x + 12 * u,
    y + height - 4 * u
  );
  ctx.bezierCurveTo(
    x + 15 * u,
    y + height,
    x + 20 * u,
    y + height,
    x + 20 * u,
    y + height
  );
  ctx.closePath();
}

function roundRectPath(
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

/** Time on the left, signal / wifi / battery on the right. */
function drawStatusBar(ctx: CanvasRenderingContext2D, frameWidth: number, barH: number) {
  const fontSize = Math.round(barH * 0.42);
  const cy = barH * 0.62;
  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_TEXT;
  ctx.font = `600 ${fontSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(IMAGE_TEMPLATE3_IMESSAGE_STATUS_TIME, frameWidth * 0.085, cy);

  const unit = barH * 0.1;
  let x = frameWidth * 0.915;

  // Battery, drawn right-to-left so the icons pack against the edge.
  const battW = unit * 6.2;
  const battH = unit * 3;
  x -= battW;
  ctx.strokeStyle = IMAGE_TEMPLATE3_IMESSAGE_TEXT;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = Math.max(1, unit * 0.35);
  roundRectPath(ctx, x, cy - battH / 2, battW, battH, unit);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_TEXT;
  ctx.fillRect(x + battW + unit * 0.35, cy - battH * 0.18, unit * 0.5, battH * 0.36);
  const pad = unit * 0.5;
  roundRectPath(ctx, x + pad, cy - battH / 2 + pad, (battW - pad * 2) * 0.7, battH - pad * 2, unit * 0.6);
  ctx.fill();

  // Wifi arcs.
  x -= unit * 4.6;
  ctx.strokeStyle = IMAGE_TEMPLATE3_IMESSAGE_TEXT;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const r = unit * (1 + i * 0.85);
    ctx.lineWidth = Math.max(1, unit * 0.5);
    ctx.beginPath();
    ctx.arc(x + unit * 1.6, cy + unit * 1.2, r, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x + unit * 1.6, cy + unit * 1.15, unit * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Signal bars.
  x -= unit * 6;
  for (let i = 0; i < 4; i++) {
    const barHeight = unit * (0.9 + i * 0.62);
    roundRectPath(ctx, x + i * unit * 1.3, cy + unit * 1.4 - barHeight, unit * 0.85, barHeight, unit * 0.3);
    ctx.fill();
  }
}

/** Back chevron, centered avatar and contact name, hairline separator. */
function drawConversationHeader(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  top: number,
  headerH: number,
  contactName: string
) {
  const cx = frameWidth / 2;
  const avatarR = headerH * 0.29;
  const avatarCy = top + headerH * 0.42;

  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_AVATAR_BG;
  ctx.beginPath();
  ctx.arc(cx, avatarCy, avatarR, 0, Math.PI * 2);
  ctx.fill();

  // Generic person glyph: head over shoulders, clipped to the avatar circle.
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#C7C7CC';
  ctx.beginPath();
  ctx.arc(cx, avatarCy - avatarR * 0.22, avatarR * 0.36, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, avatarCy + avatarR * 0.78, avatarR * 0.62, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const nameSize = Math.round(headerH * 0.19);
  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_TEXT;
  ctx.font = `500 ${nameSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(contactName, cx, avatarCy + avatarR + headerH * 0.09);

  const chevronX = frameWidth * 0.065;
  const chevronR = headerH * 0.15;
  ctx.strokeStyle = IMAGE_TEMPLATE3_IMESSAGE_ACCENT;
  ctx.lineWidth = Math.max(2, headerH * 0.035);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(chevronX + chevronR * 0.6, avatarCy - chevronR * 0.8);
  ctx.lineTo(chevronX - chevronR * 0.25, avatarCy);
  ctx.lineTo(chevronX + chevronR * 0.6, avatarCy + chevronR * 0.8);
  ctx.stroke();

  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_SEPARATOR;
  ctx.fillRect(0, top + headerH, frameWidth, Math.max(1, headerH * 0.012));
}

/** Plus button, empty iMessage field, mic, and the home indicator. */
function drawInputBar(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  top: number,
  barH: number
) {
  const cy = top + barH * 0.42;
  const marginX = frameWidth * 0.05;
  const plusR = barH * 0.19;
  const plusCx = marginX + plusR;

  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_INPUT_BORDER;
  ctx.beginPath();
  ctx.arc(plusCx, cy, plusR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#AEAEB2';
  ctx.lineWidth = Math.max(2, plusR * 0.16);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(plusCx - plusR * 0.45, cy);
  ctx.lineTo(plusCx + plusR * 0.45, cy);
  ctx.moveTo(plusCx, cy - plusR * 0.45);
  ctx.lineTo(plusCx, cy + plusR * 0.45);
  ctx.stroke();

  const fieldX = plusCx + plusR + frameWidth * 0.035;
  const fieldW = frameWidth - marginX - fieldX;
  const fieldH = plusR * 2.15;
  ctx.strokeStyle = IMAGE_TEMPLATE3_IMESSAGE_INPUT_BORDER;
  ctx.lineWidth = Math.max(1.5, fieldH * 0.045);
  roundRectPath(ctx, fieldX, cy - fieldH / 2, fieldW, fieldH, fieldH / 2);
  ctx.stroke();

  const placeholderSize = Math.round(fieldH * 0.42);
  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON;
  ctx.font = `400 ${placeholderSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('iMessage', fieldX + fieldH * 0.45, cy);

  // Mic glyph inside the right edge of the field.
  const micCx = fieldX + fieldW - fieldH * 0.55;
  const micW = fieldH * 0.22;
  const micH = fieldH * 0.42;
  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON;
  roundRectPath(ctx, micCx - micW / 2, cy - micH * 0.62, micW, micH, micW / 2);
  ctx.fill();
  ctx.strokeStyle = IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON;
  ctx.lineWidth = Math.max(1.5, micW * 0.16);
  ctx.beginPath();
  ctx.arc(micCx, cy - micH * 0.06, micW * 0.78, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(micCx, cy + micH * 0.72);
  ctx.lineTo(micCx, cy + micH * 0.9);
  ctx.stroke();

  const indicatorW = frameWidth * 0.34;
  const indicatorH = Math.max(3, barH * 0.045);
  ctx.fillStyle = '#48484A';
  roundRectPath(
    ctx,
    (frameWidth - indicatorW) / 2,
    top + barH - indicatorH * 3.2,
    indicatorW,
    indicatorH,
    indicatorH / 2
  );
  ctx.fill();
}

/** Centered "Today 3:50 PM" divider above the conversation. */
function drawTimestampDivider(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  y: number,
  fontSize: number
) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = 'Today ';
  const time = `${IMAGE_TEMPLATE3_IMESSAGE_STATUS_TIME} PM`;
  ctx.font = `600 ${fontSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  const labelW = ctx.measureText(label).width;
  ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  const timeW = ctx.measureText(time).width;
  const startX = frameWidth / 2 - (labelW + timeW) / 2;

  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_HEADER;
  ctx.textAlign = 'left';
  ctx.font = `600 ${fontSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  ctx.fillText(label, startX, y);
  ctx.font = `400 ${fontSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  ctx.fillText(time, startX + labelW, y);
}

function fillBubbleText(
  ctx: CanvasRenderingContext2D,
  metrics: BubbleMetrics,
  bubbleX: number,
  bubbleY: number
) {
  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_TEXT;
  ctx.font = `400 ${metrics.fontSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textX = bubbleX + metrics.padX;
  const textBlockH = metrics.lines.length * metrics.lineHeight;
  let y = bubbleY + (metrics.bubbleH - textBlockH) / 2 + metrics.lineHeight / 2;
  for (const line of metrics.lines) {
    ctx.fillText(line, textX, y);
    y += metrics.lineHeight;
  }
}

/** One bubble, in the style of whichever side sent it. */
function drawBubble(
  target: CanvasRenderingContext2D,
  metrics: BubbleMetrics,
  x: number,
  y: number,
  outgoing: boolean,
  withTail: boolean
) {
  const fill = outgoing
    ? IMAGE_TEMPLATE3_IMESSAGE_BUBBLE
    : IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE;
  const corner = Math.min(metrics.radius, metrics.bubbleH / 2, metrics.bubbleW / 2);
  target.fillStyle = fill;
  if (withTail && outgoing) {
    outgoingBubblePath(target, x, y, metrics.bubbleW, metrics.bubbleH, corner);
  } else if (withTail) {
    incomingBubblePath(target, x, y, metrics.bubbleW, metrics.bubbleH, corner);
  } else {
    roundRectPath(target, x, y, metrics.bubbleW, metrics.bubbleH, corner);
  }
  target.fill();
  fillBubbleText(target, metrics, x, y);
}

/**
 * Fills a vertical band with context bubbles (newest near `fromY`, stacking toward `towardY`).
 * `direction` -1 stacks upward (before), +1 stacks downward (after).
 */
function drawContextBubbleBand(
  target: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  marginX: number,
  lines: ReadonlyArray<ImessageContextLine>,
  fromY: number,
  limitY: number,
  direction: -1 | 1
) {
  const gap = Math.max(8, frameHeight * 0.01);
  let y = fromY;
  for (const line of lines) {
    const metrics = measureBubble(target, line.text, frameWidth, frameHeight);
    if (direction < 0) {
      y -= metrics.bubbleH + gap;
      if (y < limitY) break;
    } else {
      if (y + metrics.bubbleH > limitY) break;
    }
    const x = line.outgoing ? frameWidth - marginX - metrics.bubbleW : marginX;
    drawBubble(target, metrics, x, y, line.outgoing, true);
    if (direction > 0) y += metrics.bubbleH + gap;
  }
}

/** Black Messages screen: you ask (blue) → boyfriend reply bubbles (gray). */
export function drawImageTemplate3ImessageSlide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  question: string,
  replies?: string[] | string | null,
  deliveryStatus: 'Delivered' | 'Read' = 'Delivered'
) {
  const statusBarH = frameHeight * IMAGE_TEMPLATE3_IMESSAGE_STATUS_BAR_RATIO;
  const headerH = frameHeight * IMAGE_TEMPLATE3_IMESSAGE_HEADER_RATIO;
  const inputBarH = frameHeight * IMAGE_TEMPLATE3_IMESSAGE_INPUT_BAR_RATIO;

  const questionText = question.trim().replace(/\n/g, ' ');
  const replyList = (
    Array.isArray(replies)
      ? replies
      : typeof replies === 'string' && replies.trim()
        ? [replies]
        : []
  )
    .map((r) => r.trim().replace(/\n/g, ' '))
    .filter(Boolean);

  const drawChrome = (target: CanvasRenderingContext2D) => {
    target.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_BG;
    target.fillRect(0, 0, frameWidth, frameHeight);
    drawStatusBar(target, frameWidth, statusBarH);
    drawConversationHeader(
      target,
      frameWidth,
      statusBarH,
      headerH,
      IMAGE_TEMPLATE3_IMESSAGE_CONTACT_NAME
    );
    drawInputBar(target, frameWidth, frameHeight - inputBarH, inputBarH);
  };

  if (!questionText && replyList.length === 0) {
    drawChrome(ctx);
    return;
  }

  const marginX = frameWidth * 0.055;
  const gap = Math.max(16, frameHeight * 0.014);
  const bubbleGap = Math.max(8, frameHeight * 0.008);
  const deliveredSize = Math.max(
    18,
    Math.round(frameWidth * IMAGE_TEMPLATE3_IMESSAGE_DELIVERED_SIZE_RATIO * 1.35)
  );
  const deliveredGap = Math.max(10, Math.round(deliveredSize * 0.55));

  const focusMeasureOpts = {
    fontSizeRatio: IMAGE_TEMPLATE3_IMESSAGE_FOCUS_FONT_SIZE_RATIO,
    maxBubbleWidthRatio: IMAGE_TEMPLATE3_IMESSAGE_FOCUS_MAX_BUBBLE_WIDTH_RATIO,
  };
  const qMetrics = questionText
    ? measureBubble(ctx, questionText, frameWidth, frameHeight, focusMeasureOpts)
    : null;
  const replyMetrics = replyList.map((r) =>
    measureBubble(ctx, r, frameWidth, frameHeight, focusMeasureOpts)
  );

  const repliesH = replyMetrics.reduce(
    (sum, m, i) => sum + m.bubbleH + (i > 0 ? bubbleGap : 0),
    0
  );
  const stackH =
    (qMetrics?.bubbleH ?? 0) +
    (qMetrics ? deliveredGap + deliveredSize + gap : 0) +
    repliesH;

  const conversationBottom = frameHeight - inputBarH - gap;
  const conversationTop = statusBarH + headerH;
  const conversationMid = (conversationTop + conversationBottom) / 2;
  // Center the focused exchange so blurred messages can sit above and below.
  let focusTop = conversationMid - stackH / 2;
  focusTop = Math.max(conversationTop + gap, Math.min(focusTop, conversationBottom - stackH));
  const focusBottom = focusTop + stackH;

  const dividerSize = Math.max(15, Math.round(frameWidth * 0.0165));
  const dividerGap = dividerSize * 2.2;
  const dividerY = focusTop - dividerGap;
  const showDivider = dividerY > conversationTop + dividerSize;

  const { before, after } = pickImessageContextThread(
    `${questionText}|${replyList.join('|')}|${deliveryStatus}`
  );

  const drawBackdrop = (target: CanvasRenderingContext2D) => {
    drawChrome(target);
    drawContextBubbleBand(
      target,
      frameWidth,
      frameHeight,
      marginX,
      before,
      showDivider ? dividerY - dividerGap * 0.35 : focusTop - gap,
      conversationTop + gap,
      -1
    );
    if (showDivider) drawTimestampDivider(target, frameWidth, dividerY, dividerSize);
    drawContextBubbleBand(
      target,
      frameWidth,
      frameHeight,
      marginX,
      after,
      focusBottom + gap,
      conversationBottom,
      1
    );
  };

  const drawFocus = (target: CanvasRenderingContext2D) => {
    let y = focusTop;
    if (qMetrics) {
      const bubbleX = frameWidth - marginX - qMetrics.bubbleW;
      drawBubble(target, qMetrics, bubbleX, y, true, true);

      target.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_HEADER;
      target.font = `400 ${deliveredSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
      target.textAlign = 'right';
      target.textBaseline = 'top';
      target.fillText(
        deliveryStatus,
        frameWidth - marginX,
        y + qMetrics.bubbleH + deliveredGap
      );
      y += qMetrics.bubbleH + deliveredGap + deliveredSize + gap;
    }

    for (let i = 0; i < replyMetrics.length; i++) {
      const m = replyMetrics[i]!;
      drawBubble(target, m, marginX, y, false, i === replyMetrics.length - 1);
      y += m.bubbleH + bubbleGap;
    }
  };

  const backdrop = createBackdropCanvas(frameWidth, frameHeight);
  if (backdrop) {
    drawBackdrop(backdrop.ctx);
    ctx.save();
    ctx.filter = `blur(${Math.max(22, frameWidth * IMAGE_TEMPLATE3_IMESSAGE_BLUR_RATIO)}px)`;
    // Blur samples transparent pixels past the edges, so overdraw the frame.
    const bleed = frameWidth * IMAGE_TEMPLATE3_IMESSAGE_BLUR_RATIO * 4;
    ctx.drawImage(
      backdrop.canvas,
      -bleed,
      -bleed,
      frameWidth + bleed * 2,
      frameHeight + bleed * 2
    );
    ctx.restore();
    ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_SCRIM;
    ctx.fillRect(0, 0, frameWidth, frameHeight);
  } else {
    drawBackdrop(ctx);
  }

  drawFocus(ctx);
}

/** Offscreen buffer for the blurred layer; null where canvas can't be created. */
function createBackdropCanvas(
  width: number,
  height: number
): { canvas: HTMLCanvasElement | OffscreenCanvas; ctx: CanvasRenderingContext2D } | null {
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
      if (ctx) return { canvas, ctx };
    }
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return ctx ? { canvas, ctx } : null;
  } catch {
    return null;
  }
}
