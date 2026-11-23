import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  MessageSquareQuote,
  Mic,
  MicOff,
  PhoneOff,
  RefreshCw,
  ShieldAlert,
  Star,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import {
  formatCallDuration,
  type AudienceGroup,
  type AvatarExpression,
  type AvatarState,
  type CEFRLevel,
  type ConnectionStatus,
  type KidsAgeBand,
  type LiveCorrection,
  type PronunciationPointsAward,
  type ScenarioConfig,
  type TutorProfile,
} from '../shared/tutorConfig';
import type { LiveVoiceTelemetry } from '../services/liveVoiceClient';
import { TutorAvatar3D } from './TutorAvatar3D';
import { AudioWaveform } from './AudioWaveform';

interface LiveCallScreenProps {
  theme: 'light' | 'dark';
  audience: AudienceGroup;
  kidsAgeBand?: KidsAgeBand;
  tutor: TutorProfile;
  scenario: ScenarioConfig;
  activeSubtopicTitle?: string;
  cefrLevel: CEFRLevel;
  connectionStatus: ConnectionStatus;
  connectionDetail: string;
  avatarState: AvatarState;
  expression: AvatarExpression;
  durationSeconds: number;
  targetDurationMinutes: number | null;
  timeGoalReachedMinutes: number | null;
  pronunciationPoints: number;
  recentPointsAward: PronunciationPointsAward | null;
  isMuted: boolean;
  isMicLocked: boolean;
  volume: number;
  errorMessage: string | null;
  tutorCaption: string;
  activeCorrection: LiveCorrection | null;
  safetyNotice: string | null;
  sampleTelemetry: () => LiveVoiceTelemetry;
  onToggleMute: () => void;
  onChangeVolume: (vol: number) => void;
  onEndCall: () => void;
  onExtendSession: () => void;
  onDismissTimeGoal: () => void;
  onRetryConnection: () => void;
  onCancelToPrep: () => void;
  onDismissCorrection: () => void;
  onDismissSafetyNotice: () => void;
}

function getSpeakerStatusText(
  avatarState: AvatarState,
  tutorName: string,
  isMuted: boolean,
  isMicLocked: boolean,
  connectionStatus: ConnectionStatus
): string {
  if (connectionStatus === 'requesting_mic') return 'Esperando permiso del micrófono...';
  if (connectionStatus === 'connecting') return `Conectando con ${tutorName}...`;
  if (connectionStatus === 'reconnecting') return 'Reconectando audio en tiempo real...';
  if (connectionStatus === 'error') return 'Llamada interrumpida';

  switch (avatarState) {
    case 'SPEAKING':
      return isMicLocked
        ? `${tutorName} está hablando · Micrófono en espera`
        : `${tutorName} está hablando`;
    case 'LISTENING':
      return 'Escuchándote...';
    case 'THINKING':
      return `${tutorName} está pensando...`;
    case 'INTERRUPTED':
      return 'Te escucho...';
    case 'IDLE':
    default:
      if (isMuted) return 'Micrófono silenciado';
      if (isMicLocked) return `${tutorName} está respondiendo · Espera tu turno`;
      return 'Tu turno — habla libremente';
  }
}

function getConnectionLabel(status: ConnectionStatus): { text: string; tone: string } {
  switch (status) {
    case 'connected':
      return { text: 'Conectado', tone: 'text-emerald-700 dark:text-emerald-400' };
    case 'connecting':
    case 'requesting_mic':
      return { text: 'Conectando', tone: 'text-blue-700 dark:text-blue-300' };
    case 'reconnecting':
      return { text: 'Reconectando', tone: 'text-amber-700 dark:text-amber-300' };
    case 'error':
      return { text: 'Sin conexión', tone: 'text-rose-700 dark:text-rose-400' };
    default:
      return { text: 'En espera', tone: 'text-slate-600 dark:text-slate-400' };
  }
}

export function LiveCallScreen({
  theme,
  audience,
  kidsAgeBand,
  tutor,
  scenario,
  activeSubtopicTitle,
  cefrLevel,
  connectionStatus,
  connectionDetail,
  avatarState,
  expression,
  durationSeconds,
  targetDurationMinutes,
  timeGoalReachedMinutes,
  pronunciationPoints,
  recentPointsAward,
  isMuted,
  isMicLocked,
  volume,
  errorMessage,
  tutorCaption,
  activeCorrection,
  safetyNotice,
  sampleTelemetry,
  onToggleMute,
  onChangeVolume,
  onEndCall,
  onExtendSession,
  onDismissTimeGoal,
  onRetryConnection,
  onCancelToPrep,
  onDismissCorrection,
  onDismissSafetyNotice,
}: LiveCallScreenProps) {
  const tutorFirstName = tutor.name.split(' ')[0];
  const speakerLabel = getSpeakerStatusText(
    avatarState,
    tutorFirstName,
    isMuted,
    isMicLocked,
    connectionStatus
  );
  const conn = getConnectionLabel(connectionStatus);
  const isBusyConnecting =
    connectionStatus === 'connecting' ||
    connectionStatus === 'requesting_mic' ||
    connectionStatus === 'reconnecting';
  const targetSeconds = targetDurationMinutes ? targetDurationMinutes * 60 : null;
  const isGoalReached = targetSeconds !== null && durationSeconds >= targetSeconds;
  const isGoalSoon =
    targetSeconds !== null && !isGoalReached && targetSeconds - durationSeconds <= 45;

  const isBasicReadingMode = audience === 'kids' || cefrLevel === 'A1' || cefrLevel === 'A2';
  const cleanCaption = tutorCaption.trim();
  const showCaptionBesideCorrection =
    Boolean(activeCorrection && cleanCaption.length > 0) &&
    cleanCaption.toLowerCase() !== activeCorrection?.correction.trim().toLowerCase();

  return (
    <div
      data-testid="live-call-screen"
      data-connection-status={connectionStatus}
      data-avatar-state={avatarState}
      className="relative w-full h-[calc(100vh-64px)] min-h-[560px] bg-slate-100 dark:bg-[#070b16] overflow-hidden select-none transition-colors"
    >
      {/* Full-Viewport Animated Dot Companion + Living Topic Backdrop Stage */}
      <div className="absolute inset-0">
        <TutorAvatar3D
          tutor={tutor}
          avatarState={avatarState}
          expression={expression}
          scenarioId={scenario.id}
          theme={theme}
          sampleAudio={sampleTelemetry}
        />
      </div>

      {/* Subtle top and bottom luminance scrims adapted cleanly for light/dark themes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-50/90 via-slate-50/45 to-transparent dark:from-[#070b16]/90 dark:via-[#070b16]/45 dark:to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-50/95 via-slate-50/75 to-transparent dark:from-[#070b16] dark:via-[#070b16]/75 dark:to-transparent"
      />

      {/* Minimal Top Call HUD */}
      <div className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 pt-4">
        <div className="min-w-0 max-w-[320px] xl:max-w-[380px]">
          <h1 className="font-display text-lg sm:text-xl font-semibold text-slate-900 dark:text-white truncate">
            {tutor.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate">
            {scenario.title}
            {activeSubtopicTitle ? ` · ${activeSubtopicTitle}` : ''} ·{' '}
            {audience === 'kids' ? `Kids ${kidsAgeBand ?? '5-6'} años · ` : ''}
            Nivel {cefrLevel}
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Explicit connection status with icon + text (never hue-only) */}
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium ${conn.tone}`}>
            {isBusyConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            ) : connectionStatus === 'error' ? (
              <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <Wifi className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            <span className="hidden sm:inline whitespace-nowrap">{conn.text}</span>
          </div>

          {/* Live Pronunciation Points Counter (Adults & Kids) */}
          <div
            data-testid="pronunciation-points-badge"
            aria-label={`Puntos de pronunciación: ${pronunciationPoints}`}
            className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-xs sm:text-sm font-semibold px-3 py-1 rounded-lg border transition-colors ${
              pronunciationPoints > 0
                ? 'bg-amber-100/95 border-amber-400 text-amber-800 dark:bg-amber-500/15 dark:border-amber-400/50 dark:text-amber-300'
                : 'bg-white/90 border-slate-200 text-slate-800 dark:bg-[#0d1528]/90 dark:border-slate-700/80 dark:text-slate-200'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 shrink-0 ${
                pronunciationPoints > 0
                  ? 'text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400'
                  : 'text-amber-500/80 dark:text-amber-300/80'
              }`}
              aria-hidden="true"
            />
            <span>{pronunciationPoints} pts</span>
          </div>

          {/* Call Duration Timer (shows goal MM:SS / XX:00 once 5, 10 or 15 min is set) */}
          <div
            data-testid="call-duration-timer"
            aria-label={
              targetDurationMinutes
                ? `Duración de la conversación: ${formatCallDuration(durationSeconds)} de ${targetDurationMinutes} minutos`
                : 'Duración de la conversación'
            }
            className={`font-mono tabular-nums text-sm sm:text-base font-medium px-3 py-1 rounded-lg border transition-colors ${
              isGoalReached
                ? 'bg-emerald-100/95 border-emerald-400 text-emerald-900 dark:bg-emerald-500/15 dark:border-emerald-400/50 dark:text-emerald-200'
                : isGoalSoon
                  ? 'bg-amber-100/95 border-amber-400 text-amber-900 dark:bg-amber-500/15 dark:border-amber-400/50 dark:text-amber-200'
                  : 'bg-white/90 border-slate-200 text-slate-900 dark:bg-[#0d1528]/90 dark:border-slate-700/80 dark:text-slate-100'
            }`}
          >
            <span>{formatCallDuration(durationSeconds)}</span>
            {targetSeconds !== null && (
              <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                {' '}
                / {formatCallDuration(targetSeconds)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Points Celebration Toast docked cleanly under top-right HUD (never blocks Dot) */}
      <div className="pointer-events-none absolute right-4 sm:right-6 lg:right-8 top-[68px] z-30 flex justify-end">
        <AnimatePresence>
          {recentPointsAward && (
            <motion.div
              key={recentPointsAward.id}
              data-testid="points-award-toast"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 10, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="rounded-xl bg-amber-50/95 dark:bg-[#19160a]/95 border border-amber-400/80 dark:border-amber-400/60 shadow-2xl px-3.5 py-2.5 max-w-[340px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center gap-1 font-mono tabular-nums text-sm font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap shrink-0">
                  <Star
                    className="w-4 h-4 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400 shrink-0"
                    aria-hidden="true"
                  />
                  +{recentPointsAward.points} pts
                </span>
                {recentPointsAward.phrase && (
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    “{recentPointsAward.phrase}”
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-semibold text-amber-950 dark:text-amber-100 leading-snug">
                {recentPointsAward.praiseEs}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Reading / Spoken Sentence, Practice Phrase & Safety HUD directly above the avatar */}
      <div className="pointer-events-none absolute inset-x-0 top-[66px] lg:top-3 z-20 flex flex-col items-center gap-2 px-4">
        <AnimatePresence mode="wait">
          {safetyNotice ? (
            <motion.div
              key="safety-notice"
              data-testid="safety-notice-card"
              role="alert"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="pointer-events-auto w-full max-w-[590px] rounded-2xl bg-amber-50/95 dark:bg-[#1f1612]/95 border border-amber-400 dark:border-amber-500/55 shadow-2xl px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <ShieldAlert
                    className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Normas de comunidad y seguridad
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-amber-950 dark:text-amber-100 leading-snug">
                      {safetyNotice}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onDismissSafetyNotice}
                  aria-label="Cerrar aviso de seguridad"
                  className="w-6 h-6 rounded-md text-amber-700 hover:text-amber-950 hover:bg-amber-200/70 dark:text-amber-300/80 dark:hover:text-white dark:hover:bg-amber-950/80 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ) : activeCorrection ? (
            <motion.div
              key={activeCorrection.id}
              data-testid="live-correction-card"
              data-category={activeCorrection.category}
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`pointer-events-auto w-full max-w-[600px] rounded-2xl bg-white/95 dark:bg-[#0c1428]/95 shadow-2xl px-4 py-2.5 border ${
                activeCorrection.category === 'practice'
                  ? 'border-sky-400/80 dark:border-sky-400/55'
                  : 'border-blue-400/80 dark:border-blue-500/45'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${
                    activeCorrection.category === 'practice'
                      ? 'text-sky-700 dark:text-sky-300'
                      : 'text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {activeCorrection.category === 'practice' ? (
                    <Volume2
                      className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    {activeCorrection.category === 'practice'
                      ? 'Lee y pronuncia en voz alta'
                      : activeCorrection.category === 'pronunciation'
                        ? 'Corrección de pronunciación · Repite'
                        : activeCorrection.category === 'expression'
                          ? 'Mejor expresión · Repite'
                          : 'Corrección en vivo · Repite'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onDismissCorrection}
                  aria-label="Ocultar tarjeta"
                  className="w-6 h-6 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                {activeCorrection.original.trim().length > 0 &&
                  activeCorrection.original.trim().toLowerCase() !==
                    activeCorrection.correction.trim().toLowerCase() && (
                  <>
                    <span
                      className={
                        activeCorrection.category === 'practice'
                          ? 'text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic'
                          : 'text-sm sm:text-[15px] text-rose-600 dark:text-rose-300/90 line-through decoration-rose-500/70 dark:decoration-rose-400/70'
                      }
                    >
                      {activeCorrection.original}
                    </span>
                    <ArrowRight
                      className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0"
                      aria-hidden="true"
                    />
                  </>
                )}
                <span
                  className={
                    activeCorrection.category === 'practice'
                      ? 'text-lg sm:text-[21px] font-bold text-slate-950 dark:text-white tracking-tight'
                      : 'text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 tracking-tight'
                  }
                >
                  {activeCorrection.correction}
                </span>
                {activeCorrection.pronunciationGuide && (
                  <span className="font-mono text-xs sm:text-[13px] font-medium text-sky-800 bg-sky-100 border border-sky-300/80 dark:text-sky-300 dark:bg-[#13203d] dark:border-sky-500/30 px-2.5 py-0.5 rounded-md">
                    {activeCorrection.pronunciationGuide}
                  </span>
                )}
              </div>

              {activeCorrection.tipEs && (
                <div
                  data-testid="live-meaning-display"
                  className="mt-2 rounded-xl bg-emerald-50/95 dark:bg-emerald-500/15 border border-emerald-300/90 dark:border-emerald-400/40 px-3 py-1.5 flex items-center gap-2"
                >
                  <BookOpen
                    className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-emerald-300 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-base sm:text-[18.5px] font-semibold text-emerald-950 dark:text-emerald-50 leading-snug">
                    {activeCorrection.tipEs}
                  </p>
                </div>
              )}

              {showCaptionBesideCorrection && (
                <p
                  data-testid="live-tutor-subcaption"
                  className="mt-1.5 pt-1.5 border-t border-slate-200/80 dark:border-slate-700/70 text-xs text-slate-600 dark:text-slate-300/90 leading-snug line-clamp-1"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {tutorFirstName}:{' '}
                  </span>
                  “{cleanCaption}”
                </p>
              )}
            </motion.div>
          ) : cleanCaption ? (
            <motion.div
              key="live-tutor-caption"
              data-testid="live-tutor-caption-card"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="pointer-events-auto w-full max-w-[600px] rounded-2xl bg-white/95 dark:bg-[#0c1428]/95 border border-sky-300/90 dark:border-sky-500/40 shadow-2xl px-4 py-2.5"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                <MessageSquareQuote
                  className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {isBasicReadingMode
                    ? `Lee y practica · ${tutorFirstName} dice`
                    : `${tutorFirstName} dice`}
                </span>
              </div>
              <p className="mt-1 text-sm sm:text-[15.5px] font-medium text-slate-900 dark:text-white leading-snug line-clamp-3">
                {cleanCaption}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Unified Bottom Video-Call Control Dock (dual-theme solid surface, zero chat UI) */}
      <div className="absolute inset-x-0 bottom-5 z-20 px-4 flex flex-col items-center">
        {/* Connection / Reconnection / Error Alert Banner docked cleanly below avatar chin */}
        {(connectionStatus === 'error' || connectionStatus === 'reconnecting') && (
          <div role="alert" className="w-full max-w-[780px] mb-3">
            <div className="rounded-xl bg-white/95 dark:bg-[#0e162b]/95 border border-slate-300 dark:border-slate-700 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start gap-2.5 min-w-0">
                {connectionStatus === 'error' ? (
                  <AlertCircle
                    className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                ) : (
                  <Loader2
                    className="w-5 h-5 text-amber-600 dark:text-amber-300 animate-spin shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {connectionStatus === 'error'
                      ? 'No se pudo mantener la llamada'
                      : 'Reconectando la llamada'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                    {errorMessage || connectionDetail}
                  </p>
                </div>
              </div>
              {connectionStatus === 'error' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onRetryConnection}
                    className="min-h-[40px] px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    Reintentar
                  </button>
                  <button
                    type="button"
                    onClick={onCancelToPrep}
                    className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    Volver
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Non-intrusive Time-Goal Extension Choice when full 5 / 10 / 15 min goal completes */}
        {timeGoalReachedMinutes !== null && connectionStatus === 'connected' && (
          <div
            data-testid="time-goal-reached-bar"
            role="status"
            aria-live="polite"
            className="w-full max-w-[780px] mb-2.5"
          >
            <div className="rounded-xl bg-white/95 dark:bg-[#0f1c2e]/95 border border-emerald-400/80 dark:border-emerald-400/50 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xl">
              <div className="flex items-center gap-2 min-w-0">
                <Clock
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-emerald-50 truncate">
                  Meta de {timeGoalReachedMinutes} min cumplida · ¿Deseas seguir practicando o finalizar?
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onExtendSession}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  Seguir (+5 min)
                </button>
                <button
                  type="button"
                  onClick={onEndCall}
                  className="min-h-[36px] px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  Finalizar
                </button>
                <button
                  type="button"
                  onClick={onDismissTimeGoal}
                  aria-label="Cerrar aviso de tiempo cumplido"
                  className="w-7 h-7 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Who-is-speaking / Avatar State indicator */}
        <p
          aria-live="polite"
          className="mb-2.5 px-3 py-1 rounded-md bg-white/90 border border-slate-200/90 text-slate-800 dark:bg-[#070b16]/85 dark:border-slate-800/80 dark:text-slate-100 text-xs sm:text-sm font-medium tracking-wide text-center shadow-sm"
        >
          {speakerLabel}
        </p>

        <div className="w-full max-w-[780px] rounded-2xl bg-white/95 dark:bg-[#0c1324]/95 border border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 shadow-2xl">
          {/* Live Audio Spectrum Waveform */}
          <div className="mb-3">
            <AudioWaveform
              avatarState={avatarState}
              isMuted={isMuted}
              sampleWaveform={sampleTelemetry}
            />
          </div>

          {/* Primary Video-Call Controls */}
          <div className="grid grid-cols-3 items-center gap-3">
            {/* Volume Control */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onChangeVolume(volume > 0 ? 0 : 0.9)}
                aria-label={volume === 0 ? 'Activar sonido del tutor' : 'Silenciar sonido del tutor'}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#131d36] dark:hover:bg-[#1a2747] dark:text-slate-200 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                )}
              </button>
              <div className="hidden sm:flex flex-col flex-1 max-w-[130px]">
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                  <label htmlFor="tutor-volume-slider">Volumen</label>
                  <span className="font-mono tabular-nums">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  id="tutor-volume-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => onChangeVolume(Number(e.target.value))}
                  aria-label="Volumen de voz del profesor"
                  className="studio-slider w-full"
                />
              </div>
            </div>

            {/* Centered Tactile Microphone Toggle (with automatic half-duplex lock state while AI speaks) */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onToggleMute}
                aria-pressed={isMuted}
                data-mic-locked={isMicLocked ? 'true' : 'false'}
                title={
                  isMuted
                    ? 'Micrófono silenciado'
                    : isMicLocked
                      ? 'Micrófono bloqueado automáticamente mientras habla el tutor'
                      : 'Tu turno para hablar (pulsa para silenciar)'
                }
                aria-label={
                  isMuted
                    ? 'Activar micrófono'
                    : isMicLocked
                      ? 'Micrófono en espera mientras habla el tutor. Pulsar para silenciar'
                      : 'Silenciar micrófono'
                }
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0c1324] ${
                  isMuted
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-rose-400 dark:border-rose-500/40 focus-visible:ring-rose-400'
                    : isMicLocked
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-2 border-amber-400 dark:bg-[#121c33] dark:hover:bg-[#192542] dark:text-amber-300 dark:border-amber-400/55 focus-visible:ring-amber-400'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 focus-visible:ring-blue-400'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <Mic className="w-6 h-6" aria-hidden="true" />
                )}
                {!isMuted && isMicLocked && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white border border-amber-500 text-amber-600 dark:bg-[#0c1324] dark:border-amber-400/70 dark:text-amber-300 flex items-center justify-center shadow"
                  >
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            </div>

            {/* End Call Action */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onEndCall}
                className="min-h-[44px] px-4 sm:px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                <PhoneOff className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Finalizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
