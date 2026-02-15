'use client';

import { useMemo } from 'react';
import type { CanvasData } from '@/app/lib/types';
import { wrapTextToLines, getComplementaryColor } from '@/app/lib/canvas-utils';
import { ROMANTIC_IMAGE_FILTER } from '@/app/lib/constants';

interface PreviewPanelProps {
  canvases: CanvasData[];
  currentCanvasId: string;
  currentCanvas: CanvasData;
  firstCard: CanvasData;
  onSelectCanvas: (id: string) => void;
  onAddCanvas: () => void;
  onDeleteCanvas: (id: string, e: React.MouseEvent) => void;
  backgroundColor: string;
  imageSize: string;
  textSize: string;
  mode: 'plain' | 'video';
  videoBackgroundUrl: string | null;
  videoThumbnailUrl: string | null;
  card2Texts?: Array<{ text: string; color: string }>;
  mounted: boolean;
}

export function PreviewPanel({
  canvases,
  currentCanvasId,
  currentCanvas,
  firstCard,
  onSelectCanvas,
  onAddCanvas,
  onDeleteCanvas,
  backgroundColor,
  imageSize,
  textSize,
  mode,
  videoBackgroundUrl,
  videoThumbnailUrl,
  mounted,
}: PreviewPanelProps) {
  const previewContent = useMemo(() => {
    const [widthStr, heightStr] = (imageSize || '1080x1920').split('x').map((s) => s.trim());
    const width = parseInt(widthStr) || 1080;
    const height = parseInt(heightStr) || 1920;
    const fontSize = parseInt(currentCanvas.textSize || textSize) || 200;
    const previewFontSize = fontSize * 0.08;
    const aspectRatio = width / height;
    const isFirstCanvas = currentCanvasId === '1';
    const canvasWidthScale = width / 1080;
    const titleFontSize = (fontSize * canvasWidthScale) / 2.5;
    const titleMaxWidth = width * 0.9;
    const titleLines = mounted && isFirstCanvas ? wrapTextToLines(firstCard.text, titleMaxWidth, titleFontSize) : [];
    const isEndingCard = currentCanvasId === 'end';
    const useVideoBg = isFirstCanvas && mode === 'video' && !!videoBackgroundUrl;
    const showPlainBg = !useVideoBg;

    return (
      <div
        className="rounded-lg border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center p-3 relative overflow-hidden"
        style={{
          backgroundColor: showPlainBg ? backgroundColor : undefined,
          aspectRatio: `${width} / ${height}`,
          height: '100%',
          width: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          contain: 'layout style paint',
          willChange: 'contents',
        }}
      >
        {useVideoBg && videoBackgroundUrl && (
          <img src={videoBackgroundUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ pointerEvents: 'none', filter: ROMANTIC_IMAGE_FILTER }} />
        )}
        {(isFirstCanvas || isEndingCard) ? (
          <div
            className={isEndingCard ? 'flex flex-col items-center justify-center' : 'flex flex-col items-center justify-center relative w-full h-full'}
            style={{ width: '100%', height: '100%', ...(useVideoBg ? { position: 'absolute' as const, inset: 0 } : {}) }}
          >
            {isEndingCard && (
              <svg className="flex-shrink-0" style={{ width: `${previewFontSize * 1.5}px`, height: `${previewFontSize * 1.5}px`, color: currentCanvas.textColor, marginBottom: `${previewFontSize * 0.8}px` }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            )}
            {isFirstCanvas ? (
              titleLines.length > 0 ? (
                <div className="flex flex-col items-center gap-0" style={{ maxWidth: '95%' }}>
                  {titleLines.map((line, i) => (
                    <span key={i} className="font-bold text-center px-[0.45em] py-[0.2em] rounded-[0.25em]" style={{ color: '#000000', backgroundColor: '#FFFFFF', fontFamily: 'var(--font-inter), sans-serif', fontSize: `${previewFontSize}px`, lineHeight: 1.4 }}>{line}</span>
                  ))}
                </div>
              ) : (
                <p className="font-bold text-center px-3 py-1.5 rounded-lg" style={{ color: '#000000', backgroundColor: '#FFFFFF', fontFamily: 'Inter, sans-serif', width: '100%', maxWidth: '95%', fontSize: `${previewFontSize}px`, lineHeight: 1.4, minHeight: '1em' }}>{firstCard.text || 'Your title'}</p>
              )
            ) : (
              <p className="font-bold text-center break-words overflow-hidden px-2" style={{ color: currentCanvas.textColor, width: '100%', maxWidth: '95%', wordWrap: 'break-word', overflowWrap: 'break-word', fontSize: `${previewFontSize}px`, lineHeight: 1.4, minHeight: '1em', maxHeight: '100%', contain: 'layout style paint', willChange: 'auto' }}>{currentCanvas.text}</p>
            )}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4" style={{ pointerEvents: 'none', contain: 'layout style paint' }}>
            <div
              className="bg-white rounded-2xl border-4 shadow-lg flex flex-col items-start justify-start overflow-hidden relative"
              style={{ width: '75%', aspectRatio, maxHeight: '65%', pointerEvents: 'auto', contain: 'layout style paint', paddingTop: '35%', paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingBottom: '1rem', borderColor: getComplementaryColor(backgroundColor) }}
            >
              <p className="font-bold text-left break-words px-2 overflow-hidden" style={{ color: currentCanvas.textColor || '#000000', width: '100%', maxWidth: '95%', wordWrap: 'break-word', overflowWrap: 'break-word', fontSize: `${previewFontSize}px`, lineHeight: '1.4', minHeight: '1em', maxHeight: '100%', contain: 'layout style paint', willChange: 'auto' }}>{currentCanvas.text || 'Your text will appear here'}</p>
            </div>
          </div>
        )}
      </div>
    );
  }, [mounted, backgroundColor, imageSize, currentCanvas.textSize, textSize, currentCanvasId, firstCard.textColor, firstCard.text, currentCanvas.textColor, currentCanvas.text, mode, videoBackgroundUrl]);

  return (
    <div className="flex flex-col p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg h-full max-h-screen overflow-hidden">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex-shrink-0">Preview</label>
      <div className="flex-1 flex items-center justify-center min-h-0 mb-3 p-2 w-full overflow-hidden" style={{ position: 'relative', contain: 'layout style paint' }}>
        {previewContent}
      </div>
      <div className="flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {canvases.map((canvas) => {
            const [widthStr, heightStr] = (canvas.imageSize || '1080x1920').split('x').map((s) => s.trim());
            const width = parseInt(widthStr) || 1080;
            const height = parseInt(heightStr) || 1920;
            const aspectRatio = width / height;
            const isFirstCanvas = canvas.id === '1';
            const useThumbBg = isFirstCanvas && mode === 'video' && !!videoThumbnailUrl;
            const canvasWidthScale = width / 1080;
            const baseFs = parseInt(canvas.textSize || '200') || 200;
            const titleFontSize = (baseFs * canvasWidthScale) / 2.5;
            const titleMaxWidth = width * 0.9;
            const thumbTitleLines = mounted && isFirstCanvas ? wrapTextToLines(canvas.text, titleMaxWidth, titleFontSize) : [];

            return (
              <div key={canvas.id} className="contents">
                {(canvas.id === '1' || canvas.id === 'end') && (
                  <div
                    onClick={(e) => { e.stopPropagation(); onSelectCanvas(canvas.id); }}
                    className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${canvas.id === currentCanvasId ? 'border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
                    style={{ backgroundColor: canvas.backgroundColor }}
                  >
                    {useThumbBg && videoThumbnailUrl && (
                      <img src={videoThumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter: ROMANTIC_IMAGE_FILTER }} />
                    )}
                    <div className={`absolute inset-0 flex items-center justify-center p-1 ${canvas.id === 'end' ? 'flex-col gap-1' : 'flex-col gap-1'}`}>
                      {canvas.id === 'end' && (
                        <svg className="flex-shrink-0" style={{ width: '12px', height: '12px', color: canvas.textColor }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <circle cx="18" cy="5" r="3"></circle>
                          <circle cx="6" cy="12" r="3"></circle>
                          <circle cx="18" cy="19" r="3"></circle>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                      )}
                      {canvas.id === '1' ? (
                        thumbTitleLines.length > 0 ? (
                          <div className="flex flex-col items-center gap-0">
                            {thumbTitleLines.map((line, i) => (
                              <span key={i} className="font-bold text-center text-xs leading-tight px-1 py-0.5 rounded" style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#000000', backgroundColor: '#FFFFFF' }}>{line}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-bold text-center text-xs leading-tight px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-inter), sans-serif', color: '#000000', backgroundColor: '#FFFFFF' }}>{canvas.text || '•'}</span>
                        )
                      ) : (
                        <p className="font-bold text-center text-xs leading-tight px-2" style={{ color: canvas.textColor }}>{canvas.text || '•'}</p>
                      )}
                    </div>
                  </div>
                )}
                {canvas.id !== '1' && canvas.id !== 'end' && (
                  <div
                    onClick={(e) => { e.stopPropagation(); onSelectCanvas(canvas.id); }}
                    className={`relative flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${canvas.id === currentCanvasId ? 'border-[#3B82F6] ring-2 ring-[#3B82F6] ring-opacity-50' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'} z-10`}
                    style={{ backgroundColor: canvas.backgroundColor }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
                      <div className="bg-white rounded-lg border-4 shadow-lg flex flex-col items-start justify-start pointer-events-none relative overflow-hidden" style={{ width: '75%', aspectRatio, maxHeight: '65%', paddingTop: '35%', paddingLeft: '0.25rem', paddingRight: '0.25rem', paddingBottom: '0.5rem', borderColor: getComplementaryColor(canvas.backgroundColor || '#000000') }} />
                    </div>
                    {canvases.length > 3 && canvas.id !== '1' && canvas.id !== 'end' && (
                      <button onClick={(e) => onDeleteCanvas(canvas.id, e)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors z-10" title="Delete canvas">×</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={onAddCanvas} className="flex-shrink-0 w-20 aspect-[9/16] rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#3B82F6] dark:hover:border-[#3B82F6] flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-[#3B82F6] transition-colors bg-zinc-50 dark:bg-zinc-800" title="Add new canvas">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
