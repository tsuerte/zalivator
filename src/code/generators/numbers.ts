function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

function randIntRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateNumber(options?: { decimal?: boolean; min?: number; max?: number }): string {
  const decimal = !!(options && options.decimal);
  const MAX = 1_000_000_000; // UX-safe upper bound
  let min = options?.min ?? 0;
  let max = options?.max ?? 10;
  // normalize
  min = clamp(Math.floor(min), 0, MAX);
  max = clamp(Math.floor(max), 0, MAX);
  if (min > max) [min, max] = [max, min];

  const int = randIntRange(min, max);
  if (!decimal) return String(int);
  const frac = Math.floor(Math.random() * 10); // 0..9
  // Using comma as decimal separator to match UI preview
  return `${int},${frac}`;
}
