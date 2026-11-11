"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { saveCat } from "@/app/actions";
import { CATS, type CatId } from "@/lib/cats";
import { CatMascot } from "./CatMascot";
import CatPhoto from "./CatPhoto";

/** Pick the companion cat: changes the mascot and the soft colour tint on this phone. */
export default function CatPicker({ current }: { current: CatId }) {
  const t = useTranslations("cats");
  const router = useRouter();
  const [selected, setSelected] = useState<CatId>(current);
  const [pending, start] = useTransition();

  const choose = (cat: CatId) => {
    setSelected(cat);
    start(async () => {
      await saveCat(cat);
      router.refresh();
    });
  };

  return (
    <fieldset className="mb-6 rounded-3xl bg-surface p-6 shadow-sm" aria-busy={pending}>
      <legend className="px-1 text-lg font-semibold text-primary-text">{t("pickTitle")}</legend>
      <p className="mb-4 text-base text-muted-text">{t("pickHelp")}</p>
      <div className="grid grid-cols-3 gap-3">
        {CATS.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={selected === cat}
            onClick={() => choose(cat)}
            className={`flex min-h-11 flex-col items-center gap-2 rounded-2xl border-2 p-3 text-base font-medium ${
              selected === cat ? "border-primary-text bg-soft" : "border-soft bg-surface"
            }`}
          >
            <CatPhoto cat={cat} size={64} />
            <CatMascot cat={cat} className="h-14 w-14" />
            <span>{t(`names.${cat}`)}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
