// The whole pregnancy as 41 small bars in three trimesters. The current week is highlighted and pulses gently.
export default function WeekTimeline({ currentSa, labels }: { currentSa: number; labels: [string, string, string] }) {
  const trimesters = [
    { from: 0, to: 13, label: labels[0] },
    { from: 14, to: 27, label: labels[1] },
    { from: 28, to: 41, label: labels[2] },
  ];
  return (
    <div aria-hidden="true" className="flex gap-2">
      {trimesters.map((t) => (
        <div key={t.label} className="flex-1">
          <div className="flex h-9 items-end gap-[2px]">
            {Array.from({ length: t.to - t.from + 1 }, (_, i) => t.from + i).map((w) => (
              <span
                key={w}
                className={`flex-1 rounded-sm ${
                  w === currentSa ? "h-9 bg-primary week-now" : w < currentSa ? "h-6 bg-accent" : "h-4 bg-soft"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-center text-sm text-muted-text">{t.label}</p>
        </div>
      ))}
    </div>
  );
}
