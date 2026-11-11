import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CATS, COATS, DEFAULT_CAT, TINTS, isCat } from "../lib/cats";
import en from "../content/en/ui.json";
import fr from "../content/fr/ui.json";

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const INK = "#3B2F2B", PRIMARY_TEXT = "#A04D2E", MUTED_TEXT = "#73655F";

describe("companion cats", () => {
  it("has three cats and a valid default", () => {
    expect(CATS).toHaveLength(3);
    expect(isCat(DEFAULT_CAT)).toBe(true);
    expect(isCat("dog")).toBe(false);
    expect(isCat(undefined)).toBe(false);
  });

  it.each(CATS)("%s: photo exists and text on its soft tint passes AA", (cat) => {
    expect(existsSync(path.join(__dirname, "..", "public", "cats", `${cat}.webp`))).toBe(true);
    const { soft } = TINTS[cat];
    for (const fg of [INK, PRIMARY_TEXT, MUTED_TEXT]) expect(contrast(fg, soft)).toBeGreaterThanOrEqual(4.5);
  });

  it("tints in lib/cats.ts match app/globals.css", () => {
    const css = readFileSync(path.join(__dirname, "..", "app", "globals.css"), "utf8").toLowerCase();
    for (const cat of CATS.filter((c) => c !== "ginger")) {
      expect(css).toContain(`html[data-cat="${cat}"]`);
      expect(css).toContain(TINTS[cat].soft);
      expect(css).toContain(TINTS[cat].accent);
    }
  });

  it("every cat has a coat palette and a name in both languages", () => {
    for (const cat of CATS) {
      expect(COATS[cat].body).toMatch(/^#[0-9a-f]{6}$/);
      expect(en.cats.names[cat]).toBeTruthy();
      expect(fr.cats.names[cat]).toBeTruthy();
    }
  });
});
