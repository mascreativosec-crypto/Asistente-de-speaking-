import type { PracticeReport } from '../shared/tutorConfig';

const STORAGE_KEY = 'allen_aula_english_partner_history_v1';
const MAX_HISTORY_ENTRIES = 30;

export interface PracticeStats {
  totalSessions: number;
  totalMinutes: number;
  totalPronunciationPoints: number;
  averageFluency: number;
  averageComprehension: number;
}

export function loadPracticeHistory(storage?: Pick<Storage, 'getItem'>): PracticeReport[] {
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    if (!target) return [];
    const raw = target.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PracticeReport =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.scenarioTitle === 'string' &&
        typeof item.durationSeconds === 'number'
    );
  } catch {
    return [];
  }
}

export function savePracticeReport(
  report: PracticeReport,
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): PracticeReport[] {
  const existing = loadPracticeHistory(storage);
  const next = [report, ...existing.filter((item) => item.id !== report.id)].slice(
    0,
    MAX_HISTORY_ENTRIES
  );
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    target?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors gracefully
  }
  return next;
}

export function deletePracticeReport(
  reportId: string,
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): PracticeReport[] {
  const existing = loadPracticeHistory(storage);
  const next = existing.filter((item) => item.id !== reportId);
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
    target?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors gracefully
  }
  return next;
}

export function computePracticeStats(history: PracticeReport[]): PracticeStats {
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      totalPronunciationPoints: 0,
      averageFluency: 0,
      averageComprehension: 0,
    };
  }
  const totalSeconds = history.reduce((acc, item) => acc + Math.max(0, item.durationSeconds), 0);
  const totalPoints = history.reduce(
    (acc, item) => acc + Math.max(0, Math.round(Number(item.pronunciationPoints ?? 0))),
    0
  );
  const avgFluency = Math.round(
    history.reduce((acc, item) => acc + item.fluencyScore, 0) / history.length
  );
  const avgComp = Math.round(
    history.reduce((acc, item) => acc + item.comprehensionScore, 0) / history.length
  );
  return {
    totalSessions: history.length,
    totalMinutes: Math.max(1, Math.round(totalSeconds / 60)),
    totalPronunciationPoints: totalPoints,
    averageFluency: avgFluency,
    averageComprehension: avgComp,
  };
}
