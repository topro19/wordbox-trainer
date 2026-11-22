import React from 'react';
import { X, Trophy, Flame, Target, Sparkles, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';

interface StrategyGuideModalProps {
  onClose: () => void;
}

export const StrategyGuideModal: React.FC<StrategyGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                The 400+ Points Master Guide
              </h2>
              <p className="text-xs text-slate-400">
                Plato Wordbox 5×5 60-second competitive strategy breakdown
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Section 1: The Math */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Flame className="w-4 h-4 text-amber-400" /> 1. The Brutal Math: Why 3-Letter Words Are Traps
            </h3>
            <p>
              In Plato Wordbox, you have exactly <strong>60 seconds</strong>. To achieve 400 points,
              you need an average pace of <strong>6.67 points per second</strong>.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-2 text-xs font-mono">
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300">
                <span className="block font-bold">3 Letters = 1 Point</span>
                <span className="text-[10px] text-slate-400">Takes ~1.2s = 50 pts/min rate (LOSE)</span>
              </div>
              <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                <span className="block font-bold">4 Letters = 6 Points</span>
                <span className="text-[10px] text-slate-400">600% point jump! (WINNING)</span>
              </div>
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/60 text-cyan-300">
                <span className="block font-bold">5 Letters = 8 Points</span>
                <span className="text-[10px] text-slate-400">800% vs 3-letter words!</span>
              </div>
            </div>
            <p className="text-slate-400">
              <strong className="text-white">Golden Rule:</strong> High-scoring players almost never
              submit standalone 3-letter words unless chaining them into longer structures. If you find
              CAT, don't just submit CAT (1 pt). Look immediately for CATS (6 pts) or CATER (8 pts)!
            </p>
          </div>

          {/* Section 2: Suffix Chaining */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-black text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Target className="w-4 h-4 text-cyan-400" /> 2. The Suffix Chaining Technique (Word Morphing)
            </h3>
            <p>
              The top players don't scan for isolated individual words. They find a root cluster and
              rapidly rattle off 4 to 6 variations in 3 seconds:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
              <div className="text-sky-300 font-bold">Example Root: STAR</div>
              <div className="flex flex-wrap gap-2 text-slate-300">
                <span className="px-1.5 py-0.5 rounded bg-slate-800">STAR (6 pts)</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800">STARE (8 pts)</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800">STARES (10 pts)</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800">STARED (10 pts)</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800">START (8 pts)</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800">STARTS (10 pts)</span>
              </div>
              <div className="text-emerald-400 text-[11px] font-sans font-semibold pt-1">
                → 6 words in 4 seconds = 52 points! That's a 780 pts/min pace!
              </div>
            </div>
          </div>

          {/* Section 3: Blue Bonus Tile */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-black text-blue-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-blue-400" /> 3. Blue Bonus Tile (+3 Points) Anchoring
            </h3>
            <p>
              Every Plato Wordbox board contains a <strong>Blue Bonus Tile</strong> that adds{' '}
              <strong>+3 bonus points</strong> to every word that touches it.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>
                A 4-letter word through the blue tile becomes <strong className="text-white">9 points</strong>.
              </li>
              <li>
                A 5-letter word through the blue tile becomes <strong className="text-white">11 points</strong>.
              </li>
              <li>
                If the blue tile is an E, S, R, or T, anchor 8 to 15 words through it. That is{' '}
                <strong>24 to 45 free bonus points</strong>!
              </li>
            </ul>
          </div>

          {/* Section 4: Grid Scanning Strategy */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="text-sm font-black text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-purple-400" /> 4. Spatial Grid Scanning Strategy
            </h3>
            <p>
              Never let your eyes bounce randomly across the 25 tiles. Use a structured scanning routine:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">The 2-Second S-Check:</strong> Locate every letter S
                immediately at the start of the round.
              </li>
              <li>
                <strong className="text-slate-200">Corner & Edge Sweeping:</strong> Start in one quadrant
                (top-left), drain its root clusters, then move clockwise to the next quadrant.
              </li>
              <li>
                <strong className="text-slate-200">Vowel Bridges:</strong> Locate where vowels (A, E, I,
                O, U) form bridges connecting consonants.
              </li>
            </ol>
          </div>

          {/* Transparency & Disclosure Notice */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1 font-bold text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Plato Wordbox Transparency & Simulation Notes:</span>
            </div>
            <p>
              This trainer uses the standard <strong>ENABLE1 Benchmark Lexicon</strong> (172,727
              words), which is the verified standard for Words With Friends and Boggle tournament
              play. Plato uses a proprietary server dictionary and proprietary dice; our practice
              boards use authentic 25 Big Boggle dice simulation and tuned 400+ competitive
              generators to maximize skill transfer. Scoring matches Plato's official rules: 3L=1,
              4L=6, 5L=8, 6L=10, 7L=12, 8+L=14, Blue Tile=+3.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Got It — Start Training!
          </button>
        </div>
      </div>
    </div>
  );
};
