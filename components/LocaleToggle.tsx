"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { saveLocalePreference } from "@/app/actions";

export default function LocaleToggle() {
  const t = useTranslations("lang");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div role="group" aria-label={t("label")} className="flex rounded-full bg-soft p-1">
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={active}
            aria-label={t(l === "fr" ? "frFull" : "enFull")}
            onClick={async () => {
              await saveLocalePreference(l);
              router.replace(pathname, { locale: l });
            }}
            className={`min-h-11 min-w-12 rounded-full px-3 text-base font-semibold ${
              active ? "bg-primary-text text-white" : "text-ink"
            }`}
          >
            {t(l)}
          </button>
        );
      })}
    </div>
  );
}
