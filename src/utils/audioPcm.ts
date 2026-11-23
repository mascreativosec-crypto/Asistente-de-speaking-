export interface VisemeWeights {
  jawOpen: number;
  mouthSpread: number;
  lipPucker: number;
  energy: number;
}

/**
 * Linearly resamples mono Float32 PCM audio from sourceRate to targetRate.
 */
export function resampleLinear(
  samples: Float32Array,
  sourceRate: number,
  targetRate: number
): Float32Array {
  if (samples.length === 0 || sourceRate <= 0 || targetRate <= 0) {
    return new Float32Array(0);
  }
  if (sourceRate === targetRate) {
    return new Float32Array(samples);
  }
  const ratio = sourceRate / targetRate;
  const outputLength = Math.max(1, Math.round(samples.length / ratio));
  const result = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio;
    const lower = Math.floor(srcIndex);
    const upper = Math.min(lower + 1, samples.length - 1);
    const frac = srcIndex - lower;
    result[i] = samples[lower] + (samples[upper] - samples[lower]) * frac;
  }

  return result;
}

/**
 * Clamps and quantizes Float32 [-1, 1] audio to signed 16-bit PCM.
 */
export function float32ToInt16Pcm(samples: Float32Array): Int16Array {
  const output = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    output[i] = clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767);
  }
  return output;
}

/**
 * Converts signed 16-bit PCM samples to Float32 [-1, 1] audio.
 */
export function int16ToFloat32Pcm(int16: Int16Array): Float32Array {
  const output = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    output[i] = int16[i] / 32768;
  }
  return output;
}

/**
 * Encodes a Uint8Array to base64 safely in both browser and Node environments.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
  }
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string to Uint8Array safely in both browser and Node environments.
 */
export function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(base64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Resamples browser microphone Float32 samples to 16kHz signed 16-bit little-endian PCM base64.
 */
export function encodePcm16ToBase64(
  samples: Float32Array,
  sourceRate: number,
  targetRate = 16000
): string {
  const resampled = resampleLinear(samples, sourceRate, targetRate);
  const int16 = float32ToInt16Pcm(resampled);
  const view = new DataView(new ArrayBuffer(int16.length * 2));
  for (let i = 0; i < int16.length; i++) {
    view.setInt16(i * 2, int16[i], true);
  }
  return bytesToBase64(new Uint8Array(view.buffer));
}

/**
 * Decodes base64 little-endian 16-bit PCM (24kHz from Gemini Live) into Float32 samples.
 */
export function decodeBase64Pcm16ToFloat32(base64: string): Float32Array {
  const bytes = base64ToBytes(base64);
  const sampleCount = Math.floor(bytes.byteLength / 2);
  if (sampleCount === 0) return new Float32Array(0);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const output = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    output[i] = view.getInt16(i * 2, true) / 32768;
  }
  return output;
}

/**
 * Computes normalized RMS audio level [0..1] for VAD and waveform rendering.
 */
export function computeRmsLevel(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    sumSq += s * s;
  }
  return Math.min(1, Math.sqrt(sumSq / samples.length));
}

/**
 * Extracts real-time viseme mouth articulation weights from AnalyserNode FFT frequency bins.
 * Separates fundamental/vowel openness (jaw), mid formants (spread), and high fricatives (pucker).
 */
export function extractVisemeWeights(
  frequencyBins: Uint8Array,
  sampleRate: number,
  fftSize: number
): VisemeWeights {
  if (frequencyBins.length === 0 || sampleRate <= 0 || fftSize <= 0) {
    return { jawOpen: 0, mouthSpread: 0, lipPucker: 0, energy: 0 };
  }

  const binHz = sampleRate / fftSize;
  const bandAvg = (minHz: number, maxHz: number): number => {
    const start = Math.max(0, Math.floor(minHz / binHz));
    const end = Math.min(frequencyBins.length - 1, Math.ceil(maxHz / binHz));
    if (end < start) return 0;
    let total = 0;
    for (let i = start; i <= end; i++) {
      total += frequencyBins[i];
    }
    return total / ((end - start + 1) * 255);
  };

  // F1 vowel openness (250-950Hz), F2 front/spread (950-2600Hz), fricatives (2600-6500Hz)
  const lowBand = bandAvg(120, 560);
  const f1VowelBand = bandAvg(300, 1050);
  const midBand = bandAvg(950, 2500);
  const highBand = bandAvg(2500, 6500);

  const rawEnergy = lowBand * 0.42 + f1VowelBand * 0.35 + midBand * 0.16 + highBand * 0.07;
  const energy = Math.min(1, Math.max(0, (rawEnergy - 0.025) * 1.35));
  const jawOpen = Math.min(1, Math.max(0, (f1VowelBand * 0.68 + lowBand * 0.36 - 0.035) * 1.7));
  const mouthSpread = Math.min(1, Math.max(0, (midBand * 0.85 - lowBand * 0.18) * 1.45));
  const lipPucker = Math.min(1, Math.max(0, (highBand * 0.72 + lowBand * 0.28 - 0.045) * 1.35));

  return { jawOpen, mouthSpread, lipPucker, energy };
}

/**
 * Combines instantaneous time-domain speech envelope (RMS) with F1 vowel jaw openness
 * so lips snap cleanly closed on micro-pauses and open crisply on spoken vowels/syllables.
 */
export function computeSyllableLipOpen(timeDomainRms: number, visemes: VisemeWeights): number {
  // Hard-ish noise gate so trailing room noise or playback silence closes lips cleanly
  if (timeDomainRms < 0.012 && visemes.energy < 0.04) {
    return 0;
  }
  const rmsDrive = Math.min(1, Math.max(0, (timeDomainRms - 0.01) * 4.4));
  const formantDrive = Math.min(1, visemes.jawOpen * 0.82 + visemes.energy * 0.32);
  // Geometric-weighted blend prevents mouth from hanging open when RMS drops between words
  const combined = rmsDrive * 0.62 + formantDrive * 0.38;
  const gated = rmsDrive < 0.05 ? combined * (rmsDrive / 0.05) : combined;
  return Math.min(1, Math.max(0, Math.pow(gated, 0.88)));
}

