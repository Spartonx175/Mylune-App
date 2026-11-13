// Verdict colours. Never colour alone: every verdict also has an icon and a word. Text pairs are checked in tests/check-style.test.ts.
import type { Verdict } from "./content/check-types";

export const VERDICT_STYLE: Record<Verdict, { bg: string; border: string; text: string }> = {
  ok: { bg: "#e4f2e4", border: "#2f7d3a", text: "#1f5e29" },
  careful: { bg: "#fff0c2", border: "#a66a00", text: "#6b4300" },
  avoid: { bg: "#fbe3df", border: "#c0392b", text: "#8f2a1f" },
};
