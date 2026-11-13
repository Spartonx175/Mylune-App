"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { searchItems } from "@/lib/check-search";
import { VERDICT_STYLE } from "@/lib/check-style";
import type { CheckItem, CheckKind, Verdict } from "@/lib/content/check-types";

export type ClientSource = { name: string; title: string; url: string };
type Props = { kind: CheckKind; items: CheckItem[]; sources: Record<string, ClientSource> };

const SEVERITY: Record<Verdict, number> = { ok: 0, careful: 1, avoid: 2 };
const worst = (item: CheckItem): Verdict => item.answers.reduce<Verdict>((w, a) => (SEVERITY[a.verdict] > SEVERITY[w] ? a.verdict : w), "ok");

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  const path = verdict === "ok" ? "M5 12l4 4 10-10" : verdict === "careful" ? "M12 6v8M12 18v.5" : "M6 6l12 12M18 6L6 18";
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function VerdictBadge({ verdict, kind, big = false }: { verdict: Verdict; kind: CheckKind; big?: boolean }) {
  const t = useTranslations("check");
  const s = VERDICT_STYLE[verdict];
  const label = kind === "medicines" ? t(`verdictMedicines.${verdict}`) : t(`verdict.${verdict}`);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border-2 font-bold ${big ? "px-4 py-2 text-2xl" : "px-3 py-1 text-base"}`}
      style={{ background: s.bg, borderColor: s.border, color: s.text }}
    >
      <VerdictIcon verdict={verdict} />
      {label}
    </span>
  );
}

export default function CheckSearch({ kind, items, sources }: Props) {
  const t = useTranslations("check");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stateIdx, setStateIdx] = useState(0);

  const results = useMemo(() => searchItems(items, query), [items, query]);
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const answer = selected ? selected.answers[Math.min(stateIdx, selected.answers.length - 1)] : null;
  const best = items.filter((i) => i.tips?.includes("best"));
  const avoid = items.filter((i) => i.tips?.includes("avoid"));

  const pick = (id: string) => {
    setSelectedId(id);
    setStateIdx(0);
  };

  if (items.length === 0) {
    return <p className="rounded-3xl bg-surface p-6 text-lg shadow-sm">{t("empty")}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-surface p-4 shadow-sm">
        <label htmlFor="check-q" className="mb-1 block text-base font-semibold text-primary-text">
          {t("searchLabel")}
        </label>
        <div className="flex gap-2">
          <input
            id="check-q"
            type="search"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedId(null);
            }}
            placeholder={t(`placeholder.${kind}`)}
            className="min-h-14 w-full rounded-2xl border-2 border-soft bg-bg px-4 text-xl"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedId(null);
              }}
              className="min-h-14 shrink-0 rounded-2xl bg-soft px-4 text-base font-semibold"
            >
              {t("clear")}
            </button>
          )}
        </div>
      </div>

      {query && !selected && (
        <div aria-live="polite">
          {results.length === 0 ? (
            <div className="rounded-3xl bg-soft p-6">
              <p className="text-lg font-semibold">{t("noResultsTitle")}</p>
              <p className="text-lg">{t("noResults")}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => pick(item.id)}
                    className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-2 text-left shadow-sm"
                  >
                    <span className="text-lg font-semibold">{item.names[0]}</span>
                    <VerdictBadge verdict={worst(item)} kind={kind} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selected && answer && (
        <article className="space-y-3 rounded-3xl p-6 shadow-sm" style={{ background: VERDICT_STYLE[answer.verdict].bg }} aria-live="polite">
          <h2 className="text-2xl font-bold">{selected.names[0]}</h2>
          {selected.active_ingredient && <p className="text-base">{t("ingredient", { name: selected.active_ingredient })}</p>}

          {selected.answers.length > 1 && (
            <div>
              <p className="mb-1 text-base font-semibold">{t("chooseState")}</p>
              <div className="flex flex-wrap gap-2">
                {selected.answers.map((a, i) => (
                  <button
                    key={a.state}
                    type="button"
                    aria-pressed={i === stateIdx}
                    onClick={() => setStateIdx(i)}
                    className={`min-h-11 rounded-full border-2 px-4 text-base font-semibold ${
                      i === stateIdx ? "border-ink bg-ink text-white" : "border-ink/30 bg-surface"
                    }`}
                  >
                    {t(`states.${a.state}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <VerdictBadge verdict={answer.verdict} kind={kind} big />
          <p className="text-xl">{answer.why}</p>

          <details className="rounded-2xl bg-surface/70 p-3">
            <summary className="min-h-11 cursor-pointer text-base font-semibold">{t("sources")}</summary>
            <ul className="mt-1 space-y-1 text-base">
              {answer.sources.map((id) => {
                const s = sources[id];
                return (
                  <li key={id}>
                    {s ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {s.name}: {s.title}
                      </a>
                    ) : (
                      id
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
          <p className="text-sm">
            {t("reviewed", {
              date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${selected.reviewed}T00:00:00Z`)),
            })}
          </p>
          <button type="button" onClick={() => setSelectedId(null)} className="min-h-11 rounded-full bg-surface px-4 text-base font-semibold">
            ←
          </button>
        </article>
      )}

      {!query && !selected && (
        <>
          <p className="text-base text-muted-text">{t("pickOne")}</p>
          <TipList title={t("tipsBest")} items={best} kind={kind} verdict="ok" onPick={(id) => { setQuery(items.find((i) => i.id === id)?.names[0] ?? ""); pick(id); }} />
          <TipList title={t("tipsAvoid")} items={avoid} kind={kind} verdict="avoid" onPick={(id) => { setQuery(items.find((i) => i.id === id)?.names[0] ?? ""); pick(id); }} />
        </>
      )}

      <p className="rounded-2xl bg-soft p-4 text-base">{kind === "medicines" ? t("disclaimerMedicines") : t("disclaimer")}</p>
    </div>
  );
}

function TipList({ title, items, kind, verdict, onPick }: { title: string; items: CheckItem[]; kind: CheckKind; verdict: Verdict; onPick: (id: string) => void }) {
  if (items.length === 0) return null;
  const s = VERDICT_STYLE[verdict];
  return (
    <div className="rounded-3xl bg-surface p-4 shadow-sm">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold" style={{ color: s.text }}>
        <VerdictIcon verdict={verdict} />
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <button key={i.id} type="button" onClick={() => onPick(i.id)} className="min-h-11 rounded-full border-2 px-4 text-base font-medium" style={{ background: s.bg, borderColor: s.border }}>
            {i.names[0]}
          </button>
        ))}
      </div>
      <span className="sr-only">{kind}</span>
    </div>
  );
}
