'use client';

import { useEffect, useRef, useState } from 'react';
import {
  NIGHTY_SOURCE_COMMIT,
  NIGHTY_SOURCE_SOUND_OPTIONS,
  nightySourceAudioSrc,
  nightySourceSound,
  type NightySourceSoundId,
} from '@/app/lib/nighty-video-templates/sounds';
import {
  clampFadeOutSec,
  cloneCompositionState,
  getNightyComposition,
  loadCompositionState,
  NIGHTY_APP_STORE_URL,
  resetCompositionState,
  saveCompositionState,
  type NightyBeat,
  type NightyCompositionState,
  type NightySceneId,
} from '@/app/lib/nighty-video-templates/catalog';
import { paintNightyFrame } from '@/app/lib/nighty-video-templates/paint';
import { recordNightyComposition } from '@/app/lib/nighty-video-templates/record';
import { finalizeNightyRecording } from '@/app/lib/nighty-video-templates/finalize-export';
import { compositionSoundIds, frameAt } from '@/app/lib/nighty-video-templates/timeline';
import { preloadFfmpeg, terminateLoadedFfmpeg, transcodeWebmToMp4 } from '@/app/lib/webm-to-mp4';

const SCENES: { id: NightySceneId; label: string }[] = [
  { id: 'night', label: 'Night' },
  { id: 'ocean', label: 'Ocean dark' },
  { id: 'room', label: 'Dim room' },
];

const fieldClass =
  'w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400';

const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500';

function SoundSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: NightySourceSoundId;
  onChange: (id: NightySourceSoundId) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(event.target.value as NightySourceSoundId)}
      >
        {NIGHTY_SOURCE_SOUND_OPTIONS.map((sound) => (
          <option key={sound.id} value={sound.id}>
            {sound.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-zinc-400">{nightySourceAudioSrc(value)}</p>
    </div>
  );
}

export function NightyCompositionStudio({
  templateId,
  onBack,
}: {
  templateId: number;
  onBack: () => void;
}) {
  const template = getNightyComposition(templateId);
  const [state, setState] = useState<NightyCompositionState>(() => loadCompositionState(template));
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportLabel, setExportLabel] = useState('Download video');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);

  useEffect(() => {
    preloadFfmpeg();
  }, []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<Map<NightySourceSoundId, HTMLAudioElement>>(new Map());
  const timeRef = useRef(0);
  const stateRef = useRef(state);
  const drawRef = useRef<(t: number) => void>(() => {});
  stateRef.current = state;
  timeRef.current = time;

  drawRef.current = (t: number) => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    paintNightyFrame(ctx, width, height, frameAt(template, stateRef.current, t));
  };

  useEffect(() => {
    const needed = new Set(compositionSoundIds(template, state));
    for (const id of needed) {
      let el = audioRef.current.get(id);
      const src = nightySourceAudioSrc(id);
      if (!el) {
        el = new Audio(src);
        el.preload = 'auto';
        el.loop = true;
        audioRef.current.set(id, el);
      } else if (!el.src.endsWith(src)) {
        el.src = src;
      }
    }
  }, [template, state]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      for (const el of audio.values()) el.pause();
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const draw = () => drawRef.current(timeRef.current);
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(stage);
    const fontsReady = document.fonts?.ready.then(() => draw());
    return () => {
      observer.disconnect();
      void fontsReady;
    };
  }, []);

  useEffect(() => {
    drawRef.current(timeRef.current);
  }, [template, state]);

  useEffect(() => {
    if (!playing) {
      for (const el of audioRef.current.values()) el.pause();
      return;
    }

    let raf = 0;
    let origin = performance.now() - timeRef.current * 1000;
    let lastUi = 0;
    const sync = (t: number, resetClock: boolean) => {
      const frame = frameAt(template, stateRef.current, t);
      for (const [id, el] of audioRef.current) {
        const gain = frame.gains.find((item) => item.soundId === id)?.gain ?? 0;
        el.volume = gain;
        if (gain > 0.001) {
          if (resetClock || Math.abs(el.currentTime - t) > 0.45) {
            try {
              el.currentTime = t;
            } catch {
              /* element may still be loading */
            }
          }
          if (el.paused) void el.play().catch(() => {});
        }
      }
    };
    sync(timeRef.current, true);

    const tick = (now: number) => {
      let t = (now - origin) / 1000;
      let resetClock = false;
      if (t >= template.durationSec) {
        t = 0;
        origin = now;
        resetClock = true;
      }
      timeRef.current = t;
      drawRef.current(t);
      if (now - lastUi > 200) {
        lastUi = now;
        setTime(t);
      }
      sync(t, resetClock);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, template]);

  const update = (patch: Partial<NightyCompositionState>) => {
    const next = { ...stateRef.current, ...patch };
    if (patch.fadeOutSec !== undefined) {
      next.fadeOutSec = clampFadeOutSec(patch.fadeOutSec, template.durationSec);
    }
    if (patch.beats) next.beats = patch.beats.map((beat) => ({ ...beat }));
    stateRef.current = next;
    setState(next);
    saveCompositionState(template.id, next);
  };

  const updateBeat = (index: number, patch: Partial<NightyBeat>) => {
    const beats = state.beats.map((beat, beatIndex) =>
      beatIndex === index ? { ...beat, ...patch } : beat
    );
    update({ beats });
  };

  const download = async () => {
    setPlaying(false);
    setExporting(true);
    setExportLabel('Recording…');
    setExportError(null);
    setExportNote(null);
    try {
      const recorded = await recordNightyComposition(template, stateRef.current, (seconds) => {
        setExportLabel(`Recording ${Math.ceil(seconds)}s`);
      });
      setExportLabel('Encoding MP4…');
      const file = await finalizeNightyRecording(
        recorded,
        (blob) => transcodeWebmToMp4(blob, null, { preset: 'veryfast' }),
        45_000,
        terminateLoadedFfmpeg
      );
      const filename = `nighty-${template.slug}.${file.extension}`;
      setExportNote(
        file.fallback
          ? `Downloaded ${filename}. MP4 encode isn’t available in this browser, so this file is WebM.`
          : `Downloaded ${filename}.`
      );
      const url = URL.createObjectURL(file.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setExporting(false);
      setExportLabel('Download video');
    }
  };

  return (
    <div
      data-testid="nighty-composition-studio"
      className="w-full min-w-0 max-w-full rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back
        </button>
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{template.title}</p>
        <button
          type="button"
          data-testid="nighty-composition-export"
          onClick={() => void download()}
          disabled={exporting}
          className="ml-auto rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {exporting ? exportLabel : 'Download video'}
        </button>
      </div>

      <div className="flex flex-col gap-4 p-3 md:flex-row md:items-start">
        <div className="mx-auto w-full max-w-sm min-w-0">
          <div
            ref={stageRef}
            className="relative aspect-9/16 overflow-hidden rounded-xl border border-zinc-200 bg-black dark:border-zinc-700"
          >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
            <button
              type="button"
              data-testid="nighty-composition-play"
              aria-pressed={playing}
              onClick={() => setPlaying((value) => !value)}
              className="absolute bottom-3 left-3 z-10 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-900"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
          <label className="mt-3 block text-[11px] text-zinc-500" htmlFor={`nighty-scrub-${template.id}`}>
            Preview {time.toFixed(1)}s / {template.durationSec}s
            <input
              id={`nighty-scrub-${template.id}`}
              className="mt-1 w-full"
              type="range"
              min={0}
              max={template.durationSec}
              step={0.05}
              value={time}
              onChange={(event) => {
                const next = Number(event.target.value);
                setPlaying(false);
                timeRef.current = next;
                setTime(next);
                drawRef.current(next);
              }}
            />
          </label>
          {exportError ? (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
              {exportError}
            </p>
          ) : null}
          {exportNote ? (
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300" data-testid="nighty-export-result">
              {exportNote}
            </p>
          ) : null}
        </div>

        <div className="w-full space-y-3 md:max-h-[calc(100vh-8rem)] md:w-96 md:overflow-y-auto md:pr-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{template.provenance.summary}</p>

          <div>
            <label className={labelClass} htmlFor={`nighty-headline-${template.id}`}>
              Headline
            </label>
            <textarea
              id={`nighty-headline-${template.id}`}
              data-testid="nighty-composition-headline"
              className={`${fieldClass} min-h-16 resize-y`}
              value={state.headline}
              onChange={(event) => update({ headline: event.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`nighty-subline-${template.id}`}>
              {template.layout === 'sequence' ? 'Second line' : 'Subline'}
            </label>
            <input
              id={`nighty-subline-${template.id}`}
              className={fieldClass}
              value={state.subline}
              onChange={(event) => update({ subline: event.target.value })}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor={`nighty-scene-${template.id}`}>
              Scene
            </label>
            <select
              id={`nighty-scene-${template.id}`}
              className={fieldClass}
              value={state.scene}
              onChange={(event) => update({ scene: event.target.value as NightySceneId })}
            >
              {SCENES.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  {scene.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor={`nighty-fade-${template.id}`}>
              Fade out (seconds)
            </label>
            <input
              id={`nighty-fade-${template.id}`}
              className={fieldClass}
              type="number"
              min={0}
              max={4}
              step={0.1}
              value={state.fadeOutSec}
              onChange={(event) => update({ fadeOutSec: Number(event.target.value) })}
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Fades the audio at the end of this video. Nighty’s app has a sleep timer with a gentle
              fade; this number only changes the video.
            </p>
          </div>
          <div>
            <label className={labelClass} htmlFor={`nighty-cta-${template.id}`}>
              End line
            </label>
            <input
              id={`nighty-cta-${template.id}`}
              className={fieldClass}
              value={state.endCta}
              onChange={(event) => update({ endCta: event.target.value })}
            />
            <p className="mt-1 text-[11px] text-zinc-400">
              Small line under Nighty in the last two seconds. Clear it to leave the end plain.{' '}
              <a href={NIGHTY_APP_STORE_URL} target="_blank" rel="noreferrer" className="underline">
                App Store listing
              </a>
            </p>
          </div>

          {template.layout === 'compare' ? (
            <>
              <div>
                <label className={labelClass} htmlFor={`nighty-label-a-${template.id}`}>
                  First label
                </label>
                <input
                  id={`nighty-label-a-${template.id}`}
                  className={fieldClass}
                  value={state.labelA}
                  onChange={(event) => update({ labelA: event.target.value })}
                />
              </div>
              <SoundSelect
                id={`nighty-sound-a-${template.id}`}
                label="First sound"
                value={state.soundA}
                onChange={(soundA) => update({ soundA })}
              />
              <div>
                <label className={labelClass} htmlFor={`nighty-label-b-${template.id}`}>
                  Second label
                </label>
                <input
                  id={`nighty-label-b-${template.id}`}
                  className={fieldClass}
                  value={state.labelB}
                  onChange={(event) => update({ labelB: event.target.value })}
                />
              </div>
              <SoundSelect
                id={`nighty-sound-b-${template.id}`}
                label="Second sound"
                value={state.soundB}
                onChange={(soundB) => update({ soundB })}
              />
            </>
          ) : null}

          {template.layout === 'card' ? (
            <div>
              <label className={labelClass} htmlFor={`nighty-card-${template.id}`}>
                Card label
              </label>
              <input
                id={`nighty-card-${template.id}`}
                className={fieldClass}
                value={state.labelA}
                onChange={(event) => update({ labelA: event.target.value })}
              />
            </div>
          ) : null}

          {template.layout !== 'compare' && template.layout !== 'tour' ? (
            <SoundSelect
              id={`nighty-sound-${template.id}`}
              label="Sound"
              value={state.soundA}
              onChange={(soundA) => update({ soundA })}
            />
          ) : null}

          {template.layout === 'tour'
            ? state.beats.map((beat, index) => (
                <div key={`${template.id}-beat-${index}`} className="space-y-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
                  <label className={labelClass} htmlFor={`nighty-beat-label-${template.id}-${index}`}>
                    Beat {index + 1}
                  </label>
                  <input
                    id={`nighty-beat-label-${template.id}-${index}`}
                    className={fieldClass}
                    value={beat.label}
                    onChange={(event) => updateBeat(index, { label: event.target.value })}
                  />
                  <SoundSelect
                    id={`nighty-beat-sound-${template.id}-${index}`}
                    label="Sound"
                    value={beat.soundId}
                    onChange={(soundId) => updateBeat(index, { soundId })}
                  />
                </div>
              ))
            : null}

          <button
            type="button"
            onClick={() => {
              resetCompositionState(template.id);
              const next = cloneCompositionState(template.defaults);
              stateRef.current = next;
              setState(next);
              setTime(0);
              setPlaying(false);
            }}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Reset text and sound
          </button>
          <p className="text-[11px] text-zinc-400">
            The template stays in the Nighty library. Your text, sound, scene, and end line are
            saved in this browser only. They are not synced to an account or the video library.
          </p>

          <div className="rounded-lg border border-zinc-200 p-2 text-[11px] leading-relaxed text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <p className="font-medium text-zinc-600 dark:text-zinc-300">References</p>
            <p className="mt-1">
              Original Nighty composition. Source videos were not downloaded, so this is not a frame
              copy. Names below are research notes, not on-video branding.
            </p>
            <ul className="mt-2 space-y-2">
              {template.provenance.references.map((reference) => (
                <li key={reference.id}>
                  <span className="font-medium text-zinc-600 dark:text-zinc-300">
                    {reference.evidence}
                  </span>{' '}
                  · {reference.when}
                  <br />
                  <a
                    href={reference.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline"
                  >
                    {reference.sourceUrl}
                  </a>
                  <br />
                  {reference.note}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Composition audio is the Nighty track set in /nighty-source (commit {NIGHTY_SOURCE_COMMIT.slice(0, 7)}
              ). Current: {nightySourceSound(state.soundA).label}
              {template.layout === 'compare' ? ` and ${nightySourceSound(state.soundB).label}` : ''}. Those
              files have an encoder tag only. No license was found, so this is not a royalty-free claim.
              Particle and Rain still use the separate public/nighty-rain beds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
