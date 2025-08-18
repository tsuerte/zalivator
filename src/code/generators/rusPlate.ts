import { RUS_PLATE_LETTERS, RUS_PLATE_REGIONS } from "../../data/rusPlate";

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRusPlate(): string {
  // Формат: Б ддд ББ RR (например, А123ВС777)
  const L1 = pick(RUS_PLATE_LETTERS);
  const D = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  const L2 = pick(RUS_PLATE_LETTERS);
  const L3 = pick(RUS_PLATE_LETTERS);
  const R = pick(RUS_PLATE_REGIONS);
  return `${L1}${D}${L2}${L3}${R}`;
}

