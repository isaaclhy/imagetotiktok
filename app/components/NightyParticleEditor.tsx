'use client';

import {
  NIGHTY_PARTICLE_DEFAULT_LINES,
  NIGHTY_PARTICLE_TIMING,
  NIGHTY_PARTICLE_WAVE_OPTIONS,
  pickNightyParticleAccentColor,
  nightyParticleWaveOption,
  type NightyParticleLines,
  type NightyParticleTiming,
  type NightyParticleWaveId,
} from '@/app/lib/constants';

type NightyParticleEditorProps = {
  lines: NightyParticleLines;
  timing: NightyParticleTiming;
  accentColor: string;
  waveId: NightyParticleWaveId;
  onLinesChange: (lines: NightyParticleLines) => void;
  onTimingChange: (timing: NightyParticleTiming) => void;
  onAccentColorChange: (color: string) => void;
  onWaveChange: (waveId: NightyParticleWaveId) => void;
};

const inputClass =
  'w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400';

const numInputClass =
  'w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-400';

function parseSec(raw: string, fallback: number): number {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.round(n * 100) / 100;
}

export function NightyParticleEditor({
  lines,
  timing,
  accentColor,
  waveId,
  onLinesChange,
  onTimingChange,
  onAccentColorChange,
  onWaveChange,
}: NightyParticleEditorProps) {
  const setLine = (key: keyof NightyParticleLines, value: string) => {
    onLinesChange({ ...lines, [key]: value });
  };

  const setTiming = (key: keyof NightyParticleTiming, raw: string) => {
    onTimingChange({
      ...timing,
      [key]: parseSec(raw, timing[key]),
    });
  };

  const applyWave = (nextId: NightyParticleWaveId) => {
    const next = nightyParticleWaveOption(nextId);
    const prevDefaults = new Set(NIGHTY_PARTICLE_WAVE_OPTIONS.map((w) => w.line2));
    onWaveChange(nextId);
    // Keep custom line2 edits; only swap when still on a known default.
    if (prevDefaults.has(lines.line2) || !lines.line2.trim()) {
      onLinesChange({ ...lines, line2: next.line2 });
    }
  };

  return (
    <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Caption sequence
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              onAccentColorChange(pickNightyParticleAccentColor(accentColor))
            }
            className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5"
            title="Shuffle accent pink"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: accentColor }}
              aria-hidden
            />
            Color
          </button>
          <button
            type="button"
            onClick={() => {
              onLinesChange({
                ...NIGHTY_PARTICLE_DEFAULT_LINES,
                line2: nightyParticleWaveOption(waveId).line2,
              });
              onTimingChange({ ...NIGHTY_PARTICLE_TIMING });
              onAccentColorChange(pickNightyParticleAccentColor());
            }}
            className="text-xs px-2 py-1 rounded-md border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Wave
        </label>
        <select
          className={inputClass}
          value={waveId}
          onChange={(e) => applyWave(e.target.value as NightyParticleWaveId)}
        >
          {NIGHTY_PARTICLE_WAVE_OPTIONS.map((w) => (
            <option key={w.id} value={w.id}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Beat 1
        </p>
        <div>
          <label className="mb-1 block text-[11px] text-zinc-500">White</label>
          <input
            className={inputClass}
            value={lines.line1}
            onChange={(e) => setLine('line1', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px]" style={{ color: accentColor }}>
            Pink
          </label>
          <input
            className={inputClass}
            value={lines.line2}
            onChange={(e) => setLine('line2', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Beat 2
        </p>
        <div>
          <label className="mb-1 block text-[11px] text-zinc-500">White</label>
          <textarea
            className={`${inputClass} resize-y min-h-[3.5rem]`}
            rows={2}
            value={lines.line3}
            onChange={(e) => setLine('line3', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px]" style={{ color: accentColor }}>
            Pink
          </label>
          <textarea
            className={`${inputClass} resize-y min-h-[3.5rem]`}
            rows={2}
            value={lines.line4}
            onChange={(e) => setLine('line4', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Beat 3
        </p>
        <div>
          <label className="mb-1 block text-[11px] text-zinc-500">White</label>
          <input
            className={inputClass}
            value={lines.line5}
            onChange={(e) => setLine('line5', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px]" style={{ color: accentColor }}>
            Pink
          </label>
          <input
            className={inputClass}
            value={lines.line6}
            onChange={(e) => setLine('line6', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Final CTA
        </p>
        <div>
          <label className="mb-1 block text-[11px] text-zinc-500">Line 1 (white)</label>
          <input
            className={inputClass}
            value={lines.line7}
            onChange={(e) => setLine('line7', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px]" style={{ color: accentColor }}>
            Line 2 (pink)
          </label>
          <input
            className={inputClass}
            value={lines.line8}
            onChange={(e) => setLine('line8', e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-zinc-500">Line 3 (white)</label>
          <input
            className={inputClass}
            value={lines.line9}
            onChange={(e) => setLine('line9', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-700 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Timing (seconds)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">
              Gap white → pink
            </label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.gapAfterWhiteSec}
              onChange={(e) => setTiming('gapAfterWhiteSec', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">
              Between beats
            </label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.betweenPhasesSec}
              onChange={(e) => setTiming('betweenPhasesSec', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Beat 1 hold</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.phase1HoldSec}
              onChange={(e) => setTiming('phase1HoldSec', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Beat 2 hold</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.phase2HoldSec}
              onChange={(e) => setTiming('phase2HoldSec', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Beat 3 hold</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.phase3HoldSec}
              onChange={(e) => setTiming('phase3HoldSec', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">CTA hold</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.phase4HoldSec}
              onChange={(e) => setTiming('phase4HoldSec', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Fade in</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.fadeInSec}
              onChange={(e) => setTiming('fadeInSec', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-zinc-500">Fade out</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className={numInputClass}
              value={timing.fadeOutSec}
              onChange={(e) => setTiming('fadeOutSec', e.target.value)}
            />
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Hold = how long both lines stay after the pink line appears. Gap = wait after white
          before pink. Between beats = empty pause after a beat fades out.
        </p>
      </div>
    </div>
  );
}
