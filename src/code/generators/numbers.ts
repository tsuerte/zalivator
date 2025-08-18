export function generateNumber(options?: { decimal?: boolean }): string {
  const decimal = !!(options && options.decimal);
  const int = Math.floor(Math.random() * 10) + 1; // 1..10
  if (!decimal) return String(int);
  const frac = Math.floor(Math.random() * 10); // 0..9
  // Using comma as decimal separator to match UI preview
  return `${int},${frac}`;
}

