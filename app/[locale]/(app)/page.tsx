import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import CatPhoto from "@/components/CatPhoto";
import FruitIllustration from "@/components/FruitIllustration";
import ProgressRing from "@/components/ProgressRing";
import QuickCheckin from "@/components/QuickCheckin";
import { KickButton } from "@/components/HealthForms";
import { Sparkline } from "@/components/charts";
import { availableWeeks, weekOrFallback } from "@/lib/content/safe";
import type { Locale } from "@/lib/content/types";
import { getCompanionCat } from "@/lib/cat-cookie";
import { progress, pickWeek, tipOfDay } from "@/lib/week-view";
import { datingFromSession, formatDate } from "@/lib/pregnancy";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import { loadTrackData } from "@/lib/track-data";
import { parisDay } from "@/lib/track";

const Icon = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const CAL = "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z";
const HOURGLASS = "M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9";
const BELL = "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 21h4";
const BULB = "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z";

// Today: three cards (SPEC section 10): where she is, her baby this week, how she is today.
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
      <section className="space-y-4 py-2">
        <div className="card p-6">
          <h1 className="text-3xl font-bold">{t("nav.today")}</h1>
          <p className="mt-2 text-lg">{t("today.setDates")}</p>
        </div>
      </section>
    );
  }

  const loc = locale as Locale;
  const { sa } = dating;
  const week = pickWeek(sa.weeks, availableWeeks(loc));
  const weekContent = week !== null ? weekOrFallback(loc, week) : null;
  const tip = weekContent ? tipOfDay(weekContent.data.tip_of_day, sa.days) : null;
  const firstName = (session.configured && session.profile?.display_name?.split(" ")[0]) || null;

  // Her own log (mood, kicks) and the next appointment.
  const supabase = await createClient();
  const today = parisDay(new Date());
  const track =
    supabase && session.configured && session.user && session.profile
      ? await loadTrackData(supabase, session.user.id, session.profile.household_id, today)
      : null;
  const nextAppt = track?.appts[0] ?? null;

  return (
    <section className="space-y-5 py-2">
      {/* 1. Where she is */}
      <div className="hero p-6 pb-8">
        <div aria-hidden="true" className="glass absolute -right-10 -top-12 h-44 w-44 rounded-full opacity-60" />
        <div aria-hidden="true" className="glass absolute -bottom-16 -left-12 h-40 w-40 rounded-full opacity-40" />
        <p className="relative text-lg font-semibold text-white">{firstName ? t("today.greeting", { name: firstName }) : t("today.greetingAnon")}</p>
        <div className="relative mt-3">
          <ProgressRing fraction={progress(dating.daysSinceDdr)} label={t("today.ringLabel", { weeks: sa.weeks, days: sa.days, pct: Math.round(progress(dating.daysSinceDdr) * 100) })}>
            <span className="font-display text-7xl font-bold leading-none text-white">{sa.weeks}</span>
            <span className="mt-1 text-lg font-bold text-white">
              {t("today.sa")} + {sa.days} {t("today.dayShort")}
            </span>
          </ProgressRing>
        </div>
        <p className="relative mt-4 text-center font-display text-2xl font-semibold text-white">
          {t("today.weekOrdinal", { n: dating.weekOrdinal })} · {t("today.trimester", { n: dating.trimester })}
        </p>
        <ul className="relative mt-4 flex flex-wrap justify-center gap-2 text-base font-semibold">
          <li className="glass flex items-center gap-2 rounded-full px-4 py-2">
            <Icon d={HOURGLASS} />
            {dating.daysToDue40 > 0 ? t("today.daysToGo", { n: dating.daysToDue40 }) : t("today.countdownDue")}
          </li>
          <li className="glass flex items-center gap-2 rounded-full px-4 py-2">
            <Icon d={CAL} />
            {t("today.dueShort", { date: formatDate(dating.dueDate40, locale, "medium") })}
          </li>
          {nextAppt && track?.nextApptDays !== null && (
            <li className="glass flex items-center gap-2 rounded-full px-4 py-2">
              <Icon d={BELL} />
              {track!.nextApptDays! > 0 ? t("appts.nextIn", { n: track!.nextApptDays!, title: nextAppt.title }) : t("appts.today", { title: nextAppt.title })}
            </li>
          )}
        </ul>
        <CatPhoto cat={cat} size={56} className="cat-float absolute right-4 top-4" />
      </div>

      {/* 2. Baby this week */}
      <div className="card-soft relative overflow-hidden p-6">
        <div aria-hidden="true" className="glow absolute -right-16 -top-16 h-72 w-72" />
        {weekContent ? (
          <>
            <div className="relative flex items-center gap-4">
              <FruitIllustration id={weekContent.data.size_compare} className="h-32 w-32 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-extrabold uppercase tracking-wider text-primary-text">{t("today.babyTitle")}</p>
                <p className="break-words font-display text-3xl font-semibold capitalize leading-tight">{t(`fruit.${weekContent.data.size_compare}`)}</p>
                <p className="text-xl font-semibold text-muted-text">{t("today.length", { mm: weekContent.data.length_mm })}</p>
              </div>
            </div>
            {tip && (
              <div className="relative mt-4 flex gap-3 rounded-2xl bg-white/90 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-soft text-primary-text">
                  <Icon d={BULB} />
                </span>
                <p className="text-lg leading-snug">{tip}</p>
              </div>
            )}
            <Link href="/baby" className="relative mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary-text px-5 text-lg font-bold text-white">
              {t("today.seeWeek")}
              <Icon d="M5 12h14M13 6l6 6-6 6" />
            </Link>
          </>
        ) : (
          <p className="relative text-lg">{t("today.noContent")}</p>
        )}
      </div>

      {/* 3. How she is today */}
      {track && (
        <div className="card space-y-4 p-6">
          <h2 className="text-2xl font-semibold">{t("track.mood.title")}</h2>
          <QuickCheckin latestMood={track.latestMood} />
          {track.moodPoints.length >= 2 && (
            <div className="flex items-center gap-4 rounded-2xl bg-bg p-3">
              <Sparkline values={track.moodPoints.slice(-7).map((p) => p.value)} min={1} max={5} className="h-14 flex-1" />
              <p className="w-20 text-sm font-semibold leading-tight text-muted-text">{t("today.moodWeek")}</p>
            </div>
          )}
          {sa.weeks >= 20 && (
            <div className="space-y-2 border-t border-soft pt-4">
              <h3 className="text-xl font-semibold">{t("track.kicks.title")}</h3>
              <KickButton todayCount={track.kicksToday} latestId={track.kickUndoId} />
            </div>
          )}
          <Link href="/profile" className="flex min-h-11 items-center justify-center gap-2 text-lg font-bold text-primary-text">
            {t("today.seeLog")}
            <Icon d="M5 12h14M13 6l6 6-6 6" />
          </Link>
        </div>
      )}
    </section>
  );
}
