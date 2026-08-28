import { MusicalScale, RootKey } from '@/types/sequencer';

export const ROOT_KEYS: RootKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<MusicalScale, number[]> = {
  'Minor Pentatonic': [0, 3, 5, 7, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Phrygian': [0, 1, 3, 5, 7, 8, 10],
  'Hirajoshi': [0, 2, 3, 7, 8],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
  'Natural Minor': [0, 2, 3, 5, 7, 8, 10],
  'Major Pentatonic': [0, 2, 4, 7, 9],
  'Blues': [0, 3, 5, 6, 7, 10],
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function noteToMidi(note: string): number {
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // Default C4
  const name = match[1];
  const octave = parseInt(match[2], 10);
  const noteIndex = NOTE_NAMES.indexOf(name);
  if (noteIndex === -1) return 60;
  return (octave + 1) * 12 + noteIndex;
}

export function midiToNote(midi: number): string {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  const noteIndex = clamped % 12;
  const octave = Math.floor(clamped / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function getScaleNotes(
  rootKey: RootKey,
  scaleName: MusicalScale,
  startOctave: number = 2,
  numOctaves: number = 3
): string[] {
  const rootIndex = NOTE_NAMES.indexOf(rootKey);
  const intervals = SCALES[scaleName] || SCALES['Minor Pentatonic'];
  const notes: string[] = [];

  for (let oct = 0; oct < numOctaves; oct++) {
    const currentOctave = startOctave + oct;
    for (const interval of intervals) {
      const totalSemitones = rootIndex + interval;
      const noteName = NOTE_NAMES[totalSemitones % 12];
      const noteOctave = currentOctave + Math.floor(totalSemitones / 12);
      notes.push(`${noteName}${noteOctave}`);
    }
  }

  return notes;
}

export function quantizeToScale(
  pitchOrMidi: string | number,
  rootKey: RootKey,
  scaleName: MusicalScale
): string {
  const midi = typeof pitchOrMidi === 'number' ? pitchOrMidi : noteToMidi(pitchOrMidi);
  const rootIndex = NOTE_NAMES.indexOf(rootKey);
  const intervals = SCALES[scaleName] || SCALES['Minor Pentatonic'];
  
  const octave = Math.floor(midi / 12);
  const noteInOctave = midi % 12;
  
  // Find relative semitone to root
  const relSemitone = (noteInOctave - rootIndex + 12) % 12;
  
  // Find nearest interval
  let closestInterval = intervals[0];
  let minDiff = 100;
  
  for (const interval of intervals) {
    const diff = Math.abs(interval - relSemitone);
    if (diff < minDiff) {
      minDiff = diff;
      closestInterval = interval;
    }
  }
  
  const quantizedNoteInOctave = (rootIndex + closestInterval) % 12;
  const octaveAdjustment = Math.floor((rootIndex + closestInterval) / 12);
  const finalOctave = octave + octaveAdjustment - 1;
  
  return `${NOTE_NAMES[quantizedNoteInOctave]}${finalOctave}`;
}
