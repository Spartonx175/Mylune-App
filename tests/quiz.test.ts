import { describe, expect, it } from "vitest";
import { loadQuiz } from "../lib/content/quiz";

describe("quiz content", () => {
  const en = loadQuiz("en");
  const fr = loadQuiz("fr");

  it("loads and validates both languages", () => {
    expect(en.length).toBeGreaterThanOrEqual(5);
  });

  it("French mirrors English one to one: ids, order, answers and sources", () => {
    expect(fr.map((q) => q.id)).toEqual(en.map((q) => q.id));
    for (let i = 0; i < en.length; i++) {
      expect(fr[i].answer).toBe(en[i].answer);
      expect(fr[i].sources).toEqual(en[i].sources);
      expect(fr[i].options).toHaveLength(en[i].options.length);
    }
  });
});
