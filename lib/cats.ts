// The household cats. Companion cat = a per-device choice (cookie) that picks the mascot and a soft colour tint.
// Only decorative colours change; text colours stay AA-safe (tests/cats.test.ts checks every tint against the text colours).

export const CATS = ["ginger", "tabby", "birman"] as const;
export type CatId = (typeof CATS)[number];

export const DEFAULT_CAT: CatId = "ginger";
export const CAT_COOKIE = "mylune_cat";

export const isCat = (v: unknown): v is CatId => typeof v === "string" && (CATS as readonly string[]).includes(v);

/** Tints mirrored in app/globals.css (html[data-cat=...]). Ginger = the base SPEC palette. */
export const TINTS: Record<CatId, { soft: string; accent: string }> = {
  ginger: { soft: "#fde3d3", accent: "#f4a27e" },
  tabby: { soft: "#f5ebdf", accent: "#c8a27c" },
  birman: { soft: "#f2e4e0", accent: "#d9a58f" },
};

/** Colours of the drawn mascot, taken from each cat's coat. */
export type CoatPalette = {
  body: string;
  shade: string;
  chest: string;
  ear: string;
  eyes: string;
  paw: string;
  /** Dark face mask, ears, tail and legs (Birman). */
  mask?: boolean;
  /** Forehead and body stripes (ginger and tabby tabbies). */
  stripes?: boolean;
};

export const COATS: Record<CatId, CoatPalette> = {
  ginger: { body: "#e8914f", shade: "#cf7433", chest: "#fff1e0", ear: "#f4b8a0", eyes: "#7a9a3c", paw: "#fff1e0", stripes: true },
  tabby: { body: "#8c6c4b", shade: "#4e3b2c", chest: "#d9c4a6", ear: "#e0a89a", eyes: "#b98c2f", paw: "#d9c4a6", stripes: true },
  birman: { body: "#ead5c0", shade: "#4a3228", chest: "#fffaf4", ear: "#e6b0a2", eyes: "#6ba4cc", paw: "#ffffff", mask: true },
};
