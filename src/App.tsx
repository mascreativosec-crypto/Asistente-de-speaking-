import { useCallback, useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import {
  ADULT_SCENARIOS,
  ADULT_TUTORS,
  getScenariosByAudience,
  getTutorsByAudience,
  sanitizeStudentName,
  type AudienceGroup,
  type AvatarExpression,
  type AvatarState,
  type CEFRLevel,
  type ConnectionStatus,
  type KidsAgeBand,
  type LiveCorrection,
  type PracticeDurationOption,
  type PracticeReport,
  type PronunciationPointsAward,
  type ScenarioConfig,
  type SpanishSupportMode,
  type TranscriptTurn,
  type TutorProfile,
} from './shared/tutorConfig';
import { LiveVoiceClient, type LiveVoiceTelemetry } from './services/liveVoiceClient';
import {
  deletePracticeReport,
  loadPracticeHistory,
  savePracticeReport,
} from './utils/practiceHistory';
import {
  recordVisitedSubtopic,
  selectNextSubtopicForScenario,
} from './utils/subtopicRotation';
import { PreparationScreen } from './components/PreparationScreen';
import { LiveCallScreen } from './components/LiveCallScreen';
import { PracticeReportScreen } from './components/PracticeReportScreen';
import { HistoryScreen } from './components/HistoryScreen';

type AppView = 'prep' | 'call' | 'report' | 'history';
export type ThemeMode = 'light' | 'dark';

const STUDENT_NAME_STORAGE_KEY = 'allen_aula_student_name';
const THEME_STORAGE_KEY = 'allen_aula_theme';

function loadSavedTheme(): ThemeMode {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function loadSavedStudentName(): string {
  try {
    return sanitizeStudentName(window.localStorage.getItem(STUDENT_NAME_STORAGE_KEY) ?? '');
  } catch {
    return '';
  }
}

interface LastEndedSession {
  scenarioId: string;
  audience: AudienceGroup;
  kidsAgeBand?: KidsAgeBand;
  studentName?: string;
  cefrLevel: CEFRLevel;
  tutorId: string;
  durationSeconds: number;
  pronunciationPoints: number;
  transcript: TranscriptTurn[];
  corrections: LiveCorrection[];
}

const EMPTY_BINS = new Uint8Array(128);

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadSavedTheme());
  const [view, setView] = useState<AppView>('prep');
  const [audience, setAudience] = useState<AudienceGroup>('adults');
  const [kidsAgeBand, setKidsAgeBand] = useState<KidsAgeBand>('5-6');
  const [studentName, setStudentName] = useState<string>(() => loadSavedStudentName());
  const [selectedScenario, setSelectedScenario] = useState<ScenarioConfig>(ADULT_SCENARIOS[0]);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('B1');
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile>(ADULT_TUTORS[0]);
  const [spanishSupport, setSpanishSupport] = useState<SpanishSupportMode>('auto');
  const [practiceDuration, setPracticeDuration] = useState<PracticeDurationOption>('ask');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleChangeStudentName = useCallback((nextName: string) => {
    setStudentName(nextName);
    try {
      const cleaned = sanitizeStudentName(nextName);
      if (cleaned) {
        window.localStorage.setItem(STUDENT_NAME_STORAGE_KEY, cleaned);
      } else {
        window.localStorage.removeItem(STUDENT_NAME_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Live call state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionDetail, setConnectionDetail] = useState<string>('');
  const [avatarState, setAvatarState] = useState<AvatarState>('IDLE');
  const [expression, setExpression] = useState<AvatarExpression>('neutral');
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [activeTargetDurationMinutes, setActiveTargetDurationMinutes] = useState<number | null>(
    null
  );
  const [timeGoalReachedMinutes, setTimeGoalReachedMinutes] = useState<number | null>(null);
  const [activeSubtopicTitle, setActiveSubtopicTitle] = useState<string>('');
  const [tutorCaption, setTutorCaption] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMicLocked, setIsMicLocked] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.9);
  const [callError, setCallError] = useState<string | null>(null);
  const [activeCorrection, setActiveCorrection] = useState<LiveCorrection | null>(null);
  const [pronunciationPoints, setPronunciationPoints] = useState<number>(0);
  const [recentPointsAward, setRecentPointsAward] = useState<PronunciationPointsAward | null>(null);
  const [safetyNotice, setSafetyNotice] = useState<string | null>(null);

  // Report & history state
  const [history, setHistory] = useState<PracticeReport[]>(() => loadPracticeHistory());
  const [activeReport, setActiveReport] = useState<PracticeReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const clientRef = useRef<LiveVoiceClient | null>(null);
  const durationRef = useRef<number>(0);
  const pointsRef = useRef<number>(0);
  const lastEndedSessionRef = useRef<LastEndedSession | null>(null);
  const pointsToastTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  durationRef.current = durationSeconds;
  pointsRef.current = pronunciationPoints;

  const handleSelectAudience = useCallback((nextAudience: AudienceGroup) => {
    setAudience(nextAudience);
    const groupScenarios = getScenariosByAudience(nextAudience);
    setSelectedScenario(groupScenarios[0]);
    // Strictly swap to Kids-only Dots when Kids mode is active, and Adult Dots for Adults
    const groupTutors = getTutorsByAudience(nextAudience);
    setSelectedTutor(groupTutors[0]);
    if (nextAudience === 'kids') {
      // Kids in Ecuador/South America start from zero English -> always default to A1
      setSelectedLevel('A1');
    }
  }, []);

  const showLiveCorrection = useCallback((correction: LiveCorrection) => {
    setActiveCorrection(correction);
  }, []);

  const dismissLiveCorrection = useCallback(() => {
    setActiveCorrection(null);
  }, []);

  const showSafetyNotice = useCallback((message: string) => {
    setSafetyNotice(message);
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
    }
    safetyTimerRef.current = window.setTimeout(() => {
      setSafetyNotice(null);
      safetyTimerRef.current = null;
    }, 10000);
  }, []);

  const dismissSafetyNotice = useCallback(() => {
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    setSafetyNotice(null);
  }, []);

  const showPointsAward = useCallback((award: PronunciationPointsAward) => {
    setPronunciationPoints((prev) => prev + award.points);
    setRecentPointsAward(award);
    if (pointsToastTimerRef.current !== null) {
      window.clearTimeout(pointsToastTimerRef.current);
    }
    pointsToastTimerRef.current = window.setTimeout(() => {
      setRecentPointsAward((current) => (current?.id === award.id ? null : current));
      pointsToastTimerRef.current = null;
    }, 4500);
  }, []);

  const dismissPointsAward = useCallback(() => {
    if (pointsToastTimerRef.current !== null) {
      window.clearTimeout(pointsToastTimerRef.current);
      pointsToastTimerRef.current = null;
    }
    setRecentPointsAward(null);
  }, []);

  const ensureClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new LiveVoiceClient({
        onConnectionChange: (status, detail) => {
          setConnectionStatus(status);
          if (detail) setConnectionDetail(detail);
        },
        onAvatarStateChange: (nextState) => {
          setAvatarState(nextState);
        },
        onExpressionChange: (nextExpr) => {
          setExpression(nextExpr);
        },
        onCorrection: (correction) => {
          showLiveCorrection(correction);
        },
        onPointsAward: (award) => {
          showPointsAward(award);
        },
        onSafetyNotice: (message) => {
          showSafetyNotice(message);
        },
        onMicLockChange: (locked) => {
          setIsMicLocked(locked);
        },
        onSessionDurationChange: (durationMinutes) => {
          setActiveTargetDurationMinutes(durationMinutes);
          setTimeGoalReachedMinutes(null);
        },
        onTimeGoalReached: (durationMinutes) => {
          setTimeGoalReachedMinutes(durationMinutes);
        },
        onTutorCaptionChange: (caption) => {
          setTutorCaption(caption);
        },
        onError: (msg) => {
          setCallError(msg);
        },
      });
    }
    return clientRef.current;
  }, [showLiveCorrection, showPointsAward, showSafetyNotice]);

  const requestPracticeReport = useCallback(async (payload: LastEndedSession) => {
    setIsGeneratingReport(true);
    setReportError(null);
    setActiveReport(null);

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const rawText = await res.text();
      let data: { report?: PracticeReport; error?: string } = {};
      if (rawText) {
        try {
          data = JSON.parse(rawText) as { report?: PracticeReport; error?: string };
        } catch {
          throw new Error(
            res.ok
              ? 'El servidor devolvió un formato inesperado al generar el informe.'
              : `El servidor respondió con error (${res.status}) al generar el informe.`
          );
        }
      }
      if (!res.ok || !data.report) {
        throw new Error(data.error || 'No se pudo generar el informe de la práctica.');
      }
      setActiveReport(data.report);
      setHistory(savePracticeReport(data.report));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error de red al generar el informe de práctica.';
      setReportError(msg);
    } finally {
      setIsGeneratingReport(false);
    }
  }, []);

  const handleStartCall = useCallback(() => {
    const subtopicSelection = selectNextSubtopicForScenario(selectedScenario);
    recordVisitedSubtopic(selectedScenario.id, subtopicSelection.subtopic.id);

    setView('call');
    setDurationSeconds(0);
    setActiveTargetDurationMinutes(practiceDuration === 'ask' ? null : practiceDuration);
    setTimeGoalReachedMinutes(null);
    setActiveSubtopicTitle(subtopicSelection.subtopic.titleEs);
    setTutorCaption('');
    setPronunciationPoints(0);
    setIsMuted(false);
    setIsMicLocked(true);
    setCallError(null);
    dismissLiveCorrection();
    dismissPointsAward();
    dismissSafetyNotice();
    setExpression('joy');
    setAvatarState('IDLE');

    const cleanedName = sanitizeStudentName(studentName);
    const client = ensureClient();
    void client.start({
      scenarioId: selectedScenario.id,
      subtopicId: subtopicSelection.subtopic.id,
      previousSubtopicTitles: subtopicSelection.previousSubtopicTitles,
      audience,
      kidsAgeBand: audience === 'kids' ? kidsAgeBand : undefined,
      studentName: cleanedName,
      cefrLevel: selectedLevel,
      tutorId: selectedTutor.id,
      spanishSupport,
      practiceDuration,
      volume,
    });
  }, [
    audience,
    dismissLiveCorrection,
    dismissPointsAward,
    dismissSafetyNotice,
    ensureClient,
    kidsAgeBand,
    practiceDuration,
    selectedScenario,
    selectedLevel,
    selectedTutor.id,
    spanishSupport,
    studentName,
    volume,
  ]);

  const handleEndCall = useCallback(() => {
    const corrections = clientRef.current ? clientRef.current.getCorrections() : [];
    const earnedPoints = Math.max(
      pointsRef.current,
      clientRef.current ? clientRef.current.getPronunciationPoints() : 0
    );
    const transcript = clientRef.current ? clientRef.current.stop() : [];
    dismissLiveCorrection();
    dismissPointsAward();
    dismissSafetyNotice();
    setTutorCaption('');
    const cleanedName = sanitizeStudentName(studentName);
    const payload: LastEndedSession = {
      scenarioId: selectedScenario.id,
      audience,
      ...(audience === 'kids' ? { kidsAgeBand } : {}),
      ...(cleanedName ? { studentName: cleanedName } : {}),
      cefrLevel: selectedLevel,
      tutorId: selectedTutor.id,
      durationSeconds: durationRef.current,
      pronunciationPoints: earnedPoints,
      transcript,
      corrections,
    };
    lastEndedSessionRef.current = payload;
    setView('report');
    void requestPracticeReport(payload);
  }, [
    audience,
    dismissLiveCorrection,
    dismissPointsAward,
    dismissSafetyNotice,
    kidsAgeBand,
    requestPracticeReport,
    selectedScenario.id,
    selectedLevel,
    selectedTutor.id,
    studentName,
  ]);

  const handleCancelToPrep = useCallback(() => {
    clientRef.current?.stop();
    dismissLiveCorrection();
    dismissPointsAward();
    dismissSafetyNotice();
    setTutorCaption('');
    setTimeGoalReachedMinutes(null);
    setCallError(null);
    setIsMicLocked(false);
    setConnectionStatus('idle');
    setAvatarState('IDLE');
    setView('prep');
  }, [dismissLiveCorrection, dismissPointsAward, dismissSafetyNotice]);

  const handleExtendSession = useCallback(() => {
    clientRef.current?.extendSession(5);
    setTimeGoalReachedMinutes(null);
  }, []);

  const handleDismissTimeGoal = useCallback(() => {
    setTimeGoalReachedMinutes(null);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      clientRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const handleChangeVolume = useCallback((nextVolume: number) => {
    setVolume(nextVolume);
    clientRef.current?.setVolume(nextVolume);
  }, []);

  const sampleTelemetry = useCallback((): LiveVoiceTelemetry => {
    if (!clientRef.current) {
      return {
        visemes: { jawOpen: 0, mouthSpread: 0, lipPucker: 0, energy: 0 },
        lipOpen: 0,
        micLevel: 0,
        tutorLevel: 0,
        waveformBins: EMPTY_BINS,
      };
    }
    return clientRef.current.sampleTelemetry();
  }, []);

  // Increment call duration clock every second while call view is connected
  useEffect(() => {
    if (view !== 'call' || connectionStatus !== 'connected') return;
    const timer = window.setInterval(() => {
      setDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [view, connectionStatus]);

  // Support ?autostart=1 query parameter to enter the live call stage directly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      handleStartCall();
    }
    // Run once on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarantee microphone release and timer cleanup on unmount or tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      clientRef.current?.stop();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (pointsToastTimerRef.current !== null) {
        window.clearTimeout(pointsToastTimerRef.current);
      }
      if (safetyTimerRef.current !== null) {
        window.clearTimeout(safetyTimerRef.current);
      }
      clientRef.current?.stop();
    };
  }, []);

  const handleNavigate = (target: 'prep' | 'history') => {
    if (view === 'call') {
      clientRef.current?.stop();
      dismissLiveCorrection();
      setIsMicLocked(false);
      setConnectionStatus('idle');
      setAvatarState('IDLE');
    }
    setView(target);
  };

  return (
    <div
      data-view={view}
      data-theme={theme}
      className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070b16] dark:text-slate-100 transition-colors"
    >
      {/* Top Bar Contract: 3 clean zones (Brand | Single-line Nav | Theme Toggle + Primary Action) */}
      <header className="h-16 shrink-0 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#070b16] transition-colors">
        <div className="mx-auto h-full w-full max-w-[1360px] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-8">
          <button
            type="button"
            onClick={() => handleNavigate('prep')}
            className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            ALLEN Aula
          </button>

          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium"
          >
            <button
              type="button"
              onClick={() => handleNavigate('prep')}
              aria-current={view === 'prep' ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                view === 'prep' || view === 'call'
                  ? 'border-blue-600 dark:border-blue-500 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              AI English Partner
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('history')}
              aria-current={view === 'history' ? 'page' : undefined}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                view === 'history' || view === 'report'
                  ? 'border-blue-600 dark:border-blue-500 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              Historial ({history.length})
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              data-testid="theme-toggle-button"
              onClick={handleToggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo noche'}
              aria-pressed={theme === 'light'}
              className="min-h-[40px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700/90 bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0d1528] dark:hover:bg-[#14203b] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                  <span className="hidden md:inline">Modo claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                  <span className="hidden md:inline">Modo noche</span>
                </>
              )}
            </button>

            {view === 'call' ? (
              <button
                type="button"
                onClick={handleEndCall}
                className="min-h-[40px] px-3 sm:px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs sm:text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                Finalizar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartCall}
                className="hidden sm:inline-flex items-center min-h-[40px] px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                Iniciar llamada
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Active View */}
      <div className="flex-1 flex flex-col">
        {view === 'prep' && (
          <PreparationScreen
            theme={theme}
            audience={audience}
            kidsAgeBand={kidsAgeBand}
            studentName={studentName}
            selectedScenario={selectedScenario}
            selectedLevel={selectedLevel}
            selectedTutor={selectedTutor}
            spanishSupport={spanishSupport}
            practiceDuration={practiceDuration}
            onSelectAudience={handleSelectAudience}
            onSelectKidsAgeBand={setKidsAgeBand}
            onChangeStudentName={handleChangeStudentName}
            onSelectScenario={setSelectedScenario}
            onSelectLevel={setSelectedLevel}
            onSelectTutor={setSelectedTutor}
            onSelectSpanishSupport={setSpanishSupport}
            onSelectPracticeDuration={setPracticeDuration}
            onStartCall={handleStartCall}
          />
        )}

        {view === 'call' && (
          <LiveCallScreen
            theme={theme}
            audience={audience}
            kidsAgeBand={audience === 'kids' ? kidsAgeBand : undefined}
            tutor={selectedTutor}
            scenario={selectedScenario}
            activeSubtopicTitle={activeSubtopicTitle}
            cefrLevel={selectedLevel}
            connectionStatus={connectionStatus}
            connectionDetail={connectionDetail}
            avatarState={avatarState}
            expression={expression}
            durationSeconds={durationSeconds}
            targetDurationMinutes={activeTargetDurationMinutes}
            timeGoalReachedMinutes={timeGoalReachedMinutes}
            pronunciationPoints={pronunciationPoints}
            recentPointsAward={recentPointsAward}
            isMuted={isMuted}
            isMicLocked={isMicLocked}
            volume={volume}
            errorMessage={callError}
            tutorCaption={tutorCaption}
            activeCorrection={activeCorrection}
            safetyNotice={safetyNotice}
            sampleTelemetry={sampleTelemetry}
            onToggleMute={handleToggleMute}
            onChangeVolume={handleChangeVolume}
            onEndCall={handleEndCall}
            onExtendSession={handleExtendSession}
            onDismissTimeGoal={handleDismissTimeGoal}
            onRetryConnection={handleStartCall}
            onCancelToPrep={handleCancelToPrep}
            onDismissCorrection={dismissLiveCorrection}
            onDismissSafetyNotice={dismissSafetyNotice}
          />
        )}

        {view === 'report' && (
          <PracticeReportScreen
            report={activeReport}
            isLoading={isGeneratingReport}
            errorMessage={reportError}
            onRetryReport={() => {
              if (lastEndedSessionRef.current) {
                void requestPracticeReport(lastEndedSessionRef.current);
              }
            }}
            onStartNewSession={() => setView('prep')}
            onRepeatScenario={handleStartCall}
          />
        )}

        {view === 'history' && (
          <HistoryScreen
            history={history}
            onOpenReport={(entry) => {
              setActiveReport(entry);
              setReportError(null);
              setIsGeneratingReport(false);
              setView('report');
            }}
            onDeleteReport={(id) => {
              setHistory(deletePracticeReport(id));
            }}
            onStartNewSession={() => setView('prep')}
          />
        )}
      </div>
    </div>
  );
}
