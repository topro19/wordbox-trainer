import React, { useState } from 'react';
import { BoardGeneratorType, ScoringConfig } from '@/types/wordbox';
import { WordboxSettings } from '@/lib/wordbox/storage';
import { PLATO_OFFICIAL_SCORING, CLASSIC_BOGGLE_SCORING } from '@/lib/wordbox/scoring';
import { Settings, Sliders, Volume2, Sparkles, BookOpen, AlertCircle, Check } from 'lucide-react';

interface ConfigModalProps {
  settings: WordboxSettings;
  onSaveSettings: (settings: WordboxSettings) => void;
  onApplyCustomBoard?: (letters: string) => void;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  settings,
  onSaveSettings,
  onApplyCustomBoard,
  onClose,
}) => {
  const [scoring, setScoring] = useState<ScoringConfig>(settings.scoringConfig);
  const [generator, setGenerator] = useState<string>(settings.preferredGenerator);
  const [soundMuted, setSoundMuted] = useState<boolean>(settings.soundMuted);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(settings.hapticEnabled);
  const [customLetters, setCustomLetters] = useState<string>('');
  const [customError, setCustomError] = useState<string | null>(null);

  const handlePresetChange = (preset: 'plato_official' | 'classic_boggle' | 'custom') => {
    if (preset === 'plato_official') {
      setScoring(PLATO_OFFICIAL_SCORING);
    } else if (preset === 'classic_boggle') {
      setScoring(CLASSIC_BOGGLE_SCORING);
    } else {
      setScoring({
        ...scoring,
        preset: 'custom',
      });
    }
  };

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      scoringConfig: scoring,
      preferredGenerator: generator,
      soundMuted,
      hapticEnabled,
    });

    if (customLetters.trim()) {
      const clean = customLetters.toUpperCase().replace(/[^A-Z]/g, '');
      if (clean.length === 25) {
        onApplyCustomBoard?.(clean);
      } else {
        setCustomError('Custom board must be exactly 25 letters (A-Z).');
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">Trainer Settings</h2>
              <p className="text-xs text-slate-400">
                Scoring rules, board generation, and audio feedback
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs text-slate-300">
          {/* SECTION 1: SCORING RULES */}
          <div className="space-y-2.5">
            <span className="font-bold uppercase tracking-wider text-slate-200 block text-xs">
              Scoring System
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handlePresetChange('plato_official')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  scoring.preset === 'plato_official'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="block font-bold text-xs text-sky-300">Plato Official</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">3L=1, 4L=6, 8+L=14, Blue=+3</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetChange('classic_boggle')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  scoring.preset === 'classic_boggle'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="block font-bold text-xs text-sky-300">Classic Boggle</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">3L=1, 4L=1, 8+L=11, No bonus</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetChange('custom')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  scoring.preset === 'custom'
                    ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="block font-bold text-xs text-sky-300">Custom Tuning</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Customize points per length</span>
              </button>
            </div>

            {/* Custom Values Inputs */}
            {scoring.preset === 'custom' && (
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Points per Word Length:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono">
                  {[3, 4, 5, 6, 7].map((l) => (
                    <div key={l} className="flex flex-col">
                      <span className="text-[10px] text-slate-400 mb-0.5">{l}L:</span>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={scoring.pointsByLength[l] ?? 0}
                        onChange={(e) =>
                          setScoring({
                            ...scoring,
                            pointsByLength: {
                              ...scoring.pointsByLength,
                              [l]: Number(e.target.value),
                            },
                          })
                        }
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs text-center"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 mb-0.5">8+L:</span>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={scoring.points8Plus}
                      onChange={(e) =>
                        setScoring({ ...scoring, points8Plus: Number(e.target.value) })
                      }
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">Blue Bonus Tile Added Points:</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scoring.bonusTilePoints}
                    onChange={(e) =>
                      setScoring({ ...scoring, bonusTilePoints: Number(e.target.value) })
                    }
                    className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs text-center font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: BOARD GENERATION STRATEGY */}
          <div className="space-y-2.5">
            <span className="font-bold uppercase tracking-wider text-slate-200 block text-xs">
              Board Generation Engine
            </span>

            <div className="space-y-1.5">
              {[
                {
                  id: 'competitive_400',
                  title: 'Competitive 400+ Generator (Recommended)',
                  desc: 'Guarantees 32%-40% vowels, rich affix clusters (S, ED, ER, ING), and minimum 220+ valid words for authentic 400+ training.',
                },
                {
                  id: 'boggle_dice',
                  title: 'Official Big Boggle 25-Dice Simulation',
                  desc: 'Physically rolls the 25 authentic Hasbro Big Boggle dice with authentic letter face probabilities.',
                },
                {
                  id: 'weighted_corpus',
                  title: 'English Letter Frequency Weighted',
                  desc: 'Statistical English language letter weights with guaranteed 7-9 vowels.',
                },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    generator === item.id
                      ? 'bg-sky-500/10 border-sky-500/60 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/70'
                  }`}
                >
                  <input
                    type="radio"
                    name="board_generator"
                    value={item.id}
                    checked={generator === item.id}
                    onChange={(e) => setGenerator(e.target.value)}
                    className="mt-0.5 text-sky-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-200 block">{item.title}</span>
                    <span className="text-[11px] text-slate-400 leading-tight">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Custom 25 Letters Input */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Load Custom Board (25 Letters):
              </span>
              <input
                type="text"
                maxLength={25}
                placeholder="e.g. STARSP LATE RAINS EDGES TESTS"
                value={customLetters}
                onChange={(e) => {
                  setCustomLetters(e.target.value.toUpperCase());
                  setCustomError(null);
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs uppercase tracking-widest focus:outline-none focus:border-sky-500"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>{customLetters.replace(/[^A-Z]/gi, '').length} / 25 characters</span>
                {customError && <span className="text-rose-400 font-bold">{customError}</span>}
              </div>
            </div>
          </div>

          {/* SECTION 3: AUDIO & HAPTICS */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-200 block text-xs">
              Audio & Feedback
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSoundMuted(!soundMuted)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  !soundMuted
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <span>Synthesizer Audio</span>
                <span className="font-bold text-xs">{soundMuted ? 'Muted' : 'Enabled'}</span>
              </button>

              <button
                type="button"
                onClick={() => setHapticEnabled(!hapticEnabled)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  hapticEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                }`}
              >
                <span>Mobile Haptics</span>
                <span className="font-bold text-xs">{hapticEnabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>
          </div>

          {/* SECTION 4: DICTIONARY SOURCE DISCLOSURE */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Dictionary Provenance:
            </span>
            <p>
              This app is powered by the <strong>ENABLE1 Benchmark English Lexicon</strong> (172,727
              words). ENABLE1 is the standard lexicon for Words With Friends and North American
              word games. Plato uses proprietary internal dictionaries; any word that is legitimate
              standard English in ENABLE1 is accepted here.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
