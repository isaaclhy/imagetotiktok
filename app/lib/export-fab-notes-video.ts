import {
  FAB_NOTES_EXPORT_MAX_HEIGHT,
  FAB_NOTES_EXPORT_MAX_WIDTH,
  FAB_NOTES_EXPORT_VIDEO_BITRATE,
  FAB_NOTES_FOOTER,
  FAB_NOTES_MAX_DURATION_SEC,
} from '@/app/lib/fab-video';

/** Fit inside max box; keep even dims for H.264/VP encoders. */
function exportCanvasSize(srcW: number, srcH: number): { w: number; h: number } {
  const scale = Math.min(
    1,
    FAB_NOTES_EXPORT_MAX_WIDTH / srcW,
    FAB_NOTES_EXPORT_MAX_HEIGHT / srcH
  );
  let w = Math.round(srcW * scale);
  let h = Math.round(srcH * scale);
  if (w % 2) w -= 1;
  if (h % 2) h -= 1;
  return { w: Math.max(2, w), h: Math.max(2, h) };
}

function pickMediaRecorderMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  // Prefer MP4 when available so we can skip ffmpeg.wasm (broken under Turbopack).
  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return null;
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

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function strokeIconPath(
  ctx: CanvasRenderingContext2D,
  draw: () => void,
  lineWidth: number
) {
  ctx.save();
  ctx.strokeStyle = '#E4B84A';
  ctx.fillStyle = '#E4B84A';
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  draw();
  ctx.restore();
}

/** Match preview SVG header icons (gold). */
function drawNotesHeaderIcons(
  ctx: CanvasRenderingContext2D,
  cardX: number,
  cardW: number,
  headerY: number,
  padX: number,
  iconSize: number
) {
  const gold = '#E4B84A';
  const lw = Math.max(1.5, iconSize * 0.14);

  // Back chevron
  const backX = cardX + padX * 0.55;
  strokeIconPath(
    ctx,
    () => {
      ctx.beginPath();
      ctx.moveTo(backX + iconSize * 0.62, headerY - iconSize * 0.32);
      ctx.lineTo(backX + iconSize * 0.28, headerY);
      ctx.lineTo(backX + iconSize * 0.62, headerY + iconSize * 0.32);
      ctx.stroke();
    },
    lw * 1.15
  );

  // "Notes" label
  const headerFont = Math.max(11, Math.floor(iconSize * 0.95));
  ctx.fillStyle = gold;
  ctx.font = `500 ${headerFont}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Notes', backX + iconSize * 0.85, headerY);

  const rightEdge = cardX + cardW - padX * 0.55;
  const gap = iconSize * 1.55;
  const sizes = [iconSize * 0.88, iconSize * 0.88, iconSize * 0.88, iconSize];
  const centers = [
    rightEdge - gap * 3,
    rightEdge - gap * 2,
    rightEdge - gap,
    rightEdge,
  ];

  // Undo (curved arrow left)
  strokeIconPath(
    ctx,
    () => {
      const cx = centers[0]!;
      const s = sizes[0]!;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.15, headerY + s * 0.28);
      ctx.lineTo(cx - s * 0.42, headerY);
      ctx.lineTo(cx - s * 0.15, headerY - s * 0.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.42, headerY);
      ctx.quadraticCurveTo(cx + s * 0.45, headerY, cx + s * 0.35, headerY + s * 0.38);
      ctx.stroke();
    },
    lw
  );

  // Redo (curved arrow right)
  strokeIconPath(
    ctx,
    () => {
      const cx = centers[1]!;
      const s = sizes[1]!;
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.15, headerY + s * 0.28);
      ctx.lineTo(cx + s * 0.42, headerY);
      ctx.lineTo(cx + s * 0.15, headerY - s * 0.28);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.42, headerY);
      ctx.quadraticCurveTo(cx - s * 0.45, headerY, cx - s * 0.35, headerY + s * 0.38);
      ctx.stroke();
    },
    lw
  );

  // Share (box + up arrow)
  strokeIconPath(
    ctx,
    () => {
      const cx = centers[2]!;
      const s = sizes[2]!;
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.38, headerY);
      ctx.lineTo(cx - s * 0.38, headerY + s * 0.38);
      ctx.lineTo(cx + s * 0.38, headerY + s * 0.38);
      ctx.lineTo(cx + s * 0.38, headerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, headerY + s * 0.2);
      ctx.lineTo(cx, headerY - s * 0.42);
      ctx.moveTo(cx - s * 0.22, headerY - s * 0.18);
      ctx.lineTo(cx, headerY - s * 0.42);
      ctx.lineTo(cx + s * 0.22, headerY - s * 0.18);
      ctx.stroke();
    },
    lw
  );

  // More (circle with three dots)
  strokeIconPath(
    ctx,
    () => {
      const cx = centers[3]!;
      const s = sizes[3]!;
      ctx.beginPath();
      ctx.arc(cx, headerY, s * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      const r = s * 0.07;
      for (const dx of [-s * 0.18, 0, s * 0.18]) {
        ctx.beginPath();
        ctx.arc(cx + dx, headerY, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    lw * 0.9
  );
}

/** Draw the static iPhone Notes card onto a video frame canvas. */
export function drawFabNotesCardOnCanvas(
  ctx: CanvasRenderingContext2D,
  frameW: number,
  frameH: number,
  title: string,
  questions: string[]
) {
  const cardW = frameW * 0.7;
  const padX = cardW * 0.055;
  const headerH = Math.max(34, frameH * 0.036);
  const titleFont = Math.max(18, Math.floor(frameH * 0.022));
  const bodyFont = Math.max(14, Math.floor(frameH * 0.016));
  const footerFont = Math.max(12, Math.floor(frameH * 0.013));

  const visible = questions.map((q) => q.trim()).filter(Boolean).slice(0, 5);

  ctx.save();
  ctx.font = `700 ${titleFont}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const titleLines = title.trim() ? wrapText(ctx, title.trim(), cardW - padX * 2) : [];
  ctx.font = `400 ${bodyFont}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const questionBlocks = visible.map((q, i) => {
    const label = `${i + 1}. `;
    const labelW = ctx.measureText(label).width;
    const lines = wrapText(ctx, q, cardW - padX * 2 - labelW);
    return { label, labelW, lines };
  });

  const titleBlockH = titleLines.length * titleFont * 1.2;
  const questionsH = questionBlocks.reduce(
    (sum, block) => sum + block.lines.length * bodyFont * 1.25 + bodyFont * 0.55,
    0
  );
  const footerLinesEstimate = Math.max(1, Math.ceil(FAB_NOTES_FOOTER.length / 28));
  const footerH = footerFont * 1.3 * footerLinesEstimate;
  const contentPadTop = frameH * 0.018;
  const contentPadBottom = frameH * 0.022;
  const gapAfterTitle = frameH * 0.028;
  const gapBeforeFooter = frameH * 0.03;

  const cardH =
    headerH +
    contentPadTop +
    titleBlockH +
    (titleLines.length ? gapAfterTitle : 0) +
    questionsH +
    gapBeforeFooter +
    footerH +
    contentPadBottom;

  const cardX = (frameW - cardW) / 2;
  const cardY = frameH * 0.14;
  const radius = Math.max(12, frameW * 0.025);

  ctx.fillStyle = '#000000';
  roundRect(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fill();

  // Header bar
  ctx.fillStyle = '#000000';
  roundRect(ctx, cardX, cardY, cardW, headerH + radius, radius);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.fillRect(cardX, cardY + headerH - 2, cardW, 8);

  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cardX, cardY + headerH);
  ctx.lineTo(cardX + cardW, cardY + headerH);
  ctx.stroke();

  const headerY = cardY + headerH / 2;
  const iconSize = Math.max(14, Math.floor(frameH * 0.016));
  drawNotesHeaderIcons(ctx, cardX, cardW, headerY, padX, iconSize);

  // Title
  let y = cardY + headerH + contentPadTop + titleFont * 0.2;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = `700 ${titleFont}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  for (const line of titleLines) {
    ctx.fillText(line, cardX + cardW / 2, y);
    y += titleFont * 1.2;
  }
  if (titleLines.length) y += gapAfterTitle;

  // Questions
  ctx.textAlign = 'left';
  ctx.font = `400 ${bodyFont}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  for (const block of questionBlocks) {
    let lineY = y;
    block.lines.forEach((line, lineIdx) => {
      if (lineIdx === 0) {
        ctx.fillText(block.label, cardX + padX, lineY);
        ctx.fillText(line, cardX + padX + block.labelW, lineY);
      } else {
        ctx.fillText(line, cardX + padX + block.labelW, lineY);
      }
      lineY += bodyFont * 1.25;
    });
    y = lineY + bodyFont * 0.55;
  }

  y += gapBeforeFooter;
  ctx.textAlign = 'center';
  ctx.font = `400 ${footerFont}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const footerLines = wrapText(ctx, FAB_NOTES_FOOTER, cardW - padX * 2);
  for (const line of footerLines) {
    ctx.fillText(line, cardX + cardW / 2, y);
    y += footerFont * 1.3;
  }

  ctx.restore();
}

/**
 * Re-encodes a Pexels (or other) video with a static Notes card stamped on every frame.
 * Prefetches the source to a blob so recording isn't fighting a streaming proxy, caches
 * the Notes overlay once, and draws on video frame callbacks when available.
 */
export async function exportFabNotesVideo(
  videoSrc: string,
  title: string,
  questions: string[],
  maxDurationSec = FAB_NOTES_MAX_DURATION_SEC
): Promise<Blob> {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser');
  }
  const mime = pickMediaRecorderMime();
  if (!mime) throw new Error('No supported video recording format in this browser');

  // Prefetch fully before recording — export URLs often go through /api/pexels/video-proxy,
  // and streaming mid-encode is the main stutter source.
  const response = await fetch(videoSrc);
  if (!response.ok) {
    throw new Error(`Failed to download video (${response.status})`);
  }
  const sourceBlob = await response.blob();
  const objectUrl = URL.createObjectURL(sourceBlob);

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.preload = 'auto';
  video.muted = true;
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
      // Fallback if canplaythrough never fires on some browsers with blob URLs.
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

    const { w, h } = exportCanvasSize(srcW, srcH);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not available');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Notes card is static — paint once and blit each frame.
    const overlay = document.createElement('canvas');
    overlay.width = w;
    overlay.height = h;
    const overlayCtx = overlay.getContext('2d');
    if (!overlayCtx) throw new Error('Overlay canvas not available');
    drawFabNotesCardOnCanvas(overlayCtx, w, h, title, questions);

    const chunks: BlobPart[] = [];

    await new Promise<void>((resolve, reject) => {
      let rafId = 0;
      let vfcHandle = 0;
      let recorder: MediaRecorder | null = null;
      let finished = false;
      const useVideoFrameCallback =
        typeof video.requestVideoFrameCallback === 'function';

      const stopDrawing = () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
        if (
          vfcHandle &&
          typeof video.cancelVideoFrameCallback === 'function'
        ) {
          video.cancelVideoFrameCallback(vfcHandle);
        }
        vfcHandle = 0;
      };

      const paintFrame = () => {
        // Keep the previous video frame if decode briefly stalls — never wipe to black.
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
          ctx.drawImage(video, 0, 0, w, h);
        }
        ctx.drawImage(overlay, 0, 0);
      };

      const waitForDecodedFrame = () =>
        new Promise<void>((res) => {
          if (useVideoFrameCallback) {
            vfcHandle = video.requestVideoFrameCallback(() => {
              vfcHandle = 0;
              res();
            });
            return;
          }
          // Double-rAF is a common fallback when the video is already playing.
          rafId = requestAnimationFrame(() => {
            rafId = requestAnimationFrame(() => {
              rafId = 0;
              res();
            });
          });
        });

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

      const reachedMaxDuration = () => video.currentTime >= maxDurationSec - 0.05;

      const scheduleNext = () => {
        if (finished || video.ended || reachedMaxDuration()) {
          if (reachedMaxDuration() || video.ended) finishRecording();
          return;
        }
        if (useVideoFrameCallback) {
          vfcHandle = video.requestVideoFrameCallback(() => {
            paintFrame();
            scheduleNext();
          });
        } else {
          rafId = requestAnimationFrame(() => {
            paintFrame();
            scheduleNext();
          });
        }
      };

      video.addEventListener('ended', finishRecording, { once: true });

      const run = async () => {
        try {
          video.pause();
          video.muted = true;
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
            // Some browsers skip seeked when already at 0.
            if (video.currentTime === 0) {
              cleanup();
              res();
              return;
            }
            video.currentTime = 0;
          });

          // Play first — drawing a paused/seeked video often yields a black canvas frame.
          await video.play();
          await waitForDecodedFrame();
          paintFrame();

          const outStream = canvas.captureStream(30);
          recorder = new MediaRecorder(outStream, {
            mimeType: mime,
            videoBitsPerSecond: FAB_NOTES_EXPORT_VIDEO_BITRATE,
          });
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

          // Prime the capture stream with a real frame, then start recording.
          paintFrame();
          recorder.start(100);
          paintFrame();
          scheduleNext();
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
