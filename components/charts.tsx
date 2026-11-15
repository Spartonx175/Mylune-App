// Small SVG charts. Server-safe (no state). Colours come from the theme tokens; text is labelled for screen readers.
import type { Point } from "@/lib/track";

const W = 320;
const H = 150;
const PAD = { l: 34, r: 12, t: 12, b: 26 };

const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

function axis(min: number, max: number) {
  const ticks = [min, (min + max) / 2, max];
  return ticks.map((v) => ({ v, label: Number.isInteger(v) ? String(v) : v.toFixed(1) }));
}

/** Line chart for values over time (weight, mood). */
export function LineChart({ points, label, min, max, unit = "" }: { points: Point[]; label: string; min?: number; max?: number; unit?: string }) {
  if (points.length === 0) return null;
  const values = points.map((p) => p.value);
  const lo = min ?? Math.floor(Math.min(...values) - 1);
  const hi = max ?? Math.ceil(Math.max(...values) + 1);
  const span = hi - lo || 1;
  const x = (i: number) => PAD.l + (points.length === 1 ? (W - PAD.l - PAD.r) / 2 : (i * (W - PAD.l - PAD.r)) / (points.length - 1));
  const y = (v: number) => PAD.t + (1 - (v - lo) / span) * (H - PAD.t - PAD.b);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const first = points[0].label;
  const last = points[points.length - 1].label;

  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${points.length}, ${shortDate(first)} to ${shortDate(last)}`} className="h-auto w-full text-muted-text">
        {axis(lo, hi).map((t) => (
          <g key={t.v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t.v)} y2={y(t.v)} stroke="currentColor" strokeOpacity="0.15" />
            <text x={PAD.l - 6} y={y(t.v) + 4} textAnchor="end" fontSize="11" fill="currentColor">
              {t.label}
              {unit}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={p.label} cx={x(i)} cy={y(p.value)} r="3.5" fill="var(--color-primary)" />
        ))}
        <text x={PAD.l} y={H - 6} fontSize="11" fill="currentColor">
          {shortDate(first)}
        </text>
        <text x={W - PAD.r} y={H - 6} fontSize="11" textAnchor="end" fill="currentColor">
          {shortDate(last)}
        </text>
      </svg>
    </figure>
  );
}

/** Bar chart for daily counts (kicks). */
export function BarChart({ points, label }: { points: Point[]; label: string }) {
  const top = Math.max(1, ...points.map((p) => p.value));
  const innerW = W - PAD.l - PAD.r;
  const slot = innerW / Math.max(points.length, 1);
  const barW = Math.max(6, slot * 0.6);
  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${points.map((p) => `${shortDate(p.label)} ${p.value}`).join(", ")}`} className="h-auto w-full text-muted-text">
        {[0, top].map((v) => {
          const yy = PAD.t + (1 - v / top) * (H - PAD.t - PAD.b);
          return (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={yy} y2={yy} stroke="currentColor" strokeOpacity="0.15" />
              <text x={PAD.l - 6} y={yy + 4} textAnchor="end" fontSize="11" fill="currentColor">
                {v}
              </text>
            </g>
          );
        })}
        {points.map((p, i) => {
          const h = (p.value / top) * (H - PAD.t - PAD.b);
          const bx = PAD.l + i * slot + (slot - barW) / 2;
          return (
            <g key={p.label}>
              <rect x={bx} y={H - PAD.b - h} width={barW} height={Math.max(h, p.value > 0 ? 2 : 0)} rx="3" fill="var(--color-accent)" />
              {i % 2 === 0 && (
                <text x={bx + barW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="currentColor">
                  {shortDate(p.label)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
