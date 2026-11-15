"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { recordQuiz } from "@/app/track-actions";
import CatPhoto from "@/components/CatPhoto";
import type { CatId } from "@/lib/cats";

export type QuizCard = {
  id: string;
  question: string;
  options: string[];
  /** Index of the right option. Checked on the phone, so answering is instant and never waits for the server. */
  answer: number;
  why: string;
  sources: { name: string; title: string; url: string }[];
};

const LETTERS = ["A", "B", "C", "D"];

/**
 * One question at a time. Checking an answer happens on the phone, so it cannot get stuck.
 * The result is saved in the background (for the score and so questions are not repeated); a failed save is ignored.
 */
export default function QuizPlayer({ questions, cat, unseenLeft }: { questions: QuizCard[]; cat: CatId; unseenLeft: number }) {
  const t = useTranslations("quiz");
  const router = useRouter();
  const saves = useRef<Promise<unknown>[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const q = questions[index];
  const correct = checked && chosen === q.answer;
  const pct = Math.round(((finished ? questions.length : index + (checked ? 1 : 0)) / questions.length) * 100);

  const check = () => {
    if (chosen === null || checked) return;
    const ok = chosen === q.answer;
    setChecked(true);
    if (ok) setScore((s) => s + 1);
    saves.current.push(recordQuiz(q.id, ok).catch(() => undefined));
  };

  const next = () => {
    setChosen(null);
    setChecked(false);
    if (index + 1 >= questions.length) setFinished(true);
    else setIndex(index + 1);
  };

  // New round: wait for the answers to be saved, then ask the server for questions she has not seen.
  const again = async () => {
    setLoadingNext(true);
    await Promise.allSettled(saves.current);
    saves.current = [];
    router.refresh();
    // The page hands this component a new set of questions (a new key), which restarts it. If that does not happen, start over.
    setTimeout(() => {
      setIndex(0);
      setChosen(null);
      setChecked(false);
      setScore(0);
      setFinished(false);
      setLoadingNext(false);
    }, 1500);
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
        <p className="relative text-base text-white">{unseenLeft > 0 ? t("poolLeft", { n: unseenLeft }) : t("poolRepeat")}</p>
        <button type="button" onClick={again} disabled={loadingNext} className="relative flex min-h-14 w-full items-center justify-center rounded-2xl bg-white px-6 text-lg font-extrabold text-primary-text disabled:opacity-70">
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
            const isRight = checked && q.answer === i;
            const isWrongPick = checked && isChosen && !correct;
            return (
              <button
                key={`${q.id}-${i}`}
                type="button"
                role="radio"
                aria-checked={isChosen}
                disabled={checked}
                onClick={() => setChosen(i)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left text-lg transition active:scale-[0.98] ${
                  isRight ? "border-primary-text bg-soft font-bold" : isWrongPick ? "border-urgent bg-white" : isChosen ? "border-primary bg-soft" : "border-soft bg-white"
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

        {!checked ? (
          <button
            type="button"
            onClick={check}
            disabled={chosen === null}
            className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-text px-6 text-lg font-extrabold text-white disabled:opacity-50"
          >
            {chosen === null ? t("pick") : t("check")}
          </button>
        ) : (
          <div className="anim-in mt-5 space-y-3" aria-live="polite">
            <p className={`font-display text-2xl font-semibold ${correct ? "text-primary-text" : "text-ink"}`}>{correct ? t("correct") : t("notRight")}</p>
            {!correct && <p className="text-lg">{t("answerWas", { answer: q.options[q.answer] })}</p>}
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
      </div>
    </div>
  );
}
