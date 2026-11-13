// "Can I?" checker data (Guide tab): food x cooking state, drinks, exercise, medicines.
// One YAML file per kind: content/{locale}/check/{foods,drinks,exercise,medicines}.yaml
// Shared by the content sessions (authoring) and the screen (reading). Keep both in step with this file.

export type CheckKind = "foods" | "drinks" | "exercise" | "medicines";

/** ok = fine as described. careful = fine only under the stated condition, or ask first. avoid = do not. */
export type Verdict = "ok" | "careful" | "avoid";

/**
 * Cooking / preparation states for foods and drinks. An item lists only the states that make sense for it.
 * - raw: uncooked (also raw milk products only if state is `unpasteurised`)
 * - undercooked: rare, pink, runny, soft-boiled
 * - cooked: cooked through, steaming hot all the way
 * - boiled: boiled / poached
 * - cured: dry-cured, smoked or salted without cooking (charcuterie, smoked salmon)
 * - pasteurised / unpasteurised: for milk, cheese, juices
 * - canned: tinned or jarred, shelf-stable
 * - reheated: leftovers reheated until steaming hot
 * - not_applicable: single-answer items (drinks, exercise, medicines)
 */
export const FOOD_STATES = [
  "raw",
  "undercooked",
  "cooked",
  "boiled",
  "cured",
  "pasteurised",
  "unpasteurised",
  "canned",
  "reheated",
  "not_applicable",
] as const;
export type FoodState = (typeof FOOD_STATES)[number];

export const FOOD_CATEGORIES = [
  "fruit",
  "vegetable",
  "meat",
  "charcuterie",
  "fish",
  "seafood",
  "egg",
  "dairy",
  "cheese",
  "grain",
  "legume",
  "nut_seed",
  "sweet",
  "fat_oil",
  "herb_spice",
  "ready_meal",
  "other",
] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export type CheckAnswer = {
  state: FoodState;
  verdict: Verdict;
  /** One or two plain sentences, in the file's language. Never a dose, never a diagnosis. */
  why: string;
  /** Ids from content/sources.yaml. avoid and careful need at least 2. */
  sources: string[];
};

export type CheckItem = {
  /** Stable kebab-case id, same in every language. */
  id: string;
  /** Free label used for grouping: a FoodCategory for foods, e.g. "caffeine" for drinks, "walking" for exercise, a class for medicines. */
  category: string;
  /** Search names and common synonyms in the file's language, including French brand names for medicines. First = display name. */
  names: string[];
  /** Medicines only: active ingredient shown to her, e.g. "paracetamol". */
  active_ingredient?: string;
  /** Appears in the "tips" lists: best or worst choices. */
  tips?: ("best" | "avoid")[];
  /** Typically available in Paris / France (markets, supermarkets, pharmacies). */
  local?: boolean;
  answers: CheckAnswer[];
  reviewed: string;
};
