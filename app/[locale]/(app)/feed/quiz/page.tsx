import { getTranslations, setRequestLocale } from "next-intl/server";
import { loadQuiz } from "@/lib/content/quiz";
import { loadSources } from "@/lib/content/load";
import type { Locale } from "@/lib/content/types";
import { getCompanionCat } from "@/lib/cat-cookie";
import QuizPlayer, { type QuizCard } from "@/components/QuizPlayer";

export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = locale as Locale;
  const cat = await getCompanionCat();

  const sources = new Map(loadSources().sources.map((s) => [s.id, s]));
  // The right answer index stays on the server until she checks an answer.
  const questions: QuizCard[] = loadQuiz(loc).map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    why: q.why,
    sources: q.sources.map((id) => {
      const s = sources.get(id)!;
      return { name: s.name, title: s.title, url: s.url };
    }),
  }));

  return (
    <section className="space-y-4 py-2">
      <h1 className="text-4xl font-bold">{t("quiz.title")}</h1>
      <QuizPlayer locale={loc} questions={questions} cat={cat} />
    </section>
  );
}
