'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const CUP_SRC = '/logo-generator/cup-base.jpg';
const PREVIEW_SIZE = 360;
const EXPORT_SIZE = 1024;
const DEFAULT_FILL = '#7B2BFF';
const DEFAULT_BORDER = '#FFFFFF';

function extractCupOverlay(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = pixels;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const white =
      brightness > 210 && Math.abs(r - g) < 28 && Math.abs(g - b) < 28 && Math.abs(r - b) < 28;
    if (white) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    } else {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}

function paintLogo(
  ctx: CanvasRenderingContext2D,
  size: number,
  fill: string,
  border: string,
  cup: HTMLCanvasElement | null
) {
  ctx.clearRect(0, 0, size, size);
  const center = size / 2;
  const inset = size * 0.02;
  const borderWidth = size * 0.028;
  const radius = center - inset - borderWidth / 2;

  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = border;
  ctx.stroke();

  if (!cup) return;

  const cupSize = radius * 2 * 0.86;
  const x = center - cupSize / 2;
  const y = center - cupSize / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius - borderWidth * 0.15, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(cup, x, y, cupSize, cupSize);
  ctx.restore();
}

export function LogoGeneratorPanel() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const cupRef = useRef<HTMLCanvasElement | null>(null);
  const [fillColor, setFillColor] = useState(DEFAULT_FILL);
  const [borderColor, setBorderColor] = useState(DEFAULT_BORDER);
  const [ready, setReady] = useState(false);

  const redraw = useCallback(() => {
    const canvas = previewRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    paintLogo(ctx, PREVIEW_SIZE, fillColor, borderColor, cupRef.current);
  }, [fillColor, borderColor]);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      cupRef.current = extractCupOverlay(image);
      setReady(true);
    };
    image.src = CUP_SRC;
  }, []);

  useEffect(() => {
    if (!ready) return;
    redraw();
  }, [ready, redraw]);

  const handleDownload = () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = EXPORT_SIZE;
    exportCanvas.height = EXPORT_SIZE;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;
    paintLogo(ctx, EXPORT_SIZE, fillColor, borderColor, cupRef.current);
    const link = document.createElement('a');
    link.download = 'spill-it-logo.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Logo generator</h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Color the circle behind the glass, pick a border, and download a PNG.
        </p>
      </div>

      <div className="flex flex-col items-start gap-8 sm:flex-row">
        <div className="flex w-full max-w-[22rem] flex-col items-center gap-3">
          <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900">
            <canvas
              ref={previewRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              className="h-auto max-h-[22rem] w-full max-w-[22rem]"
            />
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Color
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
                aria-label="Circle color"
              />
              <input
                type="text"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
              />
            </div>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Border color
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
                aria-label="Border color"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-500"
              />
            </div>
          </label>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!ready}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Download image
          </button>
        </div>
      </div>
    </div>
  );
}
