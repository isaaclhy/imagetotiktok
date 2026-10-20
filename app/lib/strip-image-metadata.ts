/** Re-encode pixels onto a new canvas so EXIF / XMP / C2PA chunks are not copied. */
export async function stripImageMetadata(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Failed to copy image');
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => {
        if (next) resolve(next);
        else reject(new Error('Failed to encode a clean image'));
      },
      'image/jpeg',
      0.92
    );
  });
  return blob;
}
