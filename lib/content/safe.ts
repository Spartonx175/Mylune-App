// Screens never crash on missing content: if the French file is not there yet, show the English one and say so.
import { listWeeks, loadCalendar, loadWeek } from "./load";
import type { CalendarEntry, Locale, WeekFile } from "./types";

export type WithFallback<T> = { data: T; fallback: boolean };

export function weekOrFallback(locale: Locale, sa: number): WithFallback<WeekFile> | null {
  try {
    return { data: loadWeek(locale, sa), fallback: false };
  } catch {
    if (locale === "en") return null;
    try {
      return { data: loadWeek("en", sa), fallback: true };
    } catch {
      return null;
    }
  }
}

export function availableWeeks(locale: Locale): number[] {
  const own = listWeeks(locale);
  return own.length ? own : listWeeks("en");
}

export function calendarOrFallback(locale: Locale): WithFallback<CalendarEntry[]> {
  try {
    return { data: loadCalendar(locale), fallback: false };
  } catch {
    try {
      return { data: loadCalendar("en"), fallback: locale !== "en" };
    } catch {
      return { data: [], fallback: false };
    }
  }
}

import { loadChecks } from "./load";
import type { CheckItem, CheckKind } from "./check-types";

/** Checker list for a kind. Missing French file falls back to English; missing everything gives an empty list. */
const checkCache = new Map<string, WithFallback<CheckItem[]>>();

/** Checker list for a kind (parsed once per server process: the lists are large). Missing French file falls back to English. */
export function checksOrFallback(locale: Locale, kind: CheckKind): WithFallback<CheckItem[]> {
  const key = `${locale}:${kind}`;
  const hit = checkCache.get(key);
  if (hit) return hit;
  let out: WithFallback<CheckItem[]>;
  try {
    out = { data: loadChecks(locale, kind), fallback: false };
  } catch {
    if (locale === "en") out = { data: [], fallback: false };
    else {
      try {
        out = { data: loadChecks("en", kind), fallback: true };
      } catch {
        out = { data: [], fallback: false };
      }
    }
  }
  // Do not cache failures: content may be fixed without a restart in development.
  if (out.data.length > 0 && process.env.NODE_ENV === "production") checkCache.set(key, out);
  return out;
}
