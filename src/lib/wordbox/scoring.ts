import { ScoringConfig, WordSubmission } from '@/types/wordbox';

export const PLATO_OFFICIAL_SCORING: ScoringConfig = {
  preset: 'plato_official',
  pointsByLength: {
    3: 1,
    4: 6,
    5: 8,
    6: 10,
    7: 12,
  },
  points8Plus: 14,
  bonusTilePoints: 3,
  minWordLength: 3,
};

export const CLASSIC_BOGGLE_SCORING: ScoringConfig = {
  preset: 'classic_boggle',
  pointsByLength: {
    3: 1,
    4: 1,
    5: 2,
    6: 3,
    7: 5,
  },
  points8Plus: 11,
  bonusTilePoints: 0,
  minWordLength: 3,
};

/**
 * Calculates points for a given word length and bonus tile status
 */
export function calculateWordPoints(
  length: number,
  isBonusUsed: boolean,
  config: ScoringConfig = PLATO_OFFICIAL_SCORING
): { total: number; baseScore: number; bonusPoints: number } {
  if (length < config.minWordLength) {
    return { total: 0, baseScore: 0, bonusPoints: 0 };
  }

  let baseScore = 0;
  if (length in config.pointsByLength) {
    baseScore = config.pointsByLength[length];
  } else if (length >= 8) {
    baseScore = config.points8Plus;
  } else {
    baseScore = 0;
  }

  const bonusPoints = isBonusUsed ? config.bonusTilePoints : 0;
  return {
    total: baseScore + bonusPoints,
    baseScore,
    bonusPoints,
  };
}

/**
 * Formats a description of the active scoring system
 */
export function getScoringDisclosure(config: ScoringConfig): string {
  if (config.preset === 'plato_official') {
    return 'Plato Wordbox Official: 3L=1pt, 4L=6pts, 5L=8pts, 6L=10pts, 7L=12pts, 8+L=14pts. Blue Tile adds +3pts.';
  }
  if (config.preset === 'classic_boggle') {
    return 'Classic Boggle 5×5: 3L=1pt, 4L=1pt, 5L=2pts, 6L=3pts, 7L=5pts, 8+L=11pts. No bonus tiles.';
  }
  return `Custom: 3L=${config.pointsByLength[3] ?? 0}pt, 4L=${config.pointsByLength[4] ?? 0}pts, 8+L=${config.points8Plus}pts. Bonus=+${config.bonusTilePoints}pts.`;
}
