import { useEffect, useRef } from 'react';
import type { AvatarExpression, AvatarState, TutorProfile } from '../shared/tutorConfig';
import type { LiveVoiceTelemetry } from '../services/liveVoiceClient';
import { drawScenarioBackdrop } from './sceneBackdrops';
import { AllenCharacterSvg } from './AllenCharacterSvg';

interface TutorAvatar3DProps {
  tutor: TutorProfile;
  avatarState: AvatarState;
  expression: AvatarExpression;
  scenarioId?: string;
  sampleAudio?: () => LiveVoiceTelemetry;
  compact?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawFourPointStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotation = 0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 4;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function TutorAvatar3D({
  tutor,
  avatarState,
  expression,
  scenarioId = 'everyday',
  sampleAudio,
  compact = false,
  theme = 'dark',
  className = '',
}: TutorAvatar3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tutorRef = useRef(tutor);
  const avatarStateRef = useRef<AvatarState>(avatarState);
  const expressionRef = useRef<AvatarExpression>(expression);
  const scenarioIdRef = useRef<string>(scenarioId);
  const sampleAudioRef = useRef(sampleAudio);
  const compactRef = useRef(compact);
  const themeRef = useRef(theme);

  tutorRef.current = tutor;
  avatarStateRef.current = avatarState;
  expressionRef.current = expression;
  scenarioIdRef.current = scenarioId;
  sampleAudioRef.current = sampleAudio;
  compactRef.current = compact;
  themeRef.current = theme;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = Math.max(container.clientWidth, 320);
    let height = Math.max(container.clientHeight, 260);
    let dpr = Math.min(window.devicePixelRatio || 1, compactRef.current ? 1.5 : 1.25);

    const resize = () => {
      width = Math.max(container.clientWidth, 320);
      height = Math.max(container.clientHeight, 260);
      dpr = Math.min(window.devicePixelRatio || 1, compactRef.current ? 1.5 : 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let rafId = 0;
    const startMs = performance.now();
    let prevMs = startMs;
    let smoothVoice = 0;
    let smoothMic = 0;

    const renderFrame = (nowMs: number) => {
      rafId = window.requestAnimationFrame(renderFrame);

      // Smooth ~33fps cinema pacing leaves full CPU headroom for SVG lip-sync + WebAudio PCM
      if (nowMs - prevMs < 28) return;

      const dt = Math.min((nowMs - prevMs) / 1000, 0.08);
      prevMs = nowMs;
      const t = (nowMs - startMs) / 1000;

      const activeTutor = tutorRef.current;
      const state = avatarStateRef.current;
      const expr = expressionRef.current;
      const isCompact = compactRef.current;

      let targetVoice = 0;
      let targetMic = 0;
      if (sampleAudioRef.current) {
        const tel = sampleAudioRef.current();
        targetMic = clamp(tel.micLevel * 1.5, 0, 1);
        targetVoice = clamp(Math.max(tel.tutorLevel, tel.lipOpen), 0, 1);
      } else if (state === 'SPEAKING') {
        targetVoice = clamp(0.28 + 0.3 * Math.abs(Math.sin(t * 7.8)), 0, 1);
      }

      smoothVoice = lerp(smoothVoice, targetVoice, 1 - Math.pow(1 - 0.25, dt * 60));
      smoothMic = lerp(smoothMic, targetMic, 1 - Math.pow(1 - 0.22, dt * 60));

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Living animated context backdrop matched to the active conversation scenario!
      drawScenarioBackdrop(
        ctx,
        scenarioIdRef.current,
        width,
        height,
        t,
        smoothVoice,
        themeRef.current === 'light'
      );

      // 2. Soft studio spotlight + audio-reactive character aura behind the ALLEN SVG Character
      const cx = width * 0.5;
      const cy = isCompact ? height * 0.44 : height * 0.46;
      const baseR = isCompact
        ? clamp(Math.min(width, height) * 0.27, 62, 92)
        : clamp(Math.min(width, height) * 0.19, 86, 134);

      const ringColor =
        state === 'LISTENING'
          ? '#38bdf8'
          : state === 'INTERRUPTED'
            ? '#fbbf24'
            : state === 'THINKING'
              ? '#a78bfa'
              : activeTutor.dotStyle.glowHex;

      const auraEnergy =
        state === 'SPEAKING'
          ? 0.28 + smoothVoice * 0.72
          : state === 'LISTENING'
            ? 0.22 + smoothMic * 0.68
            : 0.12 + 0.05 * Math.sin(t * 2.1);

      // Subtle soft contrast halo behind the character so every ALLEN SVG Character pops cleanly
      const glowHalo = ctx.createRadialGradient(
        cx,
        cy,
        baseR * 0.25,
        cx,
        cy,
        baseR * (1.85 + auraEnergy * 0.38)
      );
      glowHalo.addColorStop(0, hexToRgba(ringColor, 0.34 * auraEnergy + 0.16));
      glowHalo.addColorStop(0.55, hexToRgba(ringColor, 0.12 * auraEnergy));
      glowHalo.addColorStop(1, hexToRgba(ringColor, 0));
      ctx.fillStyle = glowHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * (1.85 + auraEnergy * 0.38), 0, Math.PI * 2);
      ctx.fill();

      // Dynamic expanding audio wave rings while SPEAKING or LISTENING
      if (state === 'SPEAKING' || state === 'LISTENING') {
        for (let i = 0; i < 2; i++) {
          const phase = (t * (state === 'SPEAKING' ? 1.05 : 0.72) + i * 0.5) % 1;
          const rRing = baseR * (1.08 + phase * (0.52 + auraEnergy * 0.22));
          const ringAlpha = (1 - phase) * (0.26 + auraEnergy * 0.34);
          ctx.strokeStyle = hexToRgba(ringColor, ringAlpha);
          ctx.lineWidth = Math.max(1.5, (1 - phase) * 3.4);
          ctx.beginPath();
          ctx.arc(cx, cy, rRing, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Celebratory golden sparkles around the character on congratulation
      if (expr === 'congratulation') {
        const sparkOffsets = [
          { x: -baseR * 1.28, y: -baseR * 0.56, r: 9, phase: 0 },
          { x: baseR * 1.32, y: -baseR * 0.44, r: 10, phase: 1.5 },
          { x: -baseR * 1.08, y: baseR * 0.34, r: 7, phase: 3.1 },
          { x: baseR * 1.12, y: baseR * 0.28, r: 8, phase: 4.4 },
        ];
        for (const sp of sparkOffsets) {
          const pulse = 0.6 + 0.4 * Math.sin(t * 5.4 + sp.phase);
          const floatY = Math.sin(t * 3 + sp.phase) * 7;
          ctx.fillStyle = hexToRgba('#fef08a', 0.88 * pulse);
          drawFourPointStar(
            ctx,
            cx + sp.x,
            cy + sp.y + floatY,
            sp.r * pulse,
            sp.r * 0.32 * pulse,
            t * 0.9 + sp.phase
          );
        }
      }

      ctx.restore();
    };

    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="tutor-avatar-canvas"
      data-avatar-state={avatarState}
      data-avatar-expression={expression}
      data-tutor-id={tutor.id}
      data-scenario-id={scenarioId}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {/* Living Animated Context Backdrop Canvas */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* Centered Custom ALLEN Character SVG with real-time audio lip-sync */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center ${
          compact ? 'pb-12 pt-3' : 'pb-[148px] pt-[124px]'
        }`}
      >
        <div
          className={
            compact
              ? 'w-[200px] sm:w-[225px] max-h-full aspect-[240/290] flex items-center justify-center'
              : 'w-[250px] sm:w-[300px] lg:w-[330px] max-h-full aspect-[240/290] flex items-center justify-center'
          }
        >
          <AllenCharacterSvg
            characterId={tutor.dotStyle.characterId}
            avatarState={avatarState}
            expression={expression}
            sampleAudio={sampleAudio}
            className="w-full h-full drop-shadow-[0_14px_28px_rgba(4,9,24,0.42)]"
          />
        </div>
      </div>
    </div>
  );
}
