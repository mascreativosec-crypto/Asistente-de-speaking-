import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADULT_SCENARIOS,
  ADULT_TUTORS,
  KIDS_AGE_BANDS,
  KIDS_SCENARIOS,
  KIDS_TUTORS,
  SCENARIOS,
  TUTORS,
  CEFR_LEVELS,
  PRACTICE_DURATION_OPTIONS,
  buildSafetyRedirectPrompt,
  buildSilenceNudgePrompt,
  buildTimeWrapUpPrompt,
  buildTutorSystemInstruction,
  detectSensitiveContent,
  formatCallDuration,
  getScenarioById,
  getScenarioSubtopicById,
  getScenariosByAudience,
  getTutorById,
  getTutorsByAudience,
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
  type PracticeReport,
} from './tutorConfig';
import {
  computePracticeStats,
  deletePracticeReport,
  loadPracticeHistory,
  savePracticeReport,
} from '../utils/practiceHistory';
import {
  recordVisitedSubtopic,
  selectNextSubtopicForScenario,
} from '../utils/subtopicRotation';
import { SUPPORTED_BACKDROP_SCENARIO_IDS } from '../components/sceneBackdrops';

test('defines rich scenarios for both Adults (12) and Kids 5-9 (9), each with iconName and varied openingStarters', () => {
  assert.equal(ADULT_SCENARIOS.length, 12);
  assert.equal(KIDS_SCENARIOS.length, 9);
  assert.equal(SCENARIOS.length, 21);
  assert.equal(getScenariosByAudience('adults').length, 12);
  assert.equal(getScenariosByAudience('kids').length, 9);

  for (const scenario of SCENARIOS) {
    assert.ok(scenario.iconName.length > 0, `Missing iconName on ${scenario.id}`);
    assert.ok(
      scenario.openingStarters.length >= 4,
      `Expected >= 4 distinct openingStarters on ${scenario.id}`
    );
    const uniqueStarters = new Set(scenario.openingStarters);
    assert.equal(
      uniqueStarters.size,
      scenario.openingStarters.length,
      `Duplicate openingStarter found on ${scenario.id}`
    );
    assert.ok(
      scenario.guidedVocabulary.length >= 4,
      `Expected >= 4 guidedVocabulary items on ${scenario.id}`
    );
    for (const item of scenario.guidedVocabulary) {
      assert.ok(item.en.trim().length > 0, `Missing en vocab on ${scenario.id}`);
      assert.ok(item.es.trim().length > 0, `Missing es meaning on ${scenario.id}`);
      assert.ok(item.phonetic.trim().length > 0, `Missing phonetic guide on ${scenario.id}`);
    }
    assert.ok(
      scenario.conversationSteps.length >= 4,
      `Expected >= 4 conversationSteps on ${scenario.id}`
    );
  }

  // Deterministic picker returns valid varied starters across seed values
  const nyc = getScenarioById('new-york');
  const first = pickScenarioOpeningStarter(nyc, 0);
  const last = pickScenarioOpeningStarter(nyc, nyc.openingStarters.length - 1);
  assert.equal(first, nyc.openingStarters[0]);
  assert.equal(last, nyc.openingStarters[nyc.openingStarters.length - 1]);
  assert.notEqual(first, last);

  assert.deepEqual(
    CEFR_LEVELS.map((l) => l.level),
    ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  );
  assert.equal(TUTORS.length, 6);
  for (const tutor of TUTORS) {
    assert.match(tutor.accentLabel, /Americano/);
  }
});

test('shouldUseBilingualSpanish enables Spanish automatically for A1-B1 and Kids while respecting overrides', () => {
  assert.equal(shouldUseBilingualSpanish('A1', 'auto'), true);
  assert.equal(shouldUseBilingualSpanish('A2', 'auto'), true);
  assert.equal(shouldUseBilingualSpanish('B1', 'auto'), true);
  assert.equal(shouldUseBilingualSpanish('B2', 'auto'), false);
  assert.equal(shouldUseBilingualSpanish('C1', 'auto'), false);
  assert.equal(shouldUseBilingualSpanish('B2', 'auto', 'kids'), true);
  assert.equal(shouldUseBilingualSpanish('B2', 'always'), true);
  assert.equal(shouldUseBilingualSpanish('A1', 'english_only'), false);
});

test('strictly separates the 4 Adult ALLEN characters (preserving all 4 voices) from the 2 Kids-only ALLEN characters', () => {
  assert.equal(ADULT_TUTORS.length, 4);
  assert.equal(KIDS_TUTORS.length, 2);
  assert.equal(getTutorsByAudience('adults').length, 4);
  assert.equal(getTutorsByAudience('kids').length, 2);

  assert.deepEqual(
    ADULT_TUTORS.map((t) => t.dotStyle.characterId),
    ['daniel', 'marcus', 'laura', 'sofia']
  );
  assert.deepEqual(
    KIDS_TUTORS.map((t) => t.dotStyle.characterId),
    ['leo', 'mia']
  );

  // All 4 original Gemini Live voices preserved across Adult ALLEN characters
  const adultVoices = new Set(ADULT_TUTORS.map((t) => t.voiceName));
  assert.deepEqual(adultVoices, new Set(['Zephyr', 'Fenrir', 'Kore', 'Puck']));

  for (const adult of getTutorsByAudience('adults')) {
    assert.equal(adult.audience, 'adults');
    assert.ok(adult.dotStyle.bodyTopHex.startsWith('#'));
  }

  for (const kidChar of getTutorsByAudience('kids')) {
    assert.equal(kidChar.audience, 'kids');
    assert.ok(kidChar.dotStyle.bodyTopHex.startsWith('#'));
  }
});

test('sanitizeStudentName trims, strips unsafe characters, and bounds length cleanly', () => {
  assert.equal(sanitizeStudentName('  Camila   Rojas  '), 'Camila Rojas');
  assert.equal(sanitizeStudentName('Mateo<script>123'), 'Mateoscript123');
  assert.equal(sanitizeStudentName('Sofía-María'), 'Sofía-María');
  assert.equal(sanitizeStudentName('   '), '');
  assert.equal(sanitizeStudentName(null), '');
  assert.ok(sanitizeStudentName('A'.repeat(60)).length <= 32);
});

test('buildTutorSystemInstruction enforces student name personalization, warm/kind retry motivation, Kids mode, and safety guardrails', () => {
  const scenario = getScenarioById('new-york');
  const tutor = getTutorById('daniel');
  const promptA1Named = buildTutorSystemInstruction(scenario, 'A1', tutor, 'auto', 'adults', {
    studentName: 'Camila',
    practiceDuration: 'ask',
  });
  assert.match(promptA1Named, /ECUADOR & SOUTH AMERICA/);
  assert.match(promptA1Named, /AMERICAN ENGLISH STANDARD/);
  assert.match(promptA1Named, /SPANISH-TO-AMERICAN-ENGLISH MIRRORING/);
  assert.match(promptA1Named, /NEVER accept a bare one-word "yes"/);
  assert.match(promptA1Named, /HONEST 3-ATTEMPT RULE/);
  assert.match(promptA1Named, /HONEST, VARIED & KIND MISTAKE CORRECTION \(ADULTS — ZERO FALSE PRAISE\)/);
  assert.match(promptA1Named, /Estás casi cerca/);
  assert.match(promptA1Named, /no está claro, intentémoslo de nuevo/);
  assert.match(promptA1Named, /EXPLICIT SPANISH MEANING & CONTEXT EXPLANATION/);
  assert.match(promptA1Named, /"White" significa blanco/);
  assert.match(promptA1Named, /OPENING REASSURANCE/);
  assert.match(promptA1Named, /no tengas miedo a equivocarte/);
  assert.match(promptA1Named, /FULL-DURATION CONTINUITY \(CRITICAL — NEVER END EARLY!\)/);
  assert.match(promptA1Named, /RESERVE ON-TOPIC EXPANSION SUBTOPICS/);
  assert.match(promptA1Named, /PERSONALIZED ADDRESSING BY NAME — SPARING & NATURAL/);
  assert.match(promptA1Named, /NEVER repeat "Camila" in every turn/);
  assert.match(promptA1Named, /VOICE STABILITY & SINGLE-PASS CLARITY/);
  assert.match(promptA1Named, /ACTIVE LISTENING & REAL CONVERSATION PERCEPTION/);
  assert.match(promptA1Named, /UNCLEAR AUDIO OR MISHEARD SPEECH/);
  assert.match(promptA1Named, /PRACTICE TIME GOAL \(5, 10 OR 15 MINUTES\)/);
  assert.match(promptA1Named, /set_practice_duration/);
  assert.match(promptA1Named, /STRICT COMMUNITY SAFETY/);
  assert.match(promptA1Named, /70-75% Latin American Spanish/);
  assert.match(promptA1Named, /STRICT TOPIC CONTINUITY/);
  assert.match(promptA1Named, /On-topic vocabulary roadmap/);
  assert.match(promptA1Named, /Phase 1 progression steps/);
  assert.match(promptA1Named, /NEVER a text chat/);

  const promptFixedDuration = buildTutorSystemInstruction(scenario, 'A2', tutor, 'auto', 'adults', {
    studentName: '',
    practiceDuration: 10,
  });
  assert.match(promptFixedDuration, /Never assume masculine or feminine forms/);
  assert.match(promptFixedDuration, /PRACTICE TIME GOAL \(FIXED 10 MINUTES\)/);

  const kidsScenario = getScenarioById('kids-space-dinos');
  const kidsTutor = getTutorById('leo');
  const promptKids56 = buildTutorSystemInstruction(kidsScenario, 'A1', kidsTutor, 'auto', 'kids', {
    kidsAgeBand: '5-6',
    studentName: 'Mateo',
    practiceDuration: 5,
  });
  assert.match(promptKids56, /KIDS \(AGES 5 TO 9 · ACTIVE BAND: 5-6 AÑOS\)/);
  assert.match(promptKids56, /KIDS AGE 5–6 IMMERSION & ULTRA-BASIC VOCABULARY/);
  assert.match(promptKids56, /KIDS MANDATORY SPANISH MEANING RULE/);
  assert.match(promptKids56, /Significa:/);
  assert.match(promptKids56, /KIDS ULTRA-SLOW WORD-BY-WORD PRONUNCIATION/);
  assert.match(promptKids56, /HONEST, VARIED & KIND MISTAKE CORRECTION \(KIDS — ZERO FALSE PRAISE\)/);
  assert.match(promptKids56, /"Mateo"/);
  assert.match(promptKids56, /award_pronunciation_points/);
  assert.match(promptKids56, /EXTRA CHILD PROTECTION/);
  assert.match(promptKids56, /Space & Dinosaurs/);
  assert.match(promptKids56, /"rocket" = cohete/);
  assert.match(promptKids56, /75-80% cheerful, super-simple Latin American Spanish/);

  const promptKids9 = buildTutorSystemInstruction(kidsScenario, 'A1', kidsTutor, 'auto', 'kids', {
    kidsAgeBand: '9',
    studentName: 'Valentina',
  });
  assert.match(promptKids9, /KIDS AGE 9 IMMERSION & SIMPLE SENTENCES/);
  assert.match(promptKids9, /"Valentina"/);

  const promptB2EnglishOnly = buildTutorSystemInstruction(
    scenario,
    'B2',
    tutor,
    'english_only',
    'adults'
  );
  assert.match(promptB2EnglishOnly, /ENGLISH ONLY/);
});

test('duration helpers, transcript usability filter, and time wrap-up prompts behave reliably', () => {
  assert.equal(PRACTICE_DURATION_OPTIONS.length, 4);
  assert.equal(normalizePracticeDurationMinutes(5), 5);
  assert.equal(normalizePracticeDurationMinutes('10 minutos'), 10);
  assert.equal(normalizePracticeDurationMinutes(15), 15);
  assert.equal(normalizePracticeDurationMinutes(6), 5);
  assert.equal(normalizePracticeDurationMinutes(20), 15);
  assert.equal(normalizePracticeDurationMinutes('invalid'), null);
  assert.equal(normalizePracticeDurationMinutes(0), null);

  assert.equal(isUsableTranscript(''), false);
  assert.equal(isUsableTranscript('   ...  '), false);
  assert.equal(isUsableTranscript('a'), false);
  assert.equal(isUsableTranscript('Hi!'), true);
  assert.equal(isUsableTranscript('10 minutos'), true);

  const nyc = getScenarioById('new-york');
  const soonAdult = buildTimeWrapUpPrompt(nyc, 'adults', 'B1', 'soon', 10);
  assert.match(soonAdult, /45 seconds remain/);
  assert.match(soonAdult, /do NOT say goodbye yet/);
  const finishedAdult = buildTimeWrapUpPrompt(nyc, 'adults', 'A1', 'finished', 5);
  assert.match(finishedAdult, /5 minutes completed/);
  assert.match(finishedAdult, /seguir practicando/);
  assert.match(finishedAdult, /Finalizar/);
  const finishedKids = buildTimeWrapUpPrompt(
    getScenarioById('kids-animals'),
    'kids',
    'A1',
    'finished',
    5
  );
  assert.match(finishedKids, /5 minutes completed/);
  assert.match(finishedKids, /Spanish meaning/);
  assert.match(finishedKids, /seguir jugando/);
  assert.match(finishedKids, /Finalizar/);
});

test('Kids age bands define progressive difficulty (5-6, 7-8, 9) and pronunciation points helpers normalize & detect praise safely', () => {
  assert.deepEqual(
    KIDS_AGE_BANDS.map((b) => b.id),
    ['5-6', '7-8', '9']
  );

  const award = normalizePronunciationAward({
    points: 15,
    phrase: 'Big red rocket!',
    praiseEs: '¡Excelente pronunciación, Camila!',
  });
  assert.ok(award);
  assert.equal(award.points, 15);
  assert.equal(award.phrase, 'Big red rocket!');
  assert.equal(award.praiseEs, '¡Excelente pronunciación, Camila!');

  // Clamps out-of-range points safely
  const clampedHigh = normalizePronunciationAward({ points: 999, phrase: 'Dog', praiseEs: '¡Genial!' });
  assert.equal(clampedHigh?.points, 25);
  const clampedLow = normalizePronunciationAward({ points: 1, phrase: 'Dog', praiseEs: '¡Genial!' });
  assert.equal(clampedLow?.points, 5);

  assert.equal(looksLikePronunciationPraise('¡Excelente pronunciación, Camila!'), true);
  assert.equal(looksLikePronunciationPraise('Awesome job! You nailed it!'), true);
  assert.equal(
    looksLikePronunciationPraise('Todavía no sale del todo bien, intenta de nuevo despacito.'),
    false
  );
});

test('detectSensitiveContent flags sexual, violent, aggressive, self-harm, and illegal topics without false positives', () => {
  assert.equal(detectSensitiveContent('I want to talk about sex').flagged, true);
  assert.equal(detectSensitiveContent('Quiero hablar de sexo o porno').category, 'sexual');
  assert.equal(detectSensitiveContent('Te voy a matar con un arma').category, 'violence');
  assert.equal(detectSensitiveContent('Fuck you idiot').category, 'aggression');
  assert.equal(detectSensitiveContent('I want to kill myself').category, 'self_harm');
  assert.equal(detectSensitiveContent('Where can I buy drugs').category, 'illegal');

  // Benign normal English & Spanish phrases must NEVER trigger false positives
  assert.equal(detectSensitiveContent('I love dogs and pizza in New York!').flagged, false);
  assert.equal(detectSensitiveContent('Hola, fui al parque con mi familia ayer.').flagged, false);
  assert.equal(detectSensitiveContent('I went to my English class at 6 PM.').flagged, false);
  assert.equal(detectSensitiveContent('My favorite superhero can fly!').flagged, false);

  const kidsRedirect = buildSafetyRedirectPrompt(getScenarioById('kids-animals'), 'kids', 'A1');
  assert.match(kidsRedirect, /SAFETY ALERT/);
  assert.match(kidsRedirect, /Animals & Pets/);
});

test('buildSilenceNudgePrompt generates bilingual on-topic prompts using scenario vocab without repeating student name', () => {
  const scenario = getScenarioById('restaurant');
  const nudge1 = buildSilenceNudgePrompt(scenario, 'A1', 'auto', 1, 'adults', {
    studentName: 'Camila',
  });
  assert.match(nudge1, /Spanish/);
  assert.match(nudge1, /At the Restaurant/);
  assert.doesNotMatch(nudge1, /"Camila"/);
  assert.match(nudge1, /display_correction/);

  const kidsNudge = buildSilenceNudgePrompt(getScenarioById('kids-food'), 'A1', 'auto', 1, 'kids', {
    kidsAgeBand: '5-6',
    studentName: 'Mateo',
  });
  assert.match(kidsNudge, /child \(age 5-6, zero English\)/);
  assert.match(kidsNudge, /VERY SLOWLY WORD BY WORD/);
  assert.match(kidsNudge, /Spanish meaning/i);
  assert.doesNotMatch(kidsNudge, /"Mateo"/);
  assert.match(kidsNudge, /Yummy Food & Ice Cream/);

  const nudgeEnOnly = buildSilenceNudgePrompt(scenario, 'B2', 'english_only', 1, 'adults');
  assert.doesNotMatch(nudgeEnOnly, /in Spanish/);
});

test('inferExpressionFromTranscript maps English and Spanish tutor speech cues to avatar expressions', () => {
  assert.equal(
    inferExpressionFromTranscript('Awesome! You nailed it, way to go!'),
    'congratulation'
  );
  assert.equal(inferExpressionFromTranscript('¡Excelente! Lo dijiste muy bien.'), 'congratulation');
  assert.equal(inferExpressionFromTranscript('Wow, really? That is surprising!'), 'surprise');
  assert.equal(
    inferExpressionFromTranscript('Fíjate en la pronunciación: repeat after me, comfortable.'),
    'concentration'
  );
  assert.equal(
    inferExpressionFromTranscript('¡Hola! Bienvenido a nuestra clase de hoy.'),
    'joy'
  );
  assert.equal(inferExpressionFromTranscript('Let us continue the dialogue.'), 'neutral');
});

test('formatCallDuration formats seconds into MM:SS cleanly', () => {
  assert.equal(formatCallDuration(0), '00:00');
  assert.equal(formatCallDuration(9), '00:09');
  assert.equal(formatCallDuration(65), '01:05');
  assert.equal(formatCallDuration(600), '10:00');
});

test('practiceHistory saves, loads, computes stats, and deletes reports', () => {
  const backing = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => {
      backing.set(k, v);
    },
  };

  const sample: PracticeReport = {
    id: 'rep_1',
    createdAtIso: '2026-11-22T12:00:00.000Z',
    scenarioId: 'restaurant',
    scenarioTitle: 'At the Restaurant',
    audience: 'adults',
    studentName: 'Camila',
    tutorId: 'daniel',
    tutorName: 'Daniel',
    cefrLevel: 'B1',
    durationSeconds: 240,
    pronunciationPoints: 35,
    comprehensionScore: 86,
    fluencyScore: 78,
    summaryEs: 'Buen progreso.',
    vocabularyLearned: [],
    grammarErrors: [],
    recommendationsEs: ['Practica tiempos pasados.'],
    recommendedActivities: [],
  };

  assert.equal(loadPracticeHistory(mockStorage).length, 0);
  const afterSave = savePracticeReport(sample, mockStorage);
  assert.equal(afterSave.length, 1);

  const stats = computePracticeStats(afterSave);
  assert.equal(stats.totalSessions, 1);
  assert.equal(stats.totalMinutes, 4);
  assert.equal(stats.totalPronunciationPoints, 35);
  assert.equal(stats.averageFluency, 78);
  assert.equal(stats.averageComprehension, 86);

  const afterDelete = deletePracticeReport('rep_1', mockStorage);
  assert.equal(afterDelete.length, 0);
});

test('looksLikeSpokenCorrection detects corrections AND beginner practice/repeat cues', () => {
  assert.equal(
    looksLikeSpokenCorrection('Muy bien, solo un detalle: en vez de "I go yesterday", se dice "I went yesterday".'),
    true
  );
  assert.equal(
    looksLikeSpokenCorrection('En inglés puedes decir: "I would like a coffee, please". ¡Repite conmigo!'),
    true
  );
  assert.equal(
    looksLikeSpokenCorrection('Awesome! Repeat after me: "My favorite animal is a dog."'),
    true
  );
  assert.equal(
    looksLikeSpokenCorrection('That sounds cool! What did you eat for breakfast?'),
    false
  );
});

test('normalizeLiveCorrection supports practice phrase cards alongside grammar and pronunciation cards', () => {
  const practice = normalizeLiveCorrection({
    category: 'practice',
    original: '',
    correction: "I'd like an iced coffee, please.",
    pronunciationGuide: 'aid laik an aist KÓ-fi plis',
    tipEs: 'Léelo en voz alta para pedir tu bebida.',
  });
  assert.ok(practice);
  assert.equal(practice.category, 'practice');
  assert.equal(practice.correction, "I'd like an iced coffee, please.");

  const gram = normalizeLiveCorrection({
    category: 'grammar',
    original: ' I go yesterday ',
    correction: ' I went yesterday ',
    tipEs: ' En pasado usamos "went". ',
  });
  assert.ok(gram);
  assert.equal(gram.category, 'grammar');

  const pron = normalizeLiveCorrection({
    original: 'comfortable',
    correction: 'comfortable',
    pronunciationGuide: 'KÁMF-ter-bol',
    tipEs: 'Tiene 3 sílabas, no 4.',
  });
  assert.ok(pron);
  assert.equal(pron.category, 'pronunciation');

  assert.equal(normalizeLiveCorrection({ original: '', correction: '' }), null);
});

test('parseJsonObjectSafely strips markdown code fences and extracts valid JSON objects', () => {
  const fenced = '```json\n{"comprehensionScore": 85, "summaryEs": "Muy bien"}\n```';
  const obj = parseJsonObjectSafely(fenced);
  assert.equal(obj.comprehensionScore, 85);
  assert.equal(obj.summaryEs, 'Muy bien');

  const wrapped = 'Here is the JSON:\n{"fluencyScore": 72}\nThanks!';
  assert.equal(parseJsonObjectSafely(wrapped).fluencyScore, 72);
});

test('all 21 scenarios define >= 4 unique subtopics and map 1-to-1 to unique animated backdrops', () => {
  const scenarioIds = SCENARIOS.map((s) => s.id).sort();
  const backdropIds = [...SUPPORTED_BACKDROP_SCENARIO_IDS].sort();
  assert.equal(new Set(SUPPORTED_BACKDROP_SCENARIO_IDS).size, 21);
  assert.deepEqual(backdropIds, scenarioIds);

  for (const scenario of SCENARIOS) {
    assert.ok(scenario.subtopics.length >= 4, `Expected >= 4 subtopics on ${scenario.id}`);
    const ids = new Set(scenario.subtopics.map((st) => st.id));
    assert.equal(ids.size, scenario.subtopics.length, `Duplicate subtopic id on ${scenario.id}`);
    for (const st of scenario.subtopics) {
      assert.ok(st.titleEs.trim().length > 0);
      assert.ok(st.angleEn.trim().length > 0);
      assert.ok(st.featuredWords.length >= 3);
    }
    const resolved = getScenarioSubtopicById(scenario, scenario.subtopics[2].id);
    assert.equal(resolved.id, scenario.subtopics[2].id);
  }
});

test('multi-day subtopic rotation picks a fresh distinct subtopic across Day 1, Day 2, Day 3, and Day 4 without repeating', () => {
  const backing = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => {
      backing.set(k, v);
    },
  };

  const restaurant = getScenarioById('restaurant');
  const seenIds: string[] = [];

  for (let day = 1; day <= 4; day++) {
    const selection = selectNextSubtopicForScenario(restaurant, mockStorage);
    assert.ok(
      !seenIds.includes(selection.subtopic.id),
      `Day ${day} repeated an already-visited subtopic: ${selection.subtopic.id}`
    );
    assert.equal(selection.previousSubtopicTitles.length, day - 1);
    seenIds.push(selection.subtopic.id);
    recordVisitedSubtopic(
      restaurant.id,
      selection.subtopic.id,
      mockStorage,
      `2026-11-2${day}T10:00:00.000Z`
    );
  }

  assert.equal(new Set(seenIds).size, 4);

  // Day 5 wraps back to the oldest least-recently-used subtopic (Day 1), never repeating Day 4 back-to-back
  const day5 = selectNextSubtopicForScenario(restaurant, mockStorage);
  assert.equal(day5.subtopic.id, seenIds[0]);
  assert.notEqual(day5.subtopic.id, seenIds[3]);
});

test('buildTutorSystemInstruction enforces A1 adaptive slow-then-normal pace, basic above-avatar practice prompt, and multi-day subtopic injection', () => {
  const restaurant = getScenarioById('restaurant');
  const tutor = getTutorById('daniel');

  const promptA1Day2 = buildTutorSystemInstruction(restaurant, 'A1', tutor, 'auto', 'adults', {
    subtopicId: restaurant.subtopics[1].id,
    previousSubtopicTitles: [restaurant.subtopics[0].titleEs],
  });
  assert.match(promptA1Day2, /A1 ADAPTIVE PRONUNCIATION SPEED/);
  assert.match(promptA1Day2, /NOTICEABLY SLOWER and clearly WORD BY WORD/);
  assert.match(promptA1Day2, /2nd and 3rd attempts/);
  assert.match(promptA1Day2, /ALWAYS DISPLAY TARGET SENTENCE ABOVE AVATAR/);
  assert.match(promptA1Day2, /TODAY’S FRESH SUBTOPIC/);
  assert.match(promptA1Day2, new RegExp(restaurant.subtopics[1].titleEs));
  assert.match(promptA1Day2, new RegExp(restaurant.subtopics[0].titleEs));

  const promptB2 = buildTutorSystemInstruction(restaurant, 'B2', tutor, 'auto', 'adults', {
    subtopicId: restaurant.subtopics[2].id,
  });
  assert.doesNotMatch(promptB2, /A1 ADAPTIVE PRONUNCIATION SPEED/);
  assert.doesNotMatch(promptB2, /ALWAYS DISPLAY TARGET SENTENCE ABOVE AVATAR/);
  assert.match(promptB2, new RegExp(restaurant.subtopics[2].titleEs));
});
