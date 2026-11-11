import { describe, expect, it } from "vitest";
import path from "node:path";
import { listSymptoms, loadCalendar, loadSymptom } from "../lib/content/load";
import { ContentError } from "../lib/content/types";

const fixtures = path.join(__dirname, "fixtures", "content");
const bad = path.join(__dirname, "fixtures", "content-bad");
const real = path.join(__dirname, "..", "content");

describe("symptom loader", () => {
  it("lists and loads fixtures", () => {
    expect(listSymptoms("en", fixtures)).toEqual(["mood", "nausea"]);
    expect(listSymptoms("fr", fixtures)).toEqual([]);
    const s = loadSymptom("en", "nausea", fixtures);
    expect(s.sources).toEqual(["src-a", "src-b"]);
    expect(s.see_a_professional_if).toHaveLength(1);
    expect(s.body).toBe("Eat small meals.");
  });

  it("rejects one source, a dose, and an empty see_a_professional_if list", () => {
    expect(() => loadSymptom("en", "nausea", bad)).toThrow(/at least 2/);
    expect(() => loadSymptom("en", "mood", bad)).toThrow(/dose/);
    expect(() => loadSymptom("en", "cramps", bad)).toThrow(ContentError);
  });

  it("rejects a missing file", () => {
    expect(() => loadSymptom("en", "nope", fixtures)).toThrow(ContentError);
  });
});

describe("calendar loader", () => {
  it("loads fixtures, allowing an unverified entry with no sources", () => {
    const c = loadCalendar("en", fixtures);
    expect(c.map((e) => e.id)).toEqual(["declaration", "maternity-registration"]); // sorted by sa_from, stable
    expect(c[1].unverified).toBe(true);
  });

  it("rejects a backwards SA window", () => {
    expect(() => loadCalendar("en", bad)).toThrow(/sa_from/);
  });
});

describe("real C1 slice 2 content", () => {
  it("has the six first-trimester symptoms, each with 2+ sources", () => {
    expect(listSymptoms("en", real)).toEqual(["breast-tenderness", "constipation", "cramps", "fatigue", "mood", "nausea"]);
    for (const id of listSymptoms("en", real)) {
      const s = loadSymptom("en", id, real);
      expect(s.sources.length).toBeGreaterThanOrEqual(2);
      expect(s.see_a_professional_if.length).toBeGreaterThan(0);
    }
  });

  it("calendar loads, covers the required steps, and unverified entries are flagged", () => {
    const c = loadCalendar("en", real);
    const ids = c.map((e) => e.id).join(" ");
    for (const w of ["declaration", "consultation-1", "consultation-7", "echo-1", "echo-2", "echo-3", "prenatal-interview", "maternity-registration"]) {
      expect(ids).toContain(w);
    }
    expect(c.filter((e) => e.id.startsWith("consultation-"))).toHaveLength(7);
    expect(c.map((e) => e.sa_from)).toEqual([...c.map((e) => e.sa_from)].sort((a, b) => a - b));
    expect(c.find((e) => e.id === "maternity-registration")?.unverified).toBe(true);
    for (const e of c) if (!e.unverified) expect(e.sources.length).toBeGreaterThanOrEqual(1);
  });
});
