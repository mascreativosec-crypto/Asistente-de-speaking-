import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRmsLevel,
  computeSyllableLipOpen,
  decodeBase64Pcm16ToFloat32,
  encodePcm16ToBase64,
  extractVisemeWeights,
  float32ToInt16Pcm,
  int16ToFloat32Pcm,
  resampleLinear,
} from './audioPcm';

test('resampleLinear downsamples 48kHz to 16kHz with exact 3:1 ratio', () => {
  const input = new Float32Array(480);
  for (let i = 0; i < input.length; i++) {
    input[i] = Math.sin((2 * Math.PI * 440 * i) / 48000);
  }
  const output = resampleLinear(input, 48000, 16000);
  assert.equal(output.length, 160);
  assert.ok(Math.abs(output[0] - input[0]) < 1e-6);
});

test('float32ToInt16Pcm clamps extremes and round-trips accurately', () => {
  const input = new Float32Array([-1.5, -1, -0.5, 0, 0.5, 1, 1.5]);
  const int16 = float32ToInt16Pcm(input);
  assert.equal(int16[0], -32768);
  assert.equal(int16[1], -32768);
  assert.equal(int16[3], 0);
  assert.equal(int16[5], 32767);
  assert.equal(int16[6], 32767);

  const restored = int16ToFloat32Pcm(int16);
  assert.ok(Math.abs(restored[2] - -0.5) < 0.001);
  assert.ok(Math.abs(restored[4] - 0.5) < 0.001);
});

test('encodePcm16ToBase64 and decodeBase64Pcm16ToFloat32 round-trip at 16kHz', () => {
  const samples = new Float32Array([0, 0.25, -0.25, 0.75, -0.75]);
  const b64 = encodePcm16ToBase64(samples, 16000, 16000);
  const decoded = decodeBase64Pcm16ToFloat32(b64);
  assert.equal(decoded.length, samples.length);
  for (let i = 0; i < samples.length; i++) {
    assert.ok(Math.abs(decoded[i] - samples[i]) < 0.001);
  }
});

test('computeRmsLevel returns 0 for silence and ~0.707 for unit sine wave', () => {
  assert.equal(computeRmsLevel(new Float32Array(128)), 0);
  const sine = new Float32Array(1000);
  for (let i = 0; i < sine.length; i++) {
    sine[i] = Math.sin((2 * Math.PI * 10 * i) / sine.length);
  }
  const rms = computeRmsLevel(sine);
  assert.ok(Math.abs(rms - Math.SQRT1_2) < 0.02);
});

test('extractVisemeWeights differentiates vowel jaw opening from silence', () => {
  const silentBins = new Uint8Array(128);
  const silentVisemes = extractVisemeWeights(silentBins, 24000, 256);
  assert.equal(silentVisemes.jawOpen, 0);
  assert.equal(silentVisemes.energy, 0);

  // Simulate strong vowel energy in 110Hz - 520Hz (bins ~1 to 6 at 24000/256 = 93.75Hz/bin)
  const vowelBins = new Uint8Array(128);
  for (let i = 1; i <= 6; i++) vowelBins[i] = 220;
  const vowelVisemes = extractVisemeWeights(vowelBins, 24000, 256);
  assert.ok(vowelVisemes.jawOpen > 0.5, `Expected jawOpen > 0.5, got ${vowelVisemes.jawOpen}`);
  assert.ok(vowelVisemes.energy > 0.35);
});

test('computeSyllableLipOpen closes cleanly on silence and opens crisply on spoken vowels', () => {
  const silent = computeSyllableLipOpen(0.004, { jawOpen: 0, mouthSpread: 0, lipPucker: 0, energy: 0 });
  assert.equal(silent, 0);

  const mid = computeSyllableLipOpen(0.08, { jawOpen: 0.35, mouthSpread: 0.2, lipPucker: 0.1, energy: 0.3 });
  assert.ok(mid > 0.2 && mid < 0.75, `Expected mid lipOpen, got ${mid}`);

  const open = computeSyllableLipOpen(0.24, { jawOpen: 0.85, mouthSpread: 0.2, lipPucker: 0.1, energy: 0.8 });
  assert.ok(open > 0.75, `Expected wide lipOpen > 0.75, got ${open}`);
});
