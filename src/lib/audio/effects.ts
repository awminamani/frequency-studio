import * as Tone from 'tone';
import { FXState } from '@/types/audio';

export interface FXChain {
  inputBus: Tone.Gain;
  filter: Tone.Filter;
  distortion: Tone.Distortion;
  delay: Tone.FeedbackDelay;
  reverb: Tone.Reverb;
  analyser: Tone.Analyser;
  meter: Tone.Meter;
  limiter: Tone.Limiter;
  masterVolume: Tone.Volume;
  updateParams: (fx: Partial<FXState>) => void;
  dispose: () => void;
}

export function createMasterFXChain(): FXChain {
  const inputBus = new Tone.Gain(1.0);
  
  // 1. Resonant Master Filter
  const filter = new Tone.Filter({
    frequency: 4200,
    type: 'lowpass',
    rolloff: -24,
    Q: 4.5,
  });

  // 2. Analog Tape / Tube Saturation
  const distortion = new Tone.Distortion({
    distortion: 0.2,
    oversample: '2x',
    wet: 0.4,
  });

  // 3. Stereo Feedback Delay
  const delay = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.45,
    wet: 0.3,
  });

  // 4. Lush Space Reverb
  const reverb = new Tone.Reverb({
    decay: 3.2,
    preDelay: 0.02,
    wet: 0.28,
  });

  // 5. Multi-Mode Analyser & Peak Meter
  const analyser = new Tone.Analyser({
    type: 'waveform',
    size: 512,
  });

  const meter = new Tone.Meter({
    normalRange: true,
    smoothing: 0.8,
  });

  // 6. Master Volume & Safe Limiter
  const masterVolume = new Tone.Volume(0);
  const limiter = new Tone.Limiter(-0.5);

  // Audio Graph Routing:
  // inputBus -> filter -> distortion -> delay -> reverb -> analyser -> meter -> masterVolume -> limiter -> Tone.Destination
  inputBus.chain(
    filter,
    distortion,
    delay,
    reverb,
    analyser,
    meter,
    masterVolume,
    limiter,
    Tone.Destination
  );

  const updateParams = (fx: Partial<FXState>) => {
    if (fx.cutoff !== undefined) {
      filter.frequency.rampTo(Math.max(20, Math.min(20000, fx.cutoff)), 0.05);
    }
    if (fx.resonance !== undefined) {
      filter.Q.rampTo(Math.max(0.1, Math.min(20, fx.resonance)), 0.05);
    }
    if (fx.distortion !== undefined) {
      distortion.distortion = Math.max(0, Math.min(1, fx.distortion));
      distortion.wet.value = Math.max(0, Math.min(1, fx.distortion * 0.8));
    }
    if (fx.delayTime !== undefined) {
      try {
        delay.delayTime.value = fx.delayTime;
      } catch {
        // Fallback for invalid note string
        delay.delayTime.value = '8n';
      }
    }
    if (fx.delayFeedback !== undefined) {
      delay.feedback.rampTo(Math.max(0, Math.min(0.95, fx.delayFeedback)), 0.05);
    }
    if (fx.delayWet !== undefined) {
      delay.wet.rampTo(Math.max(0, Math.min(1, fx.delayWet)), 0.05);
    }
    if (fx.reverbDecay !== undefined) {
      try {
        reverb.decay = Math.max(0.2, Math.min(20, fx.reverbDecay));
      } catch {
        // Safe fallback
      }
    }
    if (fx.reverbWet !== undefined) {
      reverb.wet.rampTo(Math.max(0, Math.min(1, fx.reverbWet)), 0.05);
    }
    if (fx.masterVolume !== undefined) {
      masterVolume.volume.rampTo(Math.max(-60, Math.min(6, fx.masterVolume)), 0.05);
    }
  };

  const dispose = () => {
    inputBus.dispose();
    filter.dispose();
    distortion.dispose();
    delay.dispose();
    reverb.dispose();
    analyser.dispose();
    meter.dispose();
    masterVolume.dispose();
    limiter.dispose();
  };

  return {
    inputBus,
    filter,
    distortion,
    delay,
    reverb,
    analyser,
    meter,
    limiter,
    masterVolume,
    updateParams,
    dispose,
  };
}
