// Circular progress of the pregnancy for the hero card (white on terracotta). Animated fill.
// The numbers inside are real text for screen readers.
const R = 54;
const C = 2 * Math.PI * R;

export default function ProgressRing({ fraction, children, label }: { fraction: number; children: React.ReactNode; label: string }) {
  const f = Math.min(1, Math.max(0, fraction));
  const angle = f * 2 * Math.PI - Math.PI / 2;
  return (
    <div className="relative mx-auto h-52 w-52" role="img" aria-label={label}>
      <svg aria-hidden="true" viewBox="0 0 130 130" className="h-full w-full">
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe3d0" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        <circle cx="65" cy="65" r={R} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.22)" strokeWidth="9" />
        <circle
          className="ring-fill"
          cx="65"
          cy="65"
          r={R}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          transform="rotate(-90 65 65)"
          style={{ ["--ring-len" as string]: C, ["--ring-to" as string]: C * (1 - f) }}
        />
        <circle cx={65 + R * Math.cos(angle)} cy={65 + R * Math.sin(angle)} r="6" fill="#fff" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
