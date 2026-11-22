import React, { useState } from 'react';
import { BoardWord, RoundResult } from '@/types/wordbox';
import {
  Trophy,
  Flame,
  Clock,
  Sparkles,
  RotateCcw,
  Play,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

interface PostRoundAnalysisModalProps {
  result: RoundResult;
  onReplayBoard: () => void;
  onNewRound: () => void;
  onInspectWord: (word: BoardWord) => void;
  inspectedWord: string | null;
  onClose: () => void;
}

export const PostRoundAnalysisModal: React.FC<PostRoundAnalysisModalProps> = ({
  result,
  onReplayBoard,
  onNewRound,
  onInspectWord,
  inspectedWord,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'missed' | 'found' | 'breakdown'>('missed');
  const [filterLength, setFilterLength] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBonusOnly, setFilterBonusOnly] = useState<boolean>(false);

  const is400Club = result.score >= 400;
  const boardScoreClearance =
    result.totalPossibleScore > 0
      ? ((result.score / result.totalPossibleScore) * 100).toFixed(1)
      : '0';

  // Filter missed words
  const filteredMissed = result.wordsMissed.filter((w) => {
    if (filterBonusOnly && !w.isBonusUsed) return false;
    if (filterLength !== 'all' && w.length !== filterLength) {
      if (filterLength === 8 && w.length < 8) return false;
      if (filterLength !== 8 && w.length !== filterLength) return false;
    }
    if (searchQuery.trim() && !w.word.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header / Outcome Banner */}
        <div
          className={`p-4 sm:p-5 border-b ${
            is400Club
              ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border-amber-500/40'
              : 'bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                  is400Club
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950'
                    : 'bg-slate-800 text-sky-400 border border-slate-700'
                }`}
              >
                {is400Club ? <Trophy className="w-6 h-6 stroke-[2.5]" /> : <Award className="w-6 h-6" />}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Round Complete</span>
                  {is400Club && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wide">
                      400+ Club!
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {is400Club
                    ? 'Incredible performance! You shattered the 400-point Plato Wordbox benchmark!'
                    : `Scored ${result.score} pts. ${400 - result.score} more points needed to hit the 400+ target.`}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Final Score
              </span>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                {result.score}
              </span>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Words Found</span>
              <span className="font-mono text-base font-bold text-cyan-400">
                {result.wordsFound.length}
              </span>
              <span className="text-slate-500 text-[10px] ml-1">
                / {result.totalPossibleWords} total
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Avg Word Length</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {result.averageWordLength} letters
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Longest Word</span>
              <span className="font-mono text-base font-bold text-amber-300 truncate block">
                {result.longestWord || 'None'}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Board Clearance</span>
              <span className="font-mono text-base font-bold text-purple-400">
                {boardScoreClearance}%
              </span>
              <span className="text-slate-500 text-[10px] ml-1">
                ({result.totalPossibleScore} pts max)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('missed')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'missed'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Missed Words ({result.wordsMissed.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('found')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'found'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Words Found ({result.wordsFound.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3 py-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'breakdown'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Length Breakdown & Pace</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* TAB 1: MISSED WORDS */}
          {activeTab === 'missed' && (
            <div>
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 mr-1">Length:</span>
                  {(['all', 8, 7, 6, 5, 4, 3] as const).map((len) => (
                    <button
                      key={String(len)}
                      onClick={() => setFilterLength(len)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                        filterLength === len
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {len === 'all' ? 'All' : len === 8 ? '8+L' : `${len}L`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterBonusOnly(!filterBonusOnly)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      filterBonusOnly
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-blue-300" />
                    <span>Blue Bonus Only</span>
                  </button>

                  <div className="relative">
                    <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search words..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 pr-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-28 sm:w-36"
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 mb-2 font-medium">
                Tip: Click any missed word below to inspect its path on the 5×5 board!
              </div>

              {/* Missed Words Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredMissed.slice(0, 150).map((item) => {
                  const isInspected = inspectedWord === item.word;
                  return (
                    <button
                      key={item.word}
                      onClick={() => onInspectWord(item)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all border text-left ${
                        isInspected
                          ? 'bg-amber-500/20 text-amber-200 border-amber-400 shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                          : item.isBonusUsed
                          ? 'bg-blue-950/60 text-blue-200 border-blue-800/80 hover:border-blue-500'
                          : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-500'
                      }`}
                    >
                      <span className="truncate mr-1">{item.word}</span>
                      <span
                        className={`text-[10px] px-1 py-0.2 rounded shrink-0 ${
                          item.isBonusUsed
                            ? 'bg-blue-800 text-blue-100 flex items-center gap-0.5 font-bold'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {item.isBonusUsed && <Sparkles className="w-2.5 h-2.5" />}
                        +{item.score}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filteredMissed.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No missed words found matching this filter.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORDS FOUND */}
          {activeTab === 'found' && (
            <div>
              <div className="text-xs text-slate-400 mb-2 font-medium">
                Words you successfully submitted in this round ({result.wordsFound.length}):
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
                {result.wordsFound.map((item, idx) => (
                  <button
                    key={`${item.word}-${idx}`}
                    onClick={() =>
                      onInspectWord({
                        word: item.word,
                        path: item.path,
                        score: item.score,
                        baseScore: item.baseScore,
                        bonusPoints: item.bonusPoints,
                        length: item.length,
                        isBonusUsed: item.isBonusUsed,
                      })
                    }
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wide transition-all border text-left bg-emerald-950/40 text-emerald-200 border-emerald-800/60 hover:border-emerald-500"
                  >
                    <span className="truncate mr-1">{item.word}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-900 text-emerald-100 font-bold shrink-0">
                      +{item.score}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BREAKDOWN & EFFICIENCY */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Score & Count by Word Length
              </h3>

              <div className="space-y-2">
                {[3, 4, 5, 6, 7, 8].map((length) => {
                  const stat = result.pointsByLength[length] || { count: 0, points: 0 };
                  const label = length === 8 ? '8+ letters' : `${length} letters`;
                  const maxPointsInRow = Math.max(
                    1,
                    ...Object.values(result.pointsByLength).map((p) => p.points)
                  );
                  const barWidth = Math.min(100, (stat.points / maxPointsInRow) * 100);

                  return (
                    <div
                      key={length}
                      className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs"
                    >
                      <span className="w-20 font-semibold text-slate-300 font-mono">{label}</span>
                      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="w-16 font-mono text-cyan-400 font-bold text-right">
                        {stat.count} words
                      </span>
                      <span className="w-16 font-mono text-emerald-400 font-bold text-right">
                        {stat.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Training takeaway */}
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-200 leading-relaxed">
                <span className="font-bold flex items-center gap-1 text-sky-300 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 400+ Strategy Insight:
                </span>
                {result.pointsByLength[3]?.count > 5 ? (
                  <span>
                    You submitted {result.pointsByLength[3]?.count} 3-letter words for only{' '}
                    {result.pointsByLength[3]?.points} points total. In Plato Wordbox, 3L words are
                    traps (1 pt each). Shift focus to rapid 4L and 5L root words (6-8 pts each) to
                    reach 400+!
                  </span>
                ) : (
                  <span>
                    Excellent word length selection! Focusing heavily on 4+ letter words is the exact
                    mathematical foundation required to cross 400+ points in 60 seconds.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Inspect Board Path
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onReplayBoard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold transition-colors border border-sky-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay This Board</span>
            </button>

            <button
              onClick={onNewRound}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Next Board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
