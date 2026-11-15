// Permanent search gate. Real things she would type, in French and in English, must find something useful in the top 5.
// A "useful" result has at least one acceptable name (see tests/search-queries.ts). Run a failing query by hand to see why.
import { describe, expect, it } from "vitest";
import { loadChecks } from "../lib/content/load";
import { normalize, searchHits } from "../lib/check-search";
import { DRINK_QUERIES, EN_QUERIES, EXERCISE_QUERIES, FOOD_QUERIES, MEDICINE_QUERIES, type Q } from "./search-queries";
import type { CheckKind } from "../lib/content/check-types";

const frSets: [CheckKind, Q[]][] = [["foods", FOOD_QUERIES], ["drinks", DRINK_QUERIES], ["exercise", EXERCISE_QUERIES], ["medicines", MEDICINE_QUERIES]];
const enSets = Object.entries(EN_QUERIES) as [CheckKind, Q[]][];

// Things we know the Guide does not cover yet (no verified source). The test lists them so the gap stays visible.
const KNOWN_GAPS = new Set([
  "fr/foods:algues", "fr/foods:nori", "fr/foods:kimchi", "fr/drinks:eau de coco", "fr/medicines:strepsils", "fr/medicines:arnica",
  "fr/medicines:betadine", "fr/medicines:hextril", "fr/medicines:probiotiques", "en/foods:seaweed", "en/foods:kimchi", "en/drinks:coconut water",
]);

function misses(locale: "fr" | "en", sets: [CheckKind, Q[]][]): string[] {
  const out: string[] = [];
  for (const [kind, queries] of sets) {
    const items = loadChecks(locale, kind);
    for (const [q, ...accept] of queries) {
      const hits = searchHits(items, q, 5);
      const names = hits.flatMap((h) => [...h.item.names, h.item.active_ingredient ?? ""]).map(normalize);
      const ok = hits.length > 0 && accept.some((a) => names.some((n) => n.includes(a)));
      if (!ok && !KNOWN_GAPS.has(`${locale}/${kind}:${q}`)) out.push(`${locale}/${kind}: "${q}"`);
    }
  }
  return out;
}

describe("search finds what she types", () => {
  it("French interface: every realistic query finds a useful result", { timeout: 60000 }, () => {
    expect(misses("fr", frSets)).toEqual([]);
  });
  it("English interface: every realistic query finds a useful result", { timeout: 60000 }, () => {
    expect(misses("en", enSets)).toEqual([]);
  });

  it("typos still find the right cheese", () => {
    const items = loadChecks("fr", "foods");
    expect(searchHits(items, "mozarella", 3)[0].matched.toLowerCase()).toContain("mozzarella");
    expect(searchHits(items, "camambert", 3)[0].matched.toLowerCase()).toContain("camembert");
    expect(searchHits(items, "roqfort", 3).length).toBeGreaterThan(0);
  });

  it("typo guesses are hidden when a real match exists", () => {
    const items = loadChecks("fr", "foods");
    expect(searchHits(items, "burrata", 8).every((h) => !/burrito|burlat/i.test(h.matched))).toBe(true);
  });

  it("a result is titled with the name she typed, not another name of the item", () => {
    const items = loadChecks("fr", "foods");
    expect(searchHits(items, "feta", 1)[0].matched).toBe("Feta");
    expect(searchHits(items, "burrata", 1)[0].matched).toBe("Burrata");
    expect(searchHits(items, "ricotta", 1)[0].matched).toBe("Ricotta");
  });

  it("generic words are ignored: 'feta cheese' = 'feta', 'iron tablets' = 'iron'", () => {
    const foods = loadChecks("en", "foods");
    expect(searchHits(foods, "feta cheese", 1)[0].item.id).toBe("feta");
    const meds = loadChecks("en", "medicines");
    expect(searchHits(meds, "iron tablets", 3).map((h) => h.item.id)).toContain("iron-oral");
  });
});

describe("cheese nuance (official French rules: mangerbouger.fr and ameli.fr)", () => {
  const foods = loadChecks("en", "foods");
  const verdict = (id: string, state: string) => foods.find((i) => i.id === id)!.answers.find((a) => a.state === state)?.verdict;

  it("pasteurised fresh cheeses are fine, raw-milk versions are not", () => {
    for (const id of ["feta", "mozzarella-burrata", "goat-cheese-fresh", "fresh-sheep-cheese"]) {
      expect(verdict(id, "pasteurised"), id).toBe("ok");
      expect(verdict(id, "unpasteurised"), id).toBe("avoid");
    }
  });
  it("hard cooked-pressed cheeses are fine even from raw milk", () => {
    for (const id of ["hard-cheese", "comte-fruite", "gruyere-suisse", "emmental-francais"]) {
      expect(verdict(id, "pasteurised"), id).toBe("ok");
      expect(verdict(id, "unpasteurised"), id).toBe("ok");
    }
  });
  it("bagged grated cheese and raw-milk cheese are avoided", () => {
    expect(verdict("grated-cheese-bag", "not_applicable")).toBe("avoid");
    expect(verdict("cheese-raw-milk", "unpasteurised")).toBe("avoid");
    expect(verdict("cheese-raw-milk", "cooked")).toBe("ok");
  });
  it("an item whose answer depends on how it is made offers every case", () => {
    for (const id of ["feta", "mozzarella-burrata"]) expect(foods.find((i) => i.id === id)!.answers.length).toBeGreaterThanOrEqual(2);
  });
});

describe("medicines where official sources disagree say so", () => {
  const meds = loadChecks("en", "medicines");
  it("Spasfon and Smecta are 'careful' with two sources and explain the difference", () => {
    for (const id of ["phloroglucinol", "diosmectite"]) {
      const a = meds.find((i) => i.id === id)!.answers[0];
      expect(a.verdict, id).toBe("careful");
      expect(a.sources.length, id).toBeGreaterThanOrEqual(2);
    }
  });
});
