import type { ScenarioConfig, ScenarioSubtopic } from '../shared/tutorConfig';

export const SUBTOPIC_HISTORY_STORAGE_KEY = 'allen_aula_subtopic_rotation_v1';

interface ScenarioRotationRecord {
  recentIds: string[];
  lastSessionDateIso: string;
}

type RotationStore = Record<string, ScenarioRotationRecord>;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getSafeStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function loadStore(storage?: StorageLike): RotationStore {
  const s = getSafeStorage(storage);
  if (!s) return {};
  try {
    const raw = s.getItem(SUBTOPIC_HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as RotationStore;
  } catch {
    return {};
  }
}

function saveStore(store: RotationStore, storage?: StorageLike): void {
  const s = getSafeStorage(storage);
  if (!s) return;
  try {
    s.setItem(SUBTOPIC_HISTORY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export interface SubtopicSelectionResult {
  subtopic: ScenarioSubtopic;
  previousSubtopicTitles: string[];
  sessionCountOnScenario: number;
}

/**
 * Deterministically rotates through distinct subtopics of a scenario across repeated
 * sessions (today, tomorrow, day 3, etc.) so consecutive sessions NEVER open the same way.
 */
export function selectNextSubtopicForScenario(
  scenario: ScenarioConfig,
  storage?: StorageLike
): SubtopicSelectionResult {
  const subtopics = scenario.subtopics;
  if (!Array.isArray(subtopics) || subtopics.length === 0) {
    return {
      subtopic: {
        id: `${scenario.id}-default`,
        titleEs: scenario.title,
        angleEn: scenario.openingObjective,
        featuredWords: scenario.guidedVocabulary.slice(0, 3).map((v) => v.en),
      },
      previousSubtopicTitles: [],
      sessionCountOnScenario: 0,
    };
  }

  const store = loadStore(storage);
  const record = store[scenario.id];
  const recentIds = Array.isArray(record?.recentIds) ? record.recentIds : [];

  // 1. Prefer a subtopic that has NEVER been visited yet
  const unvisited = subtopics.find((st) => !recentIds.includes(st.id));

  let chosen: ScenarioSubtopic;
  if (unvisited) {
    chosen = unvisited;
  } else {
    // 2. All subtopics have been visited at least once: pick the least-recently-used one
    // (oldest entry in recentIds, guaranteed different from the most recent session!)
    const lastUsedIndexById = new Map<string, number>();
    recentIds.forEach((id, idx) => {
      lastUsedIndexById.set(id, idx);
    });
    const sortedByOldest = [...subtopics].sort((a, b) => {
      const ia = lastUsedIndexById.get(a.id) ?? -1;
      const ib = lastUsedIndexById.get(b.id) ?? -1;
      return ia - ib;
    });
    chosen = sortedByOldest[0];
  }

  const previousSubtopicTitles = Array.from(
    new Set(
      recentIds
        .slice(-3)
        .map((id) => subtopics.find((st) => st.id === id)?.titleEs)
        .filter((title): title is string => Boolean(title) && title !== chosen.titleEs)
    )
  );

  return {
    subtopic: chosen,
    previousSubtopicTitles,
    sessionCountOnScenario: recentIds.length,
  };
}

/**
 * Persists a visited subtopic for a scenario so the next session (later today or
 * on subsequent days) automatically advances to a fresh subtopic.
 */
export function recordVisitedSubtopic(
  scenarioId: string,
  subtopicId: string,
  storage?: StorageLike,
  nowIso: string = new Date().toISOString()
): void {
  const store = loadStore(storage);
  const existing = store[scenarioId];
  const prevIds = Array.isArray(existing?.recentIds) ? existing.recentIds : [];
  // Keep last 12 entries so history stays compact while preserving exact LRU order
  const nextIds = [...prevIds, subtopicId].slice(-12);
  store[scenarioId] = {
    recentIds: nextIds,
    lastSessionDateIso: nowIso,
  };
  saveStore(store, storage);
}
