import { describe, expect, it } from "vitest";
import { parseIcal, zonedToUtcMs } from "../lib/ical";

const NOW = new Date("2026-11-15T10:00:00Z");

describe("zonedToUtcMs", () => {
  it("Paris winter time is UTC+1", () => {
    expect(new Date(zonedToUtcMs(2027, 1, 10, 9, 0, 0, "Europe/Paris")).toISOString()).toBe("2027-01-10T08:00:00.000Z");
  });
  it("Paris summer time is UTC+2", () => {
    expect(new Date(zonedToUtcMs(2027, 7, 10, 9, 0, 0, "Europe/Paris")).toISOString()).toBe("2027-07-10T07:00:00.000Z");
  });
});

describe("parseIcal", () => {
  it("reads UTC, Paris-local and all-day events", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "BEGIN:VEVENT",
      "UID:a1",
      "DTSTART:20261201T090000Z",
      "SUMMARY:Scan\\, 20 weeks",
      "LOCATION:Hopital\\nRoom 3",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:a2",
      "DTSTART;TZID=Europe/Paris:20261203T143000",
      "SUMMARY:Midwife",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:a3",
      "DTSTART;VALUE=DATE:20261210",
      "SUMMARY:Day off",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const events = parseIcal(ics, NOW);
    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({ uid: "a1", start: "2026-12-01T09:00:00.000Z", allDay: false, summary: "Scan, 20 weeks", location: "Hopital\nRoom 3" });
    expect(events[1]).toMatchObject({ uid: "a2", start: "2026-12-03T13:30:00.000Z", summary: "Midwife", location: null });
    expect(events[2]).toMatchObject({ uid: "a3", allDay: true, start: "2026-12-09T23:00:00.000Z" });
  });

  it("unfolds long lines", () => {
    const ics = "BEGIN:VEVENT\r\nUID:x\r\nDTSTART:20261201T090000Z\r\nSUMMARY:Very long\r\n  title\r\nEND:VEVENT";
    expect(parseIcal(ics, NOW)[0].summary).toBe("Very long title");
  });

  it("skips events outside the window and events without UID", () => {
    const ics = [
      "BEGIN:VEVENT", "UID:old", "DTSTART:20200101T090000Z", "END:VEVENT",
      "BEGIN:VEVENT", "DTSTART:20261201T090000Z", "SUMMARY:No uid", "END:VEVENT",
    ].join("\n");
    expect(parseIcal(ics, NOW)).toEqual([]);
  });
});
