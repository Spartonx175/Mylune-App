// Pure helpers for the health log and quiz. No I/O, so they are unit-tested.

export const PARIS = "Europe/Paris";

/** YYYY-MM-DD for an instant, in Paris time. */
export function parisDay(iso: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PARIS, year: "numeric", month: "2-digit", day: "2-digit" }).format(
    typeof iso === "string" ? new Date(iso) : iso,
  );
}

/** The last `n` days ending at `today` (YYYY-MM-DD), oldest first. */
export function lastDays(today: string, n: number): string[] {
  const out: string[] = [];
  const base = Date.parse(`${today}T12:00:00Z`);
  for (let i = n - 1; i >= 0; i--) out.push(new Date(base - i * 86_400_000).toISOString().slice(0, 10));
  return out;
}

/** Events per Paris day, from logged_at timestamps. */
export function countsPerDay(loggedAt: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const iso of loggedAt) {
    const d = parisDay(iso);
    m.set(d, (m.get(d) ?? 0) + 1);
  }
  return m;
}

export type Point = { label: string; value: number };

/** One point per day, zero where nothing was logged. */
export function dailySeries(days: string[], counts: Map<string, number>): Point[] {
  return days.map((d) => ({ label: d, value: counts.get(d) ?? 0 }));
}

/** Badges are celebrations only (SPEC section 14): no streaks, no penalties. */
export const BADGE_STEPS = [5, 10, 20, 40] as const;
export function badgeFor(points: number): (typeof BADGE_STEPS)[number] | null {
  let best: (typeof BADGE_STEPS)[number] | null = null;
  for (const step of BADGE_STEPS) if (points >= step) best = step;
  return best;
}

/** Least-squares slope per point. 0 when flat or too few points. */
export function trendSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xm = (n - 1) / 2;
  const ym = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  values.forEach((y, x) => {
    num += (x - xm) * (y - ym);
    den += (x - xm) ** 2;
  });
  return den === 0 ? 0 : num / den;
}

/** Mood scale and symptom keys. Kept here (not in the server-actions file, which may only export async functions). */
export const MOOD_LEVELS = [1, 2, 3, 4, 5] as const;
export const SYMPTOM_KEYS = ["nausea", "tired", "headache", "back_pain", "heartburn", "swelling", "poor_sleep"] as const;
