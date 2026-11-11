import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { CatMascot } from "@/components/CatMascot";
import FruitIllustration from "@/components/FruitIllustration";
import ProgressRing from "@/components/ProgressRing";
import { calendarOrFallback, availableWeeks, weekOrFallback } from "@/lib/content/safe";
import type { Locale } from "@/lib/content/types";
import { getCompanionCat } from "@/lib/cat-cookie";
import { progress, nextSteps, pickWeek, tipOfDay, isNow } from "@/lib/week-view";
import { datingFromSession, formatDate } from "@/lib/pregnancy";
import { getSession } from "@/lib/session";

// Today: at most 3 cards (SPEC section 10): where she is, her baby this week, what is coming up.
export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  // The app opens at /fr; honour the language saved on the profile.
  const session = await getSession();
  if (session.configured && session.profile && session.profile.locale !== locale) {
    redirect({ href: "/", locale: session.profile.locale });
  }

  const cat = await getCompanionCat();
  const dating = datingFromSession(session);

  if (!dating) {
    return (
      <section className="py-4">
        <h1 className="mb-4 text-3xl font-bold">{t("nav.today")}</h1>
        <div className="rounded-3xl bg-surface p-6 shadow-sm">
          <p className="text-lg">{t("today.setDates")}</p>
        </div>
      </section>
    );
  }

  const loc = locale as Locale;
  const { sa } = dating;
  const week = pickWeek(sa.weeks, availableWeeks(loc));
  const weekContent = week !== null ? weekOrFallback(loc, week) : null;
  const calendar = calendarOrFallback(loc);
  const steps = nextSteps(calendar.data, sa.weeks, 2);
  const pct = Math.round(progress(dating.daysSinceDdr) * 100);
  const tip = weekContent ? tipOfDay(weekContent.data.tip_of_day, sa.days) : null;

  return (
    <section className="space-y-4 py-4">
      <h1 className="text-3xl font-bold">{t("nav.today")}</h1>

      {/* 1. Where she is */}
      <div className="relative overflow-hidden rounded-3xl bg-surface p-6 shadow-sm">
        <ProgressRing
          fraction={progress(dating.daysSinceDdr)}
          label={t("today.ringLabel", { weeks: sa.weeks, days: sa.days, pct })}
        >
          <span className="text-4xl font-bold text-primary-text">
            {sa.weeks} {t("today.sa")}
          </span>
          <span className="text-lg text-muted-text">
            + {sa.days} {t("today.dayShort")}
          </span>
        </ProgressRing>
        <p className="mt-3 text-center text-xl font-semibold">
          {t("today.weekOrdinal", { n: dating.weekOrdinal })} · {t("today.trimester", { n: dating.trimester })}
        </p>
        <p className="text-center text-base text-muted-text">{t("today.sg", { n: dating.sg })}</p>
        <p className="mt-2 text-center text-lg">
          {dating.daysToDue40 > 0 ? t("today.countdown", { n: dating.daysToDue40 }) : t("today.countdownDue")}
        </p>
        <p className="text-center text-base text-muted-text">
          {t("today.dueDates", { d40: formatDate(dating.dueDate40, locale), d41: formatDate(dating.term41, locale) })}
        </p>
        <CatMascot cat={cat} className="mx-auto mt-3 h-20 w-20" />
      </div>

      {/* 2. Baby this week */}
      <div className="rounded-3xl bg-soft p-6">
        <h2 className="text-lg font-semibold text-primary-text">{t("today.babyTitle")}</h2>
        {weekContent ? (
          <>
            <div className="mt-2 flex items-center gap-4">
              <FruitIllustration id={weekContent.data.size_compare} className="h-24 w-24 shrink-0" />
              <p className="text-xl">
                {t("today.sizeLike", {
                  mm: weekContent.data.length_mm,
                  fruit: t(`fruit.${weekContent.data.size_compare}`),
                })}
              </p>
            </div>
            {tip && (
              <p className="mt-3 rounded-2xl bg-surface p-4 text-lg">
                <span className="block text-base font-semibold text-primary-text">{t("today.tipTitle")}</span>
                {tip}
              </p>
            )}
            {weekContent.fallback && <p className="mt-2 text-base text-muted-text">{t("today.fallbackNote")}</p>}
          </>
        ) : (
          <p className="mt-2 text-lg">{t("today.noContent")}</p>
        )}
      </div>

      {/* 3. Coming up */}
      {steps.length > 0 && (
        <div className="rounded-3xl bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary-text">{t("today.nextTitle")}</h2>
          <ul className="mt-2 space-y-3">
            {steps.map((s) => (
              <li key={s.id}>
                <p className="text-lg font-semibold">
                  {s.title}
                  {isNow(s, sa.weeks) && (
                    <span className="ml-2 rounded-full bg-soft px-2 py-0.5 text-sm font-semibold text-primary-text">{t("today.now")}</span>
                  )}
                  {s.unverified && <span className="ml-2 text-sm font-medium text-muted-text">{t("today.toConfirm")}</span>}
                </p>
                <p className="text-base text-muted-text">
                  {s.sa_from}–{s.sa_to} SA
                </p>
              </li>
            ))}
          </ul>
          {calendar.fallback && <p className="mt-2 text-base text-muted-text">{t("today.fallbackNote")}</p>}
        </div>
      )}
    </section>
  );
}
