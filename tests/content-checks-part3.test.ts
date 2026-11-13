import { describe, expect, it } from "vitest";
import { loadChecks } from "../lib/content/load";

describe("checker part 3: medicines", () => {
  const items = loadChecks("en", "medicines");
  it("covers at least 40 medicines", () => expect(items.length).toBeGreaterThanOrEqual(40));
  it("every answer points to a pharmacist or doctor", () => {
    for (const i of items) for (const a of i.answers) expect(a.why, i.id).toMatch(/pharmacist or doctor\.$/);
  });
  it("every medicine has an active ingredient and at least 2 sources", () => {
    for (const i of items) {
      expect(i.active_ingredient, i.id).toBeTruthy();
      for (const a of i.answers) expect(a.sources.length, i.id).toBeGreaterThanOrEqual(2);
    }
  });
  it("NSAIDs state the 24-week rule", () => {
    for (const id of ["ibuprofen", "aspirin", "diclofenac", "other-nsaids"]) {
      const a = items.find((i) => i.id === id)!.answers[0];
      expect(a.verdict).toBe("avoid");
      expect(a.why).toMatch(/24 weeks/);
    }
  });
});

describe("checker part 3: exercise", () => {
  const items = loadChecks("en", "exercise");
  it("covers at least 25 activities", () => expect(items.length).toBeGreaterThanOrEqual(25));
  it("avoid and careful answers cite 2 sources", () => {
    for (const i of items) for (const a of i.answers) if (a.verdict !== "ok") expect(a.sources.length, i.id).toBeGreaterThanOrEqual(2);
  });
});
