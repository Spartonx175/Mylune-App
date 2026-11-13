import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CheckSearch, { type ClientSource } from "@/components/CheckSearch";
import { checksOrFallback } from "@/lib/content/safe";
import { loadSources } from "@/lib/content/load";
import type { CheckKind } from "@/lib/content/check-types";
import type { Locale } from "@/lib/content/types";

const KINDS: CheckKind[] = ["foods", "drinks", "exercise", "medicines"];

export default async function CheckPage({ params }: { params: Promise<{ locale: string; kind: string }> }) {
  const { locale, kind } = await params;
  setRequestLocale(locale);
  if (!KINDS.includes(kind as CheckKind)) notFound();
  const k = kind as CheckKind;
  const t = await getTranslations();

  const { data: items, fallback } = checksOrFallback(locale as Locale, k);
  // Only ship the sources these items cite to the browser.
  const cited = new Set(items.flatMap((i) => i.answers.flatMap((a) => a.sources)));
  const sources: Record<string, ClientSource> = {};
  for (const s of loadSources().sources) if (cited.has(s.id)) sources[s.id] = { name: s.name, title: s.title, url: s.url };

  return (
    <section className="space-y-4 py-4">
      <Link href="/guide" className="inline-flex min-h-11 items-center text-base font-semibold text-primary-text underline">
        ← {t("check.back")}
      </Link>
      <h1 className="text-3xl font-bold">{t(`guide.tiles.${k}`)}</h1>
      {fallback && <p className="text-base text-muted-text">{t("today.fallbackNote")}</p>}
      <CheckSearch kind={k} items={items} sources={sources} />
    </section>
  );
}
