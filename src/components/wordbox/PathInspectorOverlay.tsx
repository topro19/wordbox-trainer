import React from 'react';
import { BoardWord } from '@/types/wordbox';
import { Eye, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface PathInspectorOverlayProps {
  inspectedWord: BoardWord | null;
  onClear: () => void;
}

export const PathInspectorOverlay: React.FC<PathInspectorOverlayProps> = ({
  inspectedWord,
  onClear,
}) => {
  if (!inspectedWord) return null;

  return (
    <div className="w-full max-w-md mx-auto mb-2 px-2 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden">
          <Eye className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="truncate">
            <span className="text-xs font-semibold text-amber-300 mr-1.5">Inspecting:</span>
            <span className="font-mono text-base font-black text-white tracking-wider">
              {inspectedWord.word}
            </span>
            <span className="ml-2 text-xs font-bold text-amber-300">
              (+{inspectedWord.score} pts)
            </span>
            {inspectedWord.isBonusUsed && (
              <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-400 inline-flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-blue-300" /> Blue Bonus
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClear}
          className="p-1 rounded-lg hover:bg-amber-900/50 text-amber-300 transition-colors shrink-0 ml-2"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
