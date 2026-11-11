// Pregnancy dating (SPEC section 2). The ONLY place SA / due-date maths is allowed (CLAUDE.md).
// Pure functions on plain calendar dates ("YYYY-MM-DD"), no timezone inside: callers pass `today`
// (use todayInParis() from lib/onboarding.ts, Europe/Paris).
//
// SA = semaines d'amenorrhee, counted from the first day of the last period (DDR).
// A due date from a dating scan or from the IVF clinic overrides the DDR: it fixes the 40 SA date,
// and the equivalent DDR is then due date - 280 days.

export type Dating = {
  /** Where the dating comes from. "due_date" = scan or clinic due date overriding the DDR. */
  source: "ddr" | "due_date";
  /** DDR used for counting (equivalent DDR when a due date overrides). */
  ddr: string;
  /** Days since the (equivalent) DDR. */
  daysSinceDdr: number;
  /** SA, day-level: "5 SA + 1 j". */
  sa: { weeks: number; days: number };
  /** French phrasing: "in the 6th week" = sa.weeks + 1. */
  weekOrdinal: number;
  /** Weeks of pregnancy (SG) = SA - 2, never below 0. */
  sg: number;
  /** 40 SA (international due date). */
  dueDate40: string;
  /** 41 SA (French "terme"). */
  term41: string;
  /** Days left until 40 SA (negative once past). */
  daysToDue40: number;
  /** Window of the first-trimester dating scan, 11 SA + 0 to 13 SA + 6. */
  datingScanWindow: { from: string; to: string };
  trimester: 1 | 2 | 3;
};

export type DatingInput = {
  ddr: string;
  dueDateOverride?: string | null;
  today: string;
};

export type DatingResult = { ok: true; value: Dating } | { ok: false; error: "invalid_date" | "before_ddr" | "too_far" };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 86_400_000;

function toDay(iso: string): number | null {
  if (!ISO.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
  return Math.round(t / DAY);
}

const fromDay = (n: number): string => new Date(n * DAY).toISOString().slice(0, 10);

/** Add days to an ISO date. Exported for callers that need calendar offsets (never SA maths). */
export function addDays(iso: string, days: number): string | null {
  const d = toDay(iso);
  return d === null ? null : fromDay(d + days);
}

/** First trimester ends at 13 SA + 6, second at 27 SA + 6 (France: 3 trimesters of ~13 SA). */
const trimesterOf = (days: number): 1 | 2 | 3 => (days < 14 * 7 ? 1 : days < 28 * 7 ? 2 : 3);

export function computeDating({ ddr, dueDateOverride, today }: DatingInput): DatingResult {
  const t = toDay(today);
  const ddrDay = toDay(ddr);
  const overrideDay = dueDateOverride ? toDay(dueDateOverride) : null;
  if (t === null || ddrDay === null || (dueDateOverride && overrideDay === null)) {
    return { ok: false, error: "invalid_date" };
  }

  const usesDueDate = overrideDay !== null;
  const startDay = usesDueDate ? overrideDay - 280 : ddrDay;
  const daysSince = t - startDay;
  if (daysSince < 0) return { ok: false, error: "before_ddr" };
  if (daysSince > 300) return { ok: false, error: "too_far" };

  const weeks = Math.floor(daysSince / 7);
  const days = daysSince % 7;
  const due40 = startDay + 280;

  return {
    ok: true,
    value: {
      source: usesDueDate ? "due_date" : "ddr",
      ddr: fromDay(startDay),
      daysSinceDdr: daysSince,
      sa: { weeks, days },
      weekOrdinal: weeks + 1,
      sg: Math.max(0, weeks - 2),
      dueDate40: fromDay(due40),
      term41: fromDay(due40 + 7),
      daysToDue40: due40 - t,
      datingScanWindow: { from: fromDay(startDay + 11 * 7), to: fromDay(startDay + 13 * 7 + 6) },
      trimester: trimesterOf(daysSince),
    },
  };
}

/** Date on which a given SA + days is reached, e.g. dateAtSa(dating, 20, 0) for the mid-pregnancy scan. */
export function dateAtSa(dating: Pick<Dating, "ddr">, weeks: number, days = 0): string {
  const start = toDay(dating.ddr);
  if (start === null) throw new Error("invalid ddr");
  return fromDay(start + weeks * 7 + days);
}
