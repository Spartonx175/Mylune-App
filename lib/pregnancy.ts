import { computeDating, type Dating } from "./dating";
import { todayInParis } from "./onboarding";
import type { Session } from "./session";

/** Dating for the signed-in user from the saved profile, or null when dates are missing or out of range. */
export function datingFromSession(session: Session): Dating | null {
  const p = session.configured ? session.profile : null;
  if (!p?.ddr) return null;
  const r = computeDating({ ddr: p.ddr, dueDateOverride: p.due_date_override, today: todayInParis() });
  return r.ok ? r.value : null;
}

/** "2027-07-13" -> "13 juillet 2027" (plain calendar date, no timezone shift). */
export const formatDate = (iso: string, locale: string, style: "long" | "medium" = "long"): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: style, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
