import { describe, expect, it } from "vitest";
import { loadChecks } from "../lib/content/load";

// Exercise and drinks checkers are full lists, not 5 to 10 items (Div's brief, 2026-11-14).
describe("checker expansion: exercise and drinks", () => {
  for (const locale of ["en", "fr"] as const) {
    it(`${locale}: exercise has at least 100 activities`, () => {
      expect(loadChecks(locale, "exercise").length).toBeGreaterThanOrEqual(100);
    });
    it(`${locale}: drinks has at least 120 drinks`, () => {
      expect(loadChecks(locale, "drinks").length).toBeGreaterThanOrEqual(120);
    });
  }
  it("no caffeine numbers in any drink answer (Div has not chosen 200 vs 300)", () => {
    for (const locale of ["en", "fr"] as const) {
      for (const i of loadChecks(locale, "drinks")) for (const a of i.answers) expect(a.why, `${locale}/${i.id}`).not.toMatch(/\b\d+\s?mg\b/i);
    }
  });
  it("avoid and careful answers cite at least 2 sources, ok at least 1", () => {
    for (const kind of ["exercise", "drinks"] as const) {
      for (const i of loadChecks("en", kind)) for (const a of i.answers) expect(a.sources.length, `${kind}/${i.id}`).toBeGreaterThanOrEqual(a.verdict === "ok" ? 1 : 2);
    }
  });
});
