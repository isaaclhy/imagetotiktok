const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function writeWav(filename, numSamples, fn) {
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  for (let i = 0; i < numSamples; i++) {
    const val = Math.max(-1, Math.min(1, fn(i)));
    buffer.writeInt16LE(Math.round(val * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(outDir, filename), buffer);
  console.log('Generated public/' + filename);
}

// Swift whop - quick percussive thump
const whopSamples = Math.floor(SAMPLE_RATE * 0.08);
writeWav('whoosh.wav', whopSamples, (i) => {
  const t = i / SAMPLE_RATE;
  const progress = i / whopSamples;
  const env = Math.exp(-progress * 12) * (1 - progress * 0.5);
  const freq = 120 * Math.exp(-progress * 4);
  return Math.sin(2 * Math.PI * freq * t) * 0.5 * env;
});

// Correct/ding - pleasant success chime (two-note chord)
const dingSamples = Math.floor(SAMPLE_RATE * 0.4);
writeWav('correct.wav', dingSamples, (i) => {
  const t = i / SAMPLE_RATE;
  const envelope = Math.exp(-t * 4);
  const f1 = 880;
  const f2 = 1100;
  return (Math.sin(2 * Math.PI * f1 * t) * 0.4 + Math.sin(2 * Math.PI * f2 * t) * 0.3) * envelope;
});
