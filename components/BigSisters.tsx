import { useTranslations } from "next-intl";
import { CATS } from "@/lib/cats";
import { CatMascot } from "./CatMascot";

/** The cats waiting to meet the baby. Shown on the Baby tab. */
export default function BigSisters() {
  const t = useTranslations("cats");
  return (
    <div className="mb-4 rounded-3xl bg-soft p-6">
      <h2 className="text-lg font-semibold text-primary-text">{t("waitingTitle")}</h2>
      <p className="mt-1 text-lg">{t("waitingText")}</p>
      <div className="mt-3 flex justify-center gap-3">
        {CATS.map((cat) => (
          <CatMascot key={cat} cat={cat} className="h-24 w-24" />
        ))}
      </div>
    </div>
  );
}
