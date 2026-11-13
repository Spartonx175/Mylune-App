import { describe, expect, it } from "vitest";
import { VERDICT_STYLE } from "../lib/check-style";

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

describe("verdict colours", () => {
  it.each(Object.entries(VERDICT_STYLE))("%s: text on its background passes AA", (_v, s) => {
    expect(contrast(s.text, s.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#3B2F2B", s.bg)).toBeGreaterThanOrEqual(4.5);
  });
});
