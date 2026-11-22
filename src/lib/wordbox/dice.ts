/**
 * Dice and Letter distributions for Plato Wordbox 5x5 simulation & training boards.
 */

// Official 25 Big Boggle (5x5) dice faces
export const BIG_BOGGLE_DICE_25: string[] = [
  'AAAFRS', 'AAEEEE', 'AAFIRS', 'ADENNN', 'AEEEEM',
  'AEEGMU', 'AEGMNN', 'AFIRSY', 'BJKQXZ', 'CCNSTW',
  'CEIILT', 'CEILPT', 'CEIPST', 'DDHNOT', 'DHHLOR',
  'DHHNOW', 'DHLNOR', 'EIIITT', 'EMOTTT', 'ENSSSU',
  'FIPRSY', 'GORRVW', 'IPRRRY', 'NOOTUW', 'OOOTTU',
];

// High-impact affixes and suffix clusters that power 400+ point runs in Plato Wordbox
export const COMPETITIVE_CLUSTER_PATTERNS = [
  ['S', 'E', 'D', 'R', 'T'], // Stem + S, ED, ER
  ['I', 'N', 'G', 'S', 'T'], // Stem + ING, INGS
  ['A', 'T', 'E', 'S', 'D'], // ATE, ATED, ATES
  ['C', 'A', 'R', 'E', 'S'], // CARE, CARES, CARER, CARED
  ['S', 'T', 'A', 'R', 'E'], // STAR, STARE, STARES, STARED, STARTS
  ['P', 'L', 'A', 'Y', 'S'], // PLAY, PLAYS, PLAYER, PLAYED
  ['L', 'I', 'V', 'E', 'S'], // LIVE, LIVES, LIVED, LIVER
];

// Weighted English distribution tuned for word-finding games
// Standard frequencies slightly elevated for vowels (A, E, I, O, U) to avoid dry boards
export const LETTER_WEIGHTS_400: Record<string, number> = {
  E: 13.0,
  A: 9.5,
  I: 8.5,
  O: 8.0,
  T: 8.0,
  N: 7.0,
  R: 7.0,
  S: 8.5, // slightly boosted for Plato suffix chaining
  L: 5.0,
  D: 4.5,
  C: 3.5,
  U: 4.0,
  M: 3.0,
  P: 3.0,
  F: 2.2,
  G: 2.5,
  Y: 2.5,
  W: 2.0,
  B: 1.8,
  V: 1.2,
  K: 1.0,
  H: 3.0,
  J: 0.3,
  X: 0.3,
  Z: 0.3,
  Q: 0.2,
};

export const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
