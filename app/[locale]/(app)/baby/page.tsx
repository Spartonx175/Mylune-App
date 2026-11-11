import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import BigSisters from "@/components/BigSisters";
import FruitIllustration from "@/components/FruitIllustration";
import WeekTimeline from "@/components/WeekTimeline";
import { availableWeeks, weekOrFallback } from "@/lib/content/safe";
import { loadSources } from "@/lib/content/load";
import type { Locale } from "@/lib/content/types";
import { pickWeek } from "@/lib/week-view";
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

  return (
    <section className="space-y-4 py-4">
      <h1 className="text-3xl font-bold">{t("nav.baby")}</h1>

      {weeks.length > 0 && (
        <nav aria-label={t("baby.pick")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {weeks.map((n) => (
            <Link
              key={n}
              href={{ pathname: "/baby", query: { w: n } }}
              aria-current={n === selected ? "page" : undefined}
              className={`flex min-h-11 min-w-14 shrink-0 items-center justify-center rounded-full px-4 text-lg font-semibold ${
                n === selected ? "bg-primary-text text-white" : "bg-soft text-ink"
              } ${dating && n === dating.sa.weeks ? "ring-2 ring-primary-text ring-offset-2" : ""}`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}

      {content ? (
        <>
          <div className="rounded-3xl bg-soft p-6 text-center">
            <FruitIllustration id={content.data.size_compare} className="mx-auto h-36 w-36" />
            <h2 className="mt-1 text-2xl font-bold">{t("baby.weekTitle", { n: content.data.week_sa })}</h2>
            <p className="text-lg">
              {t("today.sizeLike", { mm: content.data.length_mm, fruit: t(`fruit.${content.data.size_compare}`) })}
            </p>
            {content.fallback && <p className="mt-1 text-base text-muted-text">{t("today.fallbackNote")}</p>}
          </div>

          <List title={t("baby.baby")} items={content.data.baby} />
          <List title={t("baby.you")} items={content.data.mother} />
          <List title={t("baby.todo")} items={content.data.todo} />

          {content.data.body && (
            <div className="space-y-3 rounded-3xl bg-surface p-6 text-lg shadow-sm">
              {content.data.body.split(/\n\s*\n/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          <details className="rounded-3xl bg-surface p-6 shadow-sm">
            <summary className="min-h-11 cursor-pointer text-lg font-semibold text-primary-text">{t("baby.sources")}</summary>
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
        </>
      ) : (
        <div className="rounded-3xl bg-surface p-6 text-lg shadow-sm">{t("baby.noWeeks")}</div>
      )}

      {dating && (
        <div className="rounded-3xl bg-surface p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-primary-text">{t("baby.timelineTitle")}</h2>
          <WeekTimeline currentSa={dating.sa.weeks} labels={[t("baby.t1"), t("baby.t2"), t("baby.t3")]} />
          <p className="mt-3 text-base text-muted-text">
            {t("baby.scanWindow", {
              from: formatDate(dating.datingScanWindow.from, locale, "medium"),
              to: formatDate(dating.datingScanWindow.to, locale, "medium"),
            })}
          </p>
        </div>
      )}

      <BigSisters />
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl bg-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-primary-text">{title}</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-lg">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
