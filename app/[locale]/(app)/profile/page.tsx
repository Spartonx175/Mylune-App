import { getTranslations, setRequestLocale } from "next-intl/server";
import { signOut } from "@/app/actions";
import { getSession } from "@/lib/session";
import CatPicker from "@/components/CatPicker";
import { getCompanionCat } from "@/lib/cat-cookie";
import { createClient } from "@/lib/supabase/server";
import { datingFromSession } from "@/lib/pregnancy";
import { BarChart, LineChart } from "@/components/charts";
import { KickButton, MoodForm, WeightForm } from "@/components/HealthForms";
import { AddAppointmentForm, CalendarForm, DeleteAppointmentButton } from "@/components/AppointmentsForms";
import { countsPerDay, dailySeries, lastDays, parisDay, PARIS, trendSlope } from "@/lib/track";

// A plain calendar date (YYYY-MM-DD) shown as-is, without timezone shifting.
const showDate = (iso: string | null, locale: string) =>
  iso ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : null;

const showWhen = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short", timeZone: PARIS }).format(new Date(iso));

type LogRow = { id: string; type: string; value: Record<string, unknown>; logged_at: string };

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

  // Health log: her own entries only (partners log under their own name).
  const supabase = await createClient();
  const dating = datingFromSession(session);
  const today = parisDay(new Date());
  const since = `${lastDays(today, 90)[0]}T00:00:00Z`;
  const { data: logData } = await supabase!
    .from("logs")
    .select("id, type, value, logged_at")
    .eq("user_id", user.id)
    .in("type", ["kick", "mood", "weight"])
    .gte("logged_at", since)
    .order("logged_at", { ascending: true });
  const logs = (logData ?? []) as LogRow[];

  const kicks = logs.filter((r) => r.type === "kick");
  const kicksToday = countsPerDay(kicks.map((r) => r.logged_at)).get(today) ?? 0;
  const lastKick = kicks[kicks.length - 1];
  const kickUndoId = lastKick && parisDay(lastKick.logged_at) === today ? lastKick.id : null;
  const kickChart = dailySeries(lastDays(today, 7), countsPerDay(kicks.map((r) => r.logged_at)));

  const moods = logs.filter((r) => r.type === "mood");
  const moodByDay = new Map<string, number>();
  for (const r of moods) moodByDay.set(parisDay(r.logged_at), Number(r.value.level));
  const moodPoints = lastDays(today, 14)
    .filter((d) => moodByDay.has(d))
    .map((d) => ({ label: d, value: moodByDay.get(d)! }));
  const latestMood = moodByDay.get(today) ?? null;

  const weights = logs.filter((r) => r.type === "weight");
  const weightPoints = weights.map((r) => ({ label: parisDay(r.logged_at), value: Number(r.value.kg) }));
  const latestKg = weightPoints.length ? weightPoints[weightPoints.length - 1].value : null;
  const slope = trendSlope(weightPoints.slice(-10).map((p) => p.value));
  const trend = weightPoints.length < 2 ? null : slope > 0.02 ? t("track.weight.trendUp") : slope < -0.02 ? t("track.weight.trendDown") : t("track.weight.trendFlat");

  // Appointments: the whole household sees them.
  const { data: apptData } = await supabase!
    .from("appointments")
    .select("id, title, at, location, source")
    .eq("household_id", profile.household_id)
    .gte("at", `${lastDays(today, 2)[0]}T00:00:00Z`)
    .order("at", { ascending: true })
    .limit(20);
  const appts = (apptData ?? []) as { id: string; title: string; at: string; location: string | null; source: string }[];
  const nextAppt = appts[0];
  const daysTo = nextAppt ? Math.round((Date.parse(`${parisDay(nextAppt.at)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000) : null;

  const { data: feed } = await supabase!.from("calendar_feeds").select("last_synced_at, last_error").eq("user_id", user.id).maybeSingle();

  const weeks = dating?.sa.weeks ?? 0;

  return (
    <section className="py-4">
      <h1 className="mb-4 text-3xl font-bold">{t("nav.profile")}</h1>

      <div className="mb-4 rounded-3xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary-text">{t("profile.account")}</h2>
        <p className="mt-1 text-xl font-semibold">{profile.display_name ?? user.name ?? user.email}</p>
        {user.email && <p className="text-base text-muted-text">{user.email}</p>}
      </div>

      <dl className="mb-6 rounded-3xl bg-surface p-6 shadow-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="border-b border-soft py-3 last:border-0">
            <dt className="text-base text-muted-text">{k}</dt>
            <dd className="text-lg">{v}</dd>
          </div>
        ))}
      </dl>

      {/* Appointments */}
      <div className="mb-4 space-y-4 rounded-3xl bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary-text">{t("appts.title")}</h2>
        {nextAppt ? (
          <div className="rounded-2xl bg-soft p-4">
            <p className="text-base font-semibold text-primary-text">{t("appts.next")}</p>
            <p className="text-lg font-semibold">
              {daysTo !== null && daysTo > 0 ? t("appts.nextIn", { n: daysTo, title: nextAppt.title }) : t("appts.today", { title: nextAppt.title })}
            </p>
            <p className="text-base">{showWhen(nextAppt.at, locale)}</p>
          </div>
        ) : (
          <p className="text-lg">{t("appts.none")}</p>
        )}
        {appts.length > 0 && (
          <ul className="space-y-2">
            {appts.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-2 border-b border-soft pb-2 last:border-0">
                <div>
                  <p className="text-lg font-semibold">{a.title}</p>
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
          <summary className="cursor-pointer text-lg font-semibold text-primary-text">{t("appts.add")}</summary>
          <div className="mt-4">
            <AddAppointmentForm />
          </div>
        </details>
        <details className="rounded-2xl bg-bg p-4">
          <summary className="cursor-pointer text-lg font-semibold text-primary-text">{t("appts.calTitle")}</summary>
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
      <div className="mb-4 space-y-6 rounded-3xl bg-surface p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary-text">{t("track.title")}</h2>

        {weeks >= 20 ? (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{t("track.kicks.title")}</h3>
            <KickButton todayCount={kicksToday} latestId={kickUndoId} />
            <p className="text-base text-muted-text">{t("track.kicks.chart")}</p>
            <BarChart points={kickChart} label={t("track.kicks.title")} />
          </div>
        ) : (
          <p className="rounded-2xl bg-soft p-4 text-base">{t("track.kicks.notYet")}</p>
        )}

        <div className="space-y-3">
          <MoodForm latestLevel={latestMood} />
          {moodPoints.length >= 2 && (
            <>
              <p className="text-base text-muted-text">{t("track.mood.chart")}</p>
              <LineChart points={moodPoints} label={t("track.mood.chart")} min={1} max={5} />
            </>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t("track.weight.title")}</h3>
          <WeightForm latestKg={latestKg} />
          {weightPoints.length >= 2 ? (
            <>
              <p className="text-base text-muted-text">{t("track.weight.chart")}{trend ? ` · ${trend}` : ""}</p>
              <LineChart points={weightPoints} label={t("track.weight.chart")} unit=" kg" />
            </>
          ) : (
            <p className="text-base text-muted-text">{t("track.weight.none")}</p>
          )}
        </div>
      </div>

      <CatPicker current={cat} />

      <form action={signOut.bind(null, locale)}>
        <button
          type="submit"
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-soft px-6 text-lg font-semibold text-ink"
        >
          {t("auth.signOut")}
        </button>
      </form>
    </section>
  );
}
