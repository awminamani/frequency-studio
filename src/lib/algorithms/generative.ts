import { Track } from '@/types/sequencer';
import { MusicalScale, RootKey } from '@/types/sequencer';
import { getScaleNotes } from './scales';

/**
 * Generative pattern mutation using stochastic Markovian pitch jumping,
 * rhythmic syncopation, and dynamic velocity perturbations.
 */
export function mutatePattern(
  tracks: Track[],
  rootKey: RootKey,
  scale: MusicalScale,
  mutationFactor: number = 0.35
): Track[] {
  const synthNotes = getScaleNotes(rootKey, scale, 3, 2);
  const bassNotes = getScaleNotes(rootKey, scale, 1, 2);

  return tracks.map((track) => {
    const isMelodic = track.type === 'synth' || track.type === 'bass';
    const notesPool = track.type === 'bass' ? bassNotes : synthNotes;

    const mutatedSteps = track.steps.map((step, idx) => {
      let active = step.active;
      let velocity = step.velocity;
      let pitch = step.pitch;
      let probability = step.probability;

      // 1. Stochastic Gate Mutation
      if (Math.random() < mutationFactor * 0.4) {
        // Toggles step or introduces syncopation
        if (track.type === 'kick') {
          // Keep kick grounded on primary beats (0, 4, 8, 12), perturb off-beats
          if (idx % 4 !== 0) {
            active = Math.random() < 0.25;
          }
        } else if (track.type === 'snare') {
          // Ghost notes or fills
          if (idx % 8 !== 4) {
            active = Math.random() < 0.2;
            if (active) velocity = 0.35 + Math.random() * 0.3;
          }
        } else {
          active = !active;
        }
      }

      // 2. Melodic Pitch Walk / Markov jump
      if (isMelodic && active && Math.random() < mutationFactor * 0.7) {
        const currentPitchIdx = pitch ? notesPool.indexOf(pitch) : -1;
        if (currentPitchIdx !== -1) {
          // Weighted step: -2, -1, 0, +1, +2, +3 semitone scale steps
          const stepDelta = [-2, -1, 1, 2, 3, -3][Math.floor(Math.random() * 6)];
          const newIdx = Math.max(0, Math.min(notesPool.length - 1, currentPitchIdx + stepDelta));
          pitch = notesPool[newIdx];
        } else {
          pitch = notesPool[Math.floor(Math.random() * notesPool.length)];
        }
      }

      // 3. Humanized Dynamic Velocity
      if (active && Math.random() < mutationFactor * 0.5) {
        const delta = (Math.random() - 0.5) * 0.3;
        velocity = Math.max(0.2, Math.min(1.0, Number((velocity + delta).toFixed(2))));
      }

      // 4. Probability modulation
      if (active && Math.random() < mutationFactor * 0.3) {
        probability = Math.random() < 0.25 ? 0.75 : 1.0;
      }

      return {
        active,
        velocity,
        pitch,
        probability,
      };
    });

    return {
      ...track,
      steps: mutatedSteps,
    };
  });
}
