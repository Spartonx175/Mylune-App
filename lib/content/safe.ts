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
