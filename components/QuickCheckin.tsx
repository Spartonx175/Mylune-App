"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { logMood } from "@/app/track-actions";

const FACES = ["😞", "🙁", "😐", "🙂", "😄"] as const;

/** One-tap mood for today: five large faces. Saved straight away; no form, no words to type. */
export default function QuickCheckin({ latestMood }: { latestMood: number | null }) {
  const t = useTranslations("track.mood");
  const [pending, start] = useTransition();
  const [level, setLevel] = useState<number | null>(latestMood);
  const [saved, setSaved] = useState(latestMood !== null);
  const [error, setError] = useState(false);

  const pick = (n: number) => {
    setLevel(n);
    setError(false);
    start(async () => {
      const res = await logMood(n, []);
      setSaved(res.ok);
      setError(!res.ok);
    });
  };

  return (
    <div>
      <div role="radiogroup" aria-label={t("title")} className="grid grid-cols-5 gap-2">
        {FACES.map((face, i) => {
          const n = i + 1;
          const on = level === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t(`levels.${i}`)}
              disabled={pending}
              onClick={() => pick(n)}
              className={`flex aspect-square items-center justify-center rounded-2xl text-3xl transition active:scale-90 ${
                on ? "scale-105 bg-primary shadow-[0_10px_20px_-8px_rgba(217,105,63,0.9)]" : "bg-soft"
              }`}
            >
              <span aria-hidden="true">{face}</span>
            </button>
          );
        })}
      </div>
      <p role="status" className="mt-2 min-h-6 text-center text-base font-semibold text-primary-text">
        {error ? t("saveError") : saved && level ? <span className="pop inline-block">✓ {t("saved")} · {t(`levels.${level - 1}`)}</span> : ""}
      </p>
    </div>
  );
}
