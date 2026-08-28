import * as Tone from 'tone';
import { TrackType } from '@/types/audio';

export interface SynthVoiceMap {
  polySynth: Tone.PolySynth;
  bassSynth: Tone.MonoSynth;
  kickSynth: Tone.MembraneSynth;
  snareSynth: Tone.NoiseSynth;
  hihatClosedSynth: Tone.NoiseSynth;
  hihatOpenSynth: Tone.NoiseSynth;
  percSynth: Tone.MetalSynth;
}

export function createSynthVoices(): SynthVoiceMap {
  // 1. Warm Polyphonic Lead/Chords Synth
  const polySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.4,
      release: 0.8,
    },
    volume: -6,
  });
  polySynth.maxPolyphony = 8;

  // 2. TB-303 Acid Bass MonoSynth
  const bassSynth = new Tone.MonoSynth({
    oscillator: {
      type: 'sawtooth',
    },
    envelope: {
      attack: 0.005,
      decay: 0.25,
      sustain: 0.2,
      release: 0.4,
    },
    filterEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.3,
      release: 0.5,
      baseFrequency: 80,
      octaves: 4.5,
      exponent: 2,
    },
    filter: {
      Q: 6,
      type: 'lowpass',
      rolloff: -24,
    },
    volume: -2,
  });

  // 3. Punchy Membrane Kick Synth
  const kickSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 8,
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.001,
      decay: 0.38,
      sustain: 0.01,
      release: 0.4,
    },
    volume: 0,
  });

  // 4. Snappy Noise Snare Synth
  const snareSynth = new Tone.NoiseSynth({
    noise: {
      type: 'white',
    },
    envelope: {
      attack: 0.001,
      decay: 0.22,
      sustain: 0,
      release: 0.22,
    },
    volume: -3,
  });

  // 5. Crisp Closed Hi-Hat Synth
  const hihatClosedSynth = new Tone.NoiseSynth({
    noise: {
      type: 'pink',
    },
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.05,
    },
    volume: -8,
  });

  // 6. Open Sizzling Hi-Hat Synth
  const hihatOpenSynth = new Tone.NoiseSynth({
    noise: {
      type: 'pink',
    },
    envelope: {
      attack: 0.001,
      decay: 0.35,
      sustain: 0,
      release: 0.35,
    },
    volume: -8,
  });

  // 7. Metallic Percussion Synth
  const percSynth = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.12,
      release: 0.1,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
    volume: -6,
  });

  return {
    polySynth,
    bassSynth,
    kickSynth,
    snareSynth,
    hihatClosedSynth,
    hihatOpenSynth,
    percSynth,
  };
}
