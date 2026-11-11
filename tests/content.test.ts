import { describe, expect, it } from "vitest";
import en from "../content/en/ui.json";
import fr from "../content/fr/ui.json";

const keys = (o: Record<string, unknown>, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === "object" && v ? keys(v as Record<string, unknown>, `${p}${k}.`) : [`${p}${k}`]));

describe("UI strings", () => {
  it("FR mirrors EN keys 1:1", () => {
    expect(keys(fr).sort()).toEqual(keys(en).sort());
  });
});
