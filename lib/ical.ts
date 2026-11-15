// Minimal iCalendar (RFC 5545) reader for appointment import. Pure, no I/O.
// Limits (by design): recurring events import only their first occurrence (no RRULE expansion);
// unknown time zones fall back to Europe/Paris.

export type IcalEvent = {
  uid: string;
  /** ISO timestamp in UTC, or the Paris-midnight instant for all-day events. */
  start: string;
  allDay: boolean;
  summary: string;
  location: string | null;
};

const DAY_MS = 86_400_000;
const PARIS = "Europe/Paris";

/** Offset in ms of `tz` from UTC at instant `ms` (positive east of Greenwich). */
function tzOffsetMs(ms: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms));
  const v = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(v("year"), v("month") - 1, v("day"), v("hour"), v("minute"), v("second"));
  return asUtc - (ms - (ms % 1000));
}

/** Wall-clock time in `tz` to a UTC instant (ms). */
export function zonedToUtcMs(y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string): number {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  const first = guess - tzOffsetMs(guess, tz);
  return guess - tzOffsetMs(first, tz); // second pass handles DST edges
}

function validZone(tz: string | undefined): string {
  if (!tz) return PARIS;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return PARIS;
  }
}

/** Unfold continuation lines (RFC 5545 3.1). */
function unfold(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    if ((raw.startsWith(" ") || raw.startsWith("\t")) && out.length) out[out.length - 1] += raw.slice(1);
    else out.push(raw);
  }
  return out;
}

const unescapeText = (s: string) => s.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1").trim();

type Prop = { name: string; params: Record<string, string>; value: string };

function parseLine(line: string): Prop | null {
  const colon = line.indexOf(":");
  if (colon < 0) return null;
  const [name, ...paramParts] = line.slice(0, colon).split(";");
  const params: Record<string, string> = {};
  for (const p of paramParts) {
    const eq = p.indexOf("=");
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, "");
  }
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

/** Parse DTSTART-style values to { iso, allDay }, or null if unreadable. */
function parseDate(p: Prop): { iso: string; allDay: boolean } | null {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(p.value.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (!m[4]) {
    const ms = zonedToUtcMs(y, mo, d, 0, 0, 0, PARIS);
    return { iso: new Date(ms).toISOString(), allDay: true };
  }
  const [h, mi, s] = [Number(m[4]), Number(m[5]), Number(m[6])];
  const ms = m[7] === "Z" ? Date.UTC(y, mo - 1, d, h, mi, s) : zonedToUtcMs(y, mo, d, h, mi, s, validZone(p.params.TZID));
  return { iso: new Date(ms).toISOString(), allDay: false };
}

/**
 * Events from an .ics file, limited to a window around `now`:
 * 30 days before to 400 days after. Events without UID or start are skipped.
 */
export function parseIcal(text: string, now: Date = new Date()): IcalEvent[] {
  const events: IcalEvent[] = [];
  const min = now.getTime() - 30 * DAY_MS;
  const max = now.getTime() + 400 * DAY_MS;
  let current: Prop[] | null = null;

  for (const line of unfold(text)) {
    const p = parseLine(line);
    if (!p) continue;
    if (p.name === "BEGIN" && p.value.toUpperCase() === "VEVENT") {
      current = [];
    } else if (p.name === "END" && p.value.toUpperCase() === "VEVENT") {
      if (current) {
        const props = current;
        const get = (n: string) => props.find((x) => x.name === n);
        const uid = get("UID")?.value.trim();
        const dtstart = get("DTSTART");
        const start = dtstart ? parseDate(dtstart) : null;
        if (uid && start) {
          const t = Date.parse(start.iso);
          if (t >= min && t <= max) {
            events.push({
              uid,
              start: start.iso,
              allDay: start.allDay,
              summary: unescapeText(get("SUMMARY")?.value ?? "") || "-",
              location: unescapeText(get("LOCATION")?.value ?? "") || null,
            });
          }
        }
      }
      current = null;
    } else if (current) {
      current.push(p);
    }
  }
  return events;
}
