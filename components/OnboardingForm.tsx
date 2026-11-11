"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { completeOnboarding, type OnboardingState } from "@/app/[locale]/onboarding/actions";

const input = "mt-1 min-h-12 w-full rounded-2xl border border-muted-text bg-surface px-4 text-lg";
const label = "block text-lg font-semibold";
const help = "mt-1 text-base text-muted-text";
const error = "mt-1 text-base font-medium text-urgent";

export default function OnboardingForm() {
  const t = useTranslations("onboarding");
  const locale = useLocale();
  const [state, action, pending] = useActionState<OnboardingState, FormData>(completeOnboarding, {});
  const e = state.errors;

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="pageLocale" value={locale} />

      <fieldset>
        <legend className={label}>{t("language")}</legend>
        <div className="mt-2 flex gap-3">
          {(["fr", "en"] as const).map((l) => (
            <label key={l} className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl bg-soft px-4 text-lg">
              <input type="radio" name="locale" value={l} defaultChecked={l === locale} className="h-5 w-5 accent-primary-text" />
              {l === "fr" ? "Français" : "English"}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="ddr" className={label}>{t("ddr")}</label>
        <input id="ddr" name="ddr" type="date" required className={input} aria-describedby="ddr-help" aria-invalid={!!e?.ddr} />
        <p id="ddr-help" className={help}>{t("ddrHelp")}</p>
        {e?.ddr && <p role="alert" className={error}>{t(`errors.ddr_${e.ddr}`)}</p>}
      </div>

      <div>
        <label htmlFor="due" className={label}>{t("due")}</label>
        <input id="due" name="due" type="date" className={input} aria-describedby="due-help" aria-invalid={!!e?.due} />
        <p id="due-help" className={help}>{t("dueHelp")}</p>
        {e?.due && <p role="alert" className={error}>{t("errors.due_invalid")}</p>}
      </div>

      <div>
        <label htmlFor="maternityName" className={label}>{t("maternityName")}</label>
        <input id="maternityName" name="maternityName" type="text" maxLength={120} autoComplete="off" className={input} />
      </div>

      <div>
        <label htmlFor="maternityPhone" className={label}>{t("maternityPhone")}</label>
        <input id="maternityPhone" name="maternityPhone" type="tel" maxLength={40} autoComplete="off" className={input} />
      </div>

      {state.failed && <p role="alert" className={error}>{t("errors.generic")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-text px-6 text-lg font-semibold text-white disabled:opacity-60"
      >
        {pending ? t("saving") : t("submit")}
      </button>
    </form>
  );
}
