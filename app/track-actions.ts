"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { parseIcal } from "@/lib/ical";
import { MOOD_LEVELS, SYMPTOM_KEYS } from "@/lib/track";

export type Result = { ok: true; message?: string } | { ok: false; error: string };

const ICAL_MAX_BYTES = 2_000_000;
const ICAL_TIMEOUT_MS = 8000;

/** Shared guard: a signed-in user with a household. */
async function context() {
  const session = await getSession();
  const supabase = await createClient();
  if (!supabase || !session.configured || !session.user || !session.profile) return null;
  return { supabase, userId: session.user.id, householdId: session.profile.household_id };
}

const refresh = () => revalidatePath("/", "layout");

async function insertLog(type: string, value: Record<string, unknown>): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  const { error } = await ctx.supabase.from("logs").insert({
    household_id: ctx.householdId,
    user_id: ctx.userId,
    type,
    value,
  });
  if (error) return { ok: false, error: "save_failed" };
  refresh();
  return { ok: true };
}

/** One tap = one movement (SPEC section 14: kick counter). */
export async function logKick(): Promise<Result> {
  return insertLog("kick", {});
}

/** Mood on a 1 to 5 scale, plus any symptoms ticked that day. */
export async function logMood(level: number, symptoms: string[]): Promise<Result> {
  if (!MOOD_LEVELS.includes(level as (typeof MOOD_LEVELS)[number])) return { ok: false, error: "invalid" };
  const picked = symptoms.filter((s): s is (typeof SYMPTOM_KEYS)[number] => (SYMPTOM_KEYS as readonly string[]).includes(s));
  const first = await insertLog("mood", { level });
  if (!first.ok) return first;
  for (const key of picked) {
    const r = await insertLog("symptom", { key });
    if (!r.ok) return r;
  }
  return { ok: true };
}

/** Weight in kilograms, 30 to 200 kg. */
export async function logWeight(kg: number): Promise<Result> {
  if (!Number.isFinite(kg) || kg < 30 || kg > 200) return { ok: false, error: "invalid" };
  return insertLog("weight", { kg: Math.round(kg * 10) / 10 });
}

/** Remove one of her own entries (for a mis-tap). */
export async function deleteLog(id: string): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  const { error } = await ctx.supabase.from("logs").delete().eq("id", id).eq("user_id", ctx.userId);
  if (error) return { ok: false, error: "delete_failed" };
  refresh();
  return { ok: true };
}

/** Remember one quiz answer for the score and so the question is not asked again soon. Never blocks the quiz. */
export async function recordQuiz(questionId: string, correct: boolean): Promise<Result> {
  if (!/^[a-z0-9:_-]{1,120}$/i.test(questionId)) return { ok: false, error: "invalid" };
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  const { error } = await ctx.supabase.from("logs").insert({
    household_id: ctx.householdId,
    user_id: ctx.userId,
    type: "quiz",
    value: { q: questionId, ok: Boolean(correct) },
  });
  // No revalidation on purpose: the quiz keeps its own state, and the Feed reads the score when it is opened.
  return error ? { ok: false, error: "save_failed" } : { ok: true };
}

/** Manual appointment. `at` is a local Paris wall-clock value from a datetime-local input. */
export async function addAppointment(title: string, at: string, location: string): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  const name = title.trim();
  const date = new Date(at);
  if (!name || name.length > 120 || Number.isNaN(date.getTime())) return { ok: false, error: "invalid" };
  const { error } = await ctx.supabase.from("appointments").insert({
    household_id: ctx.householdId,
    title: name,
    at: date.toISOString(),
    location: location.trim().slice(0, 160) || null,
    source: "manual",
  });
  if (error) return { ok: false, error: "save_failed" };
  refresh();
  return { ok: true };
}

export async function deleteAppointment(id: string): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  const { error } = await ctx.supabase.from("appointments").delete().eq("id", id).eq("source", "manual");
  if (error) return { ok: false, error: "delete_failed" };
  refresh();
  return { ok: true };
}

/**
 * Save her calendar's secret iCal address and import it now. The address is only accepted from
 * Google Calendar over https and is never logged or sent anywhere except to that calendar.
 */
export async function connectCalendar(rawUrl: string): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (url.protocol !== "https:" || url.hostname !== "calendar.google.com" || !url.pathname.startsWith("/calendar/ical/")) {
    return { ok: false, error: "invalid_url" };
  }

  const { error: saveError } = await ctx.supabase.from("calendar_feeds").upsert({
    user_id: ctx.userId,
    household_id: ctx.householdId,
    ical_url: url.toString(),
    last_error: null,
  });
  if (saveError) return { ok: false, error: "save_failed" };
  return syncCalendar();
}

/** Re-import the saved calendar. New events are added, changed ones updated, removed ones deleted. */
export async function syncCalendar(): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  const { data: feed } = await ctx.supabase.from("calendar_feeds").select("ical_url").eq("user_id", ctx.userId).maybeSingle();
  if (!feed?.ical_url) return { ok: false, error: "no_calendar" };

  const fail = async (error: string): Promise<Result> => {
    await ctx.supabase.from("calendar_feeds").update({ last_error: error }).eq("user_id", ctx.userId);
    return { ok: false, error };
  };

  let text: string;
  try {
    const res = await fetch(feed.ical_url, { cache: "no-store", signal: AbortSignal.timeout(ICAL_TIMEOUT_MS) });
    if (!res.ok) return fail("fetch_failed");
    text = await res.text();
  } catch {
    return fail("fetch_failed");
  }
  if (text.length > ICAL_MAX_BYTES || !text.includes("BEGIN:VCALENDAR")) return fail("not_a_calendar");

  const events = parseIcal(text);
  const rows = events.map((e) => ({
    household_id: ctx.householdId,
    external_uid: e.uid,
    title: e.summary,
    at: e.start,
    location: e.location,
    source: "ical" as const,
  }));
  if (rows.length > 0) {
    const { error } = await ctx.supabase.from("appointments").upsert(rows, { onConflict: "household_id,external_uid" });
    if (error) return fail("save_failed");
  }

  // Remove imported events that are no longer in the calendar.
  const uids = events.map((e) => e.uid);
  let stale = ctx.supabase.from("appointments").delete().eq("household_id", ctx.householdId).eq("source", "ical");
  if (uids.length > 0) stale = stale.not("external_uid", "in", `(${uids.map((u) => `"${u.replace(/"/g, '\\"')}"`).join(",")})`);
  await stale;

  await ctx.supabase.from("calendar_feeds").update({ last_synced_at: new Date().toISOString(), last_error: null }).eq("user_id", ctx.userId);
  refresh();
  return { ok: true, message: String(events.length) };
}

export async function disconnectCalendar(): Promise<Result> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "not_signed_in" };
  await ctx.supabase.from("calendar_feeds").delete().eq("user_id", ctx.userId);
  await ctx.supabase.from("appointments").delete().eq("household_id", ctx.householdId).eq("source", "ical");
  refresh();
  return { ok: true };
}
