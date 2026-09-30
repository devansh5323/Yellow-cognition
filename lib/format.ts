// Truncates (never rounds) to one decimal place, so 7.950571… displays as
// 7.9, not 8.0. Used anywhere a period-over-period delta is rendered.
export function formatPct1(value: number): string {
  const truncated = Math.trunc(Math.abs(value) * 10) / 10;
  return truncated.toFixed(1);
}

export function formatSignedPct(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${formatPct1(value)}%`;
}

/** Formats dashboard scores and deltas with exactly one decimal place. */
export function formatDecimal1(value: number | null | undefined, fallback = "—"): string {
  return value == null ? fallback : value.toFixed(1);
}

export function formatSignedDecimal1(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatDecimal1(value)}`;
}
