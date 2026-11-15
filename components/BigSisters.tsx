import { useTranslations } from "next-intl";
import { CATS } from "@/lib/cats";
import CatPhoto from "./CatPhoto";

/** The cats waiting to meet the baby (their real photos). Shown at the bottom of the Baby tab. */
export default function BigSisters() {
  const t = useTranslations("cats");
  return (
    <div className="card-soft p-6">
      <h2 className="text-xl font-semibold text-primary-text">{t("waitingTitle")}</h2>
      <p className="mt-1 text-lg">{t("waitingText")}</p>
      <ul className="mt-4 flex justify-center gap-4">
        {CATS.map((cat, i) => (
          <li key={cat} className="flex flex-col items-center gap-1">
            <CatPhoto cat={cat} size={84} className={i === 1 ? "cat-float" : ""} />
            <span className="text-base font-semibold">{t(`names.${cat}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
