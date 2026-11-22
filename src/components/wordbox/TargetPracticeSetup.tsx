import React from 'react';
import { TargetLength, UserStats } from '@/types/wordbox';
import { Target, Trophy, Flame, Sparkles } from 'lucide-react';

interface TargetPracticeSetupProps {
  selectedTarget: TargetLength;
  onSelectTarget: (len: TargetLength) => void;
  userStats: UserStats;
  quotaFound: number;
  quotaTotal: number;
}

export const TargetPracticeSetup: React.FC<TargetPracticeSetupProps> = ({
  selectedTarget,
  onSelectTarget,
  userStats,
  quotaFound,
  quotaTotal,
}) => {
  const TARGET_SPECS: Record<
    TargetLength,
    { label: string; points: number; tips: string; example: string }
  > = {
    5: {
      label: '5-Letter Words',
      points: 8,
      tips: 'Add -S or -ED to 4-letter roots (e.g. CARE → CARES, PLAY → PLAYS).',
      example: 'STARES, TRAIN, PLATES',
    },
    6: {
      label: '6-Letter Words',
      points: 10,
      tips: 'Look for -ER or -EST comparative endings, or prefix RE- / UN-.',
      example: 'FASTER, PLAYED, SPRINT',
    },
    7: {
      label: '7-Letter Words',
      points: 12,
      tips: 'Hunt for -ING endings or multi-syllable chains across center tiles.',
      example: 'RESTING, PAINTER, PLAYERS',
    },
    8: {
      label: '8+ Letter Words',
      points: 14,
      tips: 'Root + Prefix + Suffix compounds (RE- + START + -ING). Huge scoring bursts!',
      example: 'STARTING, RESTARTED, TRAINING',
    },
  };

  const currentSpec = TARGET_SPECS[selectedTarget];
  const stat = userStats.targetPracticeStats[selectedTarget] || {
    attempts: 0,
    found: 0,
    successRate: 0,
  };

  return (
    <div className="w-full max-w-md mx-auto mb-3 px-2">
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Target className="w-4 h-4" />
            <span>Target Length Drill</span>
          </div>

          <div className="text-xs font-mono font-bold text-slate-300">
            Progress: <span className="text-cyan-400">{quotaFound}</span> / {quotaTotal}
          </div>
        </div>

        {/* Target Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          {([5, 6, 7, 8] as const).map((len) => {
            const isSelected = selectedTarget === len;
            const targetStat = userStats.targetPracticeStats[len];
            return (
              <button
                key={len}
                onClick={() => onSelectTarget(len)}
                className={`py-2 px-1 rounded-lg flex flex-col items-center justify-center transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-sm shadow-cyan-500/30 font-black'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200 font-semibold'
                }`}
              >
                <span className="text-sm font-mono">{len === 8 ? '8+L' : `${len}L`}</span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  {len === 5 ? '8 pts' : len === 6 ? '10 pts' : len === 7 ? '12 pts' : '14 pts'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tactical Tip & Historical Stat */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span>Historical Success Rate:</span>
            <span className="font-mono font-bold text-emerald-400">
              {stat.found} found ({stat.attempts} sessions)
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-tight">
            <span className="text-cyan-400 font-semibold">Tip:</span> {currentSpec.tips}
          </p>
        </div>
      </div>
    </div>
  );
};
