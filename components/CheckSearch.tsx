"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { searchChecks, type SearchHit } from "@/app/check-actions";
import type { ClientSource } from "@/lib/check-sources";
import { VERDICT_STYLE } from "@/lib/check-style";
import { normalize } from "@/lib/check-search";
import type { CheckItem, CheckKind, Verdict } from "@/lib/content/check-types";

type Props = { kind: CheckKind; tips: CheckItem[]; total: number; tipSources: Record<string, ClientSource> };

/** "ok" / "careful" / "avoid" when every case agrees; "depends" when the answer changes with how it is prepared. */
type Summary = Verdict | "depends";
const summarize = (item: CheckItem): Summary => {
  const set = new Set(item.answers.map((a) => a.verdict));
  return set.size === 1 ? item.answers[0].verdict : "depends";
};

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  const path = verdict === "ok" ? "M5 12l4 4 10-10" : verdict === "careful" ? "M12 6v8M12 18v.5" : "M6 6l12 12M18 6L6 18";
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function VerdictBadge({ verdict, kind, big = false }: { verdict: Summary; kind: CheckKind; big?: boolean }) {
  const t = useTranslations("check");
  const s = VERDICT_STYLE[verdict === "depends" ? "careful" : verdict];
  const label = verdict === "depends" ? t("verdict.depends") : kind === "medicines" ? t(`verdictMedicines.${verdict}`) : t(`verdict.${verdict}`);
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border-2 font-bold ${big ? "px-4 py-2 text-xl" : "px-3 py-1 text-base"}`}
      style={{ background: s.bg, borderColor: s.border, color: s.text }}
    >
      {verdict !== "depends" && <VerdictIcon verdict={verdict} />}
      {label}
    </span>
  );
}

/** One line per case: "✓ Pasteurised · ✗ Raw milk", so the nuance is visible before opening the item. */
function CaseChips({ item }: { item: CheckItem }) {
  const t = useTranslations("check");
  if (item.answers.length < 2) return null;
  return (
    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold">
      {item.answers.map((a) => (
        <span key={a.state} className="inline-flex items-center gap-1" style={{ color: VERDICT_STYLE[a.verdict].text }}>
          <VerdictIcon verdict={a.verdict} />
          {a.label ?? t(`states.${a.state}`)}
        </span>
      ))}
    </span>
  );
}

export default function CheckSearch({ kind, tips, total, tipSources }: Props) {
  const t = useTranslations("check");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SearchHit | null>(null);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [sources, setSources] = useState<Record<string, ClientSource>>(tipSources);
  const [answered, setAnswered] = useState("");
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Ask the server for the best matches while typing (the full list never reaches the phone).
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const r = await searchChecks(locale, kind, q);
        if (cancelled) return;
        setHits(r.hits);
        setSources((prev) => ({ ...prev, ...r.sources }));
        setFailed(false);
      } catch {
        if (cancelled) return;
        setHits([]);
        setFailed(true);
      }
      setAnswered(q);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, locale, kind, attempt]);

  const q = query.trim();
  const shown = q ? hits : [];
  const busy = q !== "" && answered !== q;
  const best = tips.filter((i) => i.tips?.includes("best"));
  const avoid = tips.filter((i) => i.tips?.includes("avoid"));

  const openTip = (id: string) => {
    const item = tips.find((i) => i.id === id);
    if (!item) return;
    setQuery(item.names[0]);
    setSelected({ item, matched: item.names[0] });
  };

  if (total === 0) {
    return <p className="card p-6 text-lg">{t("empty")}</p>;
  }

  const item = selected?.item ?? null;
  const others = item ? item.names.filter((n) => normalize(n) !== normalize(selected!.matched)).slice(0, 6) : [];

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <label htmlFor="check-q" className="mb-1 block text-base font-bold text-primary-text">
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
              setSelected(null);
            }}
            placeholder={t(`placeholder.${kind}`)}
            className="min-h-14 w-full rounded-2xl border-2 border-soft bg-bg px-4 text-xl"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelected(null);
              }}
              className="min-h-14 shrink-0 rounded-2xl bg-soft px-4 text-base font-semibold"
            >
              {t("clear")}
            </button>
          )}
        </div>
      </div>

      {q && !selected && (
        <div aria-live="polite">
          {failed ? (
            <div className="card space-y-3 p-6">
              <p className="text-lg font-semibold">{t("searchError")}</p>
              <button type="button" onClick={() => { setAnswered(""); setAttempt((n) => n + 1); }} className="min-h-12 rounded-2xl bg-primary-text px-5 text-lg font-bold text-white">
                {t("retry")}
              </button>
            </div>
          ) : busy && shown.length === 0 ? (
            <p className="px-2 text-lg text-muted-text">{t("searching")}</p>
          ) : shown.length === 0 ? (
            <div className="card-soft p-6">
              <p className="text-lg font-bold">{t("noResultsTitle")}</p>
              <p className="text-lg">{t("noResults")}</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {shown.map((h) => (
                <li key={h.item.id}>
                  <button type="button" onClick={() => setSelected(h)} className="card flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3 text-left">
                    <span className="min-w-0">
                      <span className="block text-lg font-bold leading-tight">{h.matched}</span>
                      {normalize(h.matched) !== normalize(h.item.names[0]) && (
                        <span className="block truncate text-sm text-muted-text">{t("sameRuleAs", { name: h.item.names[0] })}</span>
                      )}
                      <CaseChips item={h.item} />
                    </span>
                    <VerdictBadge verdict={summarize(h.item)} kind={kind} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selected && item && (
        <article className="space-y-3" aria-live="polite">
          <div className="card p-5">
            <h2 className="font-display text-3xl font-semibold leading-tight">{selected.matched}</h2>
            {item.active_ingredient && <p className="mt-1 text-base text-muted-text">{t("ingredient", { name: item.active_ingredient })}</p>}
            {others.length > 0 && <p className="mt-2 text-base text-muted-text">{t("alsoCovers", { names: others.join(", ") })}</p>}
            {item.answers.length > 1 && <p className="mt-3 text-base font-semibold text-primary-text">{t("depends")}</p>}
          </div>

          {item.answers.map((a) => {
            const s = VERDICT_STYLE[a.verdict];
            return (
              <div key={a.state} className="space-y-2 rounded-[28px] p-5 shadow-[0_14px_30px_-18px_rgba(59,47,43,0.5)]" style={{ background: s.bg }}>
                <div className="flex flex-wrap items-center gap-2">
                  {item.answers.length > 1 && <span className="font-display text-xl font-semibold">{a.label ?? t(`states.${a.state}`)}</span>}
                  <VerdictBadge verdict={a.verdict} kind={kind} big={item.answers.length === 1} />
                </div>
                <p className="text-lg leading-snug">{a.why}</p>
                <details className="rounded-2xl bg-white/70 p-3">
                  <summary className="min-h-11 cursor-pointer text-base font-bold">{t("sources")}</summary>
                  <ul className="mt-1 space-y-1 text-base">
                    {a.sources.map((id) => {
                      const src = sources[id];
                      return (
                        <li key={id}>
                          {src ? (
                            <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline">
                              {src.name}: {src.title}
                            </a>
                          ) : (
                            id
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </div>
            );
          })}

          <p className="px-2 text-sm text-muted-text">
            {t("reviewed", {
              date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${item.reviewed}T00:00:00Z`)),
            })}
          </p>
          <button type="button" onClick={() => setSelected(null)} className="min-h-12 rounded-full bg-white px-5 text-lg font-bold shadow-sm">
            ← {t("back")}
          </button>
        </article>
      )}

      {!q && !selected && (
        <>
          <p className="text-base text-muted-text">{t("pickOne")}</p>
          <TipList title={t("tipsBest")} items={best} verdict="ok" onPick={openTip} />
          <TipList title={t("tipsAvoid")} items={avoid} verdict="avoid" onPick={openTip} />
        </>
      )}

      <p className="rounded-2xl bg-soft p-4 text-base">{kind === "medicines" ? t("disclaimerMedicines") : t("disclaimer")}</p>
    </div>
  );
}

function TipList({ title, items, verdict, onPick }: { title: string; items: CheckItem[]; verdict: Verdict; onPick: (id: string) => void }) {
  if (items.length === 0) return null;
  const s = VERDICT_STYLE[verdict];
  return (
    <div className="card p-4">
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold" style={{ color: s.text }}>
        <VerdictIcon verdict={verdict} />
        {title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <button key={i.id} type="button" onClick={() => onPick(i.id)} className="min-h-11 rounded-full border-2 px-4 text-base font-semibold" style={{ background: s.bg, borderColor: s.border }}>
            {i.names[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
