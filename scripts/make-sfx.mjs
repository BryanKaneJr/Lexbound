// Synthesises Lexbound's placeholder sound effects as small 16-bit mono WAVs
// in app/assets/sfx/. Everything is generated from code with a fixed seed, so
// the files are reproducible: `npm run sfx -- --check` fails if they're stale.
// Replace any file with a real recording of the same name whenever one exists.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22050;
const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'assets', 'sfx');
const check = process.argv.includes('--check');

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const buf = (seconds) => new Float32Array(Math.round(seconds * RATE));
const env = (t, attack, release, length) => Math.min(1, t / attack) * Math.max(0, Math.min(1, (length - t) / release));

/** A tone with an envelope and optional pitch glide. */
function tone(b, { start = 0, dur, freq, to = freq, vol = 0.5, attack = 0.005, release = 0.08, shape = 'sine' }) {
  let phase = 0;
  const n0 = Math.round(start * RATE);
  const n = Math.round(dur * RATE);
  for (let i = 0; i < n && n0 + i < b.length; i++) {
    const t = i / RATE;
    const f = freq + (to - freq) * (i / n);
    phase += (2 * Math.PI * f) / RATE;
    let s = Math.sin(phase);
    if (shape === 'tri') s = (2 / Math.PI) * Math.asin(Math.sin(phase));
    if (shape === 'soft') s = Math.sin(phase) + 0.3 * Math.sin(2 * phase) + 0.1 * Math.sin(3 * phase);
    b[n0 + i] += s * vol * env(t, attack, release, dur);
  }
}

/** Filtered noise: `cutoff` glides from..to (one-pole low-pass), for splashes, whooshes, crackles. */
function noise(b, { start = 0, dur, vol = 0.5, from = 4000, to = from, attack = 0.01, release = 0.1, seed = 1, crackle = 0 }) {
  const r = rng(seed);
  let y = 0;
  const n0 = Math.round(start * RATE);
  const n = Math.round(dur * RATE);
  for (let i = 0; i < n && n0 + i < b.length; i++) {
    const t = i / RATE;
    const cutoff = from + (to - from) * (i / n);
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / RATE);
    y += a * (r() * 2 - 1 - y);
    let s = y * 2.2;
    if (crackle && r() < crackle) s += (r() * 2 - 1) * 1.5;
    b[n0 + i] += s * vol * env(t, attack, release, dur);
  }
}

const SOUNDS = {
  tap: () => {
    const b = buf(0.09);
    tone(b, { dur: 0.08, freq: 880, to: 1320, vol: 0.35, release: 0.06 });
    return b;
  },
  pop: () => {
    const b = buf(0.14);
    tone(b, { dur: 0.12, freq: 520, to: 980, vol: 0.4, shape: 'soft', release: 0.08 });
    return b;
  },
  splash: () => {
    const b = buf(0.55);
    noise(b, { dur: 0.5, vol: 0.55, from: 6000, to: 900, attack: 0.005, release: 0.35, seed: 2 });
    tone(b, { start: 0.02, dur: 0.18, freq: 620, to: 300, vol: 0.18 });
    return b;
  },
  fire: () => {
    const b = buf(0.6);
    noise(b, { dur: 0.55, vol: 0.45, from: 900, to: 2600, attack: 0.08, release: 0.3, seed: 3, crackle: 0.01 });
    return b;
  },
  earth: () => {
    const b = buf(0.45);
    tone(b, { dur: 0.35, freq: 140, to: 55, vol: 0.7, shape: 'soft', release: 0.25 });
    noise(b, { dur: 0.3, vol: 0.3, from: 1200, to: 300, release: 0.2, seed: 4 });
    return b;
  },
  wind: () => {
    const b = buf(0.7);
    noise(b, { dur: 0.65, vol: 0.4, from: 500, to: 3000, attack: 0.25, release: 0.35, seed: 5 });
    return b;
  },
  hit: () => {
    const b = buf(0.25);
    tone(b, { dur: 0.18, freq: 220, to: 90, vol: 0.55, shape: 'soft', release: 0.12 });
    noise(b, { dur: 0.12, vol: 0.35, from: 3000, to: 600, release: 0.1, seed: 6 });
    return b;
  },
  heal: () => {
    const b = buf(0.5);
    [660, 880, 1100].forEach((f, i) => tone(b, { start: i * 0.08, dur: 0.25, freq: f, vol: 0.25, release: 0.2 }));
    return b;
  },
  steam: () => {
    const b = buf(0.6);
    noise(b, { dur: 0.55, vol: 0.4, from: 7000, to: 5000, attack: 0.02, release: 0.4, seed: 7 });
    return b;
  },
  sparkle: () => {
    const b = buf(0.6);
    [1320, 1760, 2093, 2637].forEach((f, i) => tone(b, { start: i * 0.06, dur: 0.3, freq: f, vol: 0.16, release: 0.25 }));
    return b;
  },
  victory: () => {
    const b = buf(1.1);
    [523, 659, 784, 1047].forEach((f, i) => tone(b, { start: i * 0.12, dur: i === 3 ? 0.6 : 0.2, freq: f, vol: 0.3, shape: 'tri', release: i === 3 ? 0.45 : 0.1 }));
    return b;
  },
  defeat: () => {
    const b = buf(0.9);
    [440, 392, 330].forEach((f, i) => tone(b, { start: i * 0.18, dur: 0.3, freq: f, vol: 0.25, shape: 'tri', release: 0.2 }));
    return b;
  },
  bond: () => {
    const b = buf(0.4);
    tone(b, { dur: 0.15, freq: 784, vol: 0.25, release: 0.1 });
    tone(b, { start: 0.1, dur: 0.25, freq: 1047, vol: 0.25, release: 0.2 });
    return b;
  },
};

function wav(samples) {
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const gain = peak > 0.95 ? 0.95 / peak : 1;
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s * gain)) * 32767), i * 2));
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVEfmt ', 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

mkdirSync(out, { recursive: true });
let stale = 0;
for (const [name, make] of Object.entries(SOUNDS)) {
  const file = join(out, `${name}.wav`);
  const bytes = wav(make());
  if (check) {
    if (!existsSync(file) || !readFileSync(file).equals(bytes)) {
      console.error(`stale: app/assets/sfx/${name}.wav (run npm run sfx)`);
      stale++;
    }
  } else writeFileSync(file, bytes);
}
if (check && stale) process.exit(1);
if (!check) console.log(`wrote ${Object.keys(SOUNDS).length} sounds to app/assets/sfx/`);
