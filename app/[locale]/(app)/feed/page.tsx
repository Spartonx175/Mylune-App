import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/lib/session";
import { datingFromSession, formatDate } from "@/lib/pregnancy";
import { createClient } from "@/lib/supabase/server";
import { BADGE_STEPS, badgeFor } from "@/lib/track";
import { getCompanionCat } from "@/lib/cat-cookie";
import CatPhoto from "@/components/CatPhoto";

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

// Icon and tint per kind of item. Decorative: the source name and title carry the meaning.
const KIND: Record<string, { icon: string; bg: string }> = {
  article: { icon: "M5 4h11l3 3v13H5V4ZM8 10h8M8 14h8M8 18h5", bg: "linear-gradient(150deg,#fff1e3,#ffd3b3)" },
  youtube: { icon: "M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM10 9l5 3-5 3V9Z", bg: "linear-gradient(150deg,#ffeef0,#ffc9d0)" },
  instagram: { icon: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z", bg: "linear-gradient(150deg,#f0eefc,#d3cdf5)" },
  infographic: { icon: "M4 20V10M10 20V4M16 20v-7M22 20H2", bg: "linear-gradient(150deg,#eef6e6,#cfe6b8)" },
  affirmation: { icon: "M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z", bg: "linear-gradient(150deg,#ffeef0,#ffc9d0)" },
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
  const nextStep = BADGE_STEPS.find((s) => s > points) ?? null;

  return (
    <section className="space-y-5 py-2">
      <div>
        <h1 className="text-4xl font-bold">{t("nav.feed")}</h1>
        <p className="mt-1 text-lg text-muted-text">{t("feed.intro")}</p>
      </div>

      <Link href="/feed/quiz" className="hero block p-6 transition active:scale-[0.98]">
        <div aria-hidden="true" className="glass absolute -right-10 -top-12 h-44 w-44 rounded-full opacity-60" />
        <div className="relative flex items-center gap-4">
          <CatPhoto cat={cat} size={76} className="cat-float shrink-0" />
          <div>
            <p className="font-display text-3xl font-semibold text-white">{t("feed.quizTitle")}</p>
            <p className="text-base text-white">{t("feed.quizHelp")}</p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-3 text-base font-bold">
          <span className="glass rounded-full px-4 py-1.5 text-white">{t("feed.points", { n: points })}</span>
          <span className="glass rounded-full px-4 py-1.5 text-white">{badge ? t(`feed.badges.${badge}`) : t("feed.noBadge")}</span>
        </div>
        {nextStep && (
          <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/25" aria-hidden="true">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, (points / nextStep) * 100)}%` }} />
          </div>
        )}
        <span className="relative mt-4 flex min-h-14 items-center justify-center rounded-2xl bg-white px-6 text-lg font-extrabold text-primary-text">
          {t("feed.quizStart")}
        </span>
      </Link>

      {items.length === 0 ? (
        <div className="card flex items-center gap-4 p-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-soft text-primary-text">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={KIND.article.icon} />
            </svg>
          </span>
          <p className="text-lg">{t("feed.empty")}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const title = (locale === "fr" ? item.title_fr : item.title_en) ?? item.title_en ?? item.title_fr ?? "";
            const summary = (locale === "fr" ? item.summary_fr : item.summary_en) ?? item.summary_en ?? item.summary_fr ?? "";
            const safeUrl = item.url && item.url.startsWith("https://") ? item.url : null;
            const kind = KIND[item.type] ?? KIND.article;
            return (
              <li key={item.id} className="card overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4" style={{ background: kind.bg }}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary-text">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={kind.icon} />
                    </svg>
                  </span>
                  <p className="text-sm font-extrabold text-ink">
                    {item.source_name}
                    {item.published_at ? ` · ${formatDate(item.published_at.slice(0, 10), locale, "medium")}` : ""}
                  </p>
                </div>
                <div className="p-5">
                  <h2 className="text-2xl font-semibold leading-snug">{title}</h2>
                  {summary && <p className="mt-2 line-clamp-3 text-lg">{summary}</p>}
                  {safeUrl && (
                    <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-lg font-bold text-primary-text underline">
                      {t("feed.open")}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
