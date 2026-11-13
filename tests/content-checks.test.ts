import { describe, expect, it, afterAll } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { loadChecks, loadSources } from "../lib/content/load";

const realRoot = path.join(__dirname, "..", "content");
const tmp: string[] = [];
afterAll(() => tmp.forEach((d) => rmSync(d, { recursive: true, force: true })));

const SOURCES = `allowed_domains: [ameli.fr]
sources:
  - {id: s1, name: ameli, url: "https://www.ameli.fr/a", title: A, accessed: 2026-11-13}
  - {id: s2, name: ameli, url: "https://www.ameli.fr/b", title: B, accessed: 2026-11-13}
`;

/** Build a throwaway content root holding one check file. */
function fixture(yaml: string): string {
  const root = mkdtempSync(path.join(tmpdir(), "mylune-check-"));
  tmp.push(root);
  mkdirSync(path.join(root, "en", "check"), { recursive: true });
  writeFileSync(path.join(root, "sources.yaml"), SOURCES);
  writeFileSync(path.join(root, "en", "check", "foods.yaml"), yaml);
  return root;
}
const item = (over: string) => `- id: x
  category: meat
  names: [Steak]
  reviewed: 2026-11-13
  answers:
    - state: cooked
      verdict: ok
      why: Fine when cooked through.
      sources: [s1]
${over}`;

describe("loadChecks (fixtures)", () => {
  it("accepts a valid file", () => {
    expect(loadChecks("en", "foods", fixture(item(""))).map((i) => i.id)).toEqual(["x"]);
  });
  it("rejects duplicate ids", () => {
    expect(() => loadChecks("en", "foods", fixture(item("") + item("")))).toThrow(/duplicate id/);
  });
  it("rejects unknown category, state and verdict", () => {
    expect(() => loadChecks("en", "foods", fixture(item("").replace("meat", "candy")))).toThrow(/category/);
    expect(() => loadChecks("en", "foods", fixture(item("").replace("state: cooked", "state: fried")))).toThrow(/state/);
    expect(() => loadChecks("en", "foods", fixture(item("").replace("verdict: ok", "verdict: maybe")))).toThrow(/verdict/);
  });
  it("rejects unknown source ids", () => {
    expect(() => loadChecks("en", "foods", fixture(item("").replace("[s1]", "[nope]")))).toThrow(/unknown source/);
  });
  it("needs 2 sources for avoid and careful, 1 for ok", () => {
    expect(() => loadChecks("en", "foods", fixture(item("").replace("verdict: ok", "verdict: avoid")))).toThrow(/at least 2/);
    expect(() => loadChecks("en", "foods", fixture(item("").replace("verdict: ok", "verdict: careful")))).toThrow(/at least 2/);
    expect(loadChecks("en", "foods", fixture(item("").replace("verdict: ok", "verdict: avoid").replace("[s1]", "[s1, s2]")))).toHaveLength(1);
  });
  it("rejects empty why, empty names, doses and repeated states", () => {
    expect(() => loadChecks("en", "foods", fixture(item("").replace("Fine when cooked through.", '""')))).toThrow(/why/);
    expect(() => loadChecks("en", "foods", fixture(item("").replace("[Steak]", "[]")))).toThrow(/names/);
    expect(() => loadChecks("en", "foods", fixture(item("").replace("Fine when cooked through.", "Take 500 mg.")))).toThrow(/dose/);
    const twice = item("").replace("sources: [s1]", "sources: [s1]\n    - state: cooked\n      verdict: ok\n      why: Again.\n      sources: [s1]");
    expect(() => loadChecks("en", "foods", fixture(twice))).toThrow(/duplicate state/);
  });
  it("rejects a missing file", () => {
    expect(() => loadChecks("en", "drinks", fixture(item("")))).toThrow(/Missing content file/);
  });
});

describe("content/en/check/foods.yaml", () => {
  const items = loadChecks("en", "foods", realRoot);
  const known = new Set(loadSources(realRoot).sources.map((s) => s.id));

  it("covers at least 60 foods, each with answers and French-market names", () => {
    expect(items.length).toBeGreaterThanOrEqual(60);
    for (const i of items) expect(i.answers.length).toBeGreaterThan(0);
  });
  it("covers the key foods from the brief by name", () => {
    const all = items.flatMap((i) => i.names.map((n) => n.toLowerCase()));
    for (const n of ["steak haché", "steak tartare", "carpaccio", "magret", "foie gras", "rillettes", "saucisson sec", "merguez", "kebab", "saumon fumé", "sushi", "huîtres", "surimi", "tarama", "mayonnaise", "tiramisu", "camembert", "roquefort", "comté", "burrata", "raclette", "reblochon", "fondue", "croque-monsieur", "quiche", "pizza"]) {
      expect(all, n).toContain(n);
    }
  });
  it("every cited source exists", () => {
    for (const i of items) for (const a of i.answers) for (const s of a.sources) expect(known.has(s)).toBe(true);
  });
  it("raw/rare meat and cured meat are explicit avoids", () => {
    const get = (id: string, state: string) => items.find((i) => i.id === id)?.answers.find((a) => a.state === state)?.verdict;
    expect(get("steak-tartare", "raw")).toBe("avoid");
    expect(get("beef-steak", "undercooked")).toBe("avoid");
    expect(get("saucisson-sec", "cured")).toBe("avoid");
    expect(get("jambon-cru", "cured")).toBe("avoid");
    expect(get("smoked-salmon", "cured")).toBe("avoid");
  });
  it("carries no personal details", () => {
    expect(JSON.stringify(items)).not.toMatch(/\b(she|her|wife|Div)\b/);
  });
});
