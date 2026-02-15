import type { CanvasData } from './types';
import { loadImage, wrapText, getComplementaryColor } from './canvas-utils';
import { ROMANTIC_IMAGE_FILTER, TITLE_FONT } from './constants';

interface GenerateCardImageParams {
  canvasData: CanvasData;
  mode: 'plain' | 'video';
  videoThumbnailUrl: string | null;
  card2Texts: Array<{ text: string; color: string }>;
}

export async function generateCardImage({
  canvasData,
  mode,
  videoThumbnailUrl,
  card2Texts,
}: GenerateCardImageParams): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  if (typeof document !== 'undefined' && document.fonts?.ready) await document.fonts.ready;

  const [widthStr, heightStr] = (canvasData.imageSize || '1080x1920').split('x').map((s) => s.trim());
  const width = parseInt(widthStr) || 1080;
  const height = parseInt(heightStr) || 1920;
  canvas.width = width;
  canvas.height = height;

  if (canvasData.id === '1' && mode === 'video' && videoThumbnailUrl) {
    const img = await loadImage(videoThumbnailUrl);
    ctx.filter = ROMANTIC_IMAGE_FILTER;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.max(width / iw, height / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const dx = (width - sw) / 2;
    const dy = (height - sh) / 2;
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, sw, sh);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = canvasData.backgroundColor || '#000000';
    ctx.fillRect(0, 0, width, height);
  }

  const aspectRatio = width / height;
  let finalCardWidth = width * 0.75;
  let finalCardHeight = finalCardWidth / aspectRatio;
  const cardMaxHeight = height * 0.6;
  if (finalCardHeight > cardMaxHeight) {
    finalCardHeight = cardMaxHeight;
    finalCardWidth = finalCardHeight * aspectRatio;
  }
  const cardX = (width - finalCardWidth) / 2;
  const cardY = (height - finalCardHeight) / 2 - height * 0.03;

  if (canvasData.id !== '1' && canvasData.id !== 'end') {
    const radius = 64;
    const borderColor = getComplementaryColor(canvasData.backgroundColor || '#000000');
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + finalCardWidth - radius, cardY);
    ctx.quadraticCurveTo(cardX + finalCardWidth, cardY, cardX + finalCardWidth, cardY + radius);
    ctx.lineTo(cardX + finalCardWidth, cardY + finalCardHeight - radius);
    ctx.quadraticCurveTo(cardX + finalCardWidth, cardY + finalCardHeight, cardX + finalCardWidth - radius, cardY + finalCardHeight);
    ctx.lineTo(cardX + radius, cardY + finalCardHeight);
    ctx.quadraticCurveTo(cardX, cardY + finalCardHeight, cardX, cardY + finalCardHeight - radius);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 16;
    ctx.stroke();
  }

  const canvasText = canvasData.id === '1' ? '' : canvasData.text || '';

  // Skip title overlay on first card when it has a background image (AI cover or Pexels);
  // the image typically already has text or we avoid the extra overlay.
  const isFirstWithImageBg = canvasData.id === '1' && mode === 'video' && !!videoThumbnailUrl;
  if (canvasData.id === 'end' && !isFirstWithImageBg) {
    ctx.fillStyle = canvasData.textColor || '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxTextWidth = canvasData.id === 'end' ? width * 0.85 : canvasData.id === '1' ? width * 0.7 : width * 0.9;
    const canvasWidthScale = width / 1080;
    const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
    const fontSizeDivisor = canvasData.id === 'end' ? 2.8 : canvasData.id === '1' ? 3.25 : 3;
    let fontSize = (baseFontSize * canvasWidthScale) / fontSizeDivisor;
    ctx.font = `bold ${fontSize}px ${TITLE_FONT}`;
    const textMetrics = ctx.measureText(canvasText);
    if (textMetrics.width > maxTextWidth && canvasData.id !== 'end' && canvasData.id !== '1') {
      const scaleFactor = 0.9;
      fontSize = (maxTextWidth / textMetrics.width) * fontSize * scaleFactor;
      ctx.font = `bold ${fontSize}px ${TITLE_FONT}`;
    }
    const lines = wrapText(ctx, canvasText, maxTextWidth);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lines.length * lineHeight;
    const vPad = fontSize * 0.2;
    const gapBetweenLines = 0;
    const boxHeight = lineHeight + 2 * vPad;
    const lineSpacing = boxHeight + gapBetweenLines;
    let startY: number
    startY = (height - totalHeight) / 2 + lineHeight / 2;
    let iconSize = 0;
    let iconY = 0;
    if (canvasData.id === 'end') {
      iconSize = fontSize * 1.5;
      const spacing = fontSize * 0.5;
      const totalContentHeight = iconSize + spacing + totalHeight;
      const contentStartY = (height - totalContentHeight) / 2 - height * 0.14;
      iconY = contentStartY;
      startY = contentStartY + iconSize + spacing + lineHeight / 2;
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#FFFFFF';
      ctx.lineWidth = fontSize * 0.1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const iconX = width / 2;
      const circleRadius = iconSize * 0.12;
      const iconSpacing = iconSize * 0.4;
      const topCircleX = iconX;
      const topCircleY = iconY + iconSize * 0.2;
      const leftCircleX = iconX - iconSpacing;
      const leftCircleY = iconY + iconSize * 0.8;
      const rightCircleX = iconX + iconSpacing;
      const rightCircleY = iconY + iconSize * 0.8;
      ctx.beginPath();
      ctx.moveTo(topCircleX, topCircleY);
      ctx.lineTo(leftCircleX, leftCircleY);
      ctx.moveTo(topCircleX, topCircleY);
      ctx.lineTo(rightCircleX, rightCircleY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(topCircleX, topCircleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(leftCircleX, leftCircleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightCircleX, rightCircleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
   
    const titleColor = canvasData.textColor || '#FFFFFF';
    ctx.fillStyle = titleColor;
    lines.forEach((line, idx) => {
      const y = canvasData.id === '1' ? startY + idx * lineSpacing : startY + idx * lineHeight;
      ctx.fillText(line, width / 2, y);
    });
  } else {
    const baseRemSize = 16;
    const remSize = baseRemSize * (width / 1080);
    const padding = remSize * 4;
    const textStartY = cardY + finalCardHeight * 0.35;
    const textX = cardX + padding;
    const maxTextWidth = cardX + finalCardWidth - padding - textX;
    const canvasWidthScale = width / 1080;
    const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
    const fontSize = (baseFontSize * canvasWidthScale * 0.75) / 3.0;
    ctx.fillStyle = canvasData.textColor || '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    const lines = wrapText(ctx, canvasText, maxTextWidth);
    lines.forEach((line, idx) => {
      ctx.fillText(line, textX, textStartY + idx * fontSize * 1.4);
    });
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create blob'));
    }, 'image/png');
  });
}
