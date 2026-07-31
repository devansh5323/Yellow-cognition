// Lightweight decorative trend visuals — deterministic (seeded), not real
// day-by-day history, since none exists in the mock data model. Same pattern
// already used for pillar cards, shared here so other weekly-summary cards
// can reuse it instead of re-deriving their own wave shape.

export function wavePoints(end: number, seed: number, count = 7): number[] {
  const amplitude = 6;
  const raw = Array.from({ length: count }, (_, i) => {
    const wave =
      Math.sin(i * 1.15 + seed * 2.1) * amplitude + Math.sin(i * 0.5 + seed * 0.8) * (amplitude * 0.5);
    return end + wave;
  });
  raw[raw.length - 1] = end;
  return raw.map((v) => Math.max(2, Math.min(98, v)));
}

export function Sparkline({
  data,
  tone,
  area = false,
}: {
  data: number[];
  tone: string;
  /** Fill the area under the line with a soft tone gradient. */
  area?: boolean;
}) {
  const w = 100;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(1, max - min);
  const points = data.map((v, i) => ({
    x: (i / Math.max(1, data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 8) - 4,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const gradientId = `sparkline-fill-${tone.replace(/[^a-zA-Z0-9]/g, "")}`;
  const areaPath = `${path} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none" aria-hidden>
      {area && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tone} stopOpacity={0.28} />
            <stop offset="100%" stopColor={tone} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {area && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
      <path d={path} fill="none" stroke={tone} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.6} fill={tone} />
      ))}
    </svg>
  );
}

export function BarSparkline({ data, tone }: { data: number[]; tone: string }) {
  const w = 100;
  const h = 28;
  const max = Math.max(...data, 1);
  const gap = 3;
  const barWidth = w / data.length - gap;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none" aria-hidden>
      {data.map((v, i) => {
        const barHeight = Math.max(2, (v / max) * (h - 4));
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={h - barHeight}
            width={barWidth}
            height={barHeight}
            rx={1.5}
            fill={tone}
            opacity={i === data.length - 1 ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}
