'use client';

import React, { useEffect, useState } from 'react';
import * as Tone from 'tone';
import { cn } from '@/lib/utils';

interface VUMeterProps {
  meterNode: Tone.Meter | null;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const VUMeter: React.FC<VUMeterProps> = ({
  meterNode,
  orientation = 'vertical',
  className,
}) => {
  const [level, setLevel] = useState<number>(0);
  const [peak, setPeak] = useState<number>(0);

  useEffect(() => {
    if (!meterNode) return;

    let animId: number;
    let currentPeak = 0;

    const poll = () => {
      try {
        const raw = meterNode.getValue();
        const db = typeof raw === 'number' ? raw : raw[0] || -100;
        
        // Convert dB (-48 to 0) to 0.0 .. 1.0
        const norm = Math.max(0, Math.min(1, (db + 48) / 48));
        setLevel(norm);

        if (norm > currentPeak) {
          currentPeak = norm;
          setPeak(norm);
        } else {
          currentPeak = Math.max(0, currentPeak - 0.015);
          setPeak(currentPeak);
        }
      } catch {}

      animId = requestAnimationFrame(poll);
    };

    animId = requestAnimationFrame(poll);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [meterNode]);

  const segments = 12;

  return (
    <div
      className={cn(
        'bg-[#0a0c0e] rounded p-1.5 border border-neutral-800 shadow-inner flex select-none font-mono text-[9px]',
        orientation === 'vertical' ? 'flex-col items-center gap-1 h-32 w-7' : 'flex-row items-center gap-1 w-full h-7',
        className
      )}
    >
      <span className="text-[8px] font-bold text-neutral-500 uppercase">VU</span>

      <div
        className={cn(
          'flex gap-0.5 justify-between flex-1',
          orientation === 'vertical' ? 'flex-col-reverse w-3' : 'flex-row h-3'
        )}
      >
        {Array.from({ length: segments }).map((_, idx) => {
          const segThreshold = (idx + 1) / segments;
          const isActive = level >= segThreshold;
          const isPeakActive = Math.abs(peak - segThreshold) < 1 / segments;

          // Green (0-8), Yellow (9-10), Red (11-12)
          let colorClass = 'bg-emerald-500/30';
          let activeClass = 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]';

          if (idx >= 8 && idx < 10) {
            colorClass = 'bg-amber-500/30';
            activeClass = 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]';
          } else if (idx >= 10) {
            colorClass = 'bg-red-500/30';
            activeClass = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]';
          }

          return (
            <div
              key={idx}
              className={cn(
                'rounded-xs transition-all duration-75',
                orientation === 'vertical' ? 'h-1.5 w-full' : 'w-1.5 h-full',
                isActive || isPeakActive ? activeClass : colorClass
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
