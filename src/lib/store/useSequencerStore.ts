import { create } from 'zustand';
import { SequencerState, PatternPreset, Track, Step, MusicalScale, RootKey } from '@/types/sequencer';
import { FXState } from '@/types/audio';
import { FACTORY_PRESETS } from '@/lib/constants/presets';
import { generateEuclidean } from '@/lib/algorithms/euclidean';
import { mutatePattern as mutatePatternAlgo } from '@/lib/algorithms/generative';

const defaultPreset = FACTORY_PRESETS[0];

export const useSequencerStore = create<SequencerState>((set, get) => ({
  tracks: JSON.parse(JSON.stringify(defaultPreset.tracks)),
  isPlaying: false,
  isEngineStarted: false,
  bpm: defaultPreset.bpm,
  currentStep: 0,
  totalSteps: 16,
  scale: defaultPreset.scale,
  rootKey: defaultPreset.rootKey,
  swing: defaultPreset.swing,
  fx: { ...defaultPreset.fx },
  activePresetId: defaultPreset.id,

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setIsEngineStarted: (isEngineStarted: boolean) => set({ isEngineStarted }),
  setCurrentStep: (step: number) => set({ currentStep: step }),
  setBpm: (bpm: number) => set({ bpm: Math.max(30, Math.min(240, Math.round(bpm))) }),
  
  setTotalSteps: (steps: number) => {
    const validSteps = steps === 32 ? 32 : 16;
    set((state) => {
      const updatedTracks = state.tracks.map((track) => {
        let newSteps = [...track.steps];
        if (validSteps === 32 && newSteps.length < 32) {
          // Double the pattern or pad with empty steps
          const padded = newSteps.map((s) => ({ ...s }));
          newSteps = [...newSteps, ...padded];
        } else if (validSteps === 16 && newSteps.length > 16) {
          newSteps = newSteps.slice(0, 16);
        }
        return { ...track, steps: newSteps };
      });
      return { totalSteps: validSteps, tracks: updatedTracks };
    });
  },

  setRootKey: (rootKey: RootKey) => set({ rootKey }),
  setScale: (scale: MusicalScale) => set({ scale }),
  setSwing: (swing: number) => set({ swing: Math.max(0, Math.min(1, swing)) }),

  toggleStep: (trackId: string, stepIndex: number) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        const newSteps = [...t.steps];
        if (stepIndex >= 0 && stepIndex < newSteps.length) {
          newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            active: !newSteps[stepIndex].active,
          };
        }
        return { ...t, steps: newSteps };
      }),
    })),

  setStepVelocity: (trackId: string, stepIndex: number, velocity: number) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        const newSteps = [...t.steps];
        if (stepIndex >= 0 && stepIndex < newSteps.length) {
          newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            velocity: Math.max(0.05, Math.min(1.0, velocity)),
          };
        }
        return { ...t, steps: newSteps };
      }),
    })),

  setStepPitch: (trackId: string, stepIndex: number, pitch: string) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        const newSteps = [...t.steps];
        if (stepIndex >= 0 && stepIndex < newSteps.length) {
          newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            pitch,
          };
        }
        return { ...t, steps: newSteps };
      }),
    })),

  setStepProbability: (trackId: string, stepIndex: number, probability: number) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        const newSteps = [...t.steps];
        if (stepIndex >= 0 && stepIndex < newSteps.length) {
          newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            probability: Math.max(0.0, Math.min(1.0, probability)),
          };
        }
        return { ...t, steps: newSteps };
      }),
    })),

  setTrackMute: (trackId: string, muted: boolean) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, muted } : t)),
    })),

  setTrackSolo: (trackId: string, solo: boolean) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, solo } : t)),
    })),

  setTrackVolume: (trackId: string, volume: number) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, volume } : t)),
    })),

  setTrackPan: (trackId: string, pan: number) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, pan } : t)),
    })),

  setTrackDefaultPitch: (trackId: string, defaultPitch: string) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, defaultPitch } : t)),
    })),

  applyEuclideanToTrack: (trackId: string, pulses: number, shift: number) =>
    set((state) => {
      const track = state.tracks.find((t) => t.id === trackId);
      if (!track) return state;

      const numSteps = track.steps.length || state.totalSteps;
      const euclideanPattern = generateEuclidean(numSteps, pulses, shift);

      return {
        tracks: state.tracks.map((t) => {
          if (t.id !== trackId) return t;
          const updatedSteps: Step[] = t.steps.map((step, idx) => ({
            ...step,
            active: euclideanPattern[idx] ?? false,
          }));
          return { ...t, steps: updatedSteps };
        }),
      };
    }),

  clearTrackSteps: (trackId: string) =>
    set((state) => ({
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        return {
          ...t,
          steps: t.steps.map((s) => ({ ...s, active: false })),
        };
      }),
    })),

  clearAllSteps: () =>
    set((state) => ({
      tracks: state.tracks.map((t) => ({
        ...t,
        steps: t.steps.map((s) => ({ ...s, active: false })),
      })),
    })),

  mutatePattern: (mutationFactor: number = 0.35) =>
    set((state) => {
      const newTracks = mutatePatternAlgo(state.tracks, state.rootKey, state.scale, mutationFactor);
      return { tracks: newTracks };
    }),

  updateFX: (newFx: Partial<FXState>) =>
    set((state) => ({
      fx: { ...state.fx, ...newFx },
    })),

  loadPreset: (preset: PatternPreset) =>
    set({
      tracks: JSON.parse(JSON.stringify(preset.tracks)),
      bpm: preset.bpm,
      rootKey: preset.rootKey,
      scale: preset.scale,
      swing: preset.swing,
      fx: { ...preset.fx },
      activePresetId: preset.id,
      totalSteps: preset.tracks[0]?.steps.length || 16,
    }),

  importPatternJSON: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.tracks || !Array.isArray(data.tracks) || !data.bpm) {
        return false;
      }
      set({
        tracks: data.tracks,
        bpm: data.bpm,
        rootKey: data.rootKey || 'C',
        scale: data.scale || 'Minor Pentatonic',
        swing: data.swing || 0,
        fx: data.fx ? { ...get().fx, ...data.fx } : get().fx,
        totalSteps: data.totalSteps || (data.tracks[0]?.steps.length || 16),
        activePresetId: null,
      });
      return true;
    } catch {
      return false;
    }
  },

  exportPatternJSON: () => {
    const state = get();
    const exportObject = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      bpm: state.bpm,
      totalSteps: state.totalSteps,
      rootKey: state.rootKey,
      scale: state.scale,
      swing: state.swing,
      fx: state.fx,
      tracks: state.tracks,
    };
    return JSON.stringify(exportObject, null, 2);
  },
}));
