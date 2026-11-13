import { describe, expect, it } from "vitest";
import path from "node:path";
import { loadChecks } from "../lib/content/load";
import type { CheckKind } from "../lib/content/check-types";

// French checker files must mirror the English ones 1:1 (CLAUDE.md: FR mirrors EN keys).
const realRoot = path.join(__dirname, "..", "content");
const KINDS = ["foods", "drinks"] as const satisfies readonly CheckKind[];

describe.each(KINDS)("checker FR mirrors EN: %s", (kind) => {
  const en = loadChecks("en", kind, realRoot);
  const fr = loadChecks("fr", kind, realRoot);

  it("loads with the same ids in the same order", () => {
    expect(fr.map((i) => i.id)).toEqual(en.map((i) => i.id));
  });

  it.each(en.map((e) => e.id))("%s: structure matches EN", (id) => {
    const e = en.find((x) => x.id === id)!;
    const f = fr.find((x) => x.id === id)!;
    expect(f.category).toBe(e.category);
    expect(f.tips ?? []).toEqual(e.tips ?? []);
    expect(f.local ?? false).toBe(e.local ?? false);
    expect(f.reviewed).toBe(e.reviewed);
    expect(f.answers.map((a) => [a.state, a.verdict, a.sources])).toEqual(e.answers.map((a) => [a.state, a.verdict, a.sources]));
  });

  it.each(en.map((e) => e.id))("%s: French names and why, English name kept last", (id) => {
    const e = en.find((x) => x.id === id)!;
    const f = fr.find((x) => x.id === id)!;
    expect(f.names.length).toBeGreaterThan(0);
    expect(f.names.every((n) => n.trim().length > 0)).toBe(true);
    expect(f.names[f.names.length - 1]).toBe(e.names[0]);
    for (const [i, a] of f.answers.entries()) {
      expect(a.why.trim().length, `${id}/${a.state} why`).toBeGreaterThan(0);
      expect(a.why, `${id}/${a.state} why is still English`).not.toBe(e.answers[i].why);
    }
  });
});
