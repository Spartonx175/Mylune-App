import { useTranslations } from "next-intl";

type Screen = "today" | "baby" | "guide" | "feed" | "profile";

export default function Placeholder({ screen }: { screen: Screen }) {
  const t = useTranslations();
  return (
    <section className="py-4">
      <h1 className="mb-4 text-3xl font-bold">{t(`nav.${screen}`)}</h1>
      <div className="rounded-3xl bg-surface p-6 shadow-sm">
        <p className="mb-2 inline-block rounded-full bg-soft px-3 py-1 text-base font-semibold text-primary-text">
          {t("placeholder.soon")}
        </p>
        <p className="text-lg">{t(`placeholder.${screen}`)}</p>
      </div>
    </section>
  );
}
