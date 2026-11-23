import { AlertCircle, ArrowLeft, Loader2, RefreshCw, RotateCcw, Star } from 'lucide-react';
import { formatCallDuration, type PracticeReport } from '../shared/tutorConfig';

interface PracticeReportScreenProps {
  report: PracticeReport | null;
  isLoading: boolean;
  errorMessage: string | null;
  onRetryReport: () => void;
  onStartNewSession: () => void;
  onRepeatScenario: () => void;
}

export function PracticeReportScreen({
  report,
  isLoading,
  errorMessage,
  onRetryReport,
  onStartNewSession,
  onRepeatScenario,
}: PracticeReportScreenProps) {
  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-16 text-center">
        <div className="rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center gap-4 shadow-sm">
          <Loader2 className="w-9 h-9 text-blue-600 dark:text-blue-400 animate-spin" aria-hidden="true" />
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
            Generando tu informe de práctica
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
            Estamos analizando tu fluidez, comprensión, vocabulario y precisión gramatical de la
            conversación recién finalizada.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !report) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-16">
        <div className="rounded-2xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-start gap-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              No se pudo generar el informe
            </h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {errorMessage || 'Ocurrió un problema inesperado al evaluar la sesión.'}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRetryReport}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Reintentar informe
            </button>
            <button
              type="button"
              onClick={onStartNewSession}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Volver a escenarios
            </button>
          </div>
        </div>
      </main>
    );
  }

  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(report.createdAtIso));

  return (
    <main className="mx-auto w-full max-w-[1160px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/90">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Informe de práctica oral · {formattedDate}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            {report.scenarioTitle}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Profesor {report.tutorName} · Nivel {report.cefrLevel} · Duración{' '}
            <span className="font-mono tabular-nums text-slate-900 dark:text-slate-200">
              {formatCallDuration(report.durationSeconds)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onRepeatScenario}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 dark:bg-[#0d1528] dark:hover:bg-[#14203b] dark:border-slate-700 dark:text-slate-100 text-sm font-medium inline-flex items-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Repetir escenario
          </button>
          <button
            type="button"
            onClick={onStartNewSession}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Nueva conversación
          </button>
        </div>
      </div>

      {/* Metrics Strip: Duration, Pronunciation Points, Comprehension, Fluency */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">Duración de la conversación</p>
          <p className="mt-2 font-mono tabular-nums text-3xl font-semibold text-slate-900 dark:text-white">
            {formatCallDuration(report.durationSeconds)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {report.audience === 'kids' && report.kidsAgeBand
              ? `Kids ${report.kidsAgeBand} años · Nivel ${report.cefrLevel}`
              : `Nivel practicado ${report.cefrLevel}`}
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-amber-300 dark:border-amber-500/30 p-5 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400">Puntos de pronunciación</p>
          <p className="mt-2 font-mono tabular-nums text-3xl font-semibold text-amber-600 dark:text-amber-300 inline-flex items-center gap-2">
            <Star
              className="w-6 h-6 text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400 shrink-0"
              aria-hidden="true"
            />
            <span>{report.pronunciationPoints ?? 0}</span>
          </p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Sumados por buena pronunciación en vivo
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-baseline justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">Comprensión estimada</p>
            <span className="font-mono tabular-nums text-lg font-semibold text-blue-600 dark:text-blue-400">
              {report.comprehensionScore}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
              style={{ width: `${report.comprehensionScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Seguimiento y respuesta contextual
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-baseline justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">Fluidez estimada</p>
            <span className="font-mono tabular-nums text-lg font-semibold text-sky-600 dark:text-sky-400">
              {report.fluencyScore}%
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 dark:bg-sky-400 transition-all"
              style={{ width: `${report.fluencyScore}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Espontaneidad y ritmo al hablar
          </p>
        </div>
      </section>

      {/* Summary */}
      {report.summaryEs && (
        <section className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Valoración general
          </h2>
          <p className="mt-2 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
            {report.summaryEs}
          </p>
        </section>
      )}

      {/* Vocabulary & Grammar 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Vocabulario aprendido
          </h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800/80">
            {report.vocabularyLearned.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-3">
                No se registró vocabulario destacado en esta sesión.
              </p>
            ) : (
              report.vocabularyLearned.map((item, idx) => (
                <div key={`${item.term}-${idx}`} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold text-[15px] text-blue-700 dark:text-blue-300">
                      {item.term}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.meaningEs}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
                    “{item.example}”
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Errores gramaticales y correcciones
          </h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800/80">
            {report.grammarErrors.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-3">
                Excelente precisión: no se detectaron errores gramaticales relevantes.
              </p>
            ) : (
              report.grammarErrors.map((err, idx) => (
                <div key={`err-${idx}`} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <p className="text-xs text-rose-600 dark:text-rose-300/90">
                    Original: <span className="line-through">{err.studentSaid}</span>
                  </p>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Natural: {err.correction}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {err.explanationEs}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recommendations & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Recomendaciones
          </h2>
          <ol className="mt-4 space-y-3">
            {report.recommendationsEs.map((rec, idx) => (
              <li
                key={`rec-${idx}`}
                className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="font-mono tabular-nums text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  0{idx + 1}.
                </span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-xl bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            Actividades recomendadas para mejorar
          </h2>
          <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800/80">
            {report.recommendedActivities.map((act, idx) => (
              <div key={`act-${idx}`} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {act.title}
                  </h3>
                  <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    {act.durationMinutes} min
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {act.descriptionEs}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
