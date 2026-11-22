"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BoardData,
  BoardWord,
  GameMode,
  LetterTile,
  RoundResult,
  TargetLength,
  UserStats,
  WordSubmission,
} from '@/types/wordbox';
import { generateBoard } from '@/lib/wordbox/boardGenerator';
import { NEIGHBORS_5X5, solveBoard, SolvedBoardResult } from '@/lib/wordbox/solver';
import { calculateWordPoints, getScoringDisclosure, PLATO_OFFICIAL_SCORING } from '@/lib/wordbox/scoring';
import { initFullDictionary, isValidWord } from '@/lib/wordbox/dictionary';
import { soundManager } from '@/lib/wordbox/sound';
import {
  loadSettings,
  loadUserStats,
  recordRoundCompletion,
  saveBoardForReplay,
  saveSettings,
  WordboxSettings,
} from '@/lib/wordbox/storage';

import { ScoreHeader } from './ScoreHeader';
import { BoardView } from './BoardView';
import { WordInputBar } from './WordInputBar';
import { RecentWordsList } from './RecentWordsList';
import { PathInspectorOverlay } from './PathInspectorOverlay';
import { PostRoundAnalysisModal } from './PostRoundAnalysisModal';
import { TrainingInsightsView } from './TrainingInsightsView';
import { TargetPracticeSetup } from './TargetPracticeSetup';
import { StrategyGuideModal } from './StrategyGuideModal';
import { ConfigModal } from './ConfigModal';

import {
  Trophy,
  Play,
  RotateCcw,
  BarChart2,
  Sliders,
  BookOpen,
  Target,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

export default function WordboxGame() {
  // Settings & Stats
  const [settings, setSettings] = useState<WordboxSettings>(loadSettings);
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats);
  const [isDictionaryReady, setIsDictionaryReady] = useState<boolean>(false);

  // Active Game State
  const [mode, setMode] = useState<GameMode>('timed_60');
  const [targetLength, setTargetLength] = useState<TargetLength>(5);
  const [targetWordsQuota, setTargetWordsQuota] = useState<number>(6);

  const [board, setBoard] = useState<BoardData | null>(null);
  const [solved, setSolved] = useState<SolvedBoardResult | null>(null);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [submittedWords, setSubmittedWords] = useState<WordSubmission[]>([]);
  const [submittedWordsSet, setSubmittedWordsSet] = useState<Set<string>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [bonusWordsCount, setBonusWordsCount] = useState<number>(0);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Feedback & Inspection
  const [feedback, setFeedback] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);
  const [inspectedWord, setInspectedWord] = useState<BoardWord | null>(null);
  const [postRoundResult, setPostRoundResult] = useState<RoundResult | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'none' | 'analysis' | 'insights' | 'strategy' | 'config'
  >('none');

  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const tickPlayedSecondsRef = useRef<Set<number>>(new Set());

  // Show a momentary feedback banner
  const showFeedback = useCallback(
    (text: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', durationMs = 1200) => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      setFeedback({ text, type });
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
      }, durationMs);
    },
    []
  );

  // Initialize dictionary in background
  useEffect(() => {
    initFullDictionary().then(() => {
      setIsDictionaryReady(true);
    });
    setUserStats(loadUserStats());
    setSettings(loadSettings());
  }, []);

  // Sync sound mute with soundManager
  useEffect(() => {
    soundManager.setMuted(settings.soundMuted);
  }, [settings.soundMuted]);

  // Convert board letters to tile objects
  const tiles: LetterTile[] = useMemo(() => {
    if (!board) return [];
    return board.letters.map((letter, id) => ({
      id,
      letter,
      row: Math.floor(id / 5),
      col: id % 5,
      isBonus: id === board.bonusTileIndex,
    }));
  }, [board]);

  // Current word string
  const currentWord = useMemo(() => {
    if (!board || currentPath.length === 0) return '';
    return currentPath.map((idx) => board.letters[idx]).join('');
  }, [board, currentPath]);

  // Points preview for active word
  const currentWordPoints = useMemo(() => {
    if (!board || currentPath.length < 3) return { total: 0, baseScore: 0, bonusPoints: 0 };
    const isBonusUsed = currentPath.includes(board.bonusTileIndex);
    return calculateWordPoints(currentPath.length, isBonusUsed, settings.scoringConfig);
  }, [board, currentPath, settings.scoringConfig]);

  const isCurrentBonusUsed = board ? currentPath.includes(board.bonusTileIndex) : false;

  // Initialize or generate a new board
  const startNewBoard = useCallback(
    (options?: { customSeed?: string; customMode?: GameMode; customTarget?: TargetLength }) => {
      const targetMode = options?.customMode || mode;
      const targetLen = options?.customTarget || targetLength;

      const { board: newBoard, solved: newSolved } = generateBoard({
        type:
          options?.customSeed
            ? 'custom'
            : (settings.preferredGenerator as any) || 'competitive_400',
        seedLetters: options?.customSeed,
        scoringConfig: settings.scoringConfig,
      });

      setBoard(newBoard);
      setSolved(newSolved);
      setCurrentPath([]);
      setSubmittedWords([]);
      setSubmittedWordsSet(new Set());
      setScore(0);
      setBonusWordsCount(0);
      setTimeLeft(60);
      setIsPlaying(false);
      setIsPaused(false);
      setHasStarted(false);
      setInspectedWord(null);
      setPostRoundResult(null);
      tickPlayedSecondsRef.current.clear();
      saveBoardForReplay(newBoard);

      if (targetMode === 'untimed' || targetMode === 'target_practice') {
        setIsPlaying(true);
        setHasStarted(true);
      }
    },
    [mode, targetLength, settings]
  );

  // Generate initial board on mount
  useEffect(() => {
    startNewBoard();
  }, [startNewBoard]);

  // Finish Round and compute full post-round statistics
  const finishRound = useCallback(() => {
    if (!board || !solved) return;
    setIsPlaying(false);
    setIsPaused(false);
    soundManager.playTimeUp();

    // Calculate missed words
    const missedWords: BoardWord[] = solved.wordsList.filter(
      (w) => !submittedWordsSet.has(w.word)
    );

    // Compute average length
    const totalChars = submittedWords.reduce((acc, w) => acc + w.length, 0);
    const avgLen =
      submittedWords.length > 0 ? Number((totalChars / submittedWords.length).toFixed(1)) : 0;

    // Longest word
    let longest = '';
    for (const w of submittedWords) {
      if (w.word.length > longest.length) longest = w.word;
    }

    // Points by length
    const pointsByLength: Record<number, { count: number; points: number }> = {
      3: { count: 0, points: 0 },
      4: { count: 0, points: 0 },
      5: { count: 0, points: 0 },
      6: { count: 0, points: 0 },
      7: { count: 0, points: 0 },
      8: { count: 0, points: 0 },
    };

    for (const w of submittedWords) {
      const bucket = Math.min(w.length, 8);
      pointsByLength[bucket].count += 1;
      pointsByLength[bucket].points += w.score;
    }

    const duration = mode === 'timed_60' ? 60 - timeLeft : 60;
    const wpm = duration > 0 ? Math.round((submittedWords.length / duration) * 60) : 0;
    const wordsPerSecond = duration > 0 ? Number((submittedWords.length / duration).toFixed(2)) : 0;

    const result: RoundResult = {
      id: `round_${Date.now()}`,
      board,
      mode,
      targetLength: mode === 'target_practice' ? targetLength : undefined,
      timestamp: Date.now(),
      score,
      targetReached400: score >= 400,
      wordsFound: submittedWords,
      wordsMissed: missedWords,
      totalPossibleWords: solved.totalPossibleWords,
      totalPossibleScore: solved.totalPossibleScore,
      durationSeconds: Math.round(duration),
      averageWordLength: avgLen,
      longestWord: longest,
      pointsByLength,
      bonusTileWordsCount: bonusWordsCount,
      wpm,
      wordsPerSecond,
      accuracyRate: 100,
    };

    // Save and update user insights in localStorage
    const updatedStats = recordRoundCompletion(result);
    setUserStats(updatedStats);
    setPostRoundResult(result);

    if (score >= 400) {
      soundManager.playMilestone400Fanfare();
    }

    setActiveModal('analysis');
  }, [
    board,
    solved,
    submittedWords,
    submittedWordsSet,
    score,
    bonusWordsCount,
    mode,
    timeLeft,
    targetLength,
  ]);

  // 60-Second Accurate Game Timer Loop
  useEffect(() => {
    if (mode !== 'timed_60' || !isPlaying || isPaused) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const deltaMs = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      setTimeLeft((prev) => {
        const next = Math.max(0, prev - deltaMs / 1000);

        // Sound countdown tick for last 10 seconds
        const wholeSec = Math.ceil(next);
        if (wholeSec <= 10 && wholeSec > 0 && !tickPlayedSecondsRef.current.has(wholeSec)) {
          tickPlayedSecondsRef.current.add(wholeSec);
          soundManager.playTick();
        }

        if (next <= 0) {
          finishRound();
          return 0;
        }
        return next;
      });

      if (timeLeft > 0) {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [mode, isPlaying, isPaused, finishRound, timeLeft]);

  // Handle tile selection via drag or click
  const handleTileSelect = useCallback(
    (index: number) => {
      if (inspectedWord) setInspectedWord(null);

      // Start round on first tile interaction if timed mode
      if (!hasStarted && mode === 'timed_60') {
        setIsPlaying(true);
        setHasStarted(true);
      }

      setCurrentPath((prev) => {
        // If path is empty, start fresh
        if (prev.length === 0) {
          soundManager.playTileSelect(0);
          return [index];
        }

        // Backtrack behavior: If dragging back to second-to-last tile, pop the last tile
        if (prev.length >= 2 && prev[prev.length - 2] === index) {
          soundManager.playTileSelect(prev.length - 2);
          return prev.slice(0, prev.length - 1);
        }

        // Check if tile is already visited in this word (tile reuse prevention)
        if (prev.includes(index)) {
          return prev;
        }

        // Check 8-direction adjacency
        const lastIndex = prev[prev.length - 1];
        const isNeighbor = NEIGHBORS_5X5[lastIndex].includes(index);
        if (!isNeighbor) {
          return prev;
        }

        soundManager.playTileSelect(prev.length);
        return [...prev, index];
      });
    },
    [inspectedWord, hasStarted, mode]
  );

  // Click-to-chain handling
  const handleTileClick = useCallback(
    (index: number) => {
      if (inspectedWord) {
        setInspectedWord(null);
        return;
      }

      if (currentPath.length > 0 && currentPath[currentPath.length - 1] === index) {
        // Double clicked the head of path -> submit word!
        submitCurrentWord();
        return;
      }

      handleTileSelect(index);
    },
    [inspectedWord, currentPath, handleTileSelect]
  );

  // Submit current word and immediately continue
  const submitCurrentWord = useCallback(() => {
    if (!board || currentPath.length === 0) return;

    const word = currentPath.map((idx) => board.letters[idx]).join('').toUpperCase();

    // 1. Length validation (Plato requires >= 3 letters)
    if (word.length < settings.scoringConfig.minWordLength) {
      soundManager.playInvalidWord();
      showFeedback(`Must be ≥ ${settings.scoringConfig.minWordLength} letters`, 'warning');
      setCurrentPath([]);
      return;
    }

    // 2. Duplicate submission prevention
    if (submittedWordsSet.has(word)) {
      soundManager.playDuplicateWord();
      showFeedback(`Already submitted "${word}"`, 'warning');
      setCurrentPath([]);
      return;
    }

    // 3. Dictionary validation
    const valid = isValidWord(word);
    if (!valid) {
      soundManager.playInvalidWord();
      showFeedback(`"${word}" not in dictionary`, 'error');
      setCurrentPath([]);
      return;
    }

    // Valid word! Calculate points
    const isBonusUsed = currentPath.includes(board.bonusTileIndex);
    const pts = calculateWordPoints(word.length, isBonusUsed, settings.scoringConfig);

    const submission: WordSubmission = {
      word,
      path: [...currentPath],
      score: pts.total,
      baseScore: pts.baseScore,
      bonusPoints: pts.bonusPoints,
      length: word.length,
      isBonusUsed,
      timestamp: Date.now(),
    };

    soundManager.playWordValid(word.length, isBonusUsed);

    setSubmittedWords((prev) => [...prev, submission]);
    setSubmittedWordsSet((prev) => new Set([...prev, word]));
    setScore((prev) => prev + pts.total);
    if (isBonusUsed) setBonusWordsCount((prev) => prev + 1);

    const bonusLabel = isBonusUsed ? ` (+${pts.bonusPoints} Blue!)` : '';
    showFeedback(`+${pts.total} pts! "${word}"${bonusLabel}`, 'success', 900);

    // Clear path immediately for next word
    setCurrentPath([]);
  }, [
    board,
    currentPath,
    settings.scoringConfig,
    submittedWordsSet,
    showFeedback,
  ]);

  // Pointer release handler (auto-submits if path >= 3 letters)
  const handlePathRelease = useCallback(() => {
    if (currentPath.length >= 3) {
      submitCurrentWord();
    } else {
      setCurrentPath([]);
    }
  }, [currentPath, submitCurrentWord]);

  // Keyboard support: Type letters to form words, Enter to submit, Esc to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeModal !== 'none') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();

      if (e.key === 'Enter') {
        e.preventDefault();
        submitCurrentWord();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCurrentPath([]);
        setInspectedWord(null);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setCurrentPath((prev) => prev.slice(0, prev.length - 1));
      } else if (/^[A-Z]$/.test(key) && board) {
        e.preventDefault();
        // Start round if not started
        if (!hasStarted && mode === 'timed_60') {
          setIsPlaying(true);
          setHasStarted(true);
        }

        // Find matching adjacent tile
        if (currentPath.length === 0) {
          // Pick any matching letter on the board
          const matchIdx = board.letters.findIndex((l) => l === key);
          if (matchIdx !== -1) handleTileSelect(matchIdx);
        } else {
          const lastIdx = currentPath[currentPath.length - 1];
          const matchNeighbor = NEIGHBORS_5X5[lastIdx].find(
            (n) => board.letters[n] === key && !currentPath.includes(n)
          );
          if (matchNeighbor !== undefined) {
            handleTileSelect(matchNeighbor);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, board, currentPath, hasStarted, mode, handleTileSelect, submitCurrentWord]);

  // Inspect path of a missed or found word on the 5x5 board
  const handleInspectWord = (wordItem: BoardWord) => {
    setInspectedWord(wordItem);
    setActiveModal('none'); // Close modal so user can view the board directly
  };

  // Replay the exact current board
  const handleReplayBoard = () => {
    if (!board || !solved) return;
    setCurrentPath([]);
    setSubmittedWords([]);
    setSubmittedWordsSet(new Set());
    setScore(0);
    setBonusWordsCount(0);
    setTimeLeft(60);
    setIsPlaying(mode !== 'timed_60');
    setIsPaused(false);
    setHasStarted(mode !== 'timed_60');
    setInspectedWord(null);
    setPostRoundResult(null);
    setActiveModal('none');
    tickPlayedSecondsRef.current.clear();
  };

  // Switch training mode
  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    startNewBoard({ customMode: newMode });
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Top Main Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center font-black text-slate-950 text-base shadow-md shadow-sky-500/25">
              W
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                <span>Wordbox Trainer</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                  5×5
                </span>
              </h1>
              <span className="text-[10px] text-slate-400 block font-medium">
                Plato 400+ Mastery Engine
              </span>
            </div>
          </div>

          {/* Quick Nav Tools */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            <button
              onClick={() => setActiveModal('insights')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 transition-colors"
            >
              <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Analytics</span>
              {userStats.bestScore > 0 && (
                <span className="font-mono text-[11px] text-amber-400 font-bold ml-0.5">
                  PB: {userStats.bestScore}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveModal('strategy')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">400+ Guide</span>
            </button>

            <button
              onClick={() => setActiveModal('config')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title="Settings & Scoring Config"
            >
              <Sliders className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Mode Selector Ribbon */}
      <div className="border-b border-slate-800/60 bg-slate-950/40 px-3 py-1.5">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1 text-xs">
          {[
            { id: 'timed_60', label: '60s Practice', icon: Play },
            { id: 'untimed', label: 'Untimed', icon: Layers },
            { id: 'target_practice', label: 'Target Drill', icon: Target },
          ].map((m) => {
            const Icon = m.icon;
            const isActive = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMode(m.id as GameMode)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Screen Container */}
      <main className="flex-1 flex flex-col justify-center items-center py-2 sm:py-4 px-2 w-full max-w-lg mx-auto">
        {/* Score & Timer Header */}
        <ScoreHeader
          mode={mode}
          score={score}
          timeLeft={timeLeft}
          maxTime={60}
          wordsFoundCount={submittedWords.length}
          bonusWordsCount={bonusWordsCount}
          isPaused={isPaused}
          isSoundMuted={settings.soundMuted}
          targetLength={targetLength}
          targetWordsFound={
            submittedWords.filter((w) => w.length >= targetLength).length
          }
          targetWordsQuota={targetWordsQuota}
          onTogglePause={() => setIsPaused(!isPaused)}
          onToggleSound={() => {
            const muted = soundManager.toggleMute();
            setSettings({ ...settings, soundMuted: muted });
            saveSettings({ ...settings, soundMuted: muted });
          }}
          onOpenStrategy={() => setActiveModal('strategy')}
          onResetRound={handleReplayBoard}
        />

        {/* Target Practice Selector (when in Mode C) */}
        {mode === 'target_practice' && (
          <TargetPracticeSetup
            selectedTarget={targetLength}
            onSelectTarget={(len) => {
              setTargetLength(len);
              startNewBoard({ customTarget: len });
            }}
            userStats={userStats}
            quotaFound={
              submittedWords.filter((w) => w.length >= targetLength).length
            }
            quotaTotal={targetWordsQuota}
          />
        )}

        {/* Path Inspector Overlay (when inspecting missed words) */}
        <PathInspectorOverlay
          inspectedWord={inspectedWord}
          onClear={() => setInspectedWord(null)}
        />

        {/* Centered 5x5 Board */}
        {board && (
          <BoardView
            tiles={tiles}
            bonusTileIndex={board.bonusTileIndex}
            currentPath={currentPath}
            inspectedPath={inspectedWord?.path}
            onTileSelect={handleTileSelect}
            onPathRelease={handlePathRelease}
            onTileClick={handleTileClick}
            disabled={isPaused}
          />
        )}

        {/* Word Input & Immediate Submit Bar */}
        <WordInputBar
          currentWord={currentWord}
          wordPoints={currentWordPoints}
          isBonusUsed={isCurrentBonusUsed}
          feedbackMessage={feedback}
          onSubmit={submitCurrentWord}
          onClear={() => setCurrentPath([])}
          disabled={isPaused}
        />

        {/* Recent Words Submitted Ribbon */}
        <RecentWordsList
          words={submittedWords}
          onWordClick={(w) =>
            handleInspectWord({
              word: w.word,
              path: w.path,
              score: w.score,
              baseScore: w.baseScore,
              bonusPoints: w.bonusPoints,
              length: w.length,
              isBonusUsed: w.isBonusUsed,
            })
          }
          activeInspectedWord={inspectedWord?.word}
        />

        {/* Bottom Primary Action Bar */}
        <div className="w-full max-w-md mx-auto mt-2 flex items-center justify-between gap-2 px-2 text-xs">
          {mode === 'untimed' ? (
            <button
              onClick={finishRound}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/25 text-center"
            >
              End Exploration & Reveal All Words
            </button>
          ) : !hasStarted && mode === 'timed_60' ? (
            <button
              onClick={() => {
                setIsPlaying(true);
                setHasStarted(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 60s Round (or Drag Tile)</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-sky-400" />
                <span>Swipe / click letters or type on keyboard</span>
              </span>
              <button
                onClick={() => startNewBoard()}
                className="text-slate-400 hover:text-sky-300 font-semibold underline underline-offset-2 transition-colors"
              >
                Skip Board
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Scoring & Dictionary Provenance Disclosure */}
      <footer className="border-t border-slate-900 py-2.5 px-4 text-center text-[11px] text-slate-500 bg-slate-950/40">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>
            {getScoringDisclosure(settings.scoringConfig)}
          </span>
          <span className="text-slate-600">
            Dictionary: ENABLE1 (172k words)
          </span>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Post Round Analysis Modal */}
      {activeModal === 'analysis' && postRoundResult && (
        <PostRoundAnalysisModal
          result={postRoundResult}
          onReplayBoard={handleReplayBoard}
          onNewRound={() => {
            setActiveModal('none');
            startNewBoard();
          }}
          onInspectWord={handleInspectWord}
          inspectedWord={inspectedWord?.word || null}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* 2. Training Insights & Analytics Modal */}
      {activeModal === 'insights' && (
        <TrainingInsightsView
          stats={userStats}
          onReplayHistoricalBoard={(id) => {
            setActiveModal('none');
            // Replay logic
          }}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* 3. 400+ Strategy Guide Modal */}
      {activeModal === 'strategy' && (
        <StrategyGuideModal onClose={() => setActiveModal('none')} />
      )}

      {/* 4. Settings & Board Config Modal */}
      {activeModal === 'config' && (
        <ConfigModal
          settings={settings}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onApplyCustomBoard={(letters) => {
            startNewBoard({ customSeed: letters });
          }}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
