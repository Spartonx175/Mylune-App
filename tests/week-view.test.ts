import { describe, expect, it } from "vitest";
import { isNow, nextSteps, pickWeek, progress, tipOfDay } from "../lib/week-view";
import type { CalendarEntry } from "../lib/content/types";

const e = (id: string, from: number, to: number): CalendarEntry => ({ id, sa_from: from, sa_to: to, title: id, description: "", sources: ["s"] });

describe("pickWeek", () => {
  it("returns the latest available week not after sa", () => {
    expect(pickWeek(9, [6, 7, 8, 9, 10])).toBe(9);
    expect(pickWeek(13, [6, 7, 12])).toBe(12);
  });
  it("falls back to the first week when sa is before the content, and null when empty", () => {
    expect(pickWeek(4, [6, 7])).toBe(6);
    expect(pickWeek(6, [])).toBeNull();
  });
});

describe("tipOfDay", () => {
  it("cycles through the tips by day", () => {
    const tips = ["a", "b", "c"];
    expect([0, 1, 2, 3, 4].map((d) => tipOfDay(tips, d))).toEqual(["a", "b", "c", "a", "b"]);
    expect(tipOfDay([], 2)).toBeNull();
  });
});

describe("nextSteps", () => {
  const list = [e("late", 30, 34), e("now-long", 6, 14), e("now-short", 11, 13), e("past", 1, 5)];
  it("drops finished steps, puts current ones first, then upcoming by start", () => {
    expect(nextSteps(list, 12, 5).map((x) => x.id)).toEqual(["now-short", "now-long", "late"]);
    expect(nextSteps([e("up", 11, 13), e("cur", 6, 14)], 6, 5).map((x) => x.id)).toEqual(["cur", "up"]);
  });
  it("respects the limit and isNow", () => {
    expect(nextSteps(list, 12, 1)).toHaveLength(1);
    expect(isNow(list[1], 12)).toBe(true);
    expect(isNow(list[0], 12)).toBe(false);
  });
});

describe("progress", () => {
  it("is clamped to 0..1", () => {
    expect(progress(-3)).toBe(0);
    expect(progress(140)).toBe(0.5);
    expect(progress(999)).toBe(1);
  });
});
