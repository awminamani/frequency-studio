'use client';

import React from 'react';
import * as Tone from 'tone';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { XYPad } from '@/components/audio/XYPad';
import { RotaryKnob } from '@/components/audio/RotaryKnob';
import { VUMeter } from '@/components/audio/VUMeter';
import { Fader } from '@/components/audio/Fader';
import { Sliders, Activity, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatFrequency, formatDecibel } from '@/lib/utils';

interface MasterStripProps {
  meterNode: Tone.Meter | null;
}

export const MasterStrip: React.FC<MasterStripProps> = ({ meterNode }) => {
  const store = useSequencerStore();

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-border-subtle bg-surface-panel shadow-2xl">
      {/* Master Section Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent-cyan" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-100">
            Master Rack & Signal Chain
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="cyan" className="text-[9px]">
            Limiter -0.5 dB Active
          </Badge>
          <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. Left: 2D Kaoss Filter Pad (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <XYPad
            xValue={store.fx.cutoff}
            yValue={store.fx.resonance}
            onChange={(cutoff, resonance) => store.updateFX({ cutoff, resonance })}
          />
        </div>

        {/* 2. Middle: Hardware FX Potentiometers (5 Cols) */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-3 p-3 rounded-lg border border-border-subtle bg-surface-card shadow-inner-bezel items-center justify-items-center">
          {/* Space Reverb Decay */}
          <RotaryKnob
            label="REV TIME"
            min={0.5}
            max={10.0}
            step={0.1}
            value={store.fx.reverbDecay}
            defaultValue={3.2}
            unit="s"
            color="cyan"
            onChange={(v) => store.updateFX({ reverbDecay: v })}
          />

          {/* Reverb Wet Mix */}
          <RotaryKnob
            label="REV MIX"
            min={0}
            max={1}
            step={0.05}
            value={store.fx.reverbWet}
            defaultValue={0.28}
            color="cyan"
            formatValue={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => store.updateFX({ reverbWet: v })}
          />

          {/* Tape Saturation / Distortion */}
          <RotaryKnob
            label="DRIVE"
            min={0}
            max={1}
            step={0.05}
            value={store.fx.distortion}
            defaultValue={0.25}
            color="orange"
            formatValue={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => store.updateFX({ distortion: v })}
          />

          {/* Stereo Delay Time */}
          <div className="flex flex-col items-center select-none font-mono text-center">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
              DLY TIME
            </span>
            <select
              value={store.fx.delayTime}
              onChange={(e) => store.updateFX({ delayTime: e.target.value })}
              className="bg-surface-panel border border-border-subtle text-accent-volt text-xs font-bold rounded px-1.5 py-1 focus:outline-none"
            >
              <option value="16n">1/16</option>
              <option value="8n">1/8</option>
              <option value="8t">1/8 Trip</option>
              <option value="4n">1/4</option>
              <option value="4t">1/4 Trip</option>
            </select>
          </div>

          {/* Delay Feedback */}
          <RotaryKnob
            label="DLY FDBK"
            min={0}
            max={0.9}
            step={0.05}
            value={store.fx.delayFeedback}
            defaultValue={0.45}
            color="volt"
            formatValue={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => store.updateFX({ delayFeedback: v })}
          />

          {/* Delay Wet Mix */}
          <RotaryKnob
            label="DLY MIX"
            min={0}
            max={1}
            step={0.05}
            value={store.fx.delayWet}
            defaultValue={0.3}
            color="volt"
            formatValue={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => store.updateFX({ delayWet: v })}
          />
        </div>

        {/* 3. Right: Master Volume Fader & Stereo VU Meter (2 Cols) */}
        <div className="lg:col-span-2 flex items-center justify-center gap-4 p-3 rounded-lg border border-border-subtle bg-surface-card shadow-inner-bezel">
          <Fader
            label="MASTER"
            min={-48}
            max={6}
            value={store.fx.masterVolume}
            defaultValue={0}
            onChange={(v) => store.updateFX({ masterVolume: v })}
          />

          <VUMeter meterNode={meterNode} orientation="vertical" />
        </div>
      </div>
    </div>
  );
};
