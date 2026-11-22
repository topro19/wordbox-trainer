import {
  BoardData,
  GameMode,
  RoundResult,
  RoundResultSummary,
  ScoringConfig,
  TargetLength,
  UserStats,
} from '@/types/wordbox';
import { PLATO_OFFICIAL_SCORING } from './scoring';

const STATS_KEY = 'wordbox_user_stats_v1';
const RECENT_ROUNDS_KEY = 'wordbox_recent_rounds_v1';
const SAVED_BOARDS_KEY = 'wordbox_saved_boards_v1';
const SETTINGS_KEY = 'wordbox_settings_v1';

export interface WordboxSettings {
  scoringConfig: ScoringConfig;
  preferredGenerator: string;
  soundMuted: boolean;
  hapticEnabled: boolean;
  showBoardHints: boolean;
}

const DEFAULT_SETTINGS: WordboxSettings = {
  scoringConfig: PLATO_OFFICIAL_SCORING,
  preferredGenerator: 'competitive_400',
  soundMuted: false,
  hapticEnabled: true,
  showBoardHints: false,
};

const DEFAULT_STATS: UserStats = {
  totalGames: 0,
  gamesReached400: 0,
  bestScore: 0,
  averageScore: 0,
  totalScoreAllTime: 0,
  totalWordsFound: 0,
  averageWordLengthAllTime: 0,
  longestWordAllTime: '',
  mostFrequentLengths: { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
  missedLengthsCount: { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
  history: [],
  targetPracticeStats: {
    5: { attempts: 0, found: 0, successRate: 0 },
    6: { attempts: 0, found: 0, successRate: 0 },
    7: { attempts: 0, found: 0, successRate: 0 },
    8: { attempts: 0, found: 0, successRate: 0 },
  },
};

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to load user stats from localStorage:', err);
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats:', err);
  }
}

export function recordRoundCompletion(round: RoundResult): UserStats {
  const current = loadUserStats();

  const totalGames = current.totalGames + 1;
  const gamesReached400 = current.gamesReached400 + (round.score >= 400 ? 1 : 0);
  const bestScore = Math.max(current.bestScore, round.score);
  const bestScoreDate = round.score >= current.bestScore ? round.timestamp : current.bestScoreDate;
  const totalScoreAllTime = current.totalScoreAllTime + round.score;
  const averageScore = Math.round(totalScoreAllTime / totalGames);
  const totalWordsFound = current.totalWordsFound + round.wordsFound.length;

  // Calculate updated average word length
  const previousTotalChars = current.averageWordLengthAllTime * current.totalWordsFound;
  const roundChars = round.wordsFound.reduce((acc, w) => acc + w.length, 0);
  const averageWordLengthAllTime =
    totalWordsFound > 0
      ? Number(((previousTotalChars + roundChars) / totalWordsFound).toFixed(2))
      : 0;

  // Longest word
  let longestWordAllTime = current.longestWordAllTime;
  if (round.longestWord && round.longestWord.length > longestWordAllTime.length) {
    longestWordAllTime = round.longestWord;
  }

  // Update length distribution
  const mostFrequentLengths = { ...current.mostFrequentLengths };
  for (const w of round.wordsFound) {
    const bucket = Math.min(w.length, 8);
    mostFrequentLengths[bucket] = (mostFrequentLengths[bucket] || 0) + 1;
  }

  // Update missed lengths
  const missedLengthsCount = { ...current.missedLengthsCount };
  for (const w of round.wordsMissed) {
    const bucket = Math.min(w.length, 8);
    missedLengthsCount[bucket] = (missedLengthsCount[bucket] || 0) + 1;
  }

  // Update Target Practice stats if applicable
  const targetPracticeStats = { ...current.targetPracticeStats };
  if (round.mode === 'target_practice' && round.targetLength) {
    const tLen = round.targetLength;
    const foundTargetWords = round.wordsFound.filter((w) => w.length >= tLen).length;
    const currentT = targetPracticeStats[tLen] || { attempts: 0, found: 0, successRate: 0 };
    const attempts = currentT.attempts + 1;
    const found = currentT.found + foundTargetWords;
    const successRate = Number(((found / (attempts * 5)) * 100).toFixed(1)); // relative to typical benchmark
    targetPracticeStats[tLen] = { attempts, found, successRate };
  }

  // Summary entry for history
  const summary: RoundResultSummary = {
    id: round.id,
    timestamp: round.timestamp,
    score: round.score,
    mode: round.mode,
    wordsCount: round.wordsFound.length,
    averageWordLength: round.averageWordLength,
    longestWord: round.longestWord,
    targetReached400: round.score >= 400,
    totalPossibleScore: round.totalPossibleScore,
  };

  const history = [summary, ...current.history].slice(0, 50);

  const updated: UserStats = {
    totalGames,
    gamesReached400,
    bestScore,
    bestScoreDate,
    averageScore,
    totalScoreAllTime,
    totalWordsFound,
    averageWordLengthAllTime,
    longestWordAllTime,
    mostFrequentLengths,
    missedLengthsCount,
    history,
    targetPracticeStats,
  };

  saveUserStats(updated);
  saveFullRound(round);
  return updated;
}

export function saveFullRound(round: RoundResult): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_ROUNDS_KEY);
    const list: RoundResult[] = raw ? JSON.parse(raw) : [];
    const updated = [round, ...list.filter((r) => r.id !== round.id)].slice(0, 10);
    localStorage.setItem(RECENT_ROUNDS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save full round:', err);
  }
}

export function getFullRound(id: string): RoundResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RECENT_ROUNDS_KEY);
    if (!raw) return null;
    const list: RoundResult[] = JSON.parse(raw);
    return list.find((r) => r.id === id) || null;
  } catch {
    return null;
  }
}

export function getSavedBoards(): BoardData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_BOARDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBoardForReplay(board: BoardData): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getSavedBoards();
    if (!list.some((b) => b.id === board.id)) {
      const updated = [board, ...list].slice(0, 20);
      localStorage.setItem(SAVED_BOARDS_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to save board for replay:', err);
  }
}

export function loadSettings(): WordboxSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: WordboxSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
