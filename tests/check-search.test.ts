import { describe, expect, it } from "vitest";
import { normalize, scoreItem, searchItems } from "../lib/check-search";

const items = [
  { id: "brie", names: ["Brie", "Brie de Meaux"] },
  { id: "camembert", names: ["Camembert", "camembert au lait cru"] },
  { id: "smoked-salmon", names: ["Smoked salmon", "Saumon fumé"] },
  { id: "paracetamol", names: ["Paracetamol", "Doliprane", "Dafalgan"], active_ingredient: "paracetamol" },
  { id: "egg-mimosa", names: ["Œuf mimosa"] },
];

describe("normalize", () => {
  it("strips accents, case and ligatures", () => {
    expect(normalize("Saumon  Fumé")).toBe("saumon fume");
    expect(normalize("Œuf")).toBe("oeuf");
    expect(normalize("  ")).toBe("");
  });
});

describe("searchItems", () => {
  it("finds French names without accents and ranks exact first", () => {
    expect(searchItems(items, "saumon fume").map((i) => i.id)).toEqual(["smoked-salmon"]);
    expect(searchItems(items, "brie")[0].id).toBe("brie");
  });
  it("matches brand names to the active ingredient item", () => {
    expect(searchItems(items, "doliprane")[0].id).toBe("paracetamol");
    expect(searchItems(items, "oeuf")[0].id).toBe("egg-mimosa");
  });
  it("matches word starts and substrings, and returns nothing for no match", () => {
    expect(searchItems(items, "meaux").map((i) => i.id)).toEqual(["brie"]);
    expect(searchItems(items, "zzz")).toEqual([]);
    expect(searchItems(items, "")).toEqual([]);
  });
  it("display name beats a synonym on equal match", () => {
    expect(scoreItem(items[0], "brie")).toBeGreaterThan(scoreItem({ names: ["x", "brie"] }, "brie"));
  });
  it("respects the limit", () => {
    expect(searchItems(items, "a", 2).length).toBeLessThanOrEqual(2);
  });
});
