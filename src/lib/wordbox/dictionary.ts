import { EMBEDDED_CORE_WORDS } from './embeddedDict';

export interface TrieNode {
  children: { [key: string]: TrieNode };
  isWord: boolean;
}

export function createTrieNode(): TrieNode {
  return {
    children: {},
    isWord: false,
  };
}

export function insertWord(root: TrieNode, word: string): void {
  let curr = root;
  const upper = word.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    if (!curr.children[ch]) {
      curr.children[ch] = createTrieNode();
    }
    curr = curr.children[ch];
  }
  curr.isWord = true;
}

// Global dictionary state
let trieRoot: TrieNode = createTrieNode();
let wordSet: Set<string> = new Set<string>();
let isLoaded = false;
let isFullDictionary = false;
let loadPromise: Promise<number> | null = null;

// Initialize with embedded core words right away
for (const word of EMBEDDED_CORE_WORDS) {
  insertWord(trieRoot, word);
  wordSet.add(word);
}

export function loadDictionaryFromLines(lines: string[]): number {
  const newRoot = createTrieNode();
  const newSet = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw.length >= 3) {
      const upper = raw.toUpperCase();
      insertWord(newRoot, upper);
      newSet.add(upper);
    }
  }

  trieRoot = newRoot;
  wordSet = newSet;
  isLoaded = true;
  isFullDictionary = true;
  return wordSet.size;
}

/**
 * Loads the full ENABLE1 172k-word dictionary asynchronously
 */
export async function initFullDictionary(): Promise<number> {
  if (isFullDictionary) return wordSet.size;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      if (typeof window === 'undefined') {
        // Running in Node / SSR / Test environment
        const fs = await import('fs');
        const path = await import('path');
        const dictPath = path.resolve(process.cwd(), 'public/wordbox_dict.txt');
        if (fs.existsSync(dictPath)) {
          const text = fs.readFileSync(dictPath, 'utf-8');
          return loadDictionaryFromLines(text.split('\n'));
        }
      }

      // Running in Browser environment: try relative subpath, then root path
      const possibleUrls = [
        './wordbox_dict.txt',
        '/wordbox-trainer/wordbox_dict.txt',
        '/wordbox_dict.txt',
      ];
      let text = '';
      for (const url of possibleUrls) {
        try {
          const resp = await fetch(url);
          if (resp.ok) {
            text = await resp.text();
            break;
          }
        } catch {
          // try next url
        }
      }

      if (!text) {
        console.warn('Could not load full dictionary file, running on embedded core dictionary.');
        isLoaded = true;
        return wordSet.size;
      }
      return loadDictionaryFromLines(text.split('\n'));
    } catch (err) {
      console.warn('Network error loading dictionary, fallback to embedded core:', err);
      isLoaded = true;
      return wordSet.size;
    }
  })();

  return loadPromise;
}

export function isValidWord(word: string): boolean {
  if (!word || word.length < 3) return false;
  return wordSet.has(word.toUpperCase());
}

export function isPrefix(prefix: string): boolean {
  if (!prefix) return true;
  let curr = trieRoot;
  const upper = prefix.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    if (!curr.children[ch]) return false;
    curr = curr.children[ch];
  }
  return true;
}

export function getTrieRoot(): TrieNode {
  return trieRoot;
}

export function getDictionaryInfo(): {
  isLoaded: boolean;
  isFullDictionary: boolean;
  wordCount: number;
  source: string;
} {
  return {
    isLoaded: true,
    isFullDictionary,
    wordCount: wordSet.size,
    source: isFullDictionary
      ? 'ENABLE1 Benchmark English Lexicon (172,727 words - Standard for Words With Friends & Scrabble variants)'
      : 'Embedded Core Lexicon (Upgrading to full ENABLE1...)',
  };
}
