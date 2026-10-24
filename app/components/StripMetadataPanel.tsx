'use client';

import { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import { stripImageMetadataKeepFormat } from '@/app/lib/strip-image-metadata';
import { preloadFfmpeg, stripVideoMetadata } from '@/app/lib/webm-to-mp4';

type ReadyFile = { url: string; name: string };

function downloadBlob(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return url;
}

function cleanImageName(name: string, mime: string): string {
  const stem = name.replace(/\.[^.]+$/, '') || 'image';
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  return `${stem}-clean.${ext}`;
}

export function StripMetadataPanel() {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageReadyRef = useRef<ReadyFile | null>(null);
  const videoReadyRef = useRef<ReadyFile | null>(null);
  const [imageStatus, setImageStatus] = useState('');
  const [videoStatus, setVideoStatus] = useState('');
  const [imageBusy, setImageBusy] = useState(false);
  const [videoBusy, setVideoBusy] = useState(false);
  const [imageReady, setImageReady] = useState<ReadyFile | null>(null);
  const [videoReady, setVideoReady] = useState<ReadyFile | null>(null);

  useEffect(() => {
    preloadFfmpeg();
    return () => {
      if (imageReadyRef.current) URL.revokeObjectURL(imageReadyRef.current.url);
      if (videoReadyRef.current) URL.revokeObjectURL(videoReadyRef.current.url);
    };
  }, []);

  const replaceReady = (
    kind: 'image' | 'video',
    next: ReadyFile | null
  ) => {
    const ref = kind === 'image' ? imageReadyRef : videoReadyRef;
    const setReady = kind === 'image' ? setImageReady : setVideoReady;
    if (ref.current && ref.current.url !== next?.url) {
      URL.revokeObjectURL(ref.current.url);
    }
    ref.current = next;
    setReady(next);
  };

  const handleImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setImageBusy(true);
    setImageStatus(`Stripping ${files.length === 1 ? 'image' : `${files.length} images`}…`);
    replaceReady('image', null);
    try {
      const entries: { name: string; blob: Blob }[] = [];
      for (const file of Array.from(files)) {
        const blob = await stripImageMetadataKeepFormat(file, file.name);
        entries.push({ name: cleanImageName(file.name, blob.type), blob });
      }
      const result =
        entries.length === 1
          ? entries[0]!
          : {
              name: 'images-clean.zip',
              blob: await (async () => {
                const zip = new JSZip();
                for (const entry of entries) zip.file(entry.name, entry.blob);
                return zip.generateAsync({ type: 'blob' });
              })(),
            };
      const url = downloadBlob(result.blob, result.name);
      replaceReady('image', { url, name: result.name });
      setImageStatus(
        `Done — ${entries.length === 1 ? result.name : `${entries.length} images`}. If nothing saved, use Download.`
      );
    } catch (error) {
      setImageStatus(error instanceof Error ? error.message : 'Failed to strip image metadata');
    } finally {
      setImageBusy(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleVideo = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setVideoBusy(true);
    setVideoStatus('Loading ffmpeg and stripping metadata…');
    replaceReady('video', null);
    try {
      const { blob, filename } = await stripVideoMetadata(file, file.name);
      const url = downloadBlob(blob, filename);
      replaceReady('video', { url, name: filename });
      setVideoStatus(`Done — ${filename}. If nothing saved, use Download.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to strip video metadata';
      setVideoStatus(
        /sharedarraybuffer|sab|cross-origin|worker|fetch|network|load/i.test(message)
          ? 'Could not start ffmpeg in this browser. Try Chrome, or check your network, then upload again.'
          : message
      );
    } finally {
      setVideoBusy(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  return (
    <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Strip metadata</h2>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          Upload images or a video. You get the same file back with EXIF / XMP / C2PA tags removed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Images</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            JPEG, PNG, or WebP. One file downloads directly; several come back as a zip.
          </p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleImages(event.target.files)}
          />
          <button
            type="button"
            disabled={imageBusy}
            onClick={() => imageInputRef.current?.click()}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {imageBusy ? 'Stripping…' : 'Upload images'}
          </button>
          {imageReady ? (
            <a
              href={imageReady.url}
              download={imageReady.name}
              className="mt-2 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-center text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            >
              Download {imageReady.name}
            </a>
          ) : null}
          {imageStatus ? (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{imageStatus}</p>
          ) : null}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Video</h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            MP4, MOV, or WebM. First load may take a moment while ffmpeg starts.
          </p>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm,video/*"
            className="hidden"
            onChange={(event) => void handleVideo(event.target.files)}
          />
          <button
            type="button"
            disabled={videoBusy}
            onClick={() => videoInputRef.current?.click()}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {videoBusy ? 'Stripping…' : 'Upload video'}
          </button>
          {videoReady ? (
            <a
              href={videoReady.url}
              download={videoReady.name}
              className="mt-2 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-center text-sm font-medium text-zinc-900 dark:border-zinc-700 dark:text-zinc-100"
            >
              Download {videoReady.name}
            </a>
          ) : null}
          {videoStatus ? (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{videoStatus}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
