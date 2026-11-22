import React from 'react';
import { GameMode, TargetLength } from '@/types/wordbox';
import { Volume2, VolumeX, Pause, Play, BookOpen, RotateCcw, Target, Trophy, Flame } from 'lucide-react';

interface ScoreHeaderProps {
  mode: GameMode;
  score: number;
  timeLeft: number; // in seconds (can be decimal)
  maxTime: number; // e.g. 60
  wordsFoundCount: number;
  bonusWordsCount: number;
  isPaused: boolean;
  isSoundMuted: boolean;
  targetLength?: TargetLength;
  targetWordsFound?: number;
  targetWordsQuota?: number;
  onTogglePause: () => void;
  onToggleSound: () => void;
  onOpenStrategy: () => void;
  onResetRound: () => void;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  mode,
  score,
  timeLeft,
  maxTime,
  wordsFoundCount,
  bonusWordsCount,
  isPaused,
  isSoundMuted,
  targetLength = 5,
  targetWordsFound = 0,
  targetWordsQuota = 6,
  onTogglePause,
  onToggleSound,
  onOpenStrategy,
  onResetRound,
}) => {
  // Calculate pace for 60s timed mode
  const elapsed = Math.max(0.5, maxTime - timeLeft);
  const pointsPerMin = Math.round((score / elapsed) * 60);
  const is400Pace = pointsPerMin >= 400;
  const targetGap = Math.max(0, 400 - score);

  // Time progress percentage
  const timePercent = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));

  // Timer color
  let timerColorClass = 'text-emerald-400';
  let timerBarColorClass = 'bg-emerald-500';
  if (timeLeft <= 10) {
    timerColorClass = 'text-rose-400 animate-pulse';
    timerBarColorClass = 'bg-rose-500';
  } else if (timeLeft <= 25) {
    timerColorClass = 'text-amber-400';
    timerBarColorClass = 'bg-amber-500';
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-3 px-2 sm:px-4">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between py-1.5 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold tracking-wider text-slate-300">
            {mode === 'timed_60' && '⚡ 60S PRACTICE (400+ TARGET)'}
            {mode === 'untimed' && '🔍 UNTIMED EXPLORATION'}
            {mode === 'target_practice' && `🎯 TARGET PRACTICE (${targetLength}+ LETTERS)`}
            {mode === 'replay' && '🔁 BOARD REPLAY'}
          </span>
          {score >= 400 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 text-[11px] animate-bounce">
              <Trophy className="w-3 h-3 text-amber-400" /> 400+ REACHED!
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onOpenStrategy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="400+ Plato Strategy Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Strategy</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isSoundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          {mode === 'timed_60' && (
            <button
              onClick={onTogglePause}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-slate-300" />
              )}
            </button>
          )}

          <button
            onClick={onResetRound}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Board"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>
      </div>

      {/* Main Score & Timer Display Grid */}
      <div className="grid grid-cols-3 items-center gap-2 pt-2.5 pb-1">
        {/* Score & Pace Column */}
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {score}
            </span>
            <span className="text-xs text-slate-500 font-medium">/ 400</span>
          </div>

          {mode === 'timed_60' && (
            <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
              <Flame className={`w-3 h-3 ${is400Pace ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <span className={is400Pace ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                Pace: {pointsPerMin} pts/m
              </span>
            </div>
          )}
        </div>

        {/* Center Timer / Goal Column */}
        <div className="flex flex-col items-center justify-center">
          {mode === 'timed_60' ? (
            <>
              <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${timerColorClass}`}>
                {timeLeft.toFixed(1)}s
              </div>
              <div className="w-full max-w-[140px] h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ease-linear rounded-full ${timerBarColorClass}`}
                  style={{ width: `${timePercent}%` }}
                />
              </div>
            </>
          ) : mode === 'target_practice' ? (
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400 flex items-center justify-center gap-1">
                <Target className="w-4 h-4 text-cyan-400" /> {targetWordsFound} / {targetWordsQuota}
              </div>
              <span className="text-[11px] text-slate-400">Target words found</span>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-300">
                {Math.floor(elapsed)}s
              </div>
              <span className="text-[11px] text-slate-500">Practice time</span>
            </div>
          )}
        </div>

        {/* Words Found & Bonus Count Column */}
        <div className="flex flex-col items-end">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Words</span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight text-cyan-400 font-mono">
            {wordsFoundCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
            <span className="text-blue-300 font-semibold">{bonusWordsCount} bonus (+3)</span>
          </div>
        </div>
      </div>

      {/* 400+ Goal Progress Mini-Bar */}
      {mode === 'timed_60' && (
        <div className="w-full mt-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
            <span>400+ Target Progress</span>
            <span className={score >= 400 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {score >= 400 ? 'Goal Achieved!' : `${targetGap} pts to go`}
            </span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                score >= 400 ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.min(100, (score / 400) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
