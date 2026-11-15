import { useTranslations } from "next-intl";
import CatPhoto from "@/components/CatPhoto";
import { DEFAULT_CAT } from "@/lib/cats";

// Shown while a screen loads. Uses the default cat: loading.tsx cannot read the companion cookie cheaply.
export default function Loading() {
  const t = useTranslations("cats");
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-20">
      <CatPhoto cat={DEFAULT_CAT} size={96} className="cat-float" />
      <p className="text-lg text-muted-text">{t("loading")}</p>
    </div>
  );
}
