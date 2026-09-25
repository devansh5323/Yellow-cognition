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