/** Template 3 Q slides — dark iMessage question + boyfriend reply. */

export const IMAGE_TEMPLATE3_IMESSAGE_BG = '#000000';
export const IMAGE_TEMPLATE3_IMESSAGE_BUBBLE = '#0A84FF';
/** Dark-mode incoming bubble. */
export const IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE = '#3A3A3C';
export const IMAGE_TEMPLATE3_IMESSAGE_TEXT = '#FFFFFF';
export const IMAGE_TEMPLATE3_IMESSAGE_HEADER = '#8E8E93';
export const IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK =
  'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif';

export const IMAGE_TEMPLATE3_IMESSAGE_MAX_BUBBLE_WIDTH_RATIO = 0.7;
/** ~34px at 1080 — closer to real Messages body size in a phone screenshot. */
export const IMAGE_TEMPLATE3_IMESSAGE_FONT_SIZE_RATIO = 0.0315;
export const IMAGE_TEMPLATE3_IMESSAGE_LINE_HEIGHT_MULT = 1.22;
/** Padding / radius are font-relative so bubbles don’t look inflated on tall frames. */
export const IMAGE_TEMPLATE3_IMESSAGE_PAD_X_EM = 0.62;
export const IMAGE_TEMPLATE3_IMESSAGE_PAD_Y_EM = 0.42;
export const IMAGE_TEMPLATE3_IMESSAGE_RADIUS_EM = 1.05;
export const IMAGE_TEMPLATE3_IMESSAGE_DELIVERED_SIZE_RATIO = 0.018;

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
  _frameHeight: number
): BubbleMetrics {
  const fontSize = Math.max(28, Math.round(frameWidth * IMAGE_TEMPLATE3_IMESSAGE_FONT_SIZE_RATIO));
  const padX = Math.max(14, Math.round(fontSize * IMAGE_TEMPLATE3_IMESSAGE_PAD_X_EM));
  const padY = Math.max(10, Math.round(fontSize * IMAGE_TEMPLATE3_IMESSAGE_PAD_Y_EM));
  const radius = Math.max(16, Math.round(fontSize * IMAGE_TEMPLATE3_IMESSAGE_RADIUS_EM));
  const maxBubbleW = frameWidth * IMAGE_TEMPLATE3_IMESSAGE_MAX_BUBBLE_WIDTH_RATIO;
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

/** Outgoing iMessage bubble + bottom-right swoosh. */
function outgoingBubblePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  const tailW = Math.max(11, radius * 0.55);
  const tipX = x + w + tailW * 0.72;
  const tipY = y + h + tailW * 0.55;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius * 0.55);
  ctx.bezierCurveTo(
    x + w + tailW * 0.08,
    y + h - radius * 0.1,
    tipX - tailW * 0.05,
    tipY - tailW * 0.35,
    tipX,
    tipY
  );
  ctx.bezierCurveTo(
    tipX - tailW * 0.85,
    tipY - tailW * 0.15,
    x + w - radius * 0.05,
    y + h + tailW * 0.02,
    x + w - radius * 0.95,
    y + h
  );
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Incoming iMessage bubble + bottom-left swoosh. */
function incomingBubblePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  const tailW = Math.max(11, radius * 0.55);
  const tipX = x - tailW * 0.72;
  const tipY = y + h + tailW * 0.55;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius * 0.95, y + h);
  ctx.bezierCurveTo(
    x + radius * 0.05,
    y + h + tailW * 0.02,
    tipX + tailW * 0.85,
    tipY - tailW * 0.15,
    tipX,
    tipY
  );
  ctx.bezierCurveTo(
    tipX + tailW * 0.05,
    tipY - tailW * 0.35,
    x - tailW * 0.08,
    y + h - radius * 0.1,
    x,
    y + h - radius * 0.55
  );
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
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

/** Black Messages screen: you ask (blue) → boyfriend reply bubbles (gray). */
export function drawImageTemplate3ImessageSlide(
  ctx: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  question: string,
  replies?: string[] | string | null
) {
  ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_BG;
  ctx.fillRect(0, 0, frameWidth, frameHeight);

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
  if (!questionText && replyList.length === 0) return;

  const marginX = frameWidth * 0.055;
  const gap = Math.max(16, frameHeight * 0.014);
  const bubbleGap = Math.max(8, frameHeight * 0.008);
  const deliveredSize = Math.max(16, Math.round(frameWidth * IMAGE_TEMPLATE3_IMESSAGE_DELIVERED_SIZE_RATIO));
  const deliveredGap = Math.max(10, Math.round(deliveredSize * 0.55));

  const qMetrics = questionText
    ? measureBubble(ctx, questionText, frameWidth, frameHeight)
    : null;
  const replyMetrics = replyList.map((r) =>
    measureBubble(ctx, r, frameWidth, frameHeight)
  );

  const repliesH = replyMetrics.reduce(
    (sum, m, i) => sum + m.bubbleH + (i > 0 ? bubbleGap : 0),
    0
  );
  const stackH =
    (qMetrics?.bubbleH ?? 0) +
    (qMetrics ? deliveredGap + deliveredSize + gap : 0) +
    repliesH;
  let cursorY = frameHeight * 0.45 - stackH / 2;

  if (qMetrics) {
    const bubbleX = frameWidth - marginX - qMetrics.bubbleW;
    const bubbleY = cursorY;
    ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_BUBBLE;
    outgoingBubblePath(
      ctx,
      bubbleX,
      bubbleY,
      qMetrics.bubbleW,
      qMetrics.bubbleH,
      qMetrics.radius
    );
    ctx.fill();
    fillBubbleText(ctx, qMetrics, bubbleX, bubbleY);

    ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_HEADER;
    ctx.font = `400 ${deliveredSize}px ${IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK}`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(
      'Delivered',
      frameWidth - marginX,
      bubbleY + qMetrics.bubbleH + deliveredGap
    );
    cursorY = bubbleY + qMetrics.bubbleH + deliveredGap + deliveredSize + gap;
  }

  for (let i = 0; i < replyMetrics.length; i++) {
    const m = replyMetrics[i]!;
    const bubbleX = marginX;
    const bubbleY = cursorY;
    const isLast = i === replyMetrics.length - 1;
    ctx.fillStyle = IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE;
    if (isLast) {
      incomingBubblePath(ctx, bubbleX, bubbleY, m.bubbleW, m.bubbleH, m.radius);
    } else {
      // Intermediate bubbles: fully rounded, no tail
      const r = Math.min(m.radius, m.bubbleW / 2, m.bubbleH / 2);
      ctx.beginPath();
      ctx.moveTo(bubbleX + r, bubbleY);
      ctx.arcTo(bubbleX + m.bubbleW, bubbleY, bubbleX + m.bubbleW, bubbleY + m.bubbleH, r);
      ctx.arcTo(bubbleX + m.bubbleW, bubbleY + m.bubbleH, bubbleX, bubbleY + m.bubbleH, r);
      ctx.arcTo(bubbleX, bubbleY + m.bubbleH, bubbleX, bubbleY, r);
      ctx.arcTo(bubbleX, bubbleY, bubbleX + m.bubbleW, bubbleY, r);
      ctx.closePath();
    }
    ctx.fill();
    fillBubbleText(ctx, m, bubbleX, bubbleY);
    cursorY += m.bubbleH + bubbleGap;
  }
}
