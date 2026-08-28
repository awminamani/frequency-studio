'use client';

import React, { useState } from 'react';
import { Track, Step, MusicalScale, RootKey } from '@/types/sequencer';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { getScaleNotes } from '@/lib/algorithms/scales';
import { cn, playTactileClick } from '@/lib/utils';
import { RotaryKnob } from './RotaryKnob';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  Trash2,
  Music,
  Disc3,
  Flame,
  Zap,
} from 'lucide-react';

interface TrackLaneProps {
  track: Track;
  currentStepIndex: number;
  rootKey: RootKey;
  scale: MusicalScale;
}

export const TrackLane: React.FC<TrackLaneProps> = ({
  track,
  currentStepIndex,
  rootKey,
  scale,
}) => {
  const store = useSequencerStore();
  const [euclideanPulses, setEuclideanPulses] = useState(4);
  const [euclideanShift, setEuclideanShift] = useState(0);
  const [selectedStepIdx, setSelectedStepIdx] = useState<number | null>(null);

  const isMelodic = track.type === 'synth' || track.type === 'bass';
  const scaleNotes = isMelodic
    ? getScaleNotes(rootKey, scale, track.type === 'bass' ? 1 : 3, 3)
    : [];

  const handleStepClick = (idx: number) => {
    const isActivating = !track.steps[idx]?.active;
    store.toggleStep(track.id, idx);
    playTactileClick(isActivating ? 'on' : 'off');
  };

  const handleApplyEuclidean = () => {
    store.applyEuclideanToTrack(track.id, euclideanPulses, euclideanShift);
  };

  const getTrackIcon = () => {
    switch (track.type) {
      case 'synth':
        return <Zap className="w-3.5 h-3.5 text-accent-volt" />;
      case 'bass':
        return <Flame className="w-3.5 h-3.5 text-accent-orange" />;
      case 'kick':
        return <Disc3 className="w-3.5 h-3.5 text-red-400" />;
      case 'snare':
        return <Radio className="w-3.5 h-3.5 text-amber-400" />;
      case 'hihat':
        return <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />;
      case 'perc':
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Disc3 className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const getTrackColorBadge = () => {
    switch (track.type) {
      case 'synth':
        return 'border-accent-volt/40 text-accent-volt';
      case 'bass':
        return 'border-accent-orange/40 text-accent-orange';
      case 'hihat':
        return 'border-accent-cyan/40 text-accent-cyan';
      default:
        return 'border-neutral-600 text-neutral-300';
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col md:flex-row items-stretch md:items-center gap-2.5 p-2 rounded-lg border transition-all duration-150',
        track.muted
          ? 'bg-[#0e1013]/60 border-neutral-900 opacity-60'
          : track.solo
          ? 'bg-surface-card border-accent-volt/40 shadow-glow-volt/10'
          : 'bg-surface-card border-border-subtle hover:border-neutral-700'
      )}
    >
      {/* 1. Track Header & Mixer Controls */}
      <div className="flex items-center justify-between md:justify-start gap-2.5 w-full md:w-64 shrink-0 pr-2 md:border-r md:border-border-subtle">
        {/* Track Icon & Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 rounded bg-surface-panel border border-border-subtle shrink-0">
            {getTrackIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-neutral-200 truncate">
                {track.name}
              </span>
              <Badge variant="outline" className={cn('text-[9px] px-1 py-0', getTrackColorBadge())}>
                {track.type}
              </Badge>
            </div>
            {isMelodic && (
              <span className="font-mono text-[10px] text-neutral-400">
                Key: {track.defaultPitch || 'Auto'}
              </span>
            )}
          </div>
        </div>

        {/* Solo / Mute Buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="xs"
            variant={track.solo ? 'volt' : 'hardware'}
            onClick={() => store.setTrackSolo(track.id, !track.solo)}
            className="w-6 h-6 p-0 text-[10px] font-bold"
            title="Solo Track (Shift + 1-6)"
          >
            S
          </Button>
          <Button
            size="xs"
            variant={track.muted ? 'danger' : 'hardware'}
            onClick={() => store.setTrackMute(track.id, !track.muted)}
            className="w-6 h-6 p-0 text-[10px] font-bold"
            title="Mute Track (1-6)"
          >
            M
          </Button>
        </div>

        {/* Track Volume & Pan Mini Knobs */}
        <div className="flex items-center gap-1.5 pl-1">
          <RotaryKnob
            label="VOL"
            size="sm"
            min={-36}
            max={6}
            step={1}
            value={track.volume}
            defaultValue={0}
            unit="dB"
            color="volt"
            onChange={(v) => store.setTrackVolume(track.id, v)}
          />
          <RotaryKnob
            label="PAN"
            size="sm"
            min={-1}
            max={1}
            step={0.1}
            value={track.pan}
            defaultValue={0}
            color="cyan"
            formatValue={(v) => (v === 0 ? 'C' : v < 0 ? `L${Math.abs(Math.round(v * 100))}` : `R${Math.round(v * 100)}`)}
            onChange={(v) => store.setTrackPan(track.id, v)}
          />
        </div>

        {/* Euclidean Generator Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-neutral-400 hover:text-accent-volt"
              title="Euclidean Rhythm Generator"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-surface-card border-border-subtle text-neutral-100">
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                <span className="font-semibold text-accent-volt flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Euclidean Gen
                </span>
                <span className="text-[10px] text-neutral-400">{track.name}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Pulses:</span>
                  <span className="text-accent-volt font-bold">{euclideanPulses}</span>
                </div>
                <Slider
                  min={0}
                  max={track.steps.length}
                  step={1}
                  value={[euclideanPulses]}
                  onValueChange={(val) => setEuclideanPulses(val[0])}
                  colorVariant="volt"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Offset Shift:</span>
                  <span className="text-accent-cyan font-bold">{euclideanShift}</span>
                </div>
                <Slider
                  min={0}
                  max={track.steps.length - 1}
                  step={1}
                  value={[euclideanShift]}
                  onValueChange={(val) => setEuclideanShift(val[0])}
                  colorVariant="cyan"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => store.clearTrackSteps(track.id)}
                  className="text-red-400 border-red-900/40 hover:bg-red-950/40"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Clear
                </Button>
                <Button size="xs" variant="volt" onClick={handleApplyEuclidean}>
                  Apply Pattern
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 2. Step Gate Matrix (16 or 32 Steps with 4-beat visual grouping) */}
      <div className="flex-1 grid grid-cols-8 md:grid-cols-16 gap-1.5 overflow-x-auto py-1">
        {track.steps.map((step, idx) => {
          const isPlayhead = currentStepIndex === idx;
          const isBeatStart = idx % 4 === 0;
          const isOddBeatGroup = Math.floor(idx / 4) % 2 === 1;

          // Color themes based on track type
          let activeBg = 'bg-accent-volt text-obsidian shadow-glow-volt';
          if (track.type === 'bass') activeBg = 'bg-accent-orange text-white shadow-glow-orange';
          if (track.type === 'hihat') activeBg = 'bg-accent-cyan text-obsidian shadow-glow-cyan';
          if (track.type === 'perc') activeBg = 'bg-purple-400 text-obsidian shadow-[0_0_12px_rgba(192,132,252,0.6)]';

          return (
            <Popover key={idx}>
              <div className="relative group/step flex flex-col items-center">
                {/* Step Button */}
                <button
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedStepIdx(idx);
                  }}
                  className={cn(
                    'relative h-10 md:h-12 w-full rounded font-mono text-[10px] font-bold transition-all duration-100 flex flex-col items-center justify-between p-1 select-none border',
                    isBeatStart ? 'border-neutral-600' : 'border-neutral-800',
                    isOddBeatGroup ? 'bg-[#15181e]' : 'bg-[#1a1e26]',
                    step.active && activeBg,
                    isPlayhead && 'ring-2 ring-white scale-105 z-10 brightness-125'
                  )}
                  style={{
                    opacity: step.active ? Math.max(0.4, step.velocity) : 1,
                  }}
                >
                  {/* Step Index or Pitch Badge */}
                  <span
                    className={cn(
                      'text-[8px] leading-none',
                      step.active ? 'text-black/80 font-extrabold' : 'text-neutral-500'
                    )}
                  >
                    {step.active && isMelodic && step.pitch ? step.pitch : idx + 1}
                  </span>

                  {/* Velocity Gauge Bar */}
                  {step.active && (
                    <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden mt-auto">
                      <div
                        className="h-full bg-white/90 rounded-full"
                        style={{ width: `${step.velocity * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Probability Warning Dot */}
                  {step.active && step.probability < 1.0 && (
                    <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>

                {/* Step Parameter Edit Trigger */}
                <PopoverTrigger asChild>
                  <button
                    className="opacity-0 group-hover/step:opacity-100 text-[8px] text-neutral-400 hover:text-white transition-opacity font-mono mt-0.5"
                    title="Edit Step Parameters"
                  >
                    ...
                  </button>
                </PopoverTrigger>
              </div>

              {/* Step Parameter Dialog Popover */}
              <PopoverContent className="w-56 bg-surface-card border-border-subtle p-3 text-neutral-100">
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
                    <span className="font-semibold text-accent-volt">
                      Step #{idx + 1} ({track.name})
                    </span>
                    <Badge variant={step.active ? 'volt' : 'outline'}>
                      {step.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Velocity Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Velocity:</span>
                      <span className="text-accent-volt font-bold">
                        {Math.round(step.velocity * 100)}%
                      </span>
                    </div>
                    <Slider
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={[step.velocity]}
                      onValueChange={(val) => store.setStepVelocity(track.id, idx, val[0])}
                      colorVariant="volt"
                    />
                  </div>

                  {/* Probability Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span>Probability:</span>
                      <span className="text-accent-cyan font-bold">
                        {Math.round(step.probability * 100)}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={1.0}
                      step={0.05}
                      value={[step.probability]}
                      onValueChange={(val) => store.setStepProbability(track.id, idx, val[0])}
                      colorVariant="cyan"
                    />
                  </div>

                  {/* Melodic Pitch Quantized Dropdown */}
                  {isMelodic && scaleNotes.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span>Pitch:</span>
                        <span className="text-accent-orange font-bold">
                          {step.pitch || track.defaultPitch || 'C3'}
                        </span>
                      </div>
                      <select
                        value={step.pitch || track.defaultPitch || 'C3'}
                        onChange={(e) => store.setStepPitch(track.id, idx, e.target.value)}
                        className="w-full bg-surface-panel border border-border-subtle rounded px-2 py-1 text-xs text-neutral-200 focus:outline-none focus:border-accent-volt"
                      >
                        {scaleNotes.map((note) => (
                          <option key={note} value={note}>
                            {note}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
};
