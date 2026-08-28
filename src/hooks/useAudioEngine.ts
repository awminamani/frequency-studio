'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';
import { useSequencerStore } from '@/lib/store/useSequencerStore';
import { createSynthVoices, SynthVoiceMap } from '@/lib/audio/synths';
import { createMasterFXChain, FXChain } from '@/lib/audio/effects';
import { createSamplePlayers, SamplePlayerMap } from '@/lib/audio/sampler';
import { Track, Step } from '@/types/sequencer';

interface TrackChannelNode {
  gain: Tone.Gain;
  panner: Tone.Panner;
  solo: Tone.Solo;
}

export function useAudioEngine(onBeatTrigger?: (trackType: string, velocity: number) => void) {
  const store = useSequencerStore();
  const [isReady, setIsReady] = useState(false);
  const [audioContextRunning, setAudioContextRunning] = useState(false);

  const synthVoicesRef = useRef<SynthVoiceMap | null>(null);
  const samplePlayersRef = useRef<SamplePlayerMap | null>(null);
  const fxChainRef = useRef<FXChain | null>(null);
  const trackChannelsRef = useRef<Map<string, TrackChannelNode>>(new Map());
  const repeatIdRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);

  // Keep references to current store state to avoid stale closures in Tone.Transport callback
  const tracksRef = useRef<Track[]>(store.tracks);
  const totalStepsRef = useRef<number>(store.totalSteps);
  const isPlayingRef = useRef<boolean>(store.isPlaying);
  const onBeatTriggerRef = useRef(onBeatTrigger);
  onBeatTriggerRef.current = onBeatTrigger;

  useEffect(() => {
    tracksRef.current = store.tracks;
  }, [store.tracks]);

  useEffect(() => {
    totalStepsRef.current = store.totalSteps;
  }, [store.totalSteps]);

  useEffect(() => {
    isPlayingRef.current = store.isPlaying;
  }, [store.isPlaying]);

  // 1. Initialize Audio Engine Graph
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fxChain = createMasterFXChain();
    fxChainRef.current = fxChain;

    const synths = createSynthVoices();
    synthVoicesRef.current = synths;

    const samplers = createSamplePlayers();
    samplePlayersRef.current = samplers;

    // Build channel routing for each track
    const channelMap = new Map<string, TrackChannelNode>();
    store.tracks.forEach((track) => {
      const gain = new Tone.Gain(Tone.dbToGain(track.muted ? -Infinity : track.volume));
      const panner = new Tone.Panner(track.pan);
      const solo = new Tone.Solo();

      // Route: Source -> Solo -> Panner -> Gain -> FX Bus
      solo.connect(panner);
      panner.connect(gain);
      gain.connect(fxChain.inputBus);

      // Connect synth or sampler to Solo node
      if (track.type === 'synth') synths.polySynth.connect(solo);
      if (track.type === 'bass') synths.bassSynth.connect(solo);
      if (track.type === 'kick') {
        synths.kickSynth.connect(solo);
        if (samplers.kick) samplers.kick.connect(solo);
      }
      if (track.type === 'snare') {
        synths.snareSynth.connect(solo);
        if (samplers.snare) samplers.snare.connect(solo);
      }
      if (track.type === 'hihat') {
        synths.hihatClosedSynth.connect(solo);
        synths.hihatOpenSynth.connect(solo);
        if (samplers.hihatClosed) samplers.hihatClosed.connect(solo);
        if (samplers.hihatOpen) samplers.hihatOpen.connect(solo);
      }
      if (track.type === 'perc') {
        synths.percSynth.connect(solo);
        if (samplers.perc) samplers.perc.connect(solo);
      }

      channelMap.set(track.id, { gain, panner, solo });
    });
    trackChannelsRef.current = channelMap;

    setIsReady(true);

    return () => {
      if (repeatIdRef.current !== null) {
        Tone.Transport.clear(repeatIdRef.current);
      }
      Tone.Transport.stop();
      fxChain.dispose();
    };
  }, []);

  // 2. Schedule Deterministic Transport Loop
  useEffect(() => {
    if (!isReady) return;

    if (repeatIdRef.current !== null) {
      Tone.Transport.clear(repeatIdRef.current);
    }

    stepRef.current = 0;

    const id = Tone.Transport.scheduleRepeat((time) => {
      const currentStep = stepRef.current;
      const tracks = tracksRef.current;
      const totalSteps = totalStepsRef.current;
      const synths = synthVoicesRef.current;
      const samplers = samplePlayersRef.current;

      if (!synths) return;

      // Trigger active voices for current step
      tracks.forEach((track) => {
        if (track.muted) return;
        const step = track.steps[currentStep];
        if (!step || !step.active) return;

        // Check probability
        if (step.probability < 1.0 && Math.random() > step.probability) {
          return;
        }

        const velocity = step.velocity || 0.8;
        const pitch = step.pitch || track.defaultPitch || 'C3';

        // Trigger visual shockwave/telemetry
        if (onBeatTriggerRef.current) {
          Tone.Draw.schedule(() => {
            onBeatTriggerRef.current?.(track.type, velocity);
          }, time);
        }

        try {
          switch (track.type) {
            case 'synth':
              synths.polySynth.triggerAttackRelease(pitch, '16n', time, velocity);
              break;
            case 'bass':
              synths.bassSynth.triggerAttackRelease(pitch, '16n', time, velocity);
              break;
            case 'kick':
              if (samplers?.isLoaded && samplers.kick?.loaded) {
                samplers.kick.start(time, 0, undefined, velocity);
              } else {
                synths.kickSynth.triggerAttackRelease('C1', '8n', time, velocity);
              }
              break;
            case 'snare':
              if (samplers?.isLoaded && samplers.snare?.loaded) {
                samplers.snare.start(time, 0, undefined, velocity);
              } else {
                synths.snareSynth.triggerAttackRelease('16n', time, velocity);
              }
              break;
            case 'hihat':
              if (pitch?.includes('open') || velocity > 0.85) {
                if (samplers?.isLoaded && samplers.hihatOpen?.loaded) {
                  samplers.hihatOpen.start(time, 0, undefined, velocity);
                } else {
                  synths.hihatOpenSynth.triggerAttackRelease('8n', time, velocity);
                }
              } else {
                if (samplers?.isLoaded && samplers.hihatClosed?.loaded) {
                  samplers.hihatClosed.start(time, 0, undefined, velocity);
                } else {
                  synths.hihatClosedSynth.triggerAttackRelease('32n', time, velocity);
                }
              }
              break;
            case 'perc':
              if (samplers?.isLoaded && samplers.perc?.loaded) {
                samplers.perc.start(time, 0, undefined, velocity);
              } else {
                synths.percSynth.triggerAttackRelease('16n', time, velocity);
              }
              break;
          }
        } catch (err) {
          console.warn('Voice trigger error:', err);
        }
      });

      // Synchronize visual playhead smoothly with Tone.Draw
      Tone.Draw.schedule(() => {
        store.setCurrentStep(currentStep);
      }, time);

      stepRef.current = (currentStep + 1) % totalSteps;
    }, '16n');

    repeatIdRef.current = id;

    return () => {
      Tone.Transport.clear(id);
    };
  }, [isReady, store.totalSteps]);

  // 3. Sync Dynamic Transport Parameters (BPM, Swing)
  useEffect(() => {
    Tone.Transport.bpm.rampTo(store.bpm, 0.05);
  }, [store.bpm]);

  useEffect(() => {
    Tone.Transport.swing = store.swing;
    Tone.Transport.swingSubdivision = '16n';
  }, [store.swing]);

  // 4. Sync Master FX Chain Parameters
  useEffect(() => {
    if (fxChainRef.current) {
      fxChainRef.current.updateParams(store.fx);
    }
  }, [store.fx]);

  // 5. Sync Track Volume, Pan, Mute, Solo Nodes
  useEffect(() => {
    const channelMap = trackChannelsRef.current;
    store.tracks.forEach((track) => {
      const channel = channelMap.get(track.id);
      if (channel) {
        channel.gain.gain.rampTo(track.muted ? 0 : Tone.dbToGain(track.volume), 0.05);
        channel.panner.pan.rampTo(track.pan, 0.05);
        channel.solo.solo = track.solo;
      }
    });
  }, [store.tracks]);

  // 6. Play / Stop Control
  const startEngine = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setAudioContextRunning(true);
    store.setIsEngineStarted(true);
  }, [store]);

  const togglePlay = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      setAudioContextRunning(true);
      store.setIsEngineStarted(true);
    }

    if (store.isPlaying) {
      Tone.Transport.stop();
      store.setIsPlaying(false);
      store.setCurrentStep(0);
      stepRef.current = 0;
    } else {
      Tone.Transport.start('+0.05');
      store.setIsPlaying(true);
    }
  }, [store]);

  return {
    isReady,
    audioContextRunning,
    startEngine,
    togglePlay,
    analyserNode: fxChainRef.current?.analyser || null,
    meterNode: fxChainRef.current?.meter || null,
  };
}
