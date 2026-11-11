import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { foodFor, loadFood, loadSources, parseFrontmatter } from "../lib/content/load";

const root = path.join(__dirname, "..", "content");

describe("C1 content (urgent + food, EN)", () => {
  const sources = loadSources(root);
  const known = new Set(sources.sources.map((s) => s.id));

  it("sources.yaml loads and every entry is on the allowlist", () => {
    expect(sources.sources.length).toBeGreaterThan(0);
  });

  it("food list loads; avoid/limit items have 2+ allowlisted sources", () => {
    const items = loadFood("en", root);
    expect(items.length).toBeGreaterThan(20);
    for (const i of items) {
      if (i.status !== "eat") expect(i.sources.length).toBeGreaterThanOrEqual(2);
      expect(i.why_fr.startsWith("[FR TODO] ")).toBe(true);
      expect(i.why_fr).toBe(`[FR TODO] ${i.why_en}`);
    }
  });

  it("covers the required topics and toxo filtering", () => {
    const items = loadFood("en", root);
    const ids = items.map((i) => i.id).join(" ");
    for (const w of ["cured", "cheese", "fish", "shellfish", "egg", "liver", "mercury", "alcohol", "sprouts", "produce", "tea", "sushi", "cat-litter", "gardening"]) {
      expect(ids).toContain(w);
    }
    const base = foodFor(items, []).length;
    expect(foodFor(items, ["toxo_non_immune"]).length).toBeGreaterThan(base);
  });

  it("urgent.md: every section cites 2+ known sources, no doses", () => {
    const text = readFileSync(path.join(root, "en", "urgent.md"), "utf8");
    const { data, body } = parseFrontmatter(text, "en/urgent.md");
    for (const id of data.sources as string[]) expect(known.has(id)).toBe(true);
    const sections = body.split(/^## /m).slice(1);
    expect(sections.length).toBeGreaterThan(5);
    for (const s of sections) {
      const m = /^Sources: (.+)$/m.exec(s);
      expect(m, s.split("\n")[0]).not.toBeNull();
      const ids = m![1].split(",").map((x) => x.trim());
      expect(ids.length).toBeGreaterThanOrEqual(2);
      for (const id of ids) expect(known.has(id)).toBe(true);
    }
    for (const n of ["15", "112", "3114"]) expect(body).toContain(n);
    expect(body).not.toMatch(/\b\d+\s?(mg|g|ml|mcg|µg)\b/i);
  });
});
