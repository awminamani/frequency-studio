'use client';

import React from 'react';
import { AnalyserData } from '@/types/audio';
import { cn } from '@/lib/utils';

interface SpectrumGridProps {
  analyserData: AnalyserData;
  className?: string;
}

export const SpectrumGrid: React.FC<SpectrumGridProps> = ({
  analyserData,
  className,
}) => {
  const bands = [
    { label: 'SUB', energy: analyserData.bassEnergy * 1.2, color: 'bg-red-500' },
    { label: 'BASS', energy: analyserData.bassEnergy, color: 'bg-accent-orange' },
    { label: 'LOW-MID', energy: analyserData.midEnergy * 0.9, color: 'bg-accent-volt' },
    { label: 'MID', energy: analyserData.midEnergy, color: 'bg-emerald-400' },
    { label: 'HIGH-MID', energy: analyserData.highEnergy * 1.1, color: 'bg-accent-cyan' },
    { label: 'AIR', energy: analyserData.highEnergy, color: 'bg-purple-400' },
  ];

  return (
    <div className={cn('grid grid-cols-6 gap-2 p-2.5 rounded-lg bg-[#0e1014] border border-border-subtle font-mono text-[9px]', className)}>
      {bands.map((b) => {
        const heightPct = Math.min(100, Math.max(5, b.energy * 100));
        return (
          <div key={b.label} className="flex flex-col items-center gap-1.5">
            <div className="relative h-16 w-full bg-[#08090a] rounded border border-neutral-800/80 overflow-hidden flex flex-col justify-end p-0.5">
              <div
                className={cn('w-full rounded-xs transition-all duration-75 shadow-sm', b.color)}
                style={{
                  height: `${heightPct}%`,
                  opacity: Math.max(0.3, b.energy),
                }}
              />
            </div>
            <span className="text-[8px] font-semibold text-neutral-400 uppercase tracking-tighter truncate">
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
