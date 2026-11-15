"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { logKick, logMood, logWeight, deleteLog, type Result } from "@/app/track-actions";
import { MOOD_LEVELS, SYMPTOM_KEYS } from "@/lib/track";

/** Error text for a failed action; falls back to a generic message. */
function useErrorText() {
  const t = useTranslations("track.errors");
  return (res: Result) => {
    if (res.ok) return null;
    return t.has(res.error) ? t(res.error) : t("save_failed");
  };
}

export function KickButton({ todayCount, latestId }: { todayCount: number; latestId: string | null }) {
  const t = useTranslations("track.kicks");
  const errorText = useErrorText();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(todayCount);
  const [last, setLast] = useState(latestId);

  // Results are applied optimistically; the next server render reconciles the real count.
  const tap = () =>
    start(async () => {
      const res = await logKick();
      if (res.ok) setCount((c) => c + 1);
      setError(errorText(res));
    });

  const undo = () =>
    start(async () => {
      if (!last) return;
      const res = await deleteLog(last);
      if (res.ok) {
        setCount((c) => Math.max(0, c - 1));
        setLast(null);
      }
      setError(errorText(res));
    });

  return (
    <div>
      <p className="text-base text-muted-text">{t("help")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={tap}
          disabled={pending}
          className="flex min-h-16 flex-1 items-center justify-center rounded-2xl bg-primary px-6 text-xl font-bold text-white transition active:scale-95 disabled:opacity-60"
        >
          {t("tap")}
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={pending || !last}
          className="min-h-16 rounded-2xl bg-soft px-5 text-base font-semibold text-ink disabled:opacity-50"
        >
          {t("undo")}
        </button>
      </div>
      <p className="mt-3 text-lg font-semibold" aria-live="polite">
        {t("today", { n: count })}
      </p>
      {error && <p role="alert" className="mt-2 text-base text-urgent">{error}</p>}
    </div>
  );
}

export function MoodForm({ latestLevel }: { latestLevel: number | null }) {
  const t = useTranslations("track.mood");
  const errorText = useErrorText();
  const [pending, start] = useTransition();
  const [level, setLevel] = useState<number | null>(latestLevel);
  const [picked, setPicked] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const toggle = (key: string) => setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const save = () => {
    if (level === null) return;
    start(async () => {
      const res = await logMood(level, picked);
      setMessage(res.ok ? t("saved") : errorText(res));
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">{t("title")}</p>
      <div role="radiogroup" aria-label={t("title")} className="grid grid-cols-5 gap-2">
        {MOOD_LEVELS.map((n, i) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={level === n}
            onClick={() => setLevel(n)}
            className={`min-h-16 rounded-2xl px-1 text-sm font-semibold ${level === n ? "bg-primary text-white" : "bg-soft text-ink"}`}
          >
            {t(`levels.${i}`)}
          </button>
        ))}
      </div>
      <p className="text-lg font-semibold">{t("symptomsTitle")}</p>
      <div className="flex flex-wrap gap-2">
        {SYMPTOM_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={picked.includes(key)}
            onClick={() => toggle(key)}
            className={`min-h-11 rounded-full px-4 text-base font-medium ${picked.includes(key) ? "bg-primary-text text-white" : "bg-soft text-ink"}`}
          >
            {t(`symptoms.${key}`)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        disabled={pending || level === null}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-white disabled:opacity-60"
      >
        {t("save")}
      </button>
      {message && (
        <p role="status" className="text-base text-muted-text">
          {message}
        </p>
      )}
    </div>
  );
}

export function WeightForm({ latestKg }: { latestKg: number | null }) {
  const t = useTranslations("track.weight");
  const errorText = useErrorText();
  const [pending, start] = useTransition();
  const [value, setValue] = useState(latestKg !== null ? String(latestKg) : "");
  const [message, setMessage] = useState<string | null>(null);

  const save = () => {
    const kg = Number(value.replace(",", "."));
    start(async () => {
      const res = await logWeight(kg);
      setMessage(res.ok ? "✓" : errorText(res));
    });
  };

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label className="flex-1">
        <span className="mb-1 block text-base text-muted-text">{t("label")}</span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-14 w-full rounded-2xl border-2 border-soft bg-surface px-4 text-xl"
        />
      </label>
      <button type="submit" disabled={pending} className="min-h-14 rounded-2xl bg-primary px-6 text-lg font-bold text-white disabled:opacity-60">
        {t("save")}
      </button>
      {message && (
        <p role="status" className="w-full text-base text-muted-text">
          {message}
        </p>
      )}
    </form>
  );
}
