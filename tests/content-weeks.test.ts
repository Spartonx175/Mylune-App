import { describe, expect, it } from "vitest";
import path from "node:path";
import { listWeeks, loadWeek } from "../lib/content/load";

const root = path.join(__dirname, "..", "content");
const SIZES = ["lentil", "blueberry", "raspberry", "olive", "kumquat", "fig", "lime", "plum", "peach", "lemon"];

describe("C1 weeks 6-12 (EN)", () => {
  it("lists weeks 6 to 12", () => {
    expect(listWeeks("en", root)).toEqual([6, 7, 8, 9, 10, 11, 12]);
  });

  for (let sa = 6; sa <= 12; sa++) {
    it(`w${sa}: valid shape, sources, no doses`, () => {
      const w = loadWeek("en", sa, root);
      expect(SIZES).toContain(w.size_compare);
      expect(w.illustration).toBe(`/img/weeks/w${String(sa).padStart(2, "0")}.svg`);
      expect(w.baby.length).toBeGreaterThanOrEqual(3);
      expect(w.baby.length).toBeLessThanOrEqual(5);
      expect(w.mother.length).toBeGreaterThanOrEqual(3);
      expect(w.mother.length).toBeLessThanOrEqual(5);
      expect(w.tip_of_day).toHaveLength(7);
      expect(w.sources.length).toBeGreaterThanOrEqual(2);
      expect(w.body.split(/\n\n/).length).toBeGreaterThanOrEqual(2);
      const all = [...w.baby, ...w.mother, ...w.todo, ...w.tip_of_day, w.body].join("\n");
      expect(all).not.toMatch(/\b\d+\s?(mg|g|ml|mcg|µg|micrograms?)\b/i);
    });
  }

  it("lengths grow week over week", () => {
    const l = listWeeks("en", root).map((s) => loadWeek("en", s, root).length_mm);
    expect([...l].sort((a, b) => a - b)).toEqual(l);
  });
});
