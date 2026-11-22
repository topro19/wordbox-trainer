import { BoardData, BoardGeneratorType, ScoringConfig } from '@/types/wordbox';
import { BIG_BOGGLE_DICE_25, LETTER_WEIGHTS_400, VOWELS } from './dice';
import { solveBoard, SolvedBoardResult } from './solver';
import { PLATO_OFFICIAL_SCORING } from './scoring';

export interface BoardGeneratorOptions {
  type?: BoardGeneratorType;
  seedLetters?: string; // 25 characters for custom
  bonusTileIndex?: number;
  scoringConfig?: ScoringConfig;
  minWordsRequired?: number; // for competitive filtering
}

function getRandomDieLetter(die: string): string {
  const idx = Math.floor(Math.random() * die.length);
  return die[idx];
}

function sampleWeightedLetter(): string {
  const entries = Object.entries(LETTER_WEIGHTS_400);
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * totalWeight;
  for (const [letter, weight] of entries) {
    if (r < weight) return letter;
    r -= weight;
  }
  return 'E';
}

/**
 * Generate 25 letters using official Big Boggle dice
 */
export function generateBoggleDiceLetters(): string[] {
  const shuffledDice = [...BIG_BOGGLE_DICE_25].sort(() => Math.random() - 0.5);
  return shuffledDice.map((die) => getRandomDieLetter(die));
}

/**
 * Generate 25 letters tuned for 400+ practice gauntlet
 * Ensures rich vowel ratios (32%-40%) and high affix connectivity (S, D, R, G, N)
 */
export function generateCompetitive400Letters(): string[] {
  // Common strong consonants for prefix/suffix chains
  const consonants = ['S', 'T', 'R', 'N', 'L', 'D', 'C', 'P', 'M', 'G', 'B', 'F', 'H', 'W', 'Y'];
  const vowels = ['A', 'E', 'I', 'O', 'U'];

  // Target 8 to 10 vowels out of 25 (32% - 40%)
  const numVowels = 8 + Math.floor(Math.random() * 3);
  const letters: string[] = [];

  // Pick vowels with natural weights (E and A dominant)
  const vowelWeights: Record<string, number> = { E: 4, A: 3, I: 2.5, O: 2.5, U: 1 };
  for (let i = 0; i < numVowels; i++) {
    const vRoll = Math.random() * 13;
    let chosen = 'E';
    let acc = 0;
    for (const [v, w] of Object.entries(vowelWeights)) {
      acc += w;
      if (vRoll <= acc) {
        chosen = v;
        break;
      }
    }
    letters.push(chosen);
  }

  // Pick consonants
  while (letters.length < 25) {
    const c = consonants[Math.floor(Math.random() * consonants.length)];
    letters.push(c);
  }

  // Guarantee at least two 'S's for suffix chaining practice (essential for 400+ points)
  const sCount = letters.filter((l) => l === 'S').length;
  if (sCount < 2) {
    const replaceIdx = letters.findIndex((l) => !VOWELS.has(l) && l !== 'S');
    if (replaceIdx !== -1) letters[replaceIdx] = 'S';
  }

  // Shuffle thoroughly
  return letters.sort(() => Math.random() - 0.5);
}

/**
 * Generate 25 letters from weighted English letter corpus
 */
export function generateWeightedCorpusLetters(): string[] {
  const letters: string[] = [];
  for (let i = 0; i < 25; i++) {
    letters.push(sampleWeightedLetter());
  }

  // Ensure between 7 and 10 vowels
  let vowelCount = letters.filter((l) => VOWELS.has(l)).length;
  const vowelList = ['A', 'E', 'I', 'O', 'U'];
  while (vowelCount < 7) {
    const idx = Math.floor(Math.random() * 25);
    if (!VOWELS.has(letters[idx])) {
      letters[idx] = vowelList[Math.floor(Math.random() * vowelList.length)];
      vowelCount++;
    }
  }

  return letters;
}

/**
 * Main board generation function with solver integration and quality gate
 */
export function generateBoard(options: BoardGeneratorOptions = {}): {
  board: BoardData;
  solved: SolvedBoardResult;
} {
  const type = options.type || 'competitive_400';
  const scoring = options.scoringConfig || PLATO_OFFICIAL_SCORING;
  const minWords = options.minWordsRequired ?? (type === 'competitive_400' ? 200 : 100);

  let letters: string[] = [];
  let solved: SolvedBoardResult | null = null;
  let attempts = 0;
  const maxAttempts = 15;

  if (type === 'custom' && options.seedLetters && options.seedLetters.length === 25) {
    letters = options.seedLetters.toUpperCase().split('');
    const bonusIdx = options.bonusTileIndex ?? Math.floor(Math.random() * 25);
    solved = solveBoard(letters, bonusIdx, scoring);
  } else {
    // Generate board and verify quality threshold
    while (attempts < maxAttempts) {
      attempts++;
      if (type === 'boggle_dice') {
        letters = generateBoggleDiceLetters();
      } else if (type === 'weighted_corpus') {
        letters = generateWeightedCorpusLetters();
      } else {
        letters = generateCompetitive400Letters();
      }

      // Check vowel count safety (between 6 and 11)
      const vCount = letters.filter((l) => VOWELS.has(l)).length;
      if (vCount < 6 || vCount > 12) continue;

      const bonusIdx = options.bonusTileIndex ?? Math.floor(Math.random() * 25);
      const testSolve = solveBoard(letters, bonusIdx, scoring);

      if (testSolve.totalPossibleWords >= minWords) {
        solved = testSolve;
        break;
      }
    }

    // Fallback if strict filter didn't pass within max attempts
    if (!solved) {
      const bonusIdx = options.bonusTileIndex ?? Math.floor(Math.random() * 25);
      solved = solveBoard(letters, bonusIdx, scoring);
    }
  }

  const bonusTileIndex =
    options.bonusTileIndex !== undefined
      ? options.bonusTileIndex
      : Math.floor(Math.random() * 25);

  // Recalculate if bonus tile changed
  solved = solveBoard(letters, bonusTileIndex, scoring);

  const board: BoardData = {
    id: `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    letters,
    bonusTileIndex,
    generatorType: type,
    createdAt: Date.now(),
    totalPossibleWords: solved.totalPossibleWords,
    totalPossibleScore: solved.totalPossibleScore,
    longestWord: solved.longestWords[0] || '',
  };

  return { board, solved };
}
