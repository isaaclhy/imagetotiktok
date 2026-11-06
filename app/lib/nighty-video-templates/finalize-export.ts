export type NightyRecording = {
  blob: Blob;
  extension: 'mp4' | 'webm';
};

export type NightyExportFile = {
  blob: Blob;
  extension: 'mp4' | 'webm';
  /** True when the browser kept the original recording because MP4 encode did not finish. */
  fallback: boolean;
};

/**
 * Chrome records WebM. Convert with the in-browser ffmpeg.wasm helper the other
 * templates use. If that encode throws or times out, keep the WebM so the user
 * still gets a file. This does not call a server or a system ffmpeg binary.
 */
export async function finalizeNightyRecording(
  recorded: NightyRecording,
  transcode: (blob: Blob) => Promise<Blob>,
  timeoutMs = 45_000,
  /** Called when the encode is abandoned so the wasm worker can be terminated. */
  onGiveUp?: () => void
): Promise<NightyExportFile> {
  if (recorded.extension === 'mp4' || recorded.blob.type.includes('mp4')) {
    return { blob: recorded.blob, extension: 'mp4', fallback: false };
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const mp4 = await new Promise<Blob>((resolve, reject) => {
      timer = setTimeout(() => {
        try {
          onGiveUp?.();
        } catch {
          /* stopping the worker should not hide the fallback */
        }
        reject(new Error('MP4 encode timed out'));
      }, timeoutMs);
      transcode(recorded.blob).then(resolve, reject);
    });
    return { blob: mp4, extension: 'mp4', fallback: false };
  } catch (error) {
    console.warn('MP4 encode unavailable. Downloading WebM instead.', error);
    return { blob: recorded.blob, extension: 'webm', fallback: true };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
