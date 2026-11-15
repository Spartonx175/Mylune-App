"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { answerQuiz } from "@/app/track-actions";
import CatPhoto from "@/components/CatPhoto";
import type { CatId } from "@/lib/cats";
import type { Locale } from "@/lib/content/types";

export type QuizCard = {
  id: string;
  question: string;
  options: string[];
  why: string;
  sources: { name: string; title: string; url: string }[];
};

const LETTERS = ["A", "B", "C", "D"];

/** One question at a time. The right answer is only revealed after she checks her answer. */
export default function QuizPlayer({ locale, questions, cat }: { locale: Locale; questions: QuizCard[]; cat: CatId }) {
  const t = useTranslations("quiz");
  const [pending, start] = useTransition();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; answer: number } | null>(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[index];
  const pct = Math.round(((finished ? questions.length : index + (result ? 1 : 0)) / questions.length) * 100);

  const check = () => {
    if (chosen === null) return;
    start(async () => {
      const res = await answerQuiz(locale, q.id, chosen);
      if (!res.ok) {
        setFailed(true);
        return;
      }
      setFailed(false);
      setResult({ correct: res.correct, answer: res.answer });
      if (res.correct) setScore((s) => s + 1);
    });
  };

  const next = () => {
    setResult(null);
    setChosen(null);
    if (index + 1 >= questions.length) setFinished(true);
    else setIndex(index + 1);
  };

  const restart = () => {
    setIndex(0);
    setChosen(null);
    setResult(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="hero space-y-5 p-8 text-center">
        <div aria-hidden="true" className="glass absolute -right-10 -top-12 h-44 w-44 rounded-full opacity-60" />
        <CatPhoto cat={cat} size={110} className="pop relative mx-auto" />
        <p className="relative font-display text-6xl font-bold text-white" role="status">
          {score}/{questions.length}
        </p>
        <p className="relative text-xl font-semibold text-white">{t("done", { n: score, total: questions.length })}</p>
        <button type="button" onClick={restart} className="relative flex min-h-14 w-full items-center justify-center rounded-2xl bg-white px-6 text-lg font-extrabold text-primary-text">
          {t("again")}
        </button>
        <Link href="/feed" className="relative flex min-h-14 w-full items-center justify-center rounded-2xl bg-white/20 px-6 text-lg font-bold text-white">
          {t("back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-base font-bold text-muted-text">{t("question", { n: index + 1, total: questions.length })}</p>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-soft" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card p-6">
        <h2 key={q.id} className="anim-in font-display text-2xl font-semibold leading-snug">
          {q.question}
        </h2>

        <div role="radiogroup" aria-label={q.question} className="mt-5 space-y-3">
          {q.options.map((opt, i) => {
            const isChosen = chosen === i;
            const locked = result !== null;
            const isRight = result !== null && result.answer === i;
            const isWrongPick = result !== null && isChosen && !result.correct;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={isChosen}
                disabled={locked || pending}
                onClick={() => setChosen(i)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left text-lg transition active:scale-[0.98] ${
                  isRight
                    ? "border-primary-text bg-soft font-bold"
                    : isWrongPick
                      ? "border-urgent bg-white"
                      : isChosen
                        ? "border-primary bg-soft"
                        : "border-soft bg-white"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-extrabold ${
                    isRight ? "bg-primary-text text-white" : isWrongPick ? "bg-urgent text-white" : "bg-soft text-primary-text"
                  }`}
                >
                  {isRight ? "✓" : isWrongPick ? "✗" : LETTERS[i]}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {result === null ? (
          <button
            type="button"
            onClick={check}
            disabled={chosen === null || pending}
            className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-text px-6 text-lg font-extrabold text-white disabled:opacity-50"
          >
            {chosen === null ? t("pick") : t("check")}
          </button>
        ) : (
          <div className="anim-in mt-5 space-y-3" aria-live="polite">
            <p className={`font-display text-2xl font-semibold ${result.correct ? "text-primary-text" : "text-ink"}`}>
              {result.correct ? t("correct") : t("notRight")}
            </p>
            {!result.correct && <p className="text-lg">{t("answerWas", { answer: q.options[result.answer] })}</p>}
            <p className="rounded-2xl bg-soft p-4 text-lg leading-snug">{q.why}</p>
            <details>
              <summary className="min-h-11 cursor-pointer text-base font-bold text-primary-text">{t("sources")}</summary>
              <ul className="mt-1 list-inside list-disc text-base">
                {q.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary-text underline">
                      {s.name}: {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            <button type="button" onClick={next} className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-text px-6 text-lg font-extrabold text-white">
              {index + 1 >= questions.length ? t("finish") : t("next")}
            </button>
          </div>
        )}
        {failed && <p role="alert" className="mt-3 text-base text-urgent">{t("notRight")}</p>}
      </div>
    </div>
  );
}
