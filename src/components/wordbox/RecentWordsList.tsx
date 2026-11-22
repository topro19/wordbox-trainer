import React from 'react';
import { WordSubmission } from '@/types/wordbox';
import { Sparkles } from 'lucide-react';

interface RecentWordsListProps {
  words: WordSubmission[];
  onWordClick: (word: WordSubmission) => void;
  activeInspectedWord?: string | null;
}

export const RecentWordsList: React.FC<RecentWordsListProps> = ({
  words,
  onWordClick,
  activeInspectedWord,
}) => {
  if (words.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto my-1.5 px-3 py-2 text-center text-xs text-slate-500 italic bg-slate-900/40 rounded-lg border border-slate-800/60">
        No words found yet this round. Connect adjacent letters to start scoring!
      </div>
    );
  }

  // Reverse so newest words are first
  const displayWords = [...words].reverse();

  return (
    <div className="w-full max-w-md mx-auto my-1.5 px-2">
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1 px-1">
        <span>WORDS FOUND ({words.length})</span>
        <span className="text-[10px] text-slate-500">Tap word to inspect path</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
        {displayWords.map((item, idx) => {
          const isSelected = activeInspectedWord === item.word;
          return (
            <button
              key={`${item.word}-${item.timestamp}-${idx}`}
              onClick={() => onWordClick(item)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-150 border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-md shadow-cyan-500/30'
                  : item.isBonusUsed
                  ? 'bg-blue-950/80 text-blue-200 border-blue-600/70 hover:border-blue-400'
                  : 'bg-slate-800/90 text-slate-200 border-slate-700/80 hover:border-slate-500'
              }`}
            >
              <span>{item.word}</span>
              <span
                className={`text-[10px] px-1 py-0.2 rounded ${
                  item.isBonusUsed
                    ? 'bg-blue-800 text-blue-100 font-black flex items-center gap-0.5'
                    : 'bg-slate-700 text-emerald-400'
                }`}
              >
                {item.isBonusUsed && <Sparkles className="w-2.5 h-2.5" />}
                +{item.score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
