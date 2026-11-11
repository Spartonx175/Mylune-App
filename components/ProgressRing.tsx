// Circular progress of the pregnancy (animated fill). The numbers inside are real text for screen readers.
const R = 52;
const C = 2 * Math.PI * R;

export default function ProgressRing({ fraction, children, label }: { fraction: number; children: React.ReactNode; label: string }) {
  const f = Math.min(1, Math.max(0, fraction));
  return (
    <div className="relative mx-auto h-44 w-44" role="img" aria-label={label}>
      <svg aria-hidden="true" viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-soft)" strokeWidth="12" />
        <circle
          className="ring-fill"
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          style={{ ["--ring-len" as string]: C, ["--ring-to" as string]: C * (1 - f) }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
