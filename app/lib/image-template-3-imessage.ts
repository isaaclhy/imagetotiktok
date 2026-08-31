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

export const IMAGE_TEMPLATE3_IMESSAGE_MAX_BUBBLE_WIDTH_RATIO = 0.7;
/** ~34px at 1080 — closer to real Messages body size in a phone screenshot. */
export const IMAGE_TEMPLATE3_IMESSAGE_FONT_SIZE_RATIO = 0.0315;
export const IMAGE_TEMPLATE3_IMESSAGE_LINE_HEIGHT_MULT = 1.22;
/** Padding / radius are font-relative so bubbles don’t look inflated on tall frames. */
export const IMAGE_TEMPLATE3_IMESSAGE_PAD_X_EM = 0.62;
export const IMAGE_TEMPLATE3_IMESSAGE_PAD_Y_EM = 0.42;
export const IMAGE_TEMPLATE3_IMESSAGE_RADIUS_EM = 1.05;
export const IMAGE_TEMPLATE3_IMESSAGE_DELIVERED_SIZE_RATIO = 0.018;

/**
 * Reply-focus look: earlier thread and chrome are blurred behind a scrim while the
 * current exchange stays sharp, the way Messages dims the screen when you reply
 * inline. Filler lines only exist to give the blur something to smear.
 */
export const IMAGE_TEMPLATE3_IMESSAGE_BLUR_RATIO = 0.012;
export const IMAGE_TEMPLATE3_IMESSAGE_SCRIM = 'rgba(0, 0, 0, 0.55)';
export const IMAGE_TEMPLATE3_IMESSAGE_CONTEXT_LINES: ReadonlyArray<{
  text: string;
  outgoing: boolean;
}> = [
  { text: 'wait what did you say', outgoing: false },
  { text: 'ok but be honest with me', outgoing: true },
  { text: 'hahaha stop', outgoing: false },
  { text: 'i have a question for you', outgoing: true },
  { text: 'you never answer these', outgoing: false },
];

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
  target.fillStyle = outgoing
    ? IMAGE_TEMPLATE3_IMESSAGE_BUBBLE
    : IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE;
  if (withTail && outgoing) {
    outgoingBubblePath(target, x, y, metrics.bubbleW, metrics.bubbleH, metrics.radius);
  } else if (withTail) {
    incomingBubblePath(target, x, y, metrics.bubbleW, metrics.bubbleH, metrics.radius);
  } else {
    roundRectPath(target, x, y, metrics.bubbleW, metrics.bubbleH, metrics.radius);
  }
  target.fill();
  fillBubbleText(target, metrics, x, y);
}

/**
 * Fills the space above the focused exchange with earlier chatter so the blurred
 * backdrop reads as a real thread rather than empty black.
 */
function drawContextBubbles(
  target: CanvasRenderingContext2D,
  frameWidth: number,
  frameHeight: number,
  marginX: number,
  bottom: number,
  top: number
) {
  const gap = Math.max(8, frameHeight * 0.01);
  let y = bottom;
  for (const line of IMAGE_TEMPLATE3_IMESSAGE_CONTEXT_LINES) {
    const metrics = measureBubble(target, line.text, frameWidth, frameHeight);
    y -= metrics.bubbleH + gap;
    if (y < top) break;
    const x = line.outgoing ? frameWidth - marginX - metrics.bubbleW : marginX;
    drawBubble(target, metrics, x, y, line.outgoing, true);
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

  // Real conversations sit against the input bar rather than floating mid-screen.
  const conversationBottom = frameHeight - inputBarH - gap;
  const conversationTop = statusBarH + headerH;
  let cursorY = conversationBottom - stackH;

  const dividerSize = Math.max(15, Math.round(frameWidth * 0.0165));
  const dividerGap = dividerSize * 2.2;
  const dividerY = cursorY - dividerGap;
  const showDivider = dividerY > conversationTop + dividerSize;
  // Never let a long exchange run under the header.
  cursorY = Math.max(cursorY, conversationTop + gap);
  const focusTop = cursorY;

  const drawBackdrop = (target: CanvasRenderingContext2D) => {
    drawChrome(target);
    drawContextBubbles(
      target,
      frameWidth,
      frameHeight,
      marginX,
      showDivider ? dividerY - dividerGap : focusTop - gap,
      conversationTop + gap
    );
    if (showDivider) drawTimestampDivider(target, frameWidth, dividerY, dividerSize);
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
    ctx.filter = `blur(${Math.max(4, frameWidth * IMAGE_TEMPLATE3_IMESSAGE_BLUR_RATIO)}px)`;
    // Blur samples transparent pixels past the edges, so overdraw the frame.
    const bleed = frameWidth * IMAGE_TEMPLATE3_IMESSAGE_BLUR_RATIO * 3;
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
