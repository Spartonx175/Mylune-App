// FR mirror checks (SPEC section 7, CLAUDE.md "EN is authored first; FR must mirror EN keys 1:1").
// Every EN week/symptom/food/calendar file has an FR file that loads for "fr" with the same ids,
// source lists, numeric fields and list lengths. No FR file may keep a "[FR TODO]" placeholder.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCalendar, loadFood, listSymptoms, listWeeks, loadSymptom, loadWeek, parseFrontmatter } from "../lib/content/load";

const ROOT = path.join(process.cwd(), "content");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

describe("French mirror of EN content", () => {
  it("has an FR urgent page with the same sources and review date as EN", () => {
    const fr = path.join(ROOT, "fr", "urgent.md");
    expect(existsSync(fr)).toBe(true);
    const en = parseFrontmatter(readFileSync(path.join(ROOT, "en", "urgent.md"), "utf8"), "en/urgent.md");
    const f = parseFrontmatter(readFileSync(fr, "utf8"), "fr/urgent.md");
    expect(f.data.sources).toEqual(en.data.sources);
    expect(f.data.reviewed).toBe(en.data.reviewed);
    expect(f.body.length).toBeGreaterThan(0);
  });

  it("has an FR week file for every EN week, with the same structure", () => {
    const enWeeks = listWeeks("en");
    expect(enWeeks.length).toBeGreaterThan(0);
    expect(listWeeks("fr")).toEqual(enWeeks);
    for (const sa of enWeeks) {
      const en = loadWeek("en", sa, ROOT);
      const fr = loadWeek("fr", sa, ROOT);
      expect(fr.week_sa, `w${sa} week_sa`).toBe(en.week_sa);
      expect(fr.size_compare, `w${sa} size_compare`).toBe(en.size_compare);
      expect(fr.length_mm, `w${sa} length_mm`).toBe(en.length_mm);
      expect(fr.illustration, `w${sa} illustration`).toBe(en.illustration);
      expect(fr.reviewed, `w${sa} reviewed`).toBe(en.reviewed);
      expect(fr.sources, `w${sa} sources`).toEqual(en.sources);
      expect(fr.baby.length, `w${sa} baby length`).toBe(en.baby.length);
      expect(fr.mother.length, `w${sa} mother length`).toBe(en.mother.length);
      expect(fr.todo.length, `w${sa} todo length`).toBe(en.todo.length);
      expect(fr.tip_of_day.length, `w${sa} tip_of_day length`).toBe(en.tip_of_day.length);
      expect(fr.tip_of_day).toHaveLength(7);
      expect(fr.body.length, `w${sa} body`).toBeGreaterThan(0);
    }
  });

  it("has an FR symptom file for every EN symptom, with the same ids, sources and list lengths", () => {
    const enIds = listSymptoms("en");
    expect(enIds.length).toBeGreaterThan(0);
    expect(listSymptoms("fr")).toEqual(enIds);
    for (const id of enIds) {
      const en = loadSymptom("en", id, ROOT);
      const fr = loadSymptom("fr", id, ROOT);
      expect(fr.id, `${id} id`).toBe(en.id);
      expect(fr.reviewed, `${id} reviewed`).toBe(en.reviewed);
      expect(fr.sources, `${id} sources`).toEqual(en.sources);
      expect(fr.see_a_professional_if.length, `${id} see_a_professional_if length`).toBe(en.see_a_professional_if.length);
      expect(fr.body.length, `${id} body`).toBeGreaterThan(0);
    }
  });

  it("has an FR food list with the same ids, status, conditions and sources, and the same why pair", () => {
    const en = loadFood("en", ROOT);
    const fr = loadFood("fr", ROOT);
    expect(fr.map((i) => i.id)).toEqual(en.map((i) => i.id));
    fr.forEach((f, idx) => {
      const e = en[idx];
      expect(f.status, `${f.id} status`).toBe(e.status);
      expect(f.conditions ?? [], `${f.id} conditions`).toEqual(e.conditions ?? []);
      expect(f.sources, `${f.id} sources`).toEqual(e.sources);
      expect(f.why_fr, `${f.id} why_fr`).toBe(e.why_fr);
      expect(f.why_en, `${f.id} why_en`).toBe(e.why_en);
    });
  });

  it("has an FR follow-up calendar with the same ids, SA windows, sources and unverified flags", () => {
    const en = loadCalendar("en", ROOT);
    const fr = loadCalendar("fr", ROOT);
    expect(fr.map((e) => e.id)).toEqual(en.map((e) => e.id));
    fr.forEach((f, idx) => {
      const e = en[idx];
      expect(f.sa_from, `${f.id} sa_from`).toBe(e.sa_from);
      expect(f.sa_to, `${f.id} sa_to`).toBe(e.sa_to);
      expect(f.sources, `${f.id} sources`).toEqual(e.sources);
      expect(f.unverified ?? false, `${f.id} unverified`).toBe(e.unverified ?? false);
    });
  });

  it("contains no [FR TODO] placeholder in any FR file", () => {
    const frFiles = walk(path.join(ROOT, "fr"));
    expect(frFiles.length).toBeGreaterThan(0);
    for (const file of frFiles) {
      expect(readFileSync(file, "utf8"), path.relative(ROOT, file)).not.toContain("[FR TODO]");
    }
  });
});
