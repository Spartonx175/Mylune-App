import { describe, expect, it } from "vitest";
import { badgeFor, countsPerDay, dailySeries, lastDays, parisDay, trendSlope } from "../lib/track";

describe("parisDay", () => {
  it("uses the Paris date, so 23:30 UTC is the next day in Paris", () => {
    expect(parisDay("2026-11-15T23:30:00Z")).toBe("2026-11-16");
    expect(parisDay("2026-11-15T10:00:00Z")).toBe("2026-11-15");
  });
});

describe("lastDays and counts", () => {
  it("returns n days oldest first", () => {
    expect(lastDays("2026-11-02", 3)).toEqual(["2026-10-31", "2026-11-01", "2026-11-02"]);
  });
  it("counts per Paris day and fills gaps with zero", () => {
    const counts = countsPerDay(["2026-11-15T08:00:00Z", "2026-11-15T20:00:00Z", "2026-11-13T09:00:00Z"]);
    expect(dailySeries(lastDays("2026-11-15", 3), counts)).toEqual([
      { label: "2026-11-13", value: 1 },
      { label: "2026-11-14", value: 0 },
      { label: "2026-11-15", value: 2 },
    ]);
  });
});

describe("badgeFor", () => {
  it("returns the highest badge reached", () => {
    expect(badgeFor(0)).toBeNull();
    expect(badgeFor(4)).toBeNull();
    expect(badgeFor(5)).toBe(5);
    expect(badgeFor(25)).toBe(20);
    expect(badgeFor(99)).toBe(40);
  });
});

describe("trendSlope", () => {
  it("is positive for a rising series and zero when flat", () => {
    expect(trendSlope([60, 60.5, 61, 61.5])).toBeCloseTo(0.5, 5);
    expect(trendSlope([60, 60, 60])).toBe(0);
    expect(trendSlope([60])).toBe(0);
  });
});
