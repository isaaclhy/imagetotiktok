import type { CanvasData } from './types';
import { loadImage, wrapText } from './canvas-utils';
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
    ctx.strokeStyle = '#e1c2ff';
    ctx.lineWidth = 16;
    ctx.stroke();
  }

  const canvasText =
    canvasData.id === '1'
      ? canvasData.text || ''
      : canvasData.id === '2'
        ? card2Texts.filter((t) => t.text.trim()).map((t) => t.text).join('\n')
        : canvasData.text || '';

  if (canvasData.id === '1' || canvasData.id === 'end') {
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
    const vPad = canvasData.id === '1' ? fontSize * 0.08 : fontSize * 0.2;
    const gapBetweenLines = 0;
    const boxHeight = lineHeight + 2 * vPad;
    const lineSpacing = boxHeight + gapBetweenLines;
    const totalBlockHeight = lines.length > 0 ? (lines.length - 1) * lineSpacing + boxHeight : 0;
    let startY: number;
    if (canvasData.id === '1') {
      const topPad = height * 0.12;
      const bottomPad = height * 0.12;
      const minStartY = topPad + boxHeight / 2;
      const maxStartY = height - bottomPad - totalBlockHeight + boxHeight / 2;
      const range = Math.max(0, maxStartY - minStartY);
      startY = minStartY + Math.random() * range;
    } else {
      startY = (height - totalHeight) / 2 + lineHeight / 2;
    }
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
    const pad = canvasData.id === '1' ? fontSize * 0.5 : fontSize * 0.45;
    const radius = fontSize * 0.25;
    if (canvasData.id === '1' && lines.length > 0) {
      ctx.fillStyle = '#FFFFFF';
      lines.forEach((line, idx) => {
        const lineW = ctx.measureText(line).width;
        const boxW = lineW + pad * 2;
        const boxH = boxHeight;
        const boxX = (width - boxW) / 2;
        const centerY = startY + idx * lineSpacing;
        const boxY = centerY - boxH / 2;
        ctx.beginPath();
        ctx.moveTo(boxX + radius, boxY);
        ctx.lineTo(boxX + boxW - radius, boxY);
        ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + radius);
        ctx.lineTo(boxX + boxW, boxY + boxH - radius);
        ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - radius, boxY + boxH);
        ctx.lineTo(boxX + radius, boxY + boxH);
        ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - radius);
        ctx.lineTo(boxX, boxY + radius);
        ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
        ctx.closePath();
        ctx.fill();
      });
    }
    const titleColor = canvasData.id === '1' && lines.length > 0 ? '#000000' : canvasData.textColor || '#FFFFFF';
    ctx.fillStyle = titleColor;
    lines.forEach((line, idx) => {
      const y = canvasData.id === '1' ? startY + idx * lineSpacing : startY + idx * lineHeight;
      ctx.fillText(line, width / 2, y);
    });
  } else if (canvasData.id === '2') {
    const baseRemSize = 16;
    const remSize = baseRemSize * (width / 1080);
    const padding = remSize * 4;
    const textStartY = cardY + finalCardHeight * 0.25;
    const canvasWidthScale = width / 1080;
    const baseFontSize = parseInt(canvasData.textSize || '200') || 200;
    const fontSize = (baseFontSize * canvasWidthScale * 0.75) / 3.7;
    ctx.fillStyle = canvasData.textColor || '#876e9f';
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    const instructionsText = 'Instructions';
    const textMetrics = ctx.measureText(instructionsText);
    ctx.textBaseline = 'top';
    const instructionsY = cardY + padding + remSize * 2;
    const instructionsX = cardX + finalCardWidth / 2;
    ctx.fillText(instructionsText, instructionsX, instructionsY);
    ctx.strokeStyle = canvasData.textColor || '#876e9f';
    ctx.lineWidth = 4 * (width / 1080);
    const underlineOffset = remSize * 0.25;
    const underlineY = instructionsY + fontSize + underlineOffset;
    const underlineLeft = Math.max(cardX + padding, instructionsX - textMetrics.width / 2);
    const underlineRight = Math.min(cardX + finalCardWidth - padding, instructionsX + textMetrics.width / 2);
    ctx.beginPath();
    ctx.moveTo(underlineLeft, underlineY);
    ctx.lineTo(underlineRight, underlineY);
    ctx.stroke();
    const instructionTexts = card2Texts.filter((t) => t.text.trim());
    ctx.textAlign = 'left';
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    const circleRadius = fontSize * 0.4;
    const circleX = cardX + padding;
    const textX = circleX + circleRadius + fontSize * 0.5;
    const rightBoundary = cardX + finalCardWidth - padding;
    const maxTextWidth = Math.max(0, rightBoundary - textX);
    const lineHeight = fontSize * 1.4;
    const itemSpacing = fontSize * 1.2;
    let currentY = textStartY;
    const itemPositions: Array<{ y: number; textLines: string[] }> = [];
    instructionTexts.forEach((textItem, idx) => {
      const textLines = wrapText(ctx, textItem.text, maxTextWidth);
      itemPositions.push({ y: currentY, textLines });
      const itemHeight = textLines.length * lineHeight;
      currentY += itemHeight;
      if (idx < instructionTexts.length - 1) currentY += itemSpacing;
    });
    itemPositions.forEach((itemPos, idx) => {
      const y = itemPos.y;
      const textLines = itemPos.textLines;
      const circleY = y + fontSize * 0.5;
      ctx.fillStyle = instructionTexts[idx].color || '#876e9f';
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${fontSize * 0.6}px system-ui, sans-serif`;
      ctx.fillText(String(idx + 1), circleX, circleY);
      ctx.fillStyle = instructionTexts[idx].color || '#876e9f';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      textLines.forEach((line, lineIdx) => {
        ctx.fillText(line, textX, y + lineIdx * lineHeight);
      });
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
    ctx.fillStyle = canvasData.textColor || '#876e9f';
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
