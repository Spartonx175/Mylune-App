import { describe, expect, it } from "vitest";

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

// SPEC section 10 palette + AA-safe text variants (see app/globals.css)
const c = {
  bg: "#FFF8F3", surface: "#FFFFFF", soft: "#FDE3D3", ink: "#3B2F2B", urgent: "#C0392B",
  primaryText: "#A04D2E", mutedText: "#73655F", white: "#FFFFFF",
};

describe("WCAG AA text contrast (>= 4.5:1)", () => {
  const pairs: [string, string, string][] = [
    ["ink on bg", c.ink, c.bg], ["ink on surface", c.ink, c.surface], ["ink on soft", c.ink, c.soft],
    ["primary-text on bg", c.primaryText, c.bg], ["primary-text on surface", c.primaryText, c.surface], ["primary-text on soft", c.primaryText, c.soft],
    ["muted-text on bg", c.mutedText, c.bg], ["muted-text on surface", c.mutedText, c.surface], ["muted-text on soft", c.mutedText, c.soft],
    ["urgent on bg", c.urgent, c.bg], ["urgent on surface", c.urgent, c.surface],
    ["white on primary-text (buttons)", c.white, c.primaryText], ["white on urgent", c.white, c.urgent],
  ];
  it.each(pairs)("%s", (_n, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });
});
