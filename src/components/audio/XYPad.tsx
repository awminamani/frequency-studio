'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { clamp, mapRange, formatFrequency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, RotateCcw } from 'lucide-react';

interface XYPadProps {
  xValue: number;         // Cutoff 100 to 18000
  yValue: number;         // Resonance 0 to 15
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  xLabel?: string;
  yLabel?: string;
  onChange: (x: number, y: number) => void;
  className?: string;
}

export const XYPad: React.FC<XYPadProps> = ({
  xValue,
  yValue,
  xMin = 100,
  xMax = 18000,
  yMin = 0.1,
  yMax = 15,
  xLabel = 'Cutoff',
  yLabel = 'Resonance',
  onChange,
  className,
}) => {
  const padRef = useRef<HTMLDivElement>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isLatched, setIsLatched] = useState(true);

  // Default coordinates
  const defaultX = 4200;
  const defaultY = 4.5;

  // Logarithmic conversion for frequency (100Hz to 18000Hz feels natural logarithmically)
  const normX = mapRange(Math.log10(xValue), Math.log10(xMin), Math.log10(xMax), 0, 1);
  const normY = mapRange(yValue, yMin, yMax, 0, 1);

  const updateFromCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!padRef.current) return;
      const rect = padRef.current.getBoundingClientRect();
      const rawX = clamp((clientX - rect.left) / rect.width, 0, 1);
      // Invert Y so bottom is min and top is max
      const rawY = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);

      // Convert back from log scale for X
      const logMin = Math.log10(xMin);
      const logMax = Math.log10(xMax);
      const calculatedX = Math.pow(10, logMin + rawX * (logMax - logMin));
      const calculatedY = yMin + rawY * (yMax - yMin);

      onChange(
        Math.round(calculatedX),
        Number(calculatedY.toFixed(2))
      );
    },
    [xMin, xMax, yMin, yMax, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPointerDown(true);
    updateFromCoords(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown) return;
    updateFromCoords(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsPointerDown(false);

    // If not latched (spring mode), return to center default
    if (!isLatched) {
      onChange(defaultX, defaultY);
    }
  };

  const handleReset = () => {
    onChange(defaultX, defaultY);
  };

  return (
    <div className={cn('flex flex-col rounded-lg border border-border-subtle bg-surface-card p-3 shadow-inner-bezel', className)}>
      {/* Header controls */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-volt animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-neutral-200">
            2D Master Kaoss XY
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsLatched(!isLatched)}
            title={isLatched ? 'Latch Mode (Holds position on release)' : 'Spring Mode (Returns to center on release)'}
            className="text-neutral-400 hover:text-white"
          >
            {isLatched ? <Lock className="w-3 h-3 text-accent-cyan" /> : <Unlock className="w-3 h-3 text-accent-orange" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleReset}
            title="Reset to center"
            className="text-neutral-400 hover:text-white"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Interactive Touch / Mouse Pad */}
      <div
        ref={padRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative h-44 w-full rounded-md bg-[#0d0f12] border border-neutral-800 cursor-crosshair overflow-hidden touch-none select-none shadow-inner"
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Dynamic Crosshairs */}
        <div
          className="absolute top-0 bottom-0 w-px bg-accent-volt/40 pointer-events-none transition-all duration-75"
          style={{ left: `${normX * 100}%` }}
        />
        <div
          className="absolute left-0 right-0 h-px bg-accent-cyan/40 pointer-events-none transition-all duration-75"
          style={{ top: `${(1 - normY) * 100}%` }}
        />

        {/* Glowing Cursor Beacon */}
        <div
          className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full pointer-events-none transition-all duration-75 flex items-center justify-center"
          style={{
            left: `${normX * 100}%`,
            top: `${(1 - normY) * 100}%`,
          }}
        >
          <div
            className={cn(
              'w-4 h-4 rounded-full border border-white bg-accent-volt/60 shadow-glow-volt transition-transform',
              isPointerDown ? 'scale-125 bg-accent-volt' : 'animate-pulse'
            )}
          />
        </div>

        {/* Axis Overlays */}
        <div className="absolute bottom-1.5 left-2 font-mono text-[9px] text-neutral-500 uppercase tracking-wider pointer-events-none">
          X: {xLabel} ({formatFrequency(xValue)})
        </div>
        <div className="absolute top-1.5 right-2 font-mono text-[9px] text-neutral-500 uppercase tracking-wider pointer-events-none">
          Y: {yLabel} (Q {yValue.toFixed(1)})
        </div>
      </div>

      {/* Footer Readouts */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border-subtle font-mono text-[10px]">
        <div className="flex justify-between bg-surface-panel px-2 py-1 rounded border border-border-subtle">
          <span className="text-neutral-400">CUTOFF:</span>
          <span className="text-accent-volt font-semibold">{formatFrequency(xValue)}</span>
        </div>
        <div className="flex justify-between bg-surface-panel px-2 py-1 rounded border border-border-subtle">
          <span className="text-neutral-400">RESONANCE:</span>
          <span className="text-accent-cyan font-semibold">{yValue.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
