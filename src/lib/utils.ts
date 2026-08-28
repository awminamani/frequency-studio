import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  if (inMax === inMin) return outMin;
  const clamped = clamp(value, inMin, inMax);
  return ((clamped - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

export function gainToDb(gain: number): number {
  return 20 * Math.log10(Math.max(gain, 0.00001));
}

export function formatFrequency(hz: number): string {
  if (hz >= 1000) {
    return `${(hz / 1000).toFixed(1)} kHz`;
  }
  return `${Math.round(hz)} Hz`;
}

export function formatDecibel(db: number): string {
  return `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`;
}

export function playTactileClick(state: 'on' | 'off') {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio(state === 'on' ? '/audio-clicks/switch-on.wav' : '/audio-clicks/switch-off.wav');
    audio.volume = 0.15;
    audio.play().catch(() => {});
  } catch {
    // Ignore audio autoplay restrictions for subtle clicks
  }
}
