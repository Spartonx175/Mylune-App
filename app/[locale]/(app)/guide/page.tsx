import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CatPhoto from "@/components/CatPhoto";
import AskAi from "@/components/AskAi";
import { getCompanionCat } from "@/lib/cat-cookie";

// Each tile has its own soft colour so the four lookups are told apart at a glance (icon and words carry the meaning).
const TILES = [
  { kind: "foods", icon: "M7 3v8a3 3 0 0 0 3 3v7M7 3v5M10 3v5M17 3c-2 2-3 5-3 8h3v10", bg: "linear-gradient(150deg,#fff1e3,#ffd3b3)", fg: "#a04d2e" },
  { kind: "drinks", icon: "M6 3h12l-1.5 17a1 1 0 0 1-1 .9h-7a1 1 0 0 1-1-.9L6 3ZM7 9h10", bg: "linear-gradient(150deg,#ffeef0,#ffc9d0)", fg: "#a8344b" },
  { kind: "exercise", icon: "M13 4a2 2 0 1 1 0 .01M8 21l3-6 3 2v4M9 11l3-2 3 3 3 1M11 9l-3 4-3-1", bg: "linear-gradient(150deg,#eef6e6,#cfe6b8)", fg: "#46702a" },
  { kind: "medicines", icon: "M8.5 4.5l11 11a4.2 4.2 0 0 1-6 6l-11-11a4.2 4.2 0 0 1 6-6ZM9 9l6 6", bg: "linear-gradient(150deg,#f0eefc,#d3cdf5)", fg: "#4e419a" },
] as const;

export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const cat = await getCompanionCat();
  const prompt = t("ask.prompt");

  return (
    <section className="space-y-5 py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold">{t("guide.title")}</h1>
          <p className="mt-1 text-lg text-muted-text">{t("guide.intro")}</p>
        </div>
        <CatPhoto cat={cat} size={64} className="cat-float shrink-0" />
      </div>

      <ul className="grid grid-cols-2 gap-3">
        {TILES.map(({ kind, icon, bg, fg }) => (
          <li key={kind}>
            <Link
              href={`/guide/${kind}`}
              style={{ background: bg, color: "#3b2f2b" }}
              className="relative flex h-full min-h-44 flex-col justify-between overflow-hidden rounded-[28px] p-4 shadow-[0_14px_30px_-16px_rgba(59,47,43,0.45)] transition active:scale-95"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm" style={{ color: fg }}>
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </span>
              <span>
                <span className="block font-display text-xl font-semibold leading-tight">{t(`guide.tiles.${kind}`)}</span>
                <span className="mt-1 block text-sm font-semibold leading-snug opacity-80">{t(`guide.tilesHelp.${kind}`)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <AskAi prompt={prompt} />
    </section>
  );
}
