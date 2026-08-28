'use client';

import React, { useState, useRef } from 'react';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { ROOT_KEYS, SCALES } from '@/lib/algorithms/scales';
import { MusicalScale, RootKey } from '@/types/sequencer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Square,
  Volume2,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Plus,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderTelemetryProps {
  onTogglePlay: () => void;
  onStartEngine: () => void;
}

export const HeaderTelemetry: React.FC<HeaderTelemetryProps> = ({
  onTogglePlay,
  onStartEngine,
}) => {
  const store = useSequencerStore();

  // Tap Tempo calculation
  const tapTimesRef = useRef<number[]>([]);
  const handleTapTempo = () => {
    const now = performance.now();
    const taps = tapTimesRef.current.filter((t) => now - t < 3000);
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        store.setBpm(calculatedBpm);
      }
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-panel shadow-2xl">
      {/* Brand & Audio Engine Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-volt via-accent-orange to-accent-cyan p-0.5 shadow-glow-volt">
            <div className="w-full h-full rounded-[6px] bg-obsidian flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-volt" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-sans font-black text-sm tracking-tight text-white uppercase">
                Frequency Studio
              </h1>
              <Badge variant="volt" className="text-[9px] py-0 px-1 font-bold">
                PRO V1.0
              </Badge>
            </div>
            <span className="font-mono text-[10px] text-neutral-400">
              Hardware Synth & Generative Matrix
            </span>
          </div>
        </div>

        {!store.isEngineStarted && (
          <Button
            size="sm"
            variant="volt"
            onClick={onStartEngine}
            className="animate-pulse"
          >
            <Activity className="w-3.5 h-3.5 mr-1" /> Start Audio Engine
          </Button>
        )}
      </div>

      {/* Center: Main Transport & Tempo Telemetry */}
      <div className="flex items-center gap-2.5">
        {/* Play / Stop Button */}
        <Button
          size="default"
          variant={store.isPlaying ? 'orange' : 'volt'}
          onClick={onTogglePlay}
          className="h-10 px-5 text-xs font-bold uppercase tracking-wider"
          title="Toggle Playback (Spacebar)"
        >
          {store.isPlaying ? (
            <>
              <Square className="w-4 h-4 mr-1.5 fill-current" /> STOP
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-1.5 fill-current" /> PLAY
            </>
          )}
        </Button>

        {/* BPM Counter & Controls */}
        <div className="flex items-center rounded-lg bg-surface-card border border-border-subtle p-1 font-mono">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => store.setBpm(store.bpm - 1)}
            className="h-7 w-7 text-neutral-400 hover:text-white"
            title="Decrease BPM (Down Arrow)"
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>

          <div className="flex flex-col items-center px-2 min-w-[58px]">
            <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold">
              TEMPO
            </span>
            <span className="text-sm font-black tabular-nums text-accent-volt leading-none">
              {store.bpm}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => store.setBpm(store.bpm + 1)}
            className="h-7 w-7 text-neutral-400 hover:text-white"
            title="Increase BPM (Up Arrow)"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="hardware"
            size="xs"
            onClick={handleTapTempo}
            className="ml-1 text-[9px] h-7 px-2 font-bold hover:text-accent-cyan"
            title="Tap Tempo"
          >
            TAP
          </Button>
        </div>
      </div>

      {/* Right: Key, Scale & Global Swing */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Root Key Dropdown */}
        <div className="flex items-center gap-1 bg-surface-card border border-border-subtle rounded-lg px-2 py-1 font-mono text-xs">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">ROOT:</span>
          <select
            value={store.rootKey}
            onChange={(e) => store.setRootKey(e.target.value as RootKey)}
            className="bg-transparent text-accent-orange font-bold focus:outline-none cursor-pointer"
          >
            {ROOT_KEYS.map((k) => (
              <option key={k} value={k} className="bg-surface-card text-neutral-100">
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Musical Scale Dropdown */}
        <div className="flex items-center gap-1 bg-surface-card border border-border-subtle rounded-lg px-2 py-1 font-mono text-xs">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">SCALE:</span>
          <select
            value={store.scale}
            onChange={(e) => store.setScale(e.target.value as MusicalScale)}
            className="bg-transparent text-accent-cyan font-bold focus:outline-none cursor-pointer"
          >
            {(Object.keys(SCALES) as MusicalScale[]).map((s) => (
              <option key={s} value={s} className="bg-surface-card text-neutral-100">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Swing Slider */}
        <div className="hidden lg:flex items-center gap-2 bg-surface-card border border-border-subtle rounded-lg px-2.5 py-1 font-mono text-xs">
          <span className="text-[10px] text-neutral-400 uppercase font-semibold">SWING:</span>
          <span className="text-accent-volt font-bold min-w-[28px] tabular-nums text-right">
            {Math.round(store.swing * 100)}%
          </span>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={store.swing}
            onChange={(e) => store.setSwing(parseFloat(e.target.value))}
            className="w-16 h-1 accent-accent-volt cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
};
