'use client';

import { useEffect } from 'react';
import { useSequencerStore } from '@/lib/store/useSequencerStore';

export function useKeyboardShortcuts(onTogglePlay: () => void) {
  const store = useSequencerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focusing input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Space: Toggle Play/Stop
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
        return;
      }

      // R: Mutate pattern
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        store.mutatePattern(0.35);
        return;
      }

      // C: Clear all step gates
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        store.clearAllSteps();
        return;
      }

      // 1 - 6 Track Shortcuts
      const numKey = parseInt(e.key, 10);
      if (!isNaN(numKey) && numKey >= 1 && numKey <= 6) {
        e.preventDefault();
        const trackIndex = numKey - 1;
        const track = store.tracks[trackIndex];
        if (track) {
          if (e.shiftKey) {
            // Toggle Solo
            store.setTrackSolo(track.id, !track.solo);
          } else {
            // Toggle Mute
            store.setTrackMute(track.id, !track.muted);
          }
        }
        return;
      }

      // Up / Down: BPM adjust
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const delta = e.shiftKey ? 5 : 1;
        store.setBpm(store.bpm + delta);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const delta = e.shiftKey ? 5 : 1;
        store.setBpm(store.bpm - delta);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, store]);
}
