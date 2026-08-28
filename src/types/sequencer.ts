import { TrackType, FXState } from './audio';

export interface Step {
  active: boolean;
  velocity: number;    // 0.1 to 1.0
  pitch?: string;      // e.g. "C3", "D#4"
  probability: number; // 0.0 to 1.0
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  solo: boolean;
  volume: number;      // -36 dB to +6 dB
  pan: number;         // -1.0 (Left) to +1.0 (Right)
  defaultPitch?: string;
  steps: Step[];
}

export type MusicalScale = 
  | 'Minor Pentatonic'
  | 'Dorian'
  | 'Phrygian'
  | 'Hirajoshi'
  | 'Lydian'
  | 'Natural Minor'
  | 'Major Pentatonic'
  | 'Blues';

export type RootKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface PatternPreset {
  id: string;
  name: string;
  genre: string;
  description: string;
  bpm: number;
  rootKey: RootKey;
  scale: MusicalScale;
  swing: number;
  fx: FXState;
  tracks: Track[];
}

export interface SequencerState {
  tracks: Track[];
  isPlaying: boolean;
  isEngineStarted: boolean;
  bpm: number;
  currentStep: number;
  totalSteps: number; // 16 or 32
  scale: MusicalScale;
  rootKey: RootKey;
  swing: number;
  fx: FXState;
  activePresetId: string | null;

  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setIsEngineStarted: (isEngineStarted: boolean) => void;
  setCurrentStep: (step: number) => void;
  setBpm: (bpm: number) => void;
  setTotalSteps: (steps: number) => void;
  setRootKey: (rootKey: RootKey) => void;
  setScale: (scale: MusicalScale) => void;
  setSwing: (swing: number) => void;
  
  toggleStep: (trackId: string, stepIndex: number) => void;
  setStepVelocity: (trackId: string, stepIndex: number, velocity: number) => void;
  setStepPitch: (trackId: string, stepIndex: number, pitch: string) => void;
  setStepProbability: (trackId: string, stepIndex: number, probability: number) => void;
  
  setTrackMute: (trackId: string, muted: boolean) => void;
  setTrackSolo: (trackId: string, solo: boolean) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  setTrackDefaultPitch: (trackId: string, pitch: string) => void;
  
  applyEuclideanToTrack: (trackId: string, pulses: number, shift: number) => void;
  clearTrackSteps: (trackId: string) => void;
  clearAllSteps: () => void;
  mutatePattern: (mutationFactor: number) => void;
  
  updateFX: (fx: Partial<FXState>) => void;
  loadPreset: (preset: PatternPreset) => void;
  importPatternJSON: (jsonString: string) => boolean;
  exportPatternJSON: () => string;
}
