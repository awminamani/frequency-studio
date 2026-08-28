import * as Tone from 'tone';
import { TrackType } from '@/types/audio';

export interface SamplePlayerMap {
  kick?: Tone.Player;
  snare?: Tone.Player;
  hihatClosed?: Tone.Player;
  hihatOpen?: Tone.Player;
  perc?: Tone.Player;
  isLoaded: boolean;
}

export function createSamplePlayers(onLoad?: () => void): SamplePlayerMap {
  const map: SamplePlayerMap = {
    isLoaded: false,
  };

  try {
    let loadedCount = 0;
    const totalSamples = 5;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalSamples) {
        map.isLoaded = true;
        if (onLoad) onLoad();
      }
    };

    map.kick = new Tone.Player({
      url: '/samples/kick.wav',
      onload: checkLoaded,
      onerror: checkLoaded,
    });

    map.snare = new Tone.Player({
      url: '/samples/snare.wav',
      onload: checkLoaded,
      onerror: checkLoaded,
    });

    map.hihatClosed = new Tone.Player({
      url: '/samples/hihat-closed.wav',
      onload: checkLoaded,
      onerror: checkLoaded,
    });

    map.hihatOpen = new Tone.Player({
      url: '/samples/hihat-open.wav',
      onload: checkLoaded,
      onerror: checkLoaded,
    });

    map.perc = new Tone.Player({
      url: '/samples/perc.wav',
      onload: checkLoaded,
      onerror: checkLoaded,
    });
  } catch (err) {
    console.warn('Sample player initialization error (using synth fallback):', err);
    map.isLoaded = false;
  }

  return map;
}
