import { ArrowRight, Star, Trash2 } from 'lucide-react';
import { formatCallDuration, type PracticeReport } from '../shared/tutorConfig';
import { computePracticeStats } from '../utils/practiceHistory';

interface HistoryScreenProps {
  history: PracticeReport[];
  onOpenReport: (report: PracticeReport) => void;
  onDeleteReport: (reportId: string) => void;
  onStartNewSession: () => void;
}

export function HistoryScreen({
  history,
  onOpenReport,
  onDeleteReport,
  onStartNewSession,
}: HistoryScreenProps) {
  const stats = computePracticeStats(history);

  return (
    <main className="mx-auto w-full max-w-[1160px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/90">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Historial de prácticas
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Revisa tu evolución oral, vocabulario acumulado e informes de conversaciones anteriores.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartNewSession}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          Nueva conversación
        </button>
      </div>

      {/* Aggregate Progress Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">Sesiones completadas</p>
          <p className="mt-2 font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            {stats.totalSessions}
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">Minutos de práctica</p>
          <p className="mt-2 font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            {stats.totalMinutes}
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-amber-300 dark:border-amber-500/30 p-5 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">Puntos acumulados</p>
          <p className="mt-2 font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-amber-600 dark:text-amber-300 inline-flex items-center gap-1.5">
            <Star
              className="w-5 h-5 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400 shrink-0"
              aria-hidden="true"
            />
            <span>{stats.totalPronunciationPoints}</span>
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">Comprensión media</p>
          <p className="mt-2 font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-blue-600 dark:text-blue-400">
            {stats.averageComprehension}%
          </p>
        </div>
        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">Fluidez media</p>
          <p className="mt-2 font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-sky-600 dark:text-sky-400">
            {stats.averageFluency}%
          </p>
        </div>
      </section>

      {/* Session List */}
      {history.length === 0 ? (
        <section className="rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-10 text-center shadow-xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Aún no tienes llamadas registradas
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Inicia tu primera conversación por voz con un profesor virtual y al finalizar recibirás
            tu informe detallado aquí.
          </p>
          <button
            type="button"
            onClick={onStartNewSession}
            className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Elegir escenario
          </button>
        </section>
      ) : (
        <section className="rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800/80 shadow-xs">
          {history.map((entry) => {
            const dateStr = new Intl.DateTimeFormat('es-ES', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(entry.createdAtIso));

            return (
              <div
                key={entry.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-[#101a30]/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-slate-900 dark:text-white truncate">
                    {entry.scenarioTitle}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {dateStr} · {entry.tutorName} · Nivel {entry.cefrLevel} ·{' '}
                    <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {formatCallDuration(entry.durationSeconds)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    {(entry.pronunciationPoints ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-300 font-mono tabular-nums font-semibold">
                        <Star
                          className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400"
                          aria-hidden="true"
                        />
                        {entry.pronunciationPoints} pts
                      </span>
                    )}
                    <span>
                      Comprensión{' '}
                      <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                        {entry.comprehensionScore}%
                      </strong>
                    </span>
                    <span>
                      Fluidez{' '}
                      <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                        {entry.fluencyScore}%
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenReport(entry)}
                      aria-label={`Ver informe de ${entry.scenarioTitle} del ${dateStr}`}
                      className="min-h-[40px] px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white dark:bg-[#14203b] dark:hover:bg-blue-600 dark:text-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <span>Ver informe</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteReport(entry.id)}
                      aria-label={`Eliminar informe de ${entry.scenarioTitle} del ${dateStr}`}
                      className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-[#0d1528] dark:hover:bg-rose-950/70 dark:text-slate-400 dark:hover:text-rose-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
