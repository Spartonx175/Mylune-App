import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BigSisters from "@/components/BigSisters";
import FruitIllustration from "@/components/FruitIllustration";
import WeekTimeline from "@/components/WeekTimeline";
import WeekTabs from "@/components/WeekTabs";
import { availableWeeks, calendarOrFallback, weekOrFallback } from "@/lib/content/safe";
import { loadSources } from "@/lib/content/load";
import type { Locale } from "@/lib/content/types";
import { isNow, nextSteps, pickWeek } from "@/lib/week-view";
import { datingFromSession, formatDate } from "@/lib/pregnancy";
import { getSession } from "@/lib/session";

export default async function BabyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ w?: string }>;
}) {
  const { locale } = await params;
  const { w } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getSession();
  const dating = datingFromSession(session);
  const loc = locale as Locale;

  const weeks = availableWeeks(loc);
  const requested = Number(w);
  const selected = weeks.includes(requested) ? requested : dating ? pickWeek(dating.sa.weeks, weeks) : (weeks[0] ?? null);
  const content = selected !== null ? weekOrFallback(loc, selected) : null;
  const sourceById = new Map(loadSources().sources.map((s) => [s.id, s]));
  const steps = dating ? nextSteps(calendarOrFallback(loc).data, dating.sa.weeks, 6) : [];

  return (
    <section className="space-y-5 py-2">
      <h1 className="text-4xl font-bold">{t("nav.baby")}</h1>

      {weeks.length > 0 && (
        <nav aria-label={t("baby.pick")} className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2">
          {weeks.map((n) => (
            <Link
              key={n}
              href={{ pathname: "/baby", query: { w: n } }}
              aria-current={n === selected ? "page" : undefined}
              className={`flex h-14 w-14 shrink-0 snap-start flex-col items-center justify-center rounded-2xl text-xl font-bold leading-none transition ${
                n === selected ? "bg-primary-text text-white shadow-[0_12px_22px_-10px_rgba(143,61,34,0.9)]" : "bg-white text-ink shadow-sm"
              } ${dating && n === dating.sa.weeks && n !== selected ? "ring-2 ring-primary" : ""}`}
            >
              {n}
              {dating && n === dating.sa.weeks && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          ))}
        </nav>
      )}

      {content ? (
        <>
          <div className="card-soft relative overflow-hidden px-6 pb-6 pt-8 text-center">
            <div aria-hidden="true" className="glow absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-8" />
            <FruitIllustration id={content.data.size_compare} className="relative mx-auto h-48 w-48" />
            <p className="relative mt-1 text-sm font-extrabold uppercase tracking-wider text-primary-text">{t("baby.weekTitle", { n: content.data.week_sa })}</p>
            <h2 className="relative font-display text-4xl font-semibold capitalize">{t(`fruit.${content.data.size_compare}`)}</h2>
            <ul className="relative mt-3 flex flex-wrap justify-center gap-2 text-base font-bold">
              <li className="rounded-full bg-white px-4 py-1.5 shadow-sm">{t("today.length", { mm: content.data.length_mm })}</li>
              {dating && content.data.week_sa === dating.sa.weeks && (
                <li className="rounded-full bg-primary-text px-4 py-1.5 text-white">{t("baby.thisWeek")}</li>
              )}
            </ul>
            {content.fallback && <p className="relative mt-2 text-base text-muted-text">{t("today.fallbackNote")}</p>}
          </div>

          <WeekTabs
            tabs={[
              { key: "baby", label: t("baby.baby"), items: content.data.baby },
              { key: "you", label: t("baby.you"), items: content.data.mother },
              { key: "todo", label: t("baby.todo"), items: content.data.todo },
            ]}
          />
        </>
      ) : (
        <div className="card p-6 text-lg">{dating ? t("baby.notYet", { n: dating.sa.weeks }) : t("baby.noWeeks")}</div>
      )}

      {steps.length > 0 && dating && (
        <div>
          <h2 className="mb-3 text-2xl font-semibold">{t("today.nextTitle")}</h2>
          <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3">
            {steps.map((s) => (
              <li key={s.id} className="card w-60 shrink-0 snap-start p-4">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-extrabold ${
                    isNow(s, dating.sa.weeks) ? "bg-primary-text text-white" : "bg-soft text-primary-text"
                  }`}
                >
                  {isNow(s, dating.sa.weeks) ? t("today.now") : `${s.sa_from}–${s.sa_to} SA`}
                </span>
                <p className="mt-2 text-lg font-bold leading-snug">{s.title}</p>
                {s.unverified && <p className="mt-1 text-sm font-semibold text-muted-text">{t("today.toConfirm")}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {dating && (
        <div className="card p-6">
          <h2 className="mb-3 text-2xl font-semibold">{t("baby.timelineTitle")}</h2>
          <WeekTimeline currentSa={dating.sa.weeks} labels={[t("baby.t1"), t("baby.t2"), t("baby.t3")]} />
          <p className="mt-3 text-base text-muted-text">
            {t("baby.scanWindow", {
              from: formatDate(dating.datingScanWindow.from, locale, "medium"),
              to: formatDate(dating.datingScanWindow.to, locale, "medium"),
            })}
          </p>
        </div>
      )}

      {content && (
        <details className="card p-5">
          <summary className="min-h-11 cursor-pointer text-lg font-bold text-primary-text">{t("baby.summary")}</summary>
          {content.data.body && (
            <div className="mt-3 space-y-3 text-lg">
              {content.data.body.split(/\n\s*\n/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <h3 className="mt-5 text-lg font-semibold text-primary-text">{t("baby.sources")}</h3>
          <ul className="mt-2 space-y-2 text-base">
            {content.data.sources.map((id) => {
              const s = sourceById.get(id);
              return (
                <li key={id}>
                  {s ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary-text underline">
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
      )}

      <BigSisters />
    </section>
  );
}
