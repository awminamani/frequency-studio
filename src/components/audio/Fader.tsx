'use client';

import React, { useRef, useState, useCallback } from 'react';
import { clamp, mapRange, formatDecibel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FaderProps {
  label: string;
  value: number; // in dB: e.g. -36 dB to +6 dB
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange: (val: number) => void;
  className?: string;
}

export const Fader: React.FC<FaderProps> = ({
  label,
  value,
  min = -36,
  max = 6,
  defaultValue = 0,
  onChange,
  className,
}) => {
  const faderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const normalized = mapRange(value, min, max, 0, 1);

  const updateFromY = useCallback(
    (clientY: number) => {
      if (!faderRef.current) return;
      const rect = faderRef.current.getBoundingClientRect();
      const rawNorm = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
      const val = min + rawNorm * (max - min);
      onChange(Number(val.toFixed(1)));
    },
    [min, max, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    updateFromY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromY(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  return (
    <div className={cn('flex flex-col items-center select-none font-mono text-[10px]', className)}>
      <span className="text-[9px] uppercase tracking-wider text-neutral-400 mb-1">{label}</span>

      {/* Fader Track Container */}
      <div
        ref={faderRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className="relative h-32 w-8 bg-[#101216] rounded border border-neutral-800 flex items-center justify-center cursor-ns-resize shadow-inner-bezel"
      >
        {/* Center Track Slot */}
        <div className="absolute top-2 bottom-2 w-1.5 bg-[#08090a] rounded-full border border-neutral-900" />

        {/* 0 dB Notch Marker */}
        <div
          className="absolute left-0 right-0 h-px bg-accent-volt/50 pointer-events-none"
          style={{ top: `${(1 - mapRange(0, min, max, 0, 1)) * 100}%` }}
        />

        {/* Fader Cap / Thumb */}
        <div
          className={cn(
            'absolute w-7 h-5 rounded bg-gradient-to-b from-[#2e3440] to-[#1a1d24] border border-neutral-500 shadow-md flex items-center justify-center transition-transform',
            isDragging ? 'scale-105 border-accent-volt shadow-glow-volt' : 'hover:border-neutral-300'
          )}
          style={{
            top: `calc(${(1 - normalized) * 100}% - 10px)`,
          }}
        >
          {/* Fader White Line Indicator */}
          <div className="w-4 h-0.5 bg-white rounded-full shadow-sm" />
        </div>
      </div>

      {/* Readout */}
      <span className="mt-1 font-semibold tabular-nums text-neutral-300 text-[10px]">
        {formatDecibel(value)}
      </span>
    </div>
  );
};
