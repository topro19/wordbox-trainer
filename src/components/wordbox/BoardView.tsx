import React, { useRef, useCallback, useEffect } from 'react';
import { LetterTile } from '@/types/wordbox';
import { Sparkles } from 'lucide-react';

interface BoardViewProps {
  tiles: LetterTile[];
  bonusTileIndex: number;
  currentPath: number[];
  inspectedPath?: number[] | null; // For inspecting missed word paths
  onTileSelect: (index: number) => void;
  onPathRelease: () => void;
  onTileClick: (index: number) => void;
  disabled?: boolean;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tiles,
  bonusTileIndex,
  currentPath,
  inspectedPath = null,
  onTileSelect,
  onPathRelease,
  onTileClick,
  disabled = false,
}) => {
  const isDraggingRef = useRef<boolean>(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const activePath = inspectedPath || currentPath;

  // Global pointer up handler to catch releases outside the grid
  useEffect(() => {
    const handlePointerUpGlobal = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        onPathRelease();
      }
    };

    window.addEventListener('pointerup', handlePointerUpGlobal);
    window.addEventListener('pointercancel', handlePointerUpGlobal);
    return () => {
      window.removeEventListener('pointerup', handlePointerUpGlobal);
      window.removeEventListener('pointercancel', handlePointerUpGlobal);
    };
  }, [onPathRelease]);

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    if (disabled || inspectedPath) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    isDraggingRef.current = true;
    onTileSelect(index);
  };

  const handlePointerEnter = (index: number) => {
    if (disabled || inspectedPath) return;
    if (isDraggingRef.current) {
      onTileSelect(index);
    }
  };

  // Support touch drag using coordinates via pointermove over the container
  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || inspectedPath || !isDraggingRef.current) return;

      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (!element) return;

      const tileElement = element.closest('[data-tile-index]') as HTMLElement;
      if (tileElement) {
        const idx = Number(tileElement.dataset.tileIndex);
        if (!isNaN(idx)) {
          onTileSelect(idx);
        }
      }
    },
    [disabled, inspectedPath, onTileSelect]
  );

  // Calculate SVG line coordinates between tile centers (in percentages 0-100%)
  const renderPathLines = () => {
    if (activePath.length < 2) return null;

    const points = activePath.map((idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      // Each cell is 20% width/height, center is at col*20 + 10%
      const x = col * 20 + 10;
      const y = row * 20 + 10;
      return { x, y, idx };
    });

    const isInspected = inspectedPath !== null;

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="inspectGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {points.slice(0, points.length - 1).map((pt, i) => {
          const nextPt = points[i + 1];
          return (
            <line
              key={`line-${i}`}
              x1={`${pt.x}%`}
              y1={`${pt.y}%`}
              x2={`${nextPt.x}%`}
              y2={`${nextPt.y}%`}
              stroke={isInspected ? 'url(#inspectGradient)' : 'url(#pathGradient)'}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeDasharray={isInspected ? '2 1' : undefined}
              className="drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="w-full max-w-[420px] mx-auto select-none touch-none px-2 sm:px-0">
      <div
        ref={gridRef}
        onPointerMove={handleContainerPointerMove}
        className="relative aspect-square w-full grid grid-cols-5 gap-2 sm:gap-2.5 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-2xl backdrop-blur-md"
        style={{ touchAction: 'none' }}
      >
        {/* Visual Connecting Lines SVG */}
        {renderPathLines()}

        {/* 25 Letter Tiles */}
        {tiles.map((tile, idx) => {
          const pathIndex = activePath.indexOf(idx);
          const isSelected = pathIndex !== -1;
          const isLastInPath = isSelected && pathIndex === activePath.length - 1;
          const isBonus = idx === bonusTileIndex;
          const isInspected = inspectedPath !== null;

          let tileBgClass = 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700/80 text-white';

          if (isBonus && !isSelected) {
            tileBgClass =
              'bg-gradient-to-br from-blue-600/90 to-indigo-800/90 border-blue-400/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]';
          }

          if (isSelected) {
            if (isInspected) {
              tileBgClass =
                'bg-gradient-to-br from-amber-500 to-rose-600 border-amber-300 text-white shadow-[0_0_15px_rgba(245,158,11,0.6)]';
            } else {
              tileBgClass =
                'bg-gradient-to-br from-sky-500 to-emerald-600 border-cyan-300 text-slate-950 font-black shadow-[0_0_16px_rgba(56,189,248,0.7)] scale-[1.03]';
            }
          }

          return (
            <div
              key={tile.id}
              data-tile-index={idx}
              onPointerDown={(e) => handlePointerDown(idx, e)}
              onPointerEnter={() => handlePointerEnter(idx)}
              onClick={() => onTileClick(idx)}
              className={`relative flex items-center justify-center rounded-xl border-2 cursor-pointer transition-all duration-100 font-sans select-none z-10 ${tileBgClass} ${
                disabled ? 'cursor-not-allowed opacity-60' : 'active:scale-95'
              }`}
            >
              {/* Main Letter */}
              <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow pointer-events-none">
                {tile.letter}
              </span>

              {/* Blue Bonus Badge */}
              {isBonus && (
                <div
                  className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.2 rounded-md bg-blue-900/90 text-blue-200 border border-blue-400 text-[9px] sm:text-[10px] font-black pointer-events-none shadow-sm"
                  title="Blue Bonus Tile: +3 extra points!"
                >
                  <Sparkles className="w-2.5 h-2.5 text-blue-300" />
                  <span>+3</span>
                </div>
              )}

              {/* Sequence Order Step Badge (1, 2, 3...) */}
              {isSelected && (
                <div
                  className={`absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-black border pointer-events-none ${
                    isInspected
                      ? 'bg-rose-900 text-amber-200 border-amber-300'
                      : 'bg-slate-950 text-cyan-300 border-cyan-400 shadow-sm'
                  }`}
                >
                  {pathIndex + 1}
                </div>
              )}

              {/* Active Pulse ring on the head of the path */}
              {isLastInPath && !isInspected && (
                <span className="absolute inset-0 rounded-xl border-2 border-white/60 animate-ping pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
