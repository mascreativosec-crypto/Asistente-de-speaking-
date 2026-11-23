import { useEffect, useRef } from 'react';
import type { AvatarState } from '../shared/tutorConfig';

interface AudioWaveformProps {
  avatarState: AvatarState;
  isMuted: boolean;
  sampleWaveform: () => {
    waveformBins: Uint8Array;
    micLevel: number;
    tutorLevel: number;
  };
}

export function AudioWaveform({ avatarState, isMuted, sampleWaveform }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(avatarState);
  const mutedRef = useRef(isMuted);
  const sampleRef = useRef(sampleWaveform);

  stateRef.current = avatarState;
  mutedRef.current = isMuted;
  sampleRef.current = sampleWaveform;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 44;
    const smoothed = new Float32Array(barCount);
    let rafId = 0;
    let phase = 0;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 320;
      const cssH = canvas.clientHeight || 48;
      if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);

      phase += 0.08;
      const st = stateRef.current;
      const muted = mutedRef.current;
      const { waveformBins, micLevel, tutorLevel } = sampleRef.current();

      const midY = cssH / 2;
      const gap = cssW / barCount;
      const barWidth = Math.max(2, gap * 0.48);

      const isTutorActive = st === 'SPEAKING';
      const isStudentActive = st === 'LISTENING' && !muted;
      const isThinking = st === 'THINKING';

      for (let i = 0; i < barCount; i++) {
        // Mirror symmetry from center outward (like a modern voice call spectrum)
        const distFromCenter = Math.abs(i - (barCount - 1) / 2) / ((barCount - 1) / 2);
        const envelope = Math.cos(distFromCenter * Math.PI * 0.48);
        const binIndex = Math.min(
          waveformBins.length - 1,
          Math.floor(distFromCenter * Math.min(48, waveformBins.length - 1))
        );
        const binEnergy = (waveformBins[binIndex] ?? 0) / 255;

        let target = 0.08;
        if (isTutorActive) {
          target = Math.max(0.12, (binEnergy * 0.85 + tutorLevel * 0.65) * envelope);
        } else if (isStudentActive) {
          target = Math.max(
            0.12,
            (binEnergy * 0.75 + micLevel * 0.75 + Math.sin(phase + i * 0.45) * 0.06) * envelope
          );
        } else if (isThinking) {
          target = (0.16 + Math.sin(phase * 1.4 - i * 0.32) * 0.1) * envelope;
        } else if (st === 'INTERRUPTED') {
          target = 0.28 * envelope;
        } else {
          target = (0.09 + Math.sin(phase * 0.6 + i * 0.25) * 0.03) * envelope;
        }

        smoothed[i] += (target - smoothed[i]) * 0.28;
        const barH = Math.max(3, smoothed[i] * (cssH - 6));
        const x = i * gap + (gap - barWidth) / 2;
        const y = midY - barH / 2;

        if (isTutorActive) {
          ctx.fillStyle = `rgba(96, 165, 250, ${0.42 + smoothed[i] * 0.58})`;
        } else if (isStudentActive) {
          ctx.fillStyle = `rgba(56, 189, 248, ${0.42 + smoothed[i] * 0.58})`;
        } else if (isThinking) {
          ctx.fillStyle = `rgba(148, 163, 184, ${0.35 + smoothed[i] * 0.45})`;
        } else if (st === 'INTERRUPTED') {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.78)';
        } else {
          ctx.fillStyle = 'rgba(100, 116, 139, 0.38)';
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, barWidth / 2);
        ctx.fill();
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      data-testid="audio-waveform-canvas"
      aria-hidden="true"
      className="w-full h-11 block"
    />
  );
}
