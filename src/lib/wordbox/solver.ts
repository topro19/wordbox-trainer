import { BoardWord, ScoringConfig } from '@/types/wordbox';
import { getTrieRoot, TrieNode } from './dictionary';
import { calculateWordPoints, PLATO_OFFICIAL_SCORING } from './scoring';

// Pre-computed 8-direction adjacency for a 5x5 grid
export const NEIGHBORS_5X5: number[][] = Array.from({ length: 25 }, (_, idx) => {
  const r = Math.floor(idx / 5);
  const c = idx % 5;
  const list: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
        list.push(nr * 5 + nc);
      }
    }
  }
  return list;
});

export interface SolvedBoardResult {
  wordsMap: Map<string, BoardWord>;
  wordsList: BoardWord[]; // Sorted by score descending, then length descending
  totalPossibleWords: number;
  totalPossibleScore: number;
  longestWords: string[];
  wordsByLength: Record<number, BoardWord[]>;
  bonusTileWordsCount: number;
  wordClusters: Array<{ root: string; variations: string[] }>;
}

/**
 * High-performance solver: finds all valid words and their paths on a 5x5 board in < 15ms.
 */
export function solveBoard(
  letters: string[],
  bonusTileIndex: number = -1,
  config: ScoringConfig = PLATO_OFFICIAL_SCORING,
  rootNode: TrieNode = getTrieRoot()
): SolvedBoardResult {
  const upperLetters = letters.map((l) => l.toUpperCase());
  const wordsMap = new Map<string, BoardWord>();
  const visited = new Array<boolean>(25).fill(false);
  const currentPath: number[] = [];

  function dfs(idx: number, node: TrieNode) {
    const ch = upperLetters[idx];
    const nextNode = node.children[ch];
    if (!nextNode) return;

    currentPath.push(idx);
    visited[idx] = true;

    if (nextNode.isWord && currentPath.length >= config.minWordLength) {
      const word = currentPath.map((i) => upperLetters[i]).join('');
      const isBonusUsed = bonusTileIndex >= 0 && currentPath.includes(bonusTileIndex);
      const points = calculateWordPoints(word.length, isBonusUsed, config);

      const existing = wordsMap.get(word);
      // If not yet seen, or existing didn't use bonus and this one does, use the bonus one!
      if (!existing || (!existing.isBonusUsed && isBonusUsed)) {
        wordsMap.set(word, {
          word,
          path: [...currentPath],
          score: points.total,
          baseScore: points.baseScore,
          bonusPoints: points.bonusPoints,
          length: word.length,
          isBonusUsed,
        });
      }
    }

    const neighbors = NEIGHBORS_5X5[idx];
    for (let i = 0; i < neighbors.length; i++) {
      const nIdx = neighbors[i];
      if (!visited[nIdx]) {
        dfs(nIdx, nextNode);
      }
    }

    visited[idx] = false;
    currentPath.pop();
  }

  // Run DFS from all 25 tile positions
  for (let i = 0; i < 25; i++) {
    dfs(i, rootNode);
  }

  const wordsList = Array.from(wordsMap.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.length !== a.length) return b.length - a.length;
    return a.word.localeCompare(b.word);
  });

  let totalPossibleScore = 0;
  const wordsByLength: Record<number, BoardWord[]> = {};
  let bonusTileWordsCount = 0;

  for (const item of wordsList) {
    totalPossibleScore += item.score;
    if (item.isBonusUsed) bonusTileWordsCount++;
    const len = item.length;
    if (!wordsByLength[len]) wordsByLength[len] = [];
    wordsByLength[len].push(item);
  }

  const longestWords = wordsList
    .slice(0, 10)
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)
    .map((w) => w.word);

  // Group root clusters (e.g. CARE, CARES, CARED)
  const clusters: Array<{ root: string; variations: string[] }> = [];
  const processedRoots = new Set<string>();

  for (const item of wordsList) {
    if (item.length === 4 && !processedRoots.has(item.word)) {
      const variations = wordsList
        .filter((w) => w.word !== item.word && w.word.startsWith(item.word))
        .map((w) => w.word);
      if (variations.length >= 2) {
        processedRoots.add(item.word);
        clusters.push({ root: item.word, variations });
      }
    }
  }

  return {
    wordsMap,
    wordsList,
    totalPossibleWords: wordsList.length,
    totalPossibleScore,
    longestWords,
    wordsByLength,
    bonusTileWordsCount,
    wordClusters: clusters.slice(0, 6),
  };
}
