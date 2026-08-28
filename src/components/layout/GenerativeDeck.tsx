'use client';

import React, { useState } from 'react';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Shuffle, Wand2, RefreshCw, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export const GenerativeDeck: React.FC = () => {
  const store = useSequencerStore();
  const [mutationFactor, setMutationFactor] = useState(0.4);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border-subtle bg-surface-panel shadow-2xl">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-accent-volt" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-100">
            Generative Intelligence Deck
          </span>
        </div>
        <span className="font-mono text-[10px] text-neutral-400">
          Stochastic Pitch & Polyrhythm Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Mutation Intensity Slider */}
        <div className="flex flex-col justify-between p-3 rounded-lg bg-surface-card border border-border-subtle">
          <div className="flex justify-between font-mono text-xs mb-2">
            <span className="text-neutral-300 font-semibold">Mutation Entropy:</span>
            <span className="text-accent-volt font-bold">{Math.round(mutationFactor * 100)}%</span>
          </div>
          <Slider
            min={0.1}
            max={0.9}
            step={0.05}
            value={[mutationFactor]}
            onValueChange={(val) => setMutationFactor(val[0])}
            colorVariant="volt"
          />
          <div className="flex justify-between font-mono text-[9px] text-neutral-500 mt-2">
            <span>Subtle Variations</span>
            <span>Radical Shift</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-2 p-3 rounded-lg bg-surface-card border border-border-subtle">
          <Button
            variant="volt"
            size="sm"
            onClick={() => store.mutatePattern(mutationFactor)}
            className="w-full font-bold"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1.5" /> Mutate Current Pattern (R)
          </Button>

          <Button
            variant="hardware"
            size="sm"
            onClick={() => {
              store.tracks.forEach((t) => {
                const pulses = t.type === 'kick' ? 4 : t.type === 'snare' ? 2 : Math.floor(Math.random() * 8) + 3;
                const shift = Math.floor(Math.random() * 4);
                store.applyEuclideanToTrack(t.id, pulses, shift);
              });
            }}
            className="w-full text-accent-cyan border-accent-cyan/30 hover:border-accent-cyan"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generative Polyrhythms
          </Button>
        </div>

        {/* Scale/Theory Info */}
        <div className="flex flex-col justify-between p-3 rounded-lg bg-surface-card border border-border-subtle font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Harmonic Constraint:</span>
            <span className="text-accent-orange font-bold">
              {store.rootKey} {store.scale}
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">
            All pitch mutations are automatically quantized to {store.rootKey} {store.scale} to preserve musical coherence.
          </p>
        </div>
      </div>
    </div>
  );
};
