export type TrackType = 'synth' | 'bass' | 'kick' | 'snare' | 'hihat' | 'perc';

export interface FXState {
  cutoff: number;         // 100 Hz to 18000 Hz
  resonance: number;      // 0 to 15 (Q factor)
  delayTime: string;      // '8n', '8t', '16n', '4n', etc.
  delayFeedback: number;  // 0.0 to 0.9
  delayWet: number;       // 0.0 to 1.0
  reverbDecay: number;    // 0.5 to 10.0 seconds
  reverbWet: number;      // 0.0 to 1.0
  distortion: number;     // 0.0 to 1.0
  masterVolume: number;   // -60 to 6 dB
}

export interface AudioVoiceTrigger {
  trackId: string;
  trackType: TrackType;
  pitch?: string;
  velocity: number;
  time: number;
}

export interface AnalyserData {
  waveform: Float32Array;
  frequencies: Float32Array;
  rms: number;
  bassEnergy: number;
  midEnergy: number;
  highEnergy: number;
}
