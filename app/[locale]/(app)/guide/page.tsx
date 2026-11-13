import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CatMascot } from "@/components/CatMascot";
import { getCompanionCat } from "@/lib/cat-cookie";

const TILES = [
  { kind: "foods", icon: "M7 3v8a3 3 0 0 0 3 3v7M7 3v5M10 3v5M17 3c-2 2-3 5-3 8h3v10" },
  { kind: "drinks", icon: "M6 3h12l-1.5 17a1 1 0 0 1-1 .9h-7a1 1 0 0 1-1-.9L6 3ZM7 9h10" },
  { kind: "exercise", icon: "M13 4a2 2 0 1 1 0 .01M8 21l3-6 3 2v4M9 11l3-2 3 3 3 1M11 9l-3 4-3-1" },
  { kind: "medicines", icon: "M8.5 4.5l11 11a4.2 4.2 0 0 1-6 6l-11-11a4.2 4.2 0 0 1 6-6ZM9 9l6 6" },
] as const;

export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const cat = await getCompanionCat();

  return (
    <section className="space-y-4 py-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("guide.title")}</h1>
          <p className="text-lg text-muted-text">{t("guide.intro")}</p>
        </div>
        <CatMascot cat={cat} variant="peek" className="h-16 w-16 shrink-0" />
      </div>

      <ul className="grid gap-3">
        {TILES.map(({ kind, icon }) => (
          <li key={kind}>
            <Link
              href={`/guide/${kind}`}
              className="flex min-h-20 items-center gap-4 rounded-3xl bg-surface p-5 shadow-sm"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-soft text-primary-text">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
              </span>
              <span>
                <span className="block text-xl font-semibold">{t(`guide.tiles.${kind}`)}</span>
                <span className="block text-base text-muted-text">{t(`guide.tilesHelp.${kind}`)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
