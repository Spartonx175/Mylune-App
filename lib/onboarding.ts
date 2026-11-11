// Pure validation for the onboarding form. Mirrors the checks in complete_onboarding() (supabase/migrations/0001_init.sql),
// which remain the source of truth. This is not date-of-pregnancy logic: SA/due-date maths lives in lib/dating.ts (B3).

export type OnboardingInput = {
  locale: string;
  ddr: string;
  dueDateOverride: string;
  maternityName: string;
  maternityPhone: string;
};

export type OnboardingErrors = { ddr?: "required" | "future" | "old"; due?: "invalid" };

export type OnboardingValue = {
  locale: "fr" | "en";
  ddr: string;
  dueDateOverride: string | null;
  maternityName: string | null;
  maternityPhone: string | null;
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

const dayNumber = (iso: string): number | null => {
  if (!ISO.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  // Reject impossible dates such as 2026-02-31.
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) return null;
  return Math.round(t / 86_400_000);
};

/** Today's calendar date in Europe/Paris as YYYY-MM-DD. */
export const todayInParis = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(now);

export function parseOnboarding(
  input: OnboardingInput,
  today: string = todayInParis(),
): { ok: true; value: OnboardingValue } | { ok: false; errors: OnboardingErrors } {
  const errors: OnboardingErrors = {};
  const t = dayNumber(today)!;

  const ddr = dayNumber(input.ddr.trim());
  if (ddr === null) errors.ddr = "required";
  else if (ddr > t) errors.ddr = "future";
  else if (ddr < t - 300) errors.ddr = "old";

  const dueRaw = input.dueDateOverride.trim();
  if (dueRaw) {
    const due = dayNumber(dueRaw);
    if (due === null || due < t - 30 || due > t + 330) errors.due = "invalid";
  }

  if (errors.ddr || errors.due) return { ok: false, errors };

  const clean = (s: string) => s.trim().slice(0, 120) || null;
  return {
    ok: true,
    value: {
      locale: input.locale === "en" ? "en" : "fr",
      ddr: input.ddr.trim(),
      dueDateOverride: dueRaw || null,
      maternityName: clean(input.maternityName),
      maternityPhone: clean(input.maternityPhone),
    },
  };
}
