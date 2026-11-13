import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import CheckSearch from "@/components/CheckSearch";
import { sourcesFor } from "@/lib/check-sources";
import { checksOrFallback } from "@/lib/content/safe";
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
  // The phone only receives the tip items; everything else is searched on the server.
  const tips = items.filter((i) => i.tips?.length);

  return (
    <section className="space-y-4 py-4">
      <Link href="/guide" className="inline-flex min-h-11 items-center text-base font-semibold text-primary-text underline">
        ← {t("check.back")}
      </Link>
      <h1 className="text-3xl font-bold">{t(`guide.tiles.${k}`)}</h1>
      {fallback && <p className="text-base text-muted-text">{t("today.fallbackNote")}</p>}
      <CheckSearch kind={k} tips={tips} total={items.length} tipSources={sourcesFor(tips)} />
    </section>
  );
}
