// Quiz content: hand-written questions (content/{en,fr}/quiz.yaml) plus questions generated from the checker data.
// Server-side only (uses fs). Everything is validated like the rest of the content.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { ContentError, type Locale } from "./types";
import { loadChecks, loadSources } from "./load";
import { QUIZ_ITEMS } from "./quiz-items";
import { hashId, pickRound, seededShuffle, type RoundQuestion } from "../quiz-round";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  why: string;
  sources: string[];
};

const DEFAULT_ROOT = path.join(process.cwd(), "content");

/** Hand-written questions. The correct answer is first in the file; use `buildPool` for shuffled options. */
export function loadQuiz(locale: Locale, root = DEFAULT_ROOT): QuizQuestion[] {
  const label = `${locale}/quiz.yaml`;
  const file = path.join(root, locale, "quiz.yaml");
  if (!existsSync(file)) throw new ContentError(`Missing content file: ${label}`);
  const raw = parse(readFileSync(file, "utf8")) as { questions?: unknown } | null;
  if (!raw || !Array.isArray(raw.questions)) throw new ContentError(`${label}: needs questions[]`);
  const known = new Set(loadSources(root).sources.map((s) => s.id));
  const seen = new Set<string>();

  return (raw.questions as QuizQuestion[]).map((q) => {
    const l = `${label}#${q.id ?? "?"}`;
    if (!q.id || seen.has(q.id)) throw new ContentError(`${l}: missing or duplicate id`);
    seen.add(q.id);
    if (typeof q.question !== "string" || !q.question) throw new ContentError(`${l}: question is required`);
    if (!Array.isArray(q.options) || q.options.length < 2 || !q.options.every((o) => typeof o === "string")) {
      throw new ContentError(`${l}: needs at least 2 options`);
    }
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) throw new ContentError(`${l}: answer index out of range`);
    if (typeof q.why !== "string" || !q.why) throw new ContentError(`${l}: why is required`);
    if (!Array.isArray(q.sources) || q.sources.length < 1) throw new ContentError(`${l}: needs at least 1 source id`);
    for (const id of q.sources) if (!known.has(id)) throw new ContentError(`${l}: unknown source id "${id}"`);
    return q;
  });
}

type QuizUi = {
  quiz: { gen: Record<"food" | "drink" | "exercise" | "medicine", string> & { stateWrap: string; ok: string; careful: string; avoid: string } };
  check: { states: Record<string, string> };
};

const KIND_KEY = { foods: "food", drinks: "drink", exercise: "exercise", medicines: "medicine" } as const;

/** Move the correct answer to a stable but varied position (same position in EN and FR, since it depends on the id). */
function shuffled(q: QuizQuestion): QuizQuestion {
  const order = seededShuffle(q.options.map((_, i) => i), hashId(q.id));
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

/** Questions generated from the checker: one per item and preparation state, answered with that item's own data. */
export function generatedQuestions(locale: Locale, root = DEFAULT_ROOT): QuizQuestion[] {
  const ui = JSON.parse(readFileSync(path.join(root, locale, "ui.json"), "utf8")) as QuizUi;
  const gen = ui.quiz.gen;
  const out: QuizQuestion[] = [];
  const lists = new Map<string, ReturnType<typeof loadChecks>>();
  for (const [kind, id, nameEn, nameFr] of QUIZ_ITEMS) {
    if (!lists.has(kind)) lists.set(kind, loadChecks(locale, kind, root));
    const item = lists.get(kind)!.find((i) => i.id === id);
    if (!item) throw new ContentError(`quiz-items: unknown ${kind} item "${id}" in ${locale}`);
    const name = locale === "fr" ? nameFr : nameEn;
    for (const a of item.answers) {
      // A single-answer item needs no qualifier; otherwise say which case the question is about.
      const stateLabel = a.label ?? ui.check.states[a.state] ?? a.state;
      const state = a.state === "not_applicable" || item.answers.length === 1 ? "" : gen.stateWrap.replace("{state}", stateLabel);
      const options = [gen.ok, gen.careful, gen.avoid];
      out.push({
        id: `g-${kind}-${id}-${a.state}`,
        question: gen[KIND_KEY[kind]].replace("{item}", `${name}${state}`),
        options,
        answer: { ok: 0, careful: 1, avoid: 2 }[a.verdict],
        why: a.why,
        sources: a.sources,
      });
    }
  }
  return out;
}

export type PoolQuestion = RoundQuestion;

/** Every question she can be asked, with option order shuffled per question. Same ids and answer positions in EN and FR. */
export function buildPool(locale: Locale, root = DEFAULT_ROOT): QuizQuestion[] {
  return [...loadQuiz(locale, root), ...generatedQuestions(locale, root)].map(shuffled);
}

export { pickRound };
