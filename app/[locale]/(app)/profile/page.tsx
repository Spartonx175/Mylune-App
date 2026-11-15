import { getTranslations, setRequestLocale } from "next-intl/server";
import { signOut } from "@/app/actions";
import { getSession } from "@/lib/session";
import CatPicker from "@/components/CatPicker";
import CatPhoto from "@/components/CatPhoto";
import { getCompanionCat } from "@/lib/cat-cookie";
import { createClient } from "@/lib/supabase/server";
import { datingFromSession } from "@/lib/pregnancy";
import { BarChart, LineChart } from "@/components/charts";
import { KickButton, MoodForm, WeightForm } from "@/components/HealthForms";
import { AddAppointmentForm, CalendarForm, DeleteAppointmentButton } from "@/components/AppointmentsForms";
import { loadTrackData } from "@/lib/track-data";
import { parisDay, PARIS } from "@/lib/track";

// A plain calendar date (YYYY-MM-DD) shown as-is, without timezone shifting.
const showDate = (iso: string | null, locale: string) =>
  iso ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : null;

const showWhen = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short", timeZone: PARIS }).format(new Date(iso));

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getSession();
  if (!session.configured || !session.user || !session.profile) return null;

  const { user, profile } = session;
  const cat = await getCompanionCat();
  const none = t("profile.none");
  const rows: [string, string][] = [
    [t("profile.language"), profile.locale === "fr" ? "Français" : "English"],
    [t("profile.ddr"), showDate(profile.ddr, locale) ?? none],
    [t("profile.due"), showDate(profile.due_date_override, locale) ?? none],
    [t("profile.maternity"), profile.maternity_name ?? none],
    [t("profile.phone"), profile.maternity_phone ?? none],
  ];

  const supabase = (await createClient())!;
  const dating = datingFromSession(session);
  const today = parisDay(new Date());
  const track = await loadTrackData(supabase, user.id, profile.household_id, today);
  const nextAppt = track.appts[0];
  const { data: feed } = await supabase.from("calendar_feeds").select("last_synced_at, last_error").eq("user_id", user.id).maybeSingle();
  const weeks = dating?.sa.weeks ?? 0;
  const trend = track.trend === "up" ? t("track.weight.trendUp") : track.trend === "down" ? t("track.weight.trendDown") : track.trend === "flat" ? t("track.weight.trendFlat") : null;

  return (
    <section className="space-y-5 py-2">
      <div className="hero flex items-center gap-4 p-6">
        <div aria-hidden="true" className="glass absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-60" />
        <CatPhoto cat={cat} size={72} className="relative shrink-0" />
        <div className="relative min-w-0">
          <h1 className="truncate font-display text-3xl font-semibold text-white">{profile.display_name ?? user.name ?? user.email}</h1>
          {user.email && <p className="truncate text-base text-white">{user.email}</p>}
        </div>
      </div>

      {/* Appointments */}
      <div className="card space-y-4 p-6">
        <h2 className="text-2xl font-semibold">{t("appts.title")}</h2>
        {nextAppt ? (
          <div className="rounded-2xl bg-soft p-4">
            <p className="text-sm font-extrabold uppercase tracking-wider text-primary-text">{t("appts.next")}</p>
            <p className="text-xl font-bold">
              {track.nextApptDays !== null && track.nextApptDays > 0
                ? t("appts.nextIn", { n: track.nextApptDays, title: nextAppt.title })
                : t("appts.today", { title: nextAppt.title })}
            </p>
            <p className="text-base">{showWhen(nextAppt.at, locale)}</p>
          </div>
        ) : (
          <p className="text-lg">{t("appts.none")}</p>
        )}
        {track.appts.length > 0 && (
          <ul className="space-y-2">
            {track.appts.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-2 border-b border-soft pb-2 last:border-0">
                <div>
                  <p className="text-lg font-bold">{a.title}</p>
                  <p className="text-base text-muted-text">
                    {showWhen(a.at, locale)}
                    {a.location ? ` · ${a.location}` : ""}
                  </p>
                  <p className="text-sm text-muted-text">{a.source === "ical" ? t("appts.fromCalendar") : t("appts.byHand")}</p>
                </div>
                {a.source === "manual" && <DeleteAppointmentButton id={a.id} />}
              </li>
            ))}
          </ul>
        )}
        <details className="rounded-2xl bg-bg p-4">
          <summary className="cursor-pointer text-lg font-bold text-primary-text">{t("appts.add")}</summary>
          <div className="mt-4">
            <AddAppointmentForm />
          </div>
        </details>
        <details className="rounded-2xl bg-bg p-4">
          <summary className="cursor-pointer text-lg font-bold text-primary-text">{t("appts.calTitle")}</summary>
          <div className="mt-4">
            <CalendarForm
              connected={Boolean(feed)}
              lastSynced={feed?.last_synced_at ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: PARIS }).format(new Date(feed.last_synced_at)) : null}
              lastError={feed?.last_error ?? null}
            />
          </div>
        </details>
      </div>

      {/* Health log */}
      <div className="card space-y-6 p-6">
        <h2 className="text-2xl font-semibold">{t("track.title")}</h2>

        {weeks >= 20 ? (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold">{t("track.kicks.title")}</h3>
            <KickButton todayCount={track.kicksToday} latestId={track.kickUndoId} />
            <p className="text-base text-muted-text">{t("track.kicks.chart")}</p>
            <BarChart points={track.kickChart} label={t("track.kicks.title")} />
          </div>
        ) : (
          <p className="rounded-2xl bg-soft p-4 text-base">{t("track.kicks.notYet")}</p>
        )}

        <div className="space-y-3">
          <MoodForm latestLevel={track.latestMood} />
          {track.moodPoints.length >= 2 && (
            <>
              <p className="text-base text-muted-text">{t("track.mood.chart")}</p>
              <LineChart points={track.moodPoints} label={t("track.mood.chart")} min={1} max={5} />
            </>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold">{t("track.weight.title")}</h3>
          <WeightForm latestKg={track.latestKg} />
          {track.weightPoints.length >= 2 ? (
            <>
              <p className="text-base text-muted-text">
                {t("track.weight.chart")}
                {trend ? ` · ${trend}` : ""}
              </p>
              <LineChart points={track.weightPoints} label={t("track.weight.chart")} unit=" kg" />
            </>
          ) : (
            <p className="text-base text-muted-text">{t("track.weight.none")}</p>
          )}
        </div>
      </div>

      <dl className="card p-6">
        {rows.map(([k, v]) => (
          <div key={k} className="border-b border-soft py-3 last:border-0">
            <dt className="text-base text-muted-text">{k}</dt>
            <dd className="text-lg font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <CatPicker current={cat} />

      <form action={signOut.bind(null, locale)}>
        <button type="submit" className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-soft px-6 text-lg font-bold text-ink">
          {t("auth.signOut")}
        </button>
      </form>
    </section>
  );
}
