'use client';

import React from 'react';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { TrackLane } from './TrackLane';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trash2, Shuffle, Layers } from 'lucide-react';

export const StepSequencer: React.FC = () => {
  const store = useSequencerStore();

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-surface-panel shadow-2xl">
      {/* Sequencer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-card border border-border-subtle">
            <Layers className="w-4 h-4 text-accent-volt" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-100">
              Pattern Gate Matrix
            </span>
          </div>

          {/* 16 / 32 Steps toggle */}
          <div className="flex items-center rounded-md border border-border-subtle bg-surface-card p-0.5 font-mono text-xs">
            <button
              onClick={() => store.setTotalSteps(16)}
              className={`px-2.5 py-1 rounded transition-colors ${
                store.totalSteps === 16
                  ? 'bg-accent-volt text-obsidian font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              16 Steps
            </button>
            <button
              onClick={() => store.setTotalSteps(32)}
              className={`px-2.5 py-1 rounded transition-colors ${
                store.totalSteps === 32
                  ? 'bg-accent-volt text-obsidian font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              32 Steps
            </button>
          </div>
        </div>

        {/* Global Matrix Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="hardware"
            onClick={() => store.mutatePattern(0.4)}
            className="text-accent-volt border-accent-volt/30 hover:border-accent-volt"
            title="Mutate Pitch & Rhythms (R)"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1" /> Mutate
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => store.clearAllSteps()}
            className="text-red-400 border-red-900/40 hover:bg-red-950/40"
            title="Clear all steps (C)"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Matrix
          </Button>
        </div>
      </div>

      {/* Step Numbers Top Telemetry Bar */}
      <div className="hidden md:flex items-center gap-2.5 px-2">
        <div className="w-64 shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
          Instruments / Channels
        </div>
        <div className="flex-1 grid grid-cols-16 gap-1.5">
          {Array.from({ length: store.totalSteps }).map((_, idx) => {
            const isPlayhead = store.currentStep === idx;
            const isBeatStart = idx % 4 === 0;
            return (
              <div
                key={idx}
                className={`text-center font-mono text-[9px] py-0.5 rounded ${
                  isPlayhead
                    ? 'text-accent-volt font-bold bg-accent-volt/20'
                    : isBeatStart
                    ? 'text-neutral-300 font-semibold'
                    : 'text-neutral-600'
                }`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Render Track Rows */}
      <div className="flex flex-col gap-2">
        {store.tracks.map((track) => (
          <TrackLane
            key={track.id}
            track={track}
            currentStepIndex={store.currentStep}
            rootKey={store.rootKey}
            scale={store.scale}
          />
        ))}
      </div>
    </div>
  );
};
