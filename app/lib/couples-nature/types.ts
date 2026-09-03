export type CouplesNatureExportProgress = (
  phase: 'frames' | 'encode',
  current: number,
  total: number
) => void;

export type CouplesNatureOverlayPainter = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => void;
