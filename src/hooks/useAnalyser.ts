'use client';

import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { AnalyserData } from '@/types/audio';

export function useAnalyser(analyserNode: Tone.Analyser | null, enabled: boolean = true) {
  const [data, setData] = useState<AnalyserData>({
    waveform: new Float32Array(512),
    frequencies: new Float32Array(512),
    rms: 0,
    bassEnergy: 0,
    midEnergy: 0,
    highEnergy: 0,
  });

  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyserNode || !enabled) return;

    const fftAnalyser = new Tone.Analyser({
      type: 'fft',
      size: 512,
    });
    analyserNode.connect(fftAnalyser);

    const updateFrame = () => {
      try {
        const wave = analyserNode.getValue() as Float32Array;
        const fft = fftAnalyser.getValue() as Float32Array;

        // Calculate RMS amplitude
        let sumSquares = 0;
        for (let i = 0; i < wave.length; i++) {
          sumSquares += wave[i] * wave[i];
        }
        const rms = Math.sqrt(sumSquares / wave.length);

        // Frequency buckets (Bass: 20-250Hz, Mid: 250-4000Hz, High: 4000-20000Hz)
        let bassSum = 0;
        let midSum = 0;
        let highSum = 0;

        const binCount = fft.length;
        const bassEnd = Math.floor(binCount * 0.12);
        const midEnd = Math.floor(binCount * 0.6);

        for (let i = 0; i < bassEnd; i++) {
          bassSum += Math.max(0, (fft[i] + 100) / 100);
        }
        for (let i = bassEnd; i < midEnd; i++) {
          midSum += Math.max(0, (fft[i] + 100) / 100);
        }
        for (let i = midEnd; i < binCount; i++) {
          highSum += Math.max(0, (fft[i] + 100) / 100);
        }

        const bassEnergy = bassSum / (bassEnd || 1);
        const midEnergy = midSum / (midEnd - bassEnd || 1);
        const highEnergy = highSum / (binCount - midEnd || 1);

        setData({
          waveform: wave,
          frequencies: fft,
          rms,
          bassEnergy,
          midEnergy,
          highEnergy,
        });
      } catch {
        // Safe skip on teardown
      }

      animFrameRef.current = requestAnimationFrame(updateFrame);
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
      fftAnalyser.dispose();
    };
  }, [analyserNode, enabled]);

  return data;
}
