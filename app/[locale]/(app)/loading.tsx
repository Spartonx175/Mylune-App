import { useTranslations } from "next-intl";
import { CatWalker } from "@/components/CatMascot";
import { DEFAULT_CAT } from "@/lib/cats";

// Shown while a screen loads. Uses the default cat: loading.tsx cannot read the companion cookie cheaply.
export default function Loading() {
  const t = useTranslations("cats");
  return (
    <div role="status" className="flex flex-col items-center gap-2 py-16">
      <CatWalker cat={DEFAULT_CAT} className="h-24 w-44" />
      <p className="text-lg text-muted-text">{t("loading")}</p>
    </div>
  );
}
