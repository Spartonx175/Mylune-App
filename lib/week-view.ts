// Pure helpers that turn dating + content into what the Today and Baby screens show. No SA maths here (lib/dating.ts only).
import type { CalendarEntry } from "./content/types";

/**
 * Week file to show for `sa`. Null when there is none: no content at all, or her week is beyond the last written week.
 * It never shows a later week in place of hers (that would be a wrong week). Before the first written week, the first one is shown.
 */
export function pickWeek(sa: number, available: number[]): number | null {
  if (available.length === 0) return null;
  const sorted = [...available].sort((a, b) => a - b);
  if (sa > sorted[sorted.length - 1]) return null;
  const past = sorted.filter((w) => w <= sa);
  return past.length ? past[past.length - 1] : sorted[0];
}

/** One tip per day of the week, in order, wrapping if the list is shorter than 7. */
export function tipOfDay(tips: string[], dayInWeek: number): string | null {
  if (tips.length === 0) return null;
  return tips[((dayInWeek % tips.length) + tips.length) % tips.length];
}

export const isNow = (e: CalendarEntry, sa: number): boolean => e.sa_from <= sa && sa <= e.sa_to;

/** Calendar steps to show: those running now first (soonest to finish), then the ones still ahead (soonest to start). */
export function nextSteps(entries: CalendarEntry[], sa: number, limit = 2): CalendarEntry[] {
  return entries
    .filter((e) => e.sa_to >= sa)
    .sort((a, b) => {
      const an = isNow(a, sa);
      const bn = isNow(b, sa);
      if (an !== bn) return an ? -1 : 1;
      return an ? a.sa_to - b.sa_to || a.sa_from - b.sa_from : a.sa_from - b.sa_from || a.sa_to - b.sa_to;
    })
    .slice(0, limit);
}

/** Share of the pregnancy elapsed (0..1) over `totalDays` (default 280 = 40 SA). */
export function progress(daysSinceDdr: number, totalDays = 280): number {
  return Math.min(1, Math.max(0, daysSinceDdr / totalDays));
}
