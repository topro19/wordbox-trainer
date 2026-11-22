import React, { useState } from 'react';
import { RoundResultSummary, UserStats } from '@/types/wordbox';
import {
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Flame,
  Award,
  RotateCcw,
  Download,
  Upload,
  BarChart2,
  Calendar,
} from 'lucide-react';

interface TrainingInsightsViewProps {
  stats: UserStats;
  onReplayHistoricalBoard?: (roundId: string) => void;
  onResetStats?: () => void;
  onClose: () => void;
}

export const TrainingInsightsView: React.FC<TrainingInsightsViewProps> = ({
  stats,
  onReplayHistoricalBoard,
  onResetStats,
  onClose,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'trends' | 'lengths' | 'history'>('trends');

  // Long word ratio (% of words found that are 4+ letters)
  const totalFound = stats.totalWordsFound || 1;
  const short3LWords = stats.mostFrequentLengths[3] || 0;
  const longWordsCount = totalFound - short3LWords;
  const longWordRatio = Math.round((longWordsCount / totalFound) * 100);

  // Highest score in history
  const is400Achieved = stats.bestScore >= 400;

  // Export JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `wordbox_training_stats_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Training Insights & Analytics</span>
                {is400Achieved && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" /> 400+ Master
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Track your progress towards the 400+ points threshold across {stats.totalGames} sessions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="p-4 sm:p-5 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Personal Best</span>
            <span
              className={`text-2xl font-black font-mono tracking-tight ${
                is400Achieved ? 'text-amber-400' : 'text-white'
              }`}
            >
              {stats.bestScore}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {is400Achieved ? 'Goal reached!' : `${400 - stats.bestScore} to 400`}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">400+ Games</span>
            <span className="text-2xl font-black font-mono text-cyan-400">
              {stats.gamesReached400}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {stats.totalGames > 0
                ? `${Math.round((stats.gamesReached400 / stats.totalGames) * 100)}% win rate`
                : '0%'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Score</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {stats.averageScore}
            </span>
            <span className="text-[10px] text-slate-500 block">All-time average</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Words Found</span>
            <span className="text-2xl font-black font-mono text-sky-400">
              {stats.totalWordsFound}
            </span>
            <span className="text-[10px] text-slate-500 block">Total submissions</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Word Length</span>
            <span className="text-2xl font-black font-mono text-purple-400">
              {stats.averageWordLengthAllTime || '0'}
            </span>
            <span className="text-[10px] text-slate-500 block">Letters / word</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">4+ Letter Ratio</span>
            <span className="text-2xl font-black font-mono text-teal-400">{longWordRatio}%</span>
            <span className="text-[10px] text-slate-500 block">Quality words</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 text-xs font-semibold">
          <button
            onClick={() => setSelectedSubTab('trends')}
            className={`px-3 py-2 border-b-2 transition-colors ${
              selectedSubTab === 'trends'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Score Progression
          </button>
          <button
            onClick={() => setSelectedSubTab('lengths')}
            className={`px-3 py-2 border-b-2 transition-colors ${
              selectedSubTab === 'lengths'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Found vs Missed Lengths
          </button>
          <button
            onClick={() => setSelectedSubTab('history')}
            className={`px-3 py-2 border-b-2 transition-colors ${
              selectedSubTab === 'history'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Game History ({stats.history.length})
          </button>
        </div>

        {/* Main Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: SCORE PROGRESSION */}
          {selectedSubTab === 'trends' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recent 60s Practice Rounds
                </span>
                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                  Target Line: 400 Points
                </span>
              </div>

              {stats.history.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  Play your first round to generate performance charts and trend lines!
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Clean SVG Trend Line Chart */}
                  <div className="relative h-48 w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                    {/* 400 benchmark line */}
                    <div className="absolute left-8 right-3 top-[20%] border-b border-dashed border-amber-400/60 pointer-events-none flex justify-end">
                      <span className="text-[9px] font-mono text-amber-300/80 -mt-3 bg-slate-900/80 px-1 rounded">
                        400 PTS GOAL
                      </span>
                    </div>

                    {/* Bars for recent 15 games */}
                    <div className="flex items-end justify-between gap-1.5 h-36 pt-4 px-2">
                      {stats.history
                        .slice(0, 15)
                        .reverse()
                        .map((round, idx) => {
                          const heightPercent = Math.min(100, (round.score / 500) * 100);
                          const is400 = round.score >= 400;
                          return (
                            <div
                              key={round.id || idx}
                              className="flex-1 flex flex-col items-center h-full justify-end group relative"
                            >
                              {/* Hover Tooltip */}
                              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 font-mono">
                                {round.score} pts ({round.wordsCount} words)
                              </div>

                              <div
                                className={`w-full rounded-t-md transition-all duration-300 ${
                                  is400
                                    ? 'bg-gradient-to-t from-amber-500 to-emerald-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                                    : 'bg-gradient-to-t from-sky-600 to-indigo-500'
                                }`}
                                style={{ height: `${Math.max(6, heightPercent)}%` }}
                              />
                              <span className="text-[9px] font-mono text-slate-400 mt-1 truncate max-w-[28px]">
                                {round.score}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-1">
                      <span>Older rounds</span>
                      <span>Most recent round →</span>
                    </div>
                  </div>

                  {/* Insight note */}
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-sky-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Growth Trajectory:
                    </span>
                    <p className="text-slate-400 text-xs">
                      {stats.bestScore >= 400
                        ? `You have achieved 400+ in ${stats.gamesReached400} games! Focus on consistency by maintaining high suffix-chain velocity.`
                        : `Your current high score is ${stats.bestScore}. Keep targeting 4L and 5L root words and using the blue bonus tile to cross the 400 threshold!`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LENGTH DISTRIBUTION */}
          {selectedSubTab === 'lengths' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Found vs Missed Words by Length
              </span>

              <div className="space-y-2.5">
                {[3, 4, 5, 6, 7, 8].map((length) => {
                  const found = stats.mostFrequentLengths[length] || 0;
                  const missed = stats.missedLengthsCount[length] || 0;
                  const total = found + missed || 1;
                  const foundPct = Math.round((found / total) * 100);

                  return (
                    <div
                      key={length}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-white">
                          {length === 8 ? '8+ Letter Words' : `${length} Letters`}
                        </span>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-emerald-400 font-bold">{found} Found</span>
                          <span className="text-rose-400/80">{missed} Missed</span>
                          <span className="text-slate-400 font-bold">({foundPct}% capture)</span>
                        </div>
                      </div>

                      {/* Split Bar */}
                      <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-300"
                          style={{ width: `${foundPct}%` }}
                          title={`Found: ${found}`}
                        />
                        <div
                          className="bg-slate-700 h-full transition-all duration-300"
                          style={{ width: `${100 - foundPct}%` }}
                          title={`Missed: ${missed}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tactical Insight on Missed Lengths */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
                <span className="font-bold text-purple-300 block mb-1">
                  Length Optimization Strategy:
                </span>
                Notice how many 6+ letter words are left on the board. You don't need to find all of
                them to hit 400 points, but bagging three 6-to-7 letter words adds ~32-36 instant
                points to your score!
              </div>
            </div>
          )}

          {/* TAB 3: GAME HISTORY */}
          {selectedSubTab === 'history' && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Saved Game Log ({stats.history.length})
              </span>

              {stats.history.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  No rounds recorded yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                  {stats.history.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                            item.score >= 400
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.score}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                            <span>{item.wordsCount} words</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{item.averageWordLength} avg len</span>
                            {item.score >= 400 && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                400+
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            <span>• Longest: {item.longestWord || 'None'}</span>
                          </div>
                        </div>
                      </div>

                      {onReplayHistoricalBoard && (
                        <button
                          onClick={() => onReplayHistoricalBoard(item.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Replay</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            title="Download your full training history as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Back to Training
          </button>
        </div>
      </div>
    </div>
  );
};
