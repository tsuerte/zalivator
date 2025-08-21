export function getHourForm(h: number): string {
  if (h === 1 || h === 21) return "час";
  if ((h >= 2 && h <= 4) || (h >= 22 && h <= 24)) return "часа";
  return "часов";
}

export function getMinuteForm(m: number): string {
  if (m === 1 || m === 21 || m === 31 || m === 41 || m === 51) return "минута";
  if (
    (m >= 2 && m <= 4) ||
    (m >= 22 && m <= 24) ||
    (m >= 32 && m <= 34) ||
    (m >= 42 && m <= 44) ||
    (m >= 52 && m <= 54)
  ) return "минуты";
  return "минут";
}

export function getSecondForm(s: number): string {
  if (s === 1 || s === 21 || s === 31 || s === 41 || s === 51) return "секунда";
  if (
    (s >= 2 && s <= 4) ||
    (s >= 22 && s <= 24) ||
    (s >= 32 && s <= 34) ||
    (s >= 42 && s <= 44) ||
    (s >= 52 && s <= 54)
  ) return "секунды";
  return "секунд";
}

