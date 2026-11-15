// Reads her own health log and the household's appointments for the Today and Profile screens.
import type { createClient } from "@/lib/supabase/server";
import { countsPerDay, dailySeries, lastDays, parisDay, trendSlope, type Point } from "./track";

export type Supa = NonNullable<Awaited<ReturnType<typeof createClient>>>;
export type Appt = { id: string; title: string; at: string; location: string | null; source: string };
type LogRow = { id: string; type: string; value: Record<string, unknown>; logged_at: string };

export type TrackData = {
  kicksToday: number;
  kickUndoId: string | null;
  kickChart: Point[];
  moodPoints: Point[];
  latestMood: number | null;
  weightPoints: Point[];
  latestKg: number | null;
  trend: "up" | "down" | "flat" | null;
  appts: Appt[];
  /** Whole days from `today` to the next appointment (0 = today), or null. */
  nextApptDays: number | null;
};

export async function loadTrackData(supabase: Supa, userId: string, householdId: string, today: string): Promise<TrackData> {
  const since = `${lastDays(today, 90)[0]}T00:00:00Z`;
  const [logRes, apptRes] = await Promise.all([
    supabase
      .from("logs")
      .select("id, type, value, logged_at")
      .eq("user_id", userId)
      .in("type", ["kick", "mood", "weight"])
      .gte("logged_at", since)
      .order("logged_at", { ascending: true }),
    supabase
      .from("appointments")
      .select("id, title, at, location, source")
      .eq("household_id", householdId)
      .gte("at", `${lastDays(today, 2)[0]}T00:00:00Z`)
      .order("at", { ascending: true })
      .limit(20),
  ]);
  const logs = (logRes.data ?? []) as LogRow[];
  const appts = (apptRes.data ?? []) as Appt[];

  const kicks = logs.filter((r) => r.type === "kick");
  const kickCounts = countsPerDay(kicks.map((r) => r.logged_at));
  const lastKick = kicks[kicks.length - 1];

  const moodByDay = new Map<string, number>();
  for (const r of logs.filter((x) => x.type === "mood")) moodByDay.set(parisDay(r.logged_at), Number(r.value.level));
  const moodPoints = lastDays(today, 14)
    .filter((d) => moodByDay.has(d))
    .map((d) => ({ label: d, value: moodByDay.get(d)! }));

  const weightPoints = logs
    .filter((r) => r.type === "weight")
    .map((r) => ({ label: parisDay(r.logged_at), value: Number(r.value.kg) }));
  const slope = trendSlope(weightPoints.slice(-10).map((p) => p.value));

  return {
    kicksToday: kickCounts.get(today) ?? 0,
    kickUndoId: lastKick && parisDay(lastKick.logged_at) === today ? lastKick.id : null,
    kickChart: dailySeries(lastDays(today, 7), kickCounts),
    moodPoints,
    latestMood: moodByDay.get(today) ?? null,
    weightPoints,
    latestKg: weightPoints.length ? weightPoints[weightPoints.length - 1].value : null,
    trend: weightPoints.length < 2 ? null : slope > 0.02 ? "up" : slope < -0.02 ? "down" : "flat",
    appts,
    nextApptDays: appts[0] ? Math.round((Date.parse(`${parisDay(appts[0].at)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000) : null,
  };
}
