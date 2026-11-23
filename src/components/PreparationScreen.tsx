import type { ComponentType } from 'react';
import {
  Backpack,
  Briefcase,
  Building2,
  Clock,
  Coffee,
  Film,
  GraduationCap,
  HeartPulse,
  Home,
  IceCream,
  Mic,
  Palette,
  PawPrint,
  Plane,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  TrendingUp,
  Trophy,
  User,
  Users,
  UtensilsCrossed,
  Volume2,
  Wand2,
  Zap,
} from 'lucide-react';
import {
  CEFR_LEVELS,
  KIDS_AGE_BANDS,
  KIDS_ALLOWED_LEVELS,
  PRACTICE_DURATION_OPTIONS,
  getScenariosByAudience,
  getTutorsByAudience,
  shouldUseBilingualSpanish,
  type AudienceGroup,
  type CEFRLevel,
  type KidsAgeBand,
  type PracticeDurationOption,
  type ScenarioConfig,
  type ScenarioIconName,
  type SpanishSupportMode,
  type TutorProfile,
} from '../shared/tutorConfig';
import { TutorAvatar3D } from './TutorAvatar3D';
import { MiniAllenCharacterBadge } from './AllenCharacterSvg';

interface PreparationScreenProps {
  theme: 'light' | 'dark';
  audience: AudienceGroup;
  kidsAgeBand: KidsAgeBand;
  studentName: string;
  selectedScenario: ScenarioConfig;
  selectedLevel: CEFRLevel;
  selectedTutor: TutorProfile;
  spanishSupport: SpanishSupportMode;
  practiceDuration: PracticeDurationOption;
  onSelectAudience: (audience: AudienceGroup) => void;
  onSelectKidsAgeBand: (band: KidsAgeBand) => void;
  onChangeStudentName: (name: string) => void;
  onSelectScenario: (scenario: ScenarioConfig) => void;
  onSelectLevel: (level: CEFRLevel) => void;
  onSelectTutor: (tutor: TutorProfile) => void;
  onSelectSpanishSupport: (mode: SpanishSupportMode) => void;
  onSelectPracticeDuration: (duration: PracticeDurationOption) => void;
  onStartCall: () => void;
}

const SPANISH_SUPPORT_OPTIONS: Array<{ id: SpanishSupportMode; label: string }> = [
  { id: 'auto', label: 'Auto (A1–B1)' },
  { id: 'always', label: 'Siempre en español' },
  { id: 'english_only', label: 'Solo inglés' },
];

const SCENARIO_ICON_MAP: Record<ScenarioIconName, ComponentType<{ className?: string }>> = {
  coffee: Coffee,
  building: Building2,
  utensils: UtensilsCrossed,
  plane: Plane,
  briefcase: Briefcase,
  'shopping-bag': ShoppingBag,
  users: Users,
  'trending-up': TrendingUp,
  'graduation-cap': GraduationCap,
  film: Film,
  'heart-pulse': HeartPulse,
  trophy: Trophy,
  'paw-print': PawPrint,
  palette: Palette,
  home: Home,
  zap: Zap,
  'ice-cream': IceCream,
  backpack: Backpack,
  rocket: Rocket,
  sun: Sun,
  wand: Wand2,
};

export function PreparationScreen({
  theme,
  audience,
  kidsAgeBand,
  studentName,
  selectedScenario,
  selectedLevel,
  selectedTutor,
  spanishSupport,
  practiceDuration,
  onSelectAudience,
  onSelectKidsAgeBand,
  onChangeStudentName,
  onSelectScenario,
  onSelectLevel,
  onSelectTutor,
  onSelectSpanishSupport,
  onSelectPracticeDuration,
  onStartCall,
}: PreparationScreenProps) {
  const isKids = audience === 'kids';
  const visibleLevels = isKids
    ? CEFR_LEVELS.filter((c) => KIDS_ALLOWED_LEVELS.includes(c.level))
    : CEFR_LEVELS;
  const activeCefr = CEFR_LEVELS.find((c) => c.level === selectedLevel) ?? CEFR_LEVELS[0];
  const activeKidsBand =
    KIDS_AGE_BANDS.find((b) => b.id === kidsAgeBand) ?? KIDS_AGE_BANDS[0];
  const scenarios = getScenariosByAudience(audience);
  const availableTutors = getTutorsByAudience(audience);
  const isBilingualActive = shouldUseBilingualSpanish(selectedLevel, spanishSupport, audience);
  const cleanName = studentName.trim();

  return (
    <main className="mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Audience, Student Name, Level & Scenario Configuration */}
        <section className="lg:col-span-7 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.1rem] font-semibold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                {isKids
                  ? 'ALLEN Aula Kids · Inglés Americano (5–9 años)'
                  : 'Conversación de inglés americano en tiempo real'}
              </h1>
              <p className="mt-1.5 text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {isKids
                  ? 'Pensado para niños de Ecuador y Sudamérica que empiezan desde cero: aprende jugando en español y repitiendo palabras fáciles en inglés americano con su compañero Dot.'
                  : 'Habla con naturalidad en una videollamada interactiva con acento y expresiones de EE. UU., fondo animado según tu tema y guía de pronunciación paso a paso.'}
              </p>
            </div>
          </div>

          {/* Audience Switcher: Adults vs Kids (5-9 años) */}
          <div
            role="radiogroup"
            aria-label="Seleccionar programa por edad"
            className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-white dark:bg-[#0d1528] border border-slate-200 dark:border-slate-800/90 shadow-xs"
          >
            <button
              type="button"
              role="radio"
              aria-checked={!isKids}
              onClick={() => onSelectAudience('adults')}
              className={`min-h-[46px] px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                !isKids
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Adultos y Jóvenes</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isKids}
              onClick={() => onSelectAudience('kids')}
              className={`min-h-[46px] px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                isKids
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Kids (5–9 años)</span>
            </button>
          </div>

          {/* Personalized Student Name Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 rounded-xl bg-white dark:bg-[#0d1528] border border-slate-200 dark:border-slate-800/90 shadow-xs">
            <div className="min-w-0">
              <label
                htmlFor="student-name-input"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
              >
                <User
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isKids ? 'text-sky-600 dark:text-sky-400' : 'text-blue-600 dark:text-blue-400'
                  }`}
                  aria-hidden="true"
                />
                <span>{isKids ? 'Nombre del niño o niña' : 'Tu nombre'}</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {cleanName
                  ? `${selectedTutor.name} saludará personalmente a ${cleanName} al iniciar la clase.`
                  : `${selectedTutor.name} personalizará el saludo con tu nombre (opcional).`}
              </p>
            </div>
            <input
              id="student-name-input"
              type="text"
              value={studentName}
              onChange={(e) => onChangeStudentName(e.target.value)}
              maxLength={32}
              placeholder={isKids ? 'Ej. Sofi, Mateo...' : 'Ej. Camila, Andrés...'}
              autoComplete="given-name"
              className={`w-full sm:w-56 min-h-[40px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#070d1c] border border-slate-300 dark:border-slate-700/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:outline-none ${
                isKids
                  ? 'focus:border-sky-500 focus:ring-2 focus:ring-sky-400/25'
                  : 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25'
              }`}
            />
          </div>

          {/* Practice Time Goal Selector (Ask at start vs 5, 10, or 15 min) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 rounded-xl bg-white dark:bg-[#0d1528] border border-slate-200 dark:border-slate-800/90 shadow-xs">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Clock
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isKids ? 'text-sky-600 dark:text-sky-400' : 'text-blue-600 dark:text-blue-400'
                  }`}
                  aria-hidden="true"
                />
                <span>Tiempo de práctica</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {practiceDuration === 'ask'
                  ? `${selectedTutor.name} te preguntará al iniciar si tienes 5, 10 o 15 minutos.`
                  : `Meta de ${practiceDuration} minutos con aviso y cierre guiado al terminar.`}
              </p>
            </div>
            <div
              role="radiogroup"
              aria-label="Tiempo de práctica"
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#070d1c] border border-slate-200 dark:border-slate-800/90 shrink-0"
            >
              {PRACTICE_DURATION_OPTIONS.map((opt) => {
                const active = practiceDuration === opt.id;
                return (
                  <button
                    key={String(opt.id)}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onSelectPracticeDuration(opt.id)}
                    className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active
                        ? isKids
                          ? 'bg-sky-600 text-white'
                          : 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
                    }`}
                  >
                    {opt.shortLabelEs}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kids Age Band Selector (5–6, 7–8, 9 años) */}
          {isKids && (
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Edad del niño
                </h2>
                <span className="text-xs text-sky-700 dark:text-sky-300 font-medium">
                  {activeKidsBand.maxWordsLabelEs} · Pronunciación muy lenta palabra por palabra
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label="Seleccionar edad del niño"
                className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-white dark:bg-[#0d1528] border border-slate-200 dark:border-slate-800/90 shadow-xs"
              >
                {KIDS_AGE_BANDS.map((band) => {
                  const active = band.id === kidsAgeBand;
                  return (
                    <button
                      key={band.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onSelectKidsAgeBand(band.id)}
                      className={`min-h-[48px] px-3 py-2 rounded-lg text-left transition-colors flex flex-col justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        active
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-semibold leading-tight">{band.labelEs}</span>
                      <span
                        className={`text-[11px] leading-tight mt-0.5 ${
                          active ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {band.shortTagEs}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
                {activeKidsBand.descriptionEs}
              </p>
            </div>
          )}

          {/* CEFR Level Selector */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isKids ? 'Nivel Kids' : 'Nivel de inglés (MCER)'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isKids ? activeCefr.kidsLabelEs : activeCefr.labelEs} · {activeCefr.paceHint}
              </span>
            </div>
            <div
              role="radiogroup"
              aria-label="Seleccionar nivel de inglés MCER"
              className={`grid ${
                isKids ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-6'
              } gap-2 p-1.5 rounded-xl bg-white dark:bg-[#0d1528] border border-slate-200 dark:border-slate-800/90 shadow-xs`}
            >
              {visibleLevels.map((item) => {
                const isActive = item.level === selectedLevel;
                return (
                  <button
                    key={item.level}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => onSelectLevel(item.level)}
                    className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isActive
                        ? isKids
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                    }`}
                  >
                    {isKids
                      ? `${item.level} · ${item.kidsLabelEs.split('(')[0].trim()}`
                      : item.level}
                  </button>
                );
              })}
            </div>

            {/* Bilingual Spanish Support Toggle */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Apoyo en español y frases guiadas arriba del avatar
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {spanishSupport === 'always'
                    ? 'Activo en español: traduce lo que digas a inglés americano y guía tu pronunciación'
                    : spanishSupport === 'english_only'
                      ? 'Solo inglés americano: correcciones de pronunciación y fluidez en inglés'
                      : activeCefr.spanishSupportSummaryEs}
                </p>
              </div>
              <div
                role="radiogroup"
                aria-label="Modo de apoyo en español"
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-[#0d1528] border border-slate-200 dark:border-slate-800/90 shrink-0 shadow-xs"
              >
                {SPANISH_SUPPORT_OPTIONS.map((opt) => {
                  const active = spanishSupport === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onSelectSpanishSupport(opt.id)}
                      className={`min-h-[34px] px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        active
                          ? isKids
                            ? 'bg-sky-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scenarios Selection Grid with Distinct Topic Icons & Unique Backdrops (12 Adult / 9 Kids) */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-baseline justify-between gap-2 mb-2.5">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isKids ? 'Temas divertidos para Kids (5–9 años)' : 'Temas de conversación'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {scenarios.length} {isKids ? 'aventuras únicas' : 'escenarios únicos'} · subtemas nuevos cada día
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {scenarios.map((scenario) => {
                const isSelected = scenario.id === selectedScenario.id;
                const IconComponent = SCENARIO_ICON_MAP[scenario.iconName] ?? Coffee;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => onSelectScenario(scenario)}
                    aria-pressed={isSelected}
                    className={`text-left p-3 rounded-xl border transition-colors flex flex-col justify-between min-h-[92px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isSelected
                        ? isKids
                          ? 'bg-sky-50 border-sky-500 text-slate-900 dark:bg-[#0e263d] dark:border-sky-400 dark:text-white shadow-xs'
                          : 'bg-blue-50 border-blue-500 text-slate-900 dark:bg-[#12203f] dark:border-blue-500 dark:text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:bg-[#0c1324] dark:border-slate-800/90 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-[#101a30]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? isKids
                              ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </span>
                      <span className="font-display text-[14.5px] font-semibold leading-snug text-slate-900 dark:text-slate-50">
                        {scenario.title}
                      </span>
                    </div>
                    <span className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {scenario.subtitleEs}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Column: Live ALLEN Character Preview over Living Context Backdrop */}
        <section className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col bg-white dark:bg-[#0c1324] border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-sm">
          {/* Live Animated ALLEN Dot & Context Backdrop Preview Stage */}
          <div className="relative h-[300px] sm:h-[340px] lg:h-[360px] w-full bg-slate-900 dark:bg-[#080e1e] border-b border-slate-200 dark:border-slate-800/80">
            <TutorAvatar3D
              tutor={selectedTutor}
              avatarState="IDLE"
              expression="neutral"
              scenarioId={selectedScenario.id}
              theme={theme}
              compact
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent dark:from-[#0c1324] dark:via-[#0c1324]/60 dark:to-transparent" />
            <div className="absolute left-5 right-5 bottom-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-white leading-tight">
                  {selectedTutor.name}
                </p>
                <p className="text-xs text-slate-200 dark:text-slate-300 mt-0.5">
                  {selectedTutor.roleEs} · {selectedTutor.accentLabel}
                </p>
              </div>
              <span className="text-xs text-white bg-slate-950/75 border border-white/20 dark:bg-[#080e1e]/75 dark:border-slate-700/70 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Volume2 className="w-3.5 h-3.5 text-sky-400 dark:text-blue-400" aria-hidden="true" />
                Voz {selectedTutor.voiceName}
              </span>
            </div>
          </div>

          {/* ALLEN Character Selector + Readiness Summary + START CONVERSATION */}
          <div className="p-5 flex-1 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-baseline justify-between mb-2.5">
                <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isKids ? 'Compañero Dot Kids' : 'Profesor virtual (ALLEN Dot)'}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[230px]">
                  {selectedTutor.greetingTaglineEs}
                </span>
              </div>
              <div
                role="radiogroup"
                aria-label={
                  isKids ? 'Seleccionar compañero Dot Kids' : 'Seleccionar profesor virtual'
                }
                className={`grid ${
                  availableTutors.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
                } gap-2`}
              >
                {availableTutors.map((tutor) => {
                  const active = tutor.id === selectedTutor.id;
                  return (
                    <button
                      key={tutor.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onSelectTutor(tutor)}
                      className={`min-h-[48px] px-2.5 py-1.5 rounded-lg border text-left transition-colors flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        active
                          ? isKids
                            ? 'bg-sky-50 border-sky-500 text-slate-900 dark:bg-[#0e263d] dark:border-sky-400 dark:text-white'
                            : 'bg-blue-50 border-blue-500 text-slate-900 dark:bg-[#132242] dark:border-blue-500 dark:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-[#090f1d] dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <MiniAllenCharacterBadge
                        characterId={tutor.dotStyle.characterId}
                        className="w-7 h-8"
                      />
                      <span className="text-xs font-medium truncate">
                        {tutor.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3.5 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <span>Situación seleccionada</span>
                <span className="text-slate-900 dark:text-slate-200 font-medium truncate">
                  {selectedScenario.title} ·{' '}
                  {isKids ? `Kids ${kidsAgeBand} años · ${selectedLevel}` : selectedLevel}
                  {practiceDuration !== 'ask' ? ` · ${practiceDuration} min` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {isKids
                  ? `${selectedTutor.name} hablará muy despacio palabra por palabra (${activeKidsBand.maxWordsLabelEs})${
                      cleanName ? ` con ${cleanName}` : ''
                    }, mostrando cada palabra arriba del avatar y sumando puntos.`
                  : isBilingualActive
                    ? `Verás cada oración arriba del avatar para leer y pronunciar. Si repites este tema otro día, ${selectedTutor.name} abrirá con un subtema distinto.`
                    : `Al iniciar se solicitará acceso al micrófono, ${selectedTutor.name} abrirá con un subtema fresco de ${selectedScenario.title} y sumarás puntos por tu pronunciación.`}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300/90 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Espacio educativo seguro con filtro activo de normas comunitarias.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartCall}
              className={`w-full min-h-[52px] px-6 py-3.5 rounded-xl ${
                isKids
                  ? 'bg-sky-600 hover:bg-sky-500 active:bg-sky-700'
                  : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
              } text-white font-display font-semibold text-sm tracking-wide transition-colors inline-flex items-center justify-center gap-2.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0c1324]`}
            >
              <Mic className="w-4 h-4 shrink-0" aria-hidden="true" />
              START CONVERSATION
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
