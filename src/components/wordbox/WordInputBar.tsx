import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

interface WordInputBarProps {
  currentWord: string;
  wordPoints: { total: number; baseScore: number; bonusPoints: number };
  isBonusUsed: boolean;
  feedbackMessage: { text: string; type: 'success' | 'warning' | 'error' | 'info' } | null;
  onSubmit: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export const WordInputBar: React.FC<WordInputBarProps> = ({
  currentWord,
  wordPoints,
  isBonusUsed,
  feedbackMessage,
  onSubmit,
  onClear,
  disabled = false,
}) => {
  const isSubmitReady = currentWord.length >= 3 && !disabled;

  return (
    <div className="w-full max-w-md mx-auto my-2 px-2">
      {/* Word Preview & Status Card */}
      <div className="relative flex items-center justify-between min-h-[52px] px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-sm">
        {/* Active Word or Empty Prompt */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          {currentWord ? (
            <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow">
                {currentWord}
              </span>

              {/* Live Points Badge */}
              <div className="flex items-center gap-1.5 ml-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                  +{wordPoints.total} pts
                </span>

                {isBonusUsed && (
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3 text-blue-400" /> +3 Blue
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs sm:text-sm font-medium tracking-wide">
              Drag or click tiles to form words (≥ 3 letters)
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {currentWord.length > 0 && (
            <button
              onClick={onClear}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Clear word (Esc / Backspace)"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onSubmit}
            disabled={!isSubmitReady}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-150 ${
              isSubmitReady
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
            type="button"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Enter</span>
          </button>
        </div>

        {/* Feedback Message Overlay */}
        {feedbackMessage && (
          <div
            className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-md whitespace-nowrap transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : feedbackMessage.type === 'warning'
                ? 'bg-amber-500 text-slate-950'
                : feedbackMessage.type === 'error'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-700 text-slate-200'
            }`}
          >
            {feedbackMessage.text}
          </div>
        )}
      </div>
    </div>
  );
};
