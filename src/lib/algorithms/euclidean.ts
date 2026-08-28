/**
 * Euclidean rhythm generation using the Bjorklund algorithm
 * Generates mathematically even polyrhythmic pulse distributions.
 */
export function generateEuclidean(steps: number, pulses: number, shift: number = 0): boolean[] {
  if (steps <= 0) return [];
  if (pulses <= 0) return new Array(steps).fill(false);
  if (pulses >= steps) return new Array(steps).fill(true);

  let pattern: number[][] = [];
  for (let i = 0; i < steps; i++) {
    pattern.push(i < pulses ? [1] : [0]);
  }

  while (pattern.filter((p) => p[0] === 0).length > 0) {
    const ones = pattern.filter((p) => p[0] === 1);
    const zeros = pattern.filter((p) => p[0] === 0);
    const minLen = Math.min(ones.length, zeros.length);
    if (minLen === 0) break;

    const newPattern: number[][] = [];
    for (let i = 0; i < minLen; i++) {
      newPattern.push([...ones[i], ...zeros[i]]);
    }
    const remainder = ones.length > zeros.length ? ones.slice(minLen) : zeros.slice(minLen);
    pattern = [...newPattern, ...remainder];
  }

  const flattened = pattern.flat().map((v) => v === 1);
  if (shift % steps !== 0) {
    const s = ((shift % steps) + steps) % steps;
    return [...flattened.slice(s), ...flattened.slice(0, s)];
  }
  return flattened;
}
