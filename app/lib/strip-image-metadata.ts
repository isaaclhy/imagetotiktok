function outputMimeForSource(source: Blob, name: string, forceJpeg: boolean): string {
  if (forceJpeg) return 'image/jpeg';
  const type = sourceMime(source, name);
  if (type === 'image/png' || type === 'image/webp') return type;
  return 'image/jpeg';
}

function sourceMime(source: Blob, name = ''): string {
  const type = (source.type || '').toLowerCase();
  if (type && type !== 'application/octet-stream') return type;
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'heic' || ext === 'heif') return 'image/heic';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return type || 'image/jpeg';
}

function isHeic(source: Blob, name = ''): boolean {
  const type = sourceMime(source, name);
  return type === 'image/heic' || type === 'image/heif' || /\.(heic|heif)$/i.test(name);
}

function loadImageElement(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode this image'));
    };
    image.src = url;
  });
}

async function decodeImage(source: Blob): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  close: () => void;
}> {
  try {
    const bitmap = await createImageBitmap(source);
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx) => ctx.drawImage(bitmap, 0, 0),
      close: () => bitmap.close(),
    };
  } catch {
    const image = await loadImageElement(source);
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (ctx) => ctx.drawImage(image, 0, 0),
      close: () => undefined,
    };
  }
}

async function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((next) => resolve(next), mime, quality);
  });
  if (blob) return blob;
  if (mime !== 'image/jpeg') {
    const jpeg = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((next) => resolve(next), 'image/jpeg', 0.92);
    });
    if (jpeg) return jpeg;
  }
  throw new Error('Failed to encode a clean image');
}

async function encodeStrippedImage(source: Blob, mime: string): Promise<Blob> {
  const decoded = await decodeImage(source);
  try {
    if (!decoded.width || !decoded.height) {
      throw new Error('Could not decode this image');
    }
    const canvas = document.createElement('canvas');
    canvas.width = decoded.width;
    canvas.height = decoded.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to copy image');
    decoded.draw(ctx);
    const quality = mime === 'image/png' ? undefined : 0.92;
    return await canvasToBlob(canvas, mime, quality);
  } finally {
    decoded.close();
  }
}

/** Re-encode pixels onto a new canvas so EXIF / XMP / C2PA chunks are not copied. */
export async function stripImageMetadata(source: Blob, name = ''): Promise<Blob> {
  if (isHeic(source, name)) {
    throw new Error('HEIC photos are not supported here. Export or convert to JPEG first.');
  }
  return encodeStrippedImage(source, 'image/jpeg');
}

/** Same as stripImageMetadata, but keeps PNG / WebP instead of forcing JPEG. */
export async function stripImageMetadataKeepFormat(source: Blob, name = ''): Promise<Blob> {
  if (isHeic(source, name)) {
    throw new Error('HEIC photos are not supported here. Export or convert to JPEG first.');
  }
  return encodeStrippedImage(source, outputMimeForSource(source, name, false));
}
