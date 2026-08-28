'use client';

import React, { useState, useCallback } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useAnalyser } from '@/hooks/useAnalyser';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { HeaderTelemetry } from '@/components/layout/HeaderTelemetry';
import { WaveformCanvas } from '@/components/visualizer/WaveformCanvas';
import { SpectrumGrid } from '@/components/visualizer/SpectrumGrid';
import { StepSequencer } from '@/components/audio/StepSequencer';
import { MasterStrip } from '@/components/layout/MasterStrip';
import { GenerativeDeck } from '@/components/layout/GenerativeDeck';
import { PresetBar } from '@/components/layout/PresetBar';
import { Badge } from '@/components/ui/badge';
import {
  Keyboard,
  Info,
  HelpCircle,
  Headphones,
  Sliders,
  Volume2,
} from 'lucide-react';

export default function FrequencyStudioPage() {
  const store = useSequencerStore();
  const [triggerSignal, setTriggerSignal] = useState<{
    type: string;
    velocity: number;
    timestamp: number;
  } | null>(null);

  const handleBeatTrigger = useCallback((type: string, velocity: number) => {
    setTriggerSignal({
      type,
      velocity,
      timestamp: Date.now(),
    });
  }, []);

  // Audio Engine Graph Hook
  const {
    isReady,
    audioContextRunning,
    startEngine,
    togglePlay,
    analyserNode,
    meterNode,
  } = useAudioEngine(handleBeatTrigger);

  // Analyser Hook for Spectrum telemetry
  const analyserData = useAnalyser(analyserNode, true);

  // Global Keyboard Hotkeys Hook
  useKeyboardShortcuts(togglePlay);

  return (
    <main className="min-h-screen bg-obsidian text-neutral-100 p-3 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-5">
        {/* 1. Header & Transport Telemetry */}
        <HeaderTelemetry
          onTogglePlay={togglePlay}
          onStartEngine={startEngine}
        />

        {/* 2. Visualizer Deck & Spectrum Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-8 flex flex-col">
            <WaveformCanvas
              analyserNode={analyserNode}
              triggerSignal={triggerSignal}
              className="h-48"
            />
          </div>
          <div className="lg:col-span-4 flex flex-col justify-between">
            <SpectrumGrid analyserData={analyserData} className="h-48" />
          </div>
        </div>

        {/* 3. Factory Preset Bar & JSON Sharing */}
        <PresetBar />

        {/* 4. Main Multi-Track Step Sequencer Matrix */}
        <StepSequencer />

        {/* 5. Master Signal Rack & Hardware FX Strip */}
        <MasterStrip meterNode={meterNode} />

        {/* 6. Generative Intelligence & Polyrhythm Deck */}
        <GenerativeDeck />

        {/* 7. Keyboard Shortcuts Footer Reference */}
        <footer className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border-subtle bg-surface-panel font-mono text-[11px] text-neutral-400">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-neutral-200">
              <Keyboard className="w-4 h-4 text-accent-volt" />
              <span className="font-bold uppercase tracking-wider">Hotkeys:</span>
            </div>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-accent-volt font-bold">Space</kbd> Play / Stop</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-accent-orange font-bold">R</kbd> Mutate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-red-400 font-bold">C</kbd> Clear Matrix</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-accent-cyan font-bold">1-6</kbd> Mute</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-neutral-200 font-bold">Shift+1-6</kbd> Solo</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-surface-card border border-border-subtle text-neutral-200 font-bold">↑ / ↓</kbd> BPM</span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <Badge variant="outline" className="border-accent-volt/40 text-accent-volt">
              Tone.js 15.0 // Web Audio API
            </Badge>
            <span>High-DPI 60FPS Canvas</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
