import { describe, expect, it } from "vitest";
import path from "node:path";
import { foodFor, listWeeks, loadFood, loadSources, loadWeek, parseFrontmatter } from "../lib/content/load";
import { ContentError } from "../lib/content/types";

const root = path.join(__dirname, "fixtures", "content");

describe("content loader", () => {
  it("loads the real sources.yaml (allowlist and entries)", () => {
    const s = loadSources(path.join(__dirname, "..", "content"));
    expect(s.allowed_domains).toContain("ameli.fr");
    expect(s.sources.length).toBeGreaterThan(0);
  });

  it("loads a week file with typed fields and body", () => {
    const w = loadWeek("en", 6, root);
    expect(w.week_sa).toBe(6);
    expect(w.tip_of_day).toHaveLength(7);
    expect(w.sources).toEqual(["src-a"]);
    expect(w.body).toBe("Body text.");
    expect(listWeeks("en", root)).toEqual([6]);
    expect(listWeeks("fr", root)).toEqual([]);
  });

  it("rejects a week citing an unknown source", () => {
    expect(() => parseAndCheckUnknown()).toThrow(ContentError);
  });

  it("loads food and filters by conditions (toxo non-immune)", () => {
    const items = loadFood("en", root);
    expect(items).toHaveLength(3);
    expect(foodFor(items, []).map((i) => i.id)).toEqual(["soft-cheese", "cooked-fish"]);
    expect(foodFor(items, ["toxo_non_immune"]).map((i) => i.id)).toEqual(["raw-ham", "soft-cheese", "cooked-fish"]);
  });

  it("food avoid with a single source is rejected (needs 2)", () => {
    expect(() => loadFood("en", path.join(__dirname, "fixtures", "content-bad"))).toThrow(/at least 2/);
  });

  it("missing files raise ContentError", () => {
    expect(() => loadWeek("en", 7, root)).toThrow(ContentError);
    expect(() => loadFood("fr", root)).toThrow(ContentError);
  });

  it("frontmatter parser needs a frontmatter block", () => {
    expect(() => parseFrontmatter("no frontmatter", "x")).toThrow(ContentError);
    expect(parseFrontmatter("---\na: 1\n---\nhi", "x")).toEqual({ data: { a: 1 }, body: "hi" });
  });
});

// A week whose sources point at an id missing from sources.yaml must fail validation.
function parseAndCheckUnknown() {
  const bad = path.join(__dirname, "fixtures", "content-bad");
  return loadWeek("en", 6, bad);
}
