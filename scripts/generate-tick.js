const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 0.05; // 50ms tick
const FREQUENCY = 900;
const VOLUME = 0.6;
const numSamples = Math.floor(SAMPLE_RATE * DURATION);

const buffer = Buffer.alloc(44 + numSamples * 2);

// WAV header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);        // chunk size
buffer.writeUInt16LE(1, 20);         // PCM
buffer.writeUInt16LE(1, 22);         // mono
buffer.writeUInt32LE(SAMPLE_RATE, 24);
buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
buffer.writeUInt16LE(2, 32);         // block align
buffer.writeUInt16LE(16, 34);        // bits per sample
buffer.write('data', 36);
buffer.writeUInt32LE(numSamples * 2, 40);

for (let i = 0; i < numSamples; i++) {
  const t = i / SAMPLE_RATE;
  const envelope = 1 - (i / numSamples); // linear fade out
  const sample = Math.sin(2 * Math.PI * FREQUENCY * t) * VOLUME * envelope;
  const val = Math.max(-1, Math.min(1, sample));
  buffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
}

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'tick.wav'), buffer);
console.log('Generated public/tick.wav');
