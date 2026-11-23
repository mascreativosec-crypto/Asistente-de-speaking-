import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import {
  ActivityHandling,
  Behavior,
  EndSensitivity,
  FunctionResponseScheduling,
  GoogleGenAI,
  Modality,
  StartSensitivity,
  ThinkingLevel,
  Type,
} from '@google/genai';
import type { FunctionDeclaration, LiveServerMessage } from '@google/genai';
import {
  buildSafetyRedirectPrompt,
  buildSilenceNudgePrompt,
  buildTimeWrapUpPrompt,
  buildTutorSystemInstruction,
  detectSensitiveContent,
  getCefrDescriptor,
  getScenarioById,
  getScenarioSubtopicById,
  getTutorById,
  inferExpressionFromTranscript,
  isUsableTranscript,
  looksLikePronunciationPraise,
  looksLikeSpokenCorrection,
  normalizeLiveCorrection,
  normalizePracticeDurationMinutes,
  normalizePronunciationAward,
  parseJsonObjectSafely,
  pickScenarioOpeningStarter,
  sanitizeStudentName,
  shouldUseBilingualSpanish,
} from './src/shared/tutorConfig.ts';
import type {
  AudienceGroup,
  CEFRLevel,
  KidsAgeBand,
  LiveCorrection,
  PracticeDurationOption,
  PracticeReport,
  ScenarioConfig,
  SpanishSupportMode,
  TranscriptTurn,
} from './src/shared/tutorConfig.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT ?? 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

function createGeminiClient(apiVersion?: string): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'No se encontró la clave GEMINI_API_KEY en el servidor. Configúrala en el panel de secretos para iniciar la conversación en vivo.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    ...(apiVersion ? { apiVersion } : {}),
    httpOptions: {
      ...(apiVersion ? { apiVersion } : {}),
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseCefrLevel(value: unknown): CEFRLevel {
  const allowed: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  if (typeof value === 'string' && allowed.includes(value as CEFRLevel)) {
    return value as CEFRLevel;
  }
  return 'B1';
}

function parseSpanishSupport(value: unknown): SpanishSupportMode {
  if (value === 'always' || value === 'english_only' || value === 'auto') {
    return value;
  }
  return 'auto';
}

function parseAudienceGroup(value: unknown, fallback: AudienceGroup = 'adults'): AudienceGroup {
  if (value === 'kids' || value === 'adults') {
    return value;
  }
  return fallback;
}

function parseKidsAgeBand(value: unknown): KidsAgeBand {
  if (value === '5-6' || value === '7-8' || value === '9') {
    return value;
  }
  return '5-6';
}

function parsePracticeDurationOption(value: unknown): PracticeDurationOption {
  if (value === 5 || value === '5') return 5;
  if (value === 10 || value === '10') return 10;
  if (value === 15 || value === '15') return 15;
  return 'ask';
}

function sendJson(ws: WebSocket, payload: Record<string, unknown>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

const displayCorrectionTool: FunctionDeclaration = {
  name: 'display_correction',
  behavior: Behavior.NON_BLOCKING,
  description:
    'Silently displays a floating card above the tutor avatar whenever you (1) correct a student pronunciation, grammar, or phrasing mistake, (2) teach a beginner or child an American English word/sentence to read and repeat aloud, or (3) mirror what the student said in Spanish into natural American English. Never pause or repeat your sentence because of calling this tool.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description:
          'Card type: "practice" (new phrase for beginner/child to read & repeat or mirrored from Spanish), "pronunciation", "grammar", or "expression".',
      },
      original: {
        type: Type.STRING,
        description:
          'Exact word/sentence the student said (in English or Spanish), or empty string if introducing a brand-new practice sentence.',
      },
      correction: {
        type: Type.STRING,
        description:
          'Exact target American English word or sentence for the student to read and pronounce aloud.',
      },
      pronunciationGuide: {
        type: Type.STRING,
        description:
          'Spanish-friendly phonetic pronunciation guide highlighting the stressed syllable (e.g. "KÁMF-ter-bol" or "ai WANT a KÓ-fi").',
      },
      tipEs: {
        type: Type.STRING,
        description:
          'Clear, prominent Spanish meaning (shown in LARGE letters above the avatar!), ideally formatted as \'"<word>" significa <traducción>\' or \'Significa: <traducción exacta en español>\' (max 14 words).',
      },
    },
    required: ['correction', 'tipEs'],
  },
};

const awardPronunciationPointsTool: FunctionDeclaration = {
  name: 'award_pronunciation_points',
  behavior: Behavior.NON_BLOCKING,
  description:
    'Silently awards real-time pronunciation points to the student (both Adults and Kids) EVERY TIME they pronounce an English word or phrase well after speaking. Never call before the student speaks or when pronunciation was incorrect or unclear.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      phrase: {
        type: Type.STRING,
        description: 'The exact English word or phrase the student pronounced well.',
      },
      points: {
        type: Type.INTEGER,
        description:
          'Points earned: 10 for good pronunciation, 15 for very clear natural American pronunciation, or 20 for nailing a challenging word/phrase after practicing.',
      },
      praiseEs: {
        type: Type.STRING,
        description:
          'Short joyful 1-line Spanish praise (e.g. "¡Excelente pronunciación!" or "¡Súper bien!"). Avoid repeating the student’s name on every award.',
      },
    },
    required: ['phrase', 'points', 'praiseEs'],
  },
};

const setPracticeDurationTool: FunctionDeclaration = {
  name: 'set_practice_duration',
  behavior: Behavior.NON_BLOCKING,
  description:
    'Silently sets the active live practice session timer goal (5, 10, or 15 minutes) as soon as the student tells you how much time they have to practice today.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      durationMinutes: {
        type: Type.INTEGER,
        description: 'Selected practice duration in minutes: 5, 10, or 15.',
      },
    },
    required: ['durationMinutes'],
  },
};

const extendPracticeSessionTool: FunctionDeclaration = {
  name: 'extend_practice_session',
  behavior: Behavior.NON_BLOCKING,
  description:
    'Silently extends the active practice timer by extra minutes (default 5) whenever the time goal was reached and the student verbally says they would like to continue practicing a bit longer.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      extraMinutes: {
        type: Type.INTEGER,
        description: 'Additional minutes to add to the session goal (usually 5).',
      },
    },
    required: ['extraMinutes'],
  },
};

function formatFriendlyGeminiError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (/PERMISSION_DENIED|API_KEY_INVALID|API key not valid/i.test(raw)) {
    return 'La clave API de Gemini no es válida o no tiene permisos. Verifica tu clave en Settings > Secrets.';
  }
  if (/RESOURCE_EXHAUSTED|429/i.test(raw)) {
    return 'Se superó temporalmente el límite de solicitudes de Gemini. Espera unos segundos y vuelve a intentarlo.';
  }
  if (/503|UNAVAILABLE|high demand|overloaded/i.test(raw)) {
    return 'El servicio de evaluación de Gemini tiene alta demanda en este momento. Pulsa «Reintentar informe» en unos segundos.';
  }
  if (/NOT_FOUND|404/i.test(raw)) {
    return 'No se encontró el modelo de evaluación configurado. Intenta nuevamente en unos segundos.';
  }
  return raw || fallback;
}

function isRetryableModelError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (/PERMISSION_DENIED|API_KEY_INVALID|API key not valid/i.test(raw)) {
    return false;
  }
  return /503|500|429|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|overloaded|timeout|ECONNRESET|fetch failed/i.test(
    raw
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Tiempo de espera agotado (${label})`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function generateStructuredWithFallback(
  ai: GoogleGenAI,
  contents: string,
  config: {
    systemInstruction?: string;
    responseMimeType: string;
    responseSchema: Record<string, unknown>;
  }
) {
  const attempts: Array<{
    model: string;
    thinkingLevel?: ThinkingLevel;
    timeoutMs: number;
    delayBeforeMs?: number;
  }> = [
    { model: 'gemini-3.1-flash-lite', timeoutMs: 10000 },
    { model: 'gemini-4-hydrogen', thinkingLevel: ThinkingLevel.LOW, timeoutMs: 12000, delayBeforeMs: 250 },
    { model: 'gemini-3.1-flash-lite', timeoutMs: 12000, delayBeforeMs: 700 },
  ];

  let lastErr: unknown = null;
  for (const attempt of attempts) {
    if (attempt.delayBeforeMs) {
      await new Promise((r) => setTimeout(r, attempt.delayBeforeMs));
    }
    try {
      return await withTimeout(
        ai.models.generateContent({
          model: attempt.model,
          contents,
          config: {
            ...config,
            ...(attempt.thinkingLevel
              ? { thinkingConfig: { thinkingLevel: attempt.thinkingLevel } }
              : {}),
          },
        }),
        attempt.timeoutMs,
        attempt.model
      );
    } catch (err) {
      lastErr = err;
      console.warn(
        `[Gemini] ${attempt.model} attempt failed:`,
        err instanceof Error ? err.message : err
      );
      if (!isRetryableModelError(err) && !/Tiempo de espera agotado/i.test(String(err))) {
        throw err;
      }
    }
  }
  throw lastErr ?? new Error('No se pudo completar la generación con Gemini.');
}

async function extractLiveCorrectionFromTurn(
  studentText: string,
  tutorText: string,
  cefrLevel: CEFRLevel,
  audience: AudienceGroup = 'adults'
): Promise<LiveCorrection | null> {
  try {
    const isBasicVisualLevel = audience === 'kids' || cefrLevel === 'A1' || cefrLevel === 'A2';
    const ai = createGeminiClient('v1beta');
    const response = await generateStructuredWithFallback(
      ai,
      [
        `Nivel del estudiante: ${cefrLevel} (${audience === 'kids' ? 'Kids 5-9 años' : 'Adultos'})`,
        studentText ? `Estudiante dijo: "${studentText}"` : 'Estudiante habló o escuchó este turno del profesor.',
        `Profesor dijo: "${tutorText}"`,
        '',
        isBasicVisualLevel
          ? 'IMPORTANTE (Nivel básico A1/A2/Kids): Extrae SIEMPRE (hasCorrection: true) la palabra, oración o pregunta en inglés que el profesor dijo o le pidió practicar/responder al estudiante, para que el estudiante pueda leerla y pronunciarla en voz alta encima del avatar.'
          : 'Si el profesor (a) corrigió una palabra, frase o pronunciación del estudiante, O (b) le mostró al estudiante cómo decir una frase en inglés ("puedes decir...", "se dice así...", "repite conmigo...", "in English you say...") para que la lea y la pronuncie en voz alta: extrae la tarjeta concisa en JSON con hasCorrection: true.',
        'Usa category: "practice" cuando sea la oración/pregunta o palabra en inglés para leer y practicar (o traducción del español al inglés), "pronunciation" para corrección de pronunciación, "grammar" para gramática o "expression" para expresión más natural.',
        'Incluye siempre en pronunciationGuide una guía fonética sencilla en español de inglés americano (ej. "ai laik PÍT-sa" o "kud ai jav a TEI-bol for tu, plis").',
        audience === 'kids'
          ? 'En tipEs escribe el significado clarísimo en español usando el formato `"<palabra>" significa <traducción>` o `Significa: <traducción exacta en español>`.'
          : 'En tipEs escribe el significado exacto en español usando el formato `"<palabra/frase>" significa <traducción>` o `Significa: <traducción clara>` (máximo 14 palabras) para que se muestre en letras grandes.',
        isBasicVisualLevel
          ? 'Solo devuelve hasCorrection: false si el turno del profesor NO contiene absolutamente ninguna palabra o frase en inglés (p. ej. solo preguntó cuántos minutos tiene en español).'
          : 'Si NO hubo corrección ni frase de práctica para repetir, devuelve hasCorrection: false.',
      ].join('\n'),
      {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasCorrection: { type: Type.BOOLEAN },
            category: { type: Type.STRING },
            original: { type: Type.STRING },
            correction: { type: Type.STRING },
            pronunciationGuide: { type: Type.STRING },
            tipEs: { type: Type.STRING },
          },
          required: ['hasCorrection'],
        },
      }
    );
    const parsed = parseJsonObjectSafely(response.text ?? '{}');
    if (parsed.hasCorrection !== true) return null;
    return normalizeLiveCorrection(parsed);
  } catch {
    return null;
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, mode: IS_PROD ? 'production' : 'development' });
  });

  app.post('/api/report', async (req, res) => {
    try {
      const body = req.body as {
        scenarioId?: string;
        audience?: string;
        kidsAgeBand?: string;
        studentName?: string;
        cefrLevel?: string;
        tutorId?: string;
        durationSeconds?: number;
        pronunciationPoints?: number;
        transcript?: TranscriptTurn[];
        corrections?: LiveCorrection[];
      };

      const scenario = getScenarioById(String(body.scenarioId ?? 'everyday'));
      const audience = parseAudienceGroup(body.audience, scenario.audience);
      const kidsAgeBand = audience === 'kids' ? parseKidsAgeBand(body.kidsAgeBand) : undefined;
      const studentName = sanitizeStudentName(body.studentName);
      const tutor = getTutorById(String(body.tutorId ?? 'daniel'));
      const cefrLevel = parseCefrLevel(body.cefrLevel);
      const cefr = getCefrDescriptor(cefrLevel);
      const durationSeconds = Math.max(0, Math.round(Number(body.durationSeconds ?? 0)));
      const pronunciationPoints = Math.max(0, Math.round(Number(body.pronunciationPoints ?? 0)));
      const transcript = Array.isArray(body.transcript) ? body.transcript : [];
      const liveCorrections = Array.isArray(body.corrections) ? body.corrections : [];

      const ai = createGeminiClient('v1beta');

      const formattedTranscript =
        transcript.length > 0
          ? transcript
              .map((t) => `${t.speaker === 'student' ? 'STUDENT' : 'TUTOR'}: ${t.text}`)
              .join('\n')
          : '(La llamada fue muy breve y no se registró suficiente diálogo hablado del estudiante.)';

      const formattedCorrections =
        liveCorrections.length > 0
          ? liveCorrections
              .map(
                (c) =>
                  `- [${c.category}] Original: "${c.original}" -> Correcto: "${c.correction}"${
                    c.pronunciationGuide ? ` (Pronunciación: ${c.pronunciationGuide})` : ''
                  } | Nota: ${c.tipEs}`
              )
              .join('\n')
          : '';

      const prompt = [
        `Analiza la siguiente práctica oral de inglés americano en tiempo real de ALLEN Aula y genera un informe pedagógico en JSON.`,
        `Grupo de edad: ${audience === 'kids' ? 'Kids (niños de 5 a 9 años — redacta un informe alegre, claro y útil para padres y niños)' : 'Adultos y jóvenes'}`,
        ...(studentName ? [`Nombre del estudiante: ${studentName}`] : []),
        `Escenario: ${scenario.title} (${scenario.subtitleEs})`,
        `Nivel objetivo MCER: ${cefr.level} (${audience === 'kids' ? cefr.kidsLabelEs : cefr.labelEs})`,
        `Profesor virtual: ${tutor.name}`,
        `Duración total: ${durationSeconds} segundos`,
        '',
        'Transcripción de la conversación por voz:',
        formattedTranscript,
        ...(formattedCorrections
          ? ['', 'Correcciones detectadas en vivo durante la llamada:', formattedCorrections]
          : []),
        '',
        'Instrucciones para el informe:',
        '- Redacta explicaciones, resúmenes, recomendaciones y descripciones en español claro y motivador.',
        '- En vocabularyLearned incluye 4 a 6 palabras o expresiones útiles en inglés de la conversación (o clave para este escenario y nivel si la charla fue muy corta) con significado en español y frase de ejemplo natural en inglés.',
        '- En grammarErrors identifica errores reales de gramática o pronunciación/expresión detectados en lo que dijo el estudiante (incluyendo las correcciones en vivo si las hubo), con la frase dicha, la corrección natural y una explicación breve en español indicando dónde estuvo el error y cómo decirlo/pronunciarlo mejor. Si no hubo errores o el estudiante habló muy poco, incluye 1 o 2 áreas clave típicas del escenario marcando claramente que son puntos preventivos.',
        '- Estima comprehensionScore y fluencyScore entre 0 y 100 de forma honesta y pedagógica según lo demostrado (si no hubo intervenciones del estudiante, usa valores bajos realistas e indícalo en el resumen).',
        '- En recommendationsEs da 3 a 4 consejos concretos y accionables.',
        '- En recommendedActivities sugiere 3 actividades breves de práctica oral o escucha adaptadas al nivel MCER.',
      ].join('\n');

      const response = await generateStructuredWithFallback(ai, prompt, {
        systemInstruction:
          'Eres un evaluador académico senior de enseñanza de inglés (MCER) para ALLEN Aula. Responde únicamente con JSON válido acorde al esquema solicitado.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comprehensionScore: {
              type: Type.INTEGER,
              description: 'Puntuación estimada de comprensión auditiva de 0 a 100.',
            },
            fluencyScore: {
              type: Type.INTEGER,
              description: 'Puntuación estimada de fluidez oral de 0 a 100.',
            },
            summaryEs: {
              type: Type.STRING,
              description: 'Resumen pedagógico breve y motivador del desempeño en español.',
            },
            vocabularyLearned: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  meaningEs: { type: Type.STRING },
                  example: { type: Type.STRING },
                },
                required: ['term', 'meaningEs', 'example'],
              },
            },
            grammarErrors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  studentSaid: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  explanationEs: { type: Type.STRING },
                },
                required: ['studentSaid', 'correction', 'explanationEs'],
              },
            },
            recommendationsEs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedActivities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  descriptionEs: { type: Type.STRING },
                  durationMinutes: { type: Type.INTEGER },
                },
                required: ['title', 'descriptionEs', 'durationMinutes'],
              },
            },
          },
          required: [
            'comprehensionScore',
            'fluencyScore',
            'summaryEs',
            'vocabularyLearned',
            'grammarErrors',
            'recommendationsEs',
            'recommendedActivities',
          ],
        },
      });

      const rawText = (response.text ?? '').trim();
      const parsed = parseJsonObjectSafely(rawText) as Partial<
        Omit<
          PracticeReport,
          | 'id'
          | 'createdAtIso'
          | 'scenarioId'
          | 'scenarioTitle'
          | 'tutorId'
          | 'tutorName'
          | 'cefrLevel'
          | 'durationSeconds'
        >
      >;

      const report: PracticeReport = {
        id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAtIso: new Date().toISOString(),
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        audience,
        ...(kidsAgeBand ? { kidsAgeBand } : {}),
        ...(studentName ? { studentName } : {}),
        tutorId: tutor.id,
        tutorName: tutor.name,
        cefrLevel,
        durationSeconds,
        pronunciationPoints,
        comprehensionScore: Math.min(100, Math.max(0, Math.round(Number(parsed.comprehensionScore ?? 0)))),
        fluencyScore: Math.min(100, Math.max(0, Math.round(Number(parsed.fluencyScore ?? 0)))),
        summaryEs: typeof parsed.summaryEs === 'string' ? parsed.summaryEs : '',
        vocabularyLearned: Array.isArray(parsed.vocabularyLearned) ? parsed.vocabularyLearned : [],
        grammarErrors: Array.isArray(parsed.grammarErrors) ? parsed.grammarErrors : [],
        recommendationsEs: Array.isArray(parsed.recommendationsEs) ? parsed.recommendationsEs : [],
        recommendedActivities: Array.isArray(parsed.recommendedActivities)
          ? parsed.recommendedActivities
          : [],
      };

      res.json({ report });
    } catch (err) {
      const message = formatFriendlyGeminiError(
        err,
        'Error inesperado al generar el informe de práctica.'
      );
      console.error('[POST /api/report] Error:', err instanceof Error ? err.message : err);
      res.status(500).json({ error: message });
    }
  });

  const server = http.createServer(app);

  // Real-time bidirectional audio bridge to Gemini Live API
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', (clientWs) => {
    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    let isClosing = false;
    let outputTranscriptBuffer = '';
    let inputTranscriptBuffer = '';
    let lastStudentTurnText = '';
    let correctionEmittedThisTurn = false;
    let pointsAwardedThisTurn = false;
    let spokeAudioThisTurn = false;
    let pendingToolSpeechTurn = false;
    let studentSpokeBeforeThisTurn = false;
    let safetyTriggeredThisTurn = false;
    let activeCefrLevel: CEFRLevel = 'B1';
    let activeSpanishSupport: SpanishSupportMode = 'auto';
    let activeAudience: AudienceGroup = 'adults';
    let activeKidsAgeBand: KidsAgeBand = '5-6';
    let activeStudentName = '';
    let activeScenario: ScenarioConfig | null = null;
    let activeTargetDurationMinutes: number | null = null;
    let sessionStartedAtMs = Date.now();
    let wrapUpFinishedSent = false;
    let durationCheckTimer: ReturnType<typeof setInterval> | null = null;

    // Server-side half-duplex guard: ignore stray incoming audio while tutor turn is in flight
    let tutorTurnActive = false;
    let turnUnlockFallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const clearTurnUnlockFallback = () => {
      if (turnUnlockFallbackTimer) {
        clearTimeout(turnUnlockFallbackTimer);
        turnUnlockFallbackTimer = null;
      }
    };

    const startDurationWatcher = (minutes: number) => {
      activeTargetDurationMinutes = Math.max(5, Math.min(60, Math.round(minutes)));
      wrapUpFinishedSent = false;
      sendJson(clientWs, { type: 'sessionDuration', durationMinutes: activeTargetDurationMinutes });
      if (durationCheckTimer) {
        clearInterval(durationCheckTimer);
      }
      durationCheckTimer = setInterval(() => {
        if (isClosing || !liveSession || !activeScenario || !activeTargetDurationMinutes) return;
        const elapsedSec = Math.floor((Date.now() - sessionStartedAtMs) / 1000);
        const targetSec = activeTargetDurationMinutes * 60;

        // Wait until the FULL target duration (e.g. full 5:00, 10:00, 15:00) is reached—never wrap up early!
        if (!wrapUpFinishedSent && elapsedSec >= targetSec && !tutorTurnActive) {
          wrapUpFinishedSent = true;
          tutorTurnActive = true;
          sendJson(clientWs, {
            type: 'timeGoalReached',
            durationMinutes: activeTargetDurationMinutes,
          });
          try {
            liveSession.sendClientContent({
              turns: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: buildTimeWrapUpPrompt(
                        activeScenario,
                        activeAudience,
                        activeCefrLevel,
                        'finished',
                        activeTargetDurationMinutes
                      ),
                    },
                  ],
                },
              ],
              turnComplete: true,
            });
          } catch {
            // ignore if closed
          }
        }
      }, 5000);
    };

    const cleanupSession = () => {
      if (isClosing) return;
      isClosing = true;
      clearTurnUnlockFallback();
      if (durationCheckTimer) {
        clearInterval(durationCheckTimer);
        durationCheckTimer = null;
      }
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // ignore close errors
        }
        liveSession = null;
      }
    };

    clientWs.on('message', async (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString()) as {
          type?: string;
          scenarioId?: string;
          subtopicId?: string;
          previousSubtopicTitles?: string[];
          audience?: string;
          kidsAgeBand?: string;
          studentName?: string;
          practiceDuration?: string | number;
          cefrLevel?: string;
          tutorId?: string;
          spanishSupport?: string;
          data?: string;
          isReconnect?: boolean;
          attempt?: number;
        };

        if (msg.type === 'init') {
          if (liveSession) return;
          const scenario = getScenarioById(String(msg.scenarioId ?? 'everyday'));
          const activeSubtopic = getScenarioSubtopicById(scenario, msg.subtopicId);
          const previousSubtopicTitles = Array.isArray(msg.previousSubtopicTitles)
            ? msg.previousSubtopicTitles
                .filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
                .slice(0, 6)
            : [];
          const audience = parseAudienceGroup(msg.audience, scenario.audience);
          const kidsAgeBand = parseKidsAgeBand(msg.kidsAgeBand);
          const studentName = sanitizeStudentName(msg.studentName);
          const practiceDuration = parsePracticeDurationOption(msg.practiceDuration);
          const tutor = getTutorById(String(msg.tutorId ?? 'daniel'));
          const cefrLevel = parseCefrLevel(msg.cefrLevel);
          const spanishSupport = parseSpanishSupport(msg.spanishSupport);
          activeScenario = scenario;
          activeAudience = audience;
          activeKidsAgeBand = kidsAgeBand;
          activeStudentName = studentName;
          activeCefrLevel = cefrLevel;
          activeSpanishSupport = spanishSupport;
          sessionStartedAtMs = Date.now();
          tutorTurnActive = true;
          const systemInstruction = buildTutorSystemInstruction(
            scenario,
            cefrLevel,
            tutor,
            spanishSupport,
            audience,
            {
              kidsAgeBand,
              studentName,
              practiceDuration,
              subtopicId: activeSubtopic.id,
              previousSubtopicTitles,
            }
          );

          let ai: GoogleGenAI;
          try {
            ai = createGeminiClient('v1beta');
          } catch (keyErr) {
            sendJson(clientWs, {
              type: 'error',
              code: 'MISSING_API_KEY',
              message:
                keyErr instanceof Error
                  ? keyErr.message
                  : 'Falta configurar GEMINI_API_KEY en el servidor.',
            });
            clientWs.close();
            return;
          }

          sendJson(clientWs, { type: 'status', status: 'connecting' });

          // Patient VAD + NO_INTERRUPTION so the AI finishes every turn cleanly without voice shifts or cutoffs
          const isPatientLearner = audience === 'kids' || cefrLevel === 'A1' || cefrLevel === 'A2';

          liveSession = await ai.live.connect({
            model: 'gemini-3.8-live',
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: tutor.voiceName,
                  },
                },
              },
              realtimeInputConfig: {
                activityHandling: ActivityHandling.NO_INTERRUPTION,
                automaticActivityDetection: {
                  disabled: false,
                  startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
                  endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
                  prefixPaddingMs: isPatientLearner ? 200 : 160,
                  silenceDurationMs: isPatientLearner ? 1250 : 950,
                },
              },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              tools: [
                {
                  functionDeclarations: [
                    displayCorrectionTool,
                    awardPronunciationPointsTool,
                    setPracticeDurationTool,
                    extendPracticeSessionTool,
                  ],
                },
              ],
              systemInstruction,
            },
            callbacks: {
              onopen: () => {
                sendJson(clientWs, {
                  type: 'ready',
                  tutorName: tutor.name,
                  scenarioTitle: scenario.title,
                  cefrLevel,
                });
                if (practiceDuration !== 'ask') {
                  startDurationWatcher(practiceDuration);
                }
              },
              onmessage: (message: LiveServerMessage) => {
                // Handle live visual correction, points & duration tool calls (non-blocking):
                // - If the tutor has NOT spoken yet in this turn, schedule WHEN_IDLE so it speaks immediately.
                // - If the tutor ALREADY spoke in this turn, schedule SILENT so it never repeats itself.
                const functionCalls = message.toolCall?.functionCalls ?? [];
                if (functionCalls.length > 0 && liveSession) {
                  const responseScheduling = spokeAudioThisTurn
                    ? FunctionResponseScheduling.SILENT
                    : FunctionResponseScheduling.WHEN_IDLE;
                  const responses = [];
                  for (const call of functionCalls) {
                    if (call.name === 'display_correction') {
                      const normalized = normalizeLiveCorrection(call.args);
                      if (normalized) {
                        correctionEmittedThisTurn = true;
                        sendJson(clientWs, {
                          type: 'correction',
                          correction: normalized,
                        });
                      }
                      if (call.id) {
                        responses.push({
                          id: call.id,
                          name: call.name,
                          response: { displayed: true },
                          scheduling: responseScheduling,
                        });
                      }
                    } else if (call.name === 'award_pronunciation_points') {
                      const award = normalizePronunciationAward(call.args);
                      if (award && studentSpokeBeforeThisTurn) {
                        pointsAwardedThisTurn = true;
                        sendJson(clientWs, {
                          type: 'pointsAward',
                          award,
                        });
                      }
                      if (call.id) {
                        responses.push({
                          id: call.id,
                          name: call.name,
                          response: { awarded: Boolean(award && studentSpokeBeforeThisTurn) },
                          scheduling: responseScheduling,
                        });
                      }
                    } else if (call.name === 'set_practice_duration') {
                      const minutes = normalizePracticeDurationMinutes(
                        (call.args as Record<string, unknown> | undefined)?.durationMinutes
                      );
                      if (minutes) {
                        startDurationWatcher(minutes);
                      }
                      if (call.id) {
                        responses.push({
                          id: call.id,
                          name: call.name,
                          response: { durationMinutes: minutes ?? 10 },
                          scheduling: responseScheduling,
                        });
                      }
                    } else if (call.name === 'extend_practice_session') {
                      const rawExtra = Number(
                        (call.args as Record<string, unknown> | undefined)?.extraMinutes ?? 5
                      );
                      const extra = Number.isFinite(rawExtra)
                        ? Math.max(2, Math.min(15, Math.round(rawExtra)))
                        : 5;
                      const currentMinutes =
                        activeTargetDurationMinutes ??
                        Math.max(5, Math.ceil((Date.now() - sessionStartedAtMs) / 60000));
                      startDurationWatcher(currentMinutes + extra);
                      if (call.id) {
                        responses.push({
                          id: call.id,
                          name: call.name,
                          response: { extendedToMinutes: currentMinutes + extra },
                          scheduling: responseScheduling,
                        });
                      }
                    } else if (call.id && call.name) {
                      responses.push({
                        id: call.id,
                        name: call.name,
                        response: { ok: true },
                        scheduling: responseScheduling,
                      });
                    }
                  }
                  if (responses.length > 0) {
                    if (responseScheduling === FunctionResponseScheduling.WHEN_IDLE) {
                      pendingToolSpeechTurn = true;
                      tutorTurnActive = true;
                    }
                    try {
                      liveSession.sendToolResponse({ functionResponses: responses });
                    } catch {
                      // Ignore if session closed mid-response
                    }
                  }
                }

                const content = message.serverContent;
                if (!content) return;

                if (content.interrupted) {
                  outputTranscriptBuffer = '';
                  correctionEmittedThisTurn = false;
                  pointsAwardedThisTurn = false;
                  spokeAudioThisTurn = false;
                  pendingToolSpeechTurn = false;
                  tutorTurnActive = false;
                  clearTurnUnlockFallback();
                  sendJson(clientWs, { type: 'interrupted' });
                }

                if (content.inputTranscription?.text) {
                  const chunk = content.inputTranscription.text;
                  if (isUsableTranscript(chunk)) {
                    studentSpokeBeforeThisTurn = true;
                  }
                  inputTranscriptBuffer += chunk;
                  sendJson(clientWs, {
                    type: 'inputTranscript',
                    text: chunk,
                  });

                  // Real-time community safety guardrail for both Kids (5-9) and Adults
                  if (!safetyTriggeredThisTurn && activeScenario) {
                    const safetyCheck = detectSensitiveContent(inputTranscriptBuffer);
                    if (safetyCheck.flagged) {
                      safetyTriggeredThisTurn = true;
                      const noticeMessage =
                        activeAudience === 'kids'
                          ? 'Recordatorio seguro: en ALLEN Aula Kids solo hablamos de temas divertidos y seguros para aprender inglés.'
                          : 'Normas de comunidad: en ALLEN Aula mantenemos un espacio educativo seguro y no tratamos temas sensibles, sexuales, violentos o de agresión.';
                      sendJson(clientWs, {
                        type: 'safetyNotice',
                        category: safetyCheck.category,
                        message: noticeMessage,
                      });
                      if (liveSession) {
                        try {
                          tutorTurnActive = true;
                          liveSession.sendClientContent({
                            turns: [
                              {
                                role: 'user',
                                parts: [
                                  {
                                    text: buildSafetyRedirectPrompt(
                                      activeScenario,
                                      activeAudience,
                                      activeCefrLevel
                                    ),
                                  },
                                ],
                              },
                            ],
                            turnComplete: true,
                          });
                        } catch {
                          // Ignore if session closed
                        }
                      }
                    }
                  }
                }

                if (content.outputTranscription?.text) {
                  const chunk = content.outputTranscription.text;
                  spokeAudioThisTurn = true;
                  tutorTurnActive = true;
                  clearTurnUnlockFallback();
                  if (inputTranscriptBuffer.trim().length > 0) {
                    lastStudentTurnText = inputTranscriptBuffer.trim();
                    inputTranscriptBuffer = '';
                  }
                  outputTranscriptBuffer += chunk;
                  const expression = inferExpressionFromTranscript(outputTranscriptBuffer);
                  sendJson(clientWs, {
                    type: 'outputTranscript',
                    text: chunk,
                    expression,
                  });
                }

                for (const part of content.modelTurn?.parts ?? []) {
                  if (part.inlineData?.data) {
                    spokeAudioThisTurn = true;
                    tutorTurnActive = true;
                    clearTurnUnlockFallback();
                    sendJson(clientWs, {
                      type: 'audio',
                      data: part.inlineData.data,
                    });
                  }
                }

                if (content.turnComplete) {
                  // If a pre-speech WHEN_IDLE tool call just completed before audio arrived,
                  // wait for the actual spoken response before notifying client turnComplete.
                  if (pendingToolSpeechTurn && !spokeAudioThisTurn) {
                    pendingToolSpeechTurn = false;
                    return;
                  }

                  const completedTutorText = outputTranscriptBuffer.trim();
                  const hadToolCorrection = correctionEmittedThisTurn;
                  const hadToolPoints = pointsAwardedThisTurn;
                  const hadStudentSpeech = studentSpokeBeforeThisTurn;
                  const recentStudentText =
                    inputTranscriptBuffer.trim() || lastStudentTurnText;

                  outputTranscriptBuffer = '';
                  inputTranscriptBuffer = '';
                  correctionEmittedThisTurn = false;
                  pointsAwardedThisTurn = false;
                  spokeAudioThisTurn = false;
                  pendingToolSpeechTurn = false;
                  studentSpokeBeforeThisTurn = false;
                  safetyTriggeredThisTurn = false;
                  sendJson(clientWs, { type: 'turnComplete' });

                  // Keep audio input blocked briefly until client confirms playbackDone (with safe 2.5s fallback)
                  clearTurnUnlockFallback();
                  turnUnlockFallbackTimer = setTimeout(() => {
                    tutorTurnActive = false;
                    turnUnlockFallbackTimer = null;
                  }, 2500);

                  // Reliable fallback: if the student spoke cleanly and the tutor praised their pronunciation
                  // without calling award_pronunciation_points, award +10 points without spamming their name.
                  if (
                    hadStudentSpeech &&
                    isUsableTranscript(recentStudentText) &&
                    !hadToolPoints &&
                    !hadToolCorrection &&
                    completedTutorText.length > 8 &&
                    looksLikePronunciationPraise(completedTutorText)
                  ) {
                    const fallbackAward = normalizePronunciationAward({
                      points: 10,
                      phrase: recentStudentText.slice(0, 70),
                      praiseEs: '¡Muy buena pronunciación!',
                    });
                    if (fallbackAward) {
                      sendJson(clientWs, {
                        type: 'pointsAward',
                        award: fallbackAward,
                      });
                    }
                  }

                  // Reliable fallback:
                  // - For A1, A2, and Kids: ALWAYS extract the practice phrase/question so the reading card appears above the avatar on every turn.
                  // - For B1–C2: extract whenever a spoken correction or explicit practice phrase was given.
                  const isBasicVisualLevel =
                    activeAudience === 'kids' ||
                    activeCefrLevel === 'A1' ||
                    activeCefrLevel === 'A2';
                  if (
                    !hadToolCorrection &&
                    completedTutorText.length > 8 &&
                    (isBasicVisualLevel || looksLikeSpokenCorrection(completedTutorText))
                  ) {
                    void extractLiveCorrectionFromTurn(
                      recentStudentText,
                      completedTutorText,
                      activeCefrLevel,
                      activeAudience
                    ).then((extracted) => {
                      if (extracted && !isClosing) {
                        sendJson(clientWs, {
                          type: 'correction',
                          correction: extracted,
                        });
                      }
                    });
                  }
                }
              },
              onerror: (event) => {
                const ev = event as { message?: string; error?: { message?: string } };
                const errMessage =
                  ev?.error?.message ||
                  ev?.message ||
                  (event instanceof Error ? event.message : 'Error de conexión con Gemini Live API.');
                console.error('[Gemini Live] Error:', errMessage);
                sendJson(clientWs, { type: 'error', message: errMessage });
              },
              onclose: (event) => {
                if (!isClosing) {
                  sendJson(clientWs, {
                    type: 'closed',
                    reason: event?.reason || 'La sesión de voz finalizó.',
                  });
                }
                liveSession = null;
              },
            },
          });

          // Prompt the tutor to greet the student verbally right away in authentic American English
          const isKids = audience === 'kids';
          const useA1HeavySpanish = spanishSupport === 'auto' && cefrLevel === 'A1';
          const useA2BalancedSpanish =
            spanishSupport === 'always' || (spanishSupport === 'auto' && cefrLevel === 'A2');
          const useB1IntroHint =
            spanishSupport === 'auto' &&
            cefrLevel === 'B1' &&
            shouldUseBilingualSpanish(cefrLevel, spanishSupport, audience);

          const openingStarter = activeSubtopic.angleEn || pickScenarioOpeningStarter(scenario);
          const subtopicFocusDirective = `TODAY'S FRESH SUBTOPIC FOR THIS SESSION: "${activeSubtopic.titleEs}" (${activeSubtopic.angleEn}). Featured practice words: ${activeSubtopic.featuredWords.join(', ')}.${
            previousSubtopicTitles.length > 0
              ? ` IMPORTANT: In previous days/sessions the student ALREADY practiced [${previousSubtopicTitles.join(' | ')}], so open with a noticeably DIFFERENT situation focused strictly on "${activeSubtopic.titleEs}"!`
              : ''
          }`;
          const openingNameHint = studentName
            ? `Greet the student warmly by their real name "${studentName}" ONCE right at the start (e.g. "¡Hola, ${studentName}!" or "Hey ${studentName}!"). Remember: do NOT repeat their name again in the next turns.`
            : 'No student name was provided—greet them warmly using neutral Spanish/English (e.g. "¡Hola! Qué gusto saludarte" or "Hey there!"). Never assume gender.';
          const openingReassuranceHint = isKids
            ? 'In your greeting, include 1 super short warm reassurance: "Si no entiendes algo, pregúntame sin pena y no tengas miedo a equivocarte."'
            : useA1HeavySpanish || useA2BalancedSpanish || useB1IntroHint
              ? 'In your greeting, include 1 brief warm reassurance: "Si en algún momento no entiendes algo, pregúntame con confianza y no tengas miedo a equivocarte."'
              : 'In your greeting, include 1 brief warm reassurance: if anything is ever unclear they can ask anytime, and never be afraid to make mistakes.';

          const timeAskDirective =
            practiceDuration === 'ask'
              ? isKids
                ? 'Right after greeting and that reassurance, warmly ask: "¿Cuánto tiempo tenemos para practicar hoy: 5, 10 o 15 minutitos?" and briefly tease today’s fresh "' +
                  activeSubtopic.titleEs +
                  '" adventure inside "' +
                  scenario.title +
                  '"—keep it short (2–3 sentences) and stop so they can answer!'
                : 'Right after greeting, that reassurance, and mentioning today’s specific subtopic "' +
                  activeSubtopic.titleEs +
                  '" in "' +
                  scenario.title +
                  '", warmly ask: "¿Cuánto tiempo tienes en este momento para practicar hoy: 5, 10 o 15 minutos?" (or in English if B2–C2: "How much time do you have to practice today—5, 10, or 15 minutes?") and stop cleanly so they can answer!'
              : `The student chose a ${practiceDuration}-minute session. Briefly mention we have ${practiceDuration} full minutes together, include that brief reassurance, and jump straight into today’s fresh subtopic "${activeSubtopic.titleEs}": ${openingStarter}`;

          const kidsOpeningScope =
            kidsAgeBand === '5-6'
              ? 'Age 5–6 (zero English): if starting the word now, teach ONLY ONE single super basic word from today’s subtopic "' +
                activeSubtopic.titleEs +
                '", ALWAYS state its exact Spanish meaning clearly (`"<word>" significa <traducción>`), and pronounce it VERY SLOWLY ONCE.'
              : kidsAgeBand === '7-8'
                ? 'Age 7–8 (zero English): always state the exact Spanish meaning clearly (`"<phrase>" significa <traducción>`) and pronounce 2-to-3 word phrases VERY SLOWLY WORD BY WORD ONCE.'
                : 'Age 9 (zero English): always state the exact Spanish meaning clearly (`"<phrase>" significa <traducción>`) and pronounce short 4-word phrases SLOWLY ONCE.';

          const greetingTrigger = msg.isReconnect
            ? useA1HeavySpanish || useA2BalancedSpanish || isKids
              ? `The call just reconnected briefly. Welcome the student back warmly in 1 short sentence and immediately continue "${scenario.title}" (${activeSubtopic.titleEs}).`
              : `The call just reconnected briefly. Warmly welcome the student back in 1 short American English sentence and immediately continue "${scenario.title}" (${activeSubtopic.titleEs}).`
            : practiceDuration === 'ask'
              ? isKids
                ? `The Kids (age ${kidsAgeBand}) video call just connected! ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} Speak in one steady, warm, gentle voice as ${tutor.name} in "${scenario.title}" (${scenario.subtitleEs}). ${timeAskDirective}`
                : useA1HeavySpanish || useA2BalancedSpanish
                  ? `The video call just connected. ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} Speak in one steady, warm natural voice as ${tutor.name} for "${scenario.title}" (${scenario.subtitleEs}). ${timeAskDirective}`
                  : useB1IntroHint
                    ? `The video call just connected. ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} Speak in warm, natural American English (with brief Spanish if helpful) as ${tutor.name} for "${scenario.title}". ${timeAskDirective}`
                    : `The video call just connected. ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} Speak in natural American English as ${tutor.name} for "${scenario.title}". ${timeAskDirective}`
              : isKids
                ? `The Kids (age ${kidsAgeBand}) video call just connected! ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} ${kidsOpeningScope} ${timeAskDirective} Call "display_correction" (category: "practice", tipEs like '"<word>" significa <traducción>') silently so it appears above your ALLEN character, pronounce the English VERY SLOWLY ONCE, and stop cleanly! Keep it to 2–3 short sentences.`
                : useA1HeavySpanish
                  ? `The video call just connected. ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} ${timeAskDirective} Speak in ~70-75% warm Latin American Spanish and ~25-30% slow American English for "${scenario.title}". Give 1 easy example phrase with its explicit Spanish meaning ('"<phrase>" significa ...')—calling "display_correction" (category: "practice") silently—say it ONCE clearly, and stop! (3 short sentences max).`
                  : useA2BalancedSpanish
                    ? `The video call just connected. ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} ${timeAskDirective} Speak in ~45-50% warm Latin American Spanish and ~50-55% clear American English for "${scenario.title}". Call "display_correction" (category: "practice") silently with your key English question/phrase and its Spanish meaning, ask it once, and stop! (3 short sentences max).`
                    : useB1IntroHint
                      ? `The video call just connected. ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} ${timeAskDirective} Greet in clear, casual American English as ${tutor.name} in "${scenario.title}" (CEFR B1). Ask one clear opening question and stop! (3 short sentences max).`
                      : `The video call just connected. ${subtopicFocusDirective} ${openingNameHint} ${openingReassuranceHint} ${timeAskDirective} Greet in natural American English as ${tutor.name} in "${scenario.title}" (CEFR ${cefrLevel}). Ask one crisp opening question and stop! (3 short sentences max).`;

          liveSession.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: greetingTrigger }] }],
            turnComplete: true,
          });
          return;
        }

        if (msg.type === 'extendDuration' && liveSession && activeScenario) {
          const extraRaw = Number((msg as { extraMinutes?: number }).extraMinutes ?? 5);
          const extraMinutes = Number.isFinite(extraRaw)
            ? Math.max(2, Math.min(15, Math.round(extraRaw)))
            : 5;
          const baseMinutes =
            activeTargetDurationMinutes ??
            Math.max(5, Math.ceil((Date.now() - sessionStartedAtMs) / 60000));
          startDurationWatcher(baseMinutes + extraMinutes);
          tutorTurnActive = true;
          liveSession.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [
                  {
                    text: `The student chose to EXTEND the practice by ${extraMinutes} more minutes inside "${activeScenario.title}"! Cheer warmly in 1 short sentence and immediately introduce a fresh follow-up angle or reserve subtopic from "${activeScenario.title}" to keep practicing!`,
                  },
                ],
              },
            ],
            turnComplete: true,
          });
          return;
        }

        if (msg.type === 'playbackDone') {
          clearTurnUnlockFallback();
          tutorTurnActive = false;
          return;
        }

        if (msg.type === 'silenceNudge' && liveSession && activeScenario) {
          const attempt: 1 | 2 = typeof msg.attempt === 'number' && msg.attempt >= 2 ? 2 : 1;
          tutorTurnActive = true;
          const nudgePrompt = buildSilenceNudgePrompt(
            activeScenario,
            activeCefrLevel,
            activeSpanishSupport,
            attempt,
            activeAudience,
            { kidsAgeBand: activeKidsAgeBand, studentName: activeStudentName }
          );
          liveSession.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: nudgePrompt }] }],
            turnComplete: true,
          });
          return;
        }

        if (msg.type === 'audio' && typeof msg.data === 'string' && liveSession) {
          // Half-duplex server guard: drop any stray in-flight audio while the tutor is speaking
          if (tutorTurnActive) {
            return;
          }
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.data,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
          return;
        }

        if (msg.type === 'end') {
          cleanupSession();
          clientWs.close();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo procesar el audio en tiempo real.';
        console.error('[WS /api/live] Error:', message);
        sendJson(clientWs, { type: 'error', message });
      }
    });

    clientWs.on('close', () => {
      cleanupSession();
    });

    clientWs.on('error', () => {
      cleanupSession();
    });
  });

  if (IS_PROD) {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`ALLEN Aula AI English Partner listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
