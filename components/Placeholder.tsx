import { useTranslations } from "next-intl";
import { CatMascot } from "./CatMascot";
import type { CatId } from "@/lib/cats";

type Screen = "today" | "baby" | "guide" | "feed" | "profile";

export default function Placeholder({ screen, cat }: { screen: Screen; cat: CatId }) {
  const t = useTranslations();
  return (
    <section className="py-4">
      <h1 className="mb-4 text-3xl font-bold">{t(`nav.${screen}`)}</h1>
      <div className="relative overflow-hidden rounded-3xl bg-surface p-6 pr-28 shadow-sm">
        <div className="cat-peek pointer-events-none absolute bottom-0 right-3 h-24 w-24">
          <CatMascot cat={cat} variant="peek" className="h-full w-full" />
        </div>
        <p className="mb-2 inline-block rounded-full bg-soft px-3 py-1 text-base font-semibold text-primary-text">
          {t("placeholder.soon")}
        </p>
        <p className="text-lg">{t(`placeholder.${screen}`)}</p>
      </div>
    </section>
  );
}
