import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPool, pickRound } from "@/lib/content/quiz";
import { loadSources } from "@/lib/content/load";
import type { Locale } from "@/lib/content/types";
import { getCompanionCat } from "@/lib/cat-cookie";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import QuizPlayer, { type QuizCard } from "@/components/QuizPlayer";

export const dynamic = "force-dynamic";

const ROUND_SIZE = 10;

export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const loc = locale as Locale;
  const cat = await getCompanionCat();
  const session = await getSession();

  // Questions she has already answered, oldest first, so a round only holds ones she has not seen.
  let answered: string[] = [];
  if (session.configured && session.user) {
    const supabase = await createClient();
    const { data } = supabase
      ? await supabase.from("logs").select("value").eq("user_id", session.user.id).eq("type", "quiz").order("logged_at", { ascending: true }).limit(5000)
      : { data: null };
    answered = (data ?? []).map((r) => String((r.value as { q?: string }).q ?? "")).filter(Boolean);
  }

  const pool = buildPool(loc);
  const round = pickRound(pool, answered, ROUND_SIZE);
  const seen = new Set(answered);
  const unseenLeft = pool.filter((q) => !seen.has(q.id) && !round.some((r) => r.id === q.id)).length;

  const sources = new Map(loadSources().sources.map((s) => [s.id, s]));
  const questions: QuizCard[] = round.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    answer: q.answer,
    why: q.why,
    sources: q.sources.flatMap((id) => {
      const s = sources.get(id);
      return s ? [{ name: s.name, title: s.title, url: s.url }] : [];
    }),
  }));

  return (
    <section className="space-y-4 py-2">
      <h1 className="text-4xl font-bold">{t("quiz.title")}</h1>
      <QuizPlayer key={questions.map((q) => q.id).join("|")} questions={questions} cat={cat} unseenLeft={unseenLeft} />
    </section>
  );
}
