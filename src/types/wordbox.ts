export type BoardGeneratorType = 
  | 'competitive_400' 
  | 'boggle_dice' 
  | 'weighted_corpus' 
  | 'custom';

export type GameMode = 
  | 'timed_60' 
  | 'untimed' 
  | 'target_practice' 
  | 'replay';

export type TargetLength = 5 | 6 | 7 | 8;

export interface LetterTile {
  id: number; // 0 to 24
  letter: string;
  row: number; // 0 to 4
  col: number; // 0 to 4
  isBonus: boolean; // blue bonus tile
}

export interface BoardData {
  id: string;
  letters: string[]; // 25 letters
  bonusTileIndex: number;
  generatorType: BoardGeneratorType;
  seed?: string;
  createdAt: number;
  totalPossibleWords?: number;
  totalPossibleScore?: number;
  longestWord?: string;
}

export interface WordSubmission {
  word: string;
  path: number[];
  score: number;
  baseScore: number;
  bonusPoints: number;
  length: number;
  isBonusUsed: boolean;
  timestamp: number;
}

export interface BoardWord {
  word: string;
  path: number[];
  score: number;
  baseScore: number;
  bonusPoints: number;
  length: number;
  isBonusUsed: boolean;
}

export interface ScoringConfig {
  preset: 'plato_official' | 'classic_boggle' | 'custom';
  pointsByLength: Record<number, number>; // 3: 1, 4: 6, 5: 8, 6: 10, 7: 12
  points8Plus: number; // 14 for Plato
  bonusTilePoints: number; // +3 for Plato blue tile
  minWordLength: number; // 3
}

export interface RoundResult {
  id: string;
  board: BoardData;
  mode: GameMode;
  targetLength?: TargetLength;
  timestamp: number;
  score: number;
  targetReached400: boolean;
  wordsFound: WordSubmission[];
  wordsMissed: BoardWord[];
  totalPossibleWords: number;
  totalPossibleScore: number;
  durationSeconds: number;
  averageWordLength: number;
  longestWord: string;
  pointsByLength: Record<number, { count: number; points: number }>;
  bonusTileWordsCount: number;
  wpm: number;
  wordsPerSecond: number;
  accuracyRate: number; // submitted valid / total attempts
}

export interface UserStats {
  totalGames: number;
  gamesReached400: number;
  bestScore: number;
  bestScoreDate?: number;
  averageScore: number;
  totalScoreAllTime: number;
  totalWordsFound: number;
  averageWordLengthAllTime: number;
  longestWordAllTime: string;
  mostFrequentLengths: Record<number, number>; // length -> count
  missedLengthsCount: Record<number, number>; // length -> missed count
  history: RoundResultSummary[];
  targetPracticeStats: Record<TargetLength, { attempts: number; found: number; successRate: number }>;
}

export interface RoundResultSummary {
  id: string;
  timestamp: number;
  score: number;
  mode: GameMode;
  wordsCount: number;
  averageWordLength: number;
  longestWord: string;
  targetReached400: boolean;
  totalPossibleScore: number;
}
