import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/session";
import { datingFromSession, formatDate } from "@/lib/pregnancy";
import { createClient } from "@/lib/supabase/server";
import { badgeFor } from "@/lib/track";
import { getCompanionCat } from "@/lib/cat-cookie";
import { CatMascot } from "@/components/CatMascot";

type FeedRow = {
  id: string;
  type: string;
  url: string | null;
  title_fr: string | null;
  title_en: string | null;
  summary_fr: string | null;
  summary_en: string | null;
  source_name: string | null;
  week_min: number | null;
  week_max: number | null;
  published_at: string | null;
};

export default async function FeedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getSession();
  const cat = await getCompanionCat();
  const dating = datingFromSession(session);
  const sa = dating?.sa.weeks ?? null;

  const supabase = await createClient();
  // Only items Div has approved (status = live) come back: the database policy enforces it.
  const { data: rows } = supabase
    ? await supabase
        .from("feed_items")
        .select("id, type, url, title_fr, title_en, summary_fr, summary_en, source_name, week_min, week_max, published_at")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(40)
    : { data: null };

  const items = ((rows ?? []) as FeedRow[]).filter((r) => {
    if (sa === null) return true;
    return (r.week_min === null || sa >= r.week_min) && (r.week_max === null || sa <= r.week_max);
  });

  // Quiz points: her own correct answers. Celebration only (SPEC section 14).
  let points = 0;
  if (session.configured && session.user && supabase) {
    const { data: answers } = await supabase.from("logs").select("value").eq("user_id", session.user.id).eq("type", "quiz");
    points = (answers ?? []).filter((a) => (a.value as { ok?: boolean }).ok === true).length;
  }
  const badge = badgeFor(points);

  return (
    <section className="space-y-4 py-4">
      <h1 className="text-3xl font-bold">{t("nav.feed")}</h1>
      <p className="text-lg text-muted-text">{t("feed.intro")}</p>

      <Link href="/feed/quiz" className="block rounded-3xl bg-soft p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <CatMascot cat={cat} className="h-16 w-16 shrink-0" />
          <div>
            <p className="text-xl font-bold text-primary-text">{t("feed.quizTitle")}</p>
            <p className="text-base">{t("feed.quizHelp")}</p>
            <p className="mt-1 text-base font-semibold">{t("feed.points", { n: points })}</p>
            <p className="text-base text-muted-text">
              {badge ? t("feed.badge", { name: t(`feed.badges.${badge}`) }) : t("feed.noBadge")}
            </p>
          </div>
        </div>
        <span className="mt-4 flex min-h-14 items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-white">
          {t("feed.quizStart")}
        </span>
      </Link>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-surface p-6 shadow-sm">
          <p className="text-lg">{t("feed.empty")}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const title = (locale === "fr" ? item.title_fr : item.title_en) ?? item.title_en ?? item.title_fr ?? "";
            const summary = (locale === "fr" ? item.summary_fr : item.summary_en) ?? item.summary_en ?? item.summary_fr ?? "";
            const safeUrl = item.url && item.url.startsWith("https://") ? item.url : null;
            return (
              <li key={item.id} className="rounded-3xl bg-surface p-6 shadow-sm">
                <p className="text-sm font-semibold text-muted-text">
                  {item.source_name}
                  {item.published_at ? ` · ${formatDate(item.published_at.slice(0, 10), locale, "medium")}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-bold">{title}</h2>
                {summary && <p className="mt-2 text-lg">{summary}</p>}
                {safeUrl && (
                  <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-lg font-semibold text-primary-text underline">
                    {t("feed.open")}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
