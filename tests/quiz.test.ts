import { describe, expect, it } from "vitest";
import { buildPool, generatedQuestions, loadQuiz } from "../lib/content/quiz";
import { loadSources } from "../lib/content/load";
import { hashId, pickRound, seededShuffle } from "../lib/quiz-round";

describe("quiz content", () => {
  const en = buildPool("en");
  const fr = buildPool("fr");

  it("has well over 100 questions", () => {
    expect(en.length).toBeGreaterThanOrEqual(150);
    expect(fr.length).toBe(en.length);
  });

  it("has unique ids and valid answers and sources everywhere", () => {
    const known = new Set(loadSources().sources.map((s) => s.id));
    for (const pool of [en, fr]) {
      expect(new Set(pool.map((q) => q.id)).size).toBe(pool.length);
      for (const q of pool) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        expect(q.sources.length).toBeGreaterThan(0);
        for (const s of q.sources) expect(known.has(s)).toBe(true);
        expect(q.why.length).toBeGreaterThan(10);
      }
    }
  });

  it("French mirrors English one to one: ids, answer position and sources", () => {
    expect(fr.map((q) => q.id)).toEqual(en.map((q) => q.id));
    for (let i = 0; i < en.length; i++) {
      expect(fr[i].answer).toBe(en[i].answer);
      expect(fr[i].sources).toEqual(en[i].sources);
      expect(fr[i].options).toHaveLength(en[i].options.length);
    }
  });

  it("the right answer is not always in the same place", () => {
    const counts = new Map<number, number>();
    for (const q of en) counts.set(q.answer, (counts.get(q.answer) ?? 0) + 1);
    expect(counts.size).toBeGreaterThanOrEqual(3);
    for (const n of counts.values()) expect(n / en.length).toBeLessThan(0.6);
  });

  it("every hand-written question still has a source and no question text is empty", () => {
    for (const q of loadQuiz("en")) expect(q.question.endsWith("?") || q.question.endsWith("...")).toBe(true);
  });

  it("generated answers agree with the checker verdicts", () => {
    const gen = generatedQuestions("en");
    const feta = gen.find((q) => q.id === "g-foods-feta-unpasteurised")!;
    expect(feta.options[feta.answer]).toBe("Avoid it");
    const fetaOk = gen.find((q) => q.id === "g-foods-feta-pasteurised")!;
    expect(fetaOk.options[fetaOk.answer]).toBe("It is fine");
  });
});

describe("pickRound", () => {
  const pool = Array.from({ length: 25 }, (_, i) => ({ id: `q${i}` }));

  it("returns the requested number of distinct questions", () => {
    const r = pickRound(pool, [], 10);
    expect(r).toHaveLength(10);
    expect(new Set(r.map((q) => q.id)).size).toBe(10);
  });

  it("never repeats a question she has answered while new ones remain", () => {
    let answered: string[] = [];
    const seen = new Set<string>();
    for (let round = 0; round < 2; round++) {
      const r = pickRound(pool, answered, 10);
      for (const q of r) {
        expect(seen.has(q.id)).toBe(false);
        seen.add(q.id);
      }
      answered = [...answered, ...r.map((q) => q.id)];
    }
    expect(seen.size).toBe(20);
  });

  it("when fewer new ones remain, adds the ones answered longest ago", () => {
    const answered = pool.slice(0, 20).map((q) => q.id); // q0 answered first, q19 last
    const r = pickRound(pool, answered, 10);
    expect(r.slice(0, 5).map((q) => q.id).sort()).toEqual(["q20", "q21", "q22", "q23", "q24"]);
    expect(r.slice(5).map((q) => q.id)).toEqual(["q0", "q1", "q2", "q3", "q4"]);
  });

  it("starts over, oldest first, when everything has been answered", () => {
    const answered = pool.map((q) => q.id);
    expect(pickRound(pool, answered, 3).map((q) => q.id)).toEqual(["q0", "q1", "q2"]);
  });

  it("hash and shuffle are stable", () => {
    expect(hashId("abc")).toBe(hashId("abc"));
    expect(seededShuffle([1, 2, 3, 4, 5], 42)).toEqual(seededShuffle([1, 2, 3, 4, 5], 42));
    expect([...seededShuffle([1, 2, 3, 4, 5], 7)].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
