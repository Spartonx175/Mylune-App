import { describe, expect, it } from "vitest";
import path from "node:path";
import { loadChecks } from "../lib/content/load";

// Audit guard: items must not share an identical `why` (copy-pasted class wording can be wrong for the item).
// Scope: the animal-food categories that were audited one by one. Categories are added here as each audit lands.
const AUDITED = ["meat", "charcuterie", "fish", "seafood", "egg", "dairy"];
// Explicit allow-list of why texts that may be shared, as "locale|exact why". Keep empty unless a shared text is truly item-neutral.
const ALLOWED_SHARED: string[] = [];

const realRoot = path.join(__dirname, "..", "content");

describe.each(["en", "fr"] as const)("foods: no duplicated why (%s)", (locale) => {
  it("no two audited items share the same why text", () => {
    const seen = new Map<string, string[]>();
    for (const item of loadChecks(locale, "foods", realRoot)) {
      if (!AUDITED.includes(item.category)) continue;
      for (const a of item.answers) {
        const key = a.why;
        seen.set(key, [...(seen.get(key) ?? []), `${item.id}/${a.state}`]);
      }
    }
    const dups = [...seen.entries()].filter(([why, ids]) => new Set(ids.map((x) => x.split("/")[0])).size > 1 && !ALLOWED_SHARED.includes(`${locale}|${why}`));
    if (dups.length) {
      console.log(`Duplicate why texts (${locale}):\n` + dups.map(([why, ids]) => `- ${ids.join(", ")}\n    ${why}`).join("\n"));
    }
    expect(dups.length, `${dups.length} duplicated why texts`).toBe(0);
  });
});
