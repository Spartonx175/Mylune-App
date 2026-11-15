"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { answerQuiz } from "@/app/track-actions";
import type { Locale } from "@/lib/content/types";

export type QuizCard = {
  id: string;
  question: string;
  options: string[];
  why: string;
  sources: { name: string; title: string; url: string }[];
};

/** One question at a time. The right answer is only revealed after she checks her answer. */
export default function QuizPlayer({ locale, questions }: { locale: Locale; questions: QuizCard[] }) {
  const t = useTranslations("quiz");
  const [pending, start] = useTransition();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [result, setResult] = useState<{ correct: boolean; answer: number } | null>(null);
  const [score, setScore] = useState(0);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[index];

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
      <div className="space-y-4 rounded-3xl bg-surface p-6 shadow-sm">
        <p className="text-2xl font-bold text-primary-text" role="status">
          {t("done", { n: score, total: questions.length })}
        </p>
        <button type="button" onClick={restart} className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-white">
          {t("again")}
        </button>
        <Link href="/feed" className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-soft px-6 text-lg font-semibold text-ink">
          {t("back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl bg-surface p-6 shadow-sm">
      <p className="text-base font-semibold text-muted-text">{t("question", { n: index + 1, total: questions.length })}</p>
      <h2 className="text-xl font-bold">{q.question}</h2>

      <div role="radiogroup" aria-label={q.question} className="space-y-2">
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
              className={`block min-h-14 w-full rounded-2xl border-2 px-4 py-3 text-left text-lg ${
                isRight
                  ? "border-primary-text bg-soft font-semibold"
                  : isWrongPick
                    ? "border-urgent bg-surface"
                    : isChosen
                      ? "border-primary bg-soft"
                      : "border-soft bg-surface"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {result === null ? (
        <button
          type="button"
          onClick={check}
          disabled={chosen === null || pending}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-white disabled:opacity-50"
        >
          {chosen === null ? t("pick") : t("check")}
        </button>
      ) : (
        <div className="space-y-3" aria-live="polite">
          <p className="text-xl font-bold">{result.correct ? t("correct") : t("notRight")}</p>
          {!result.correct && <p className="text-lg">{t("answerWas", { answer: q.options[result.answer] })}</p>}
          <p className="text-lg">{q.why}</p>
          <div>
            <p className="text-base font-semibold text-muted-text">{t("sources")}</p>
            <ul className="list-inside list-disc text-base">
              {q.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary-text underline">
                    {s.name}: {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <button type="button" onClick={next} className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-white">
            {index + 1 >= questions.length ? t("finish") : t("next")}
          </button>
        </div>
      )}
      {failed && <p role="alert" className="text-base text-urgent">{t("notRight")}</p>}
    </div>
  );
}
