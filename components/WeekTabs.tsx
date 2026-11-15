"use client";

import { useState } from "react";

type Tab = { key: string; label: string; items: string[] };

const ICONS: Record<string, string> = {
  baby: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z",
  you: "M12 3l2.2 5.3 5.8.5-4.4 3.8 1.3 5.6L12 15l-4.9 3.2 1.3-5.6L4 8.8l5.8-.5L12 3Z",
  todo: "M5 12l4.5 4.5L19 7",
};

/** Three short lists, one at a time, so a week reads as cards instead of a wall of text. */
export default function WeekTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  return (
    <div className="card p-3">
      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-2xl bg-soft p-1">
        {tabs.map((tb, i) => (
          <button
            key={tb.key}
            type="button"
            role="tab"
            id={`wk-tab-${tb.key}`}
            aria-selected={i === active}
            aria-controls="wk-panel"
            onClick={() => setActive(i)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-base font-bold transition ${
              i === active ? "bg-white text-primary-text shadow-sm" : "text-ink"
            }`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICONS[tb.key] ?? ICONS.baby} />
            </svg>
            {tb.label}
          </button>
        ))}
      </div>
      <ul key={tab.key} id="wk-panel" role="tabpanel" aria-labelledby={`wk-tab-${tab.key}`} className="anim-in mt-3 space-y-3 p-2">
        {tab.items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-base font-extrabold text-primary-text">{i + 1}</span>
            <p className="text-lg leading-snug">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
