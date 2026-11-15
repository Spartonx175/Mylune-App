// Quiz loader: content/{en,fr}/quiz.yaml, validated like the other content (server-side, uses fs).
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { ContentError, type Locale } from "./types";
import { loadSources } from "./load";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  why: string;
  sources: string[];
};

const DEFAULT_ROOT = path.join(process.cwd(), "content");

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
