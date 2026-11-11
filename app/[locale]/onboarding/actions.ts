"use server";

import { redirect } from "@/i18n/navigation";
import { parseOnboarding, type OnboardingErrors } from "@/lib/onboarding";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { errors?: OnboardingErrors; failed?: boolean };

const field = (f: FormData, k: string) => (typeof f.get(k) === "string" ? (f.get(k) as string) : "");

export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const pageLocale = field(formData, "pageLocale") === "en" ? "en" : "fr";

  const parsed = parseOnboarding({
    locale: field(formData, "locale"),
    ddr: field(formData, "ddr"),
    dueDateOverride: field(formData, "due"),
    maternityName: field(formData, "maternityName"),
    maternityPhone: field(formData, "maternityPhone"),
  });
  if (!parsed.ok) return { errors: parsed.errors };

  const session = await getSession();
  if (!session.configured || !session.user) redirect({ href: "/login", locale: pageLocale });

  const supabase = await createClient();
  const name = session.configured && session.user ? session.user.name : null;
  const { error } = await supabase!.rpc("complete_onboarding", {
    p_locale: parsed.value.locale,
    p_ddr: parsed.value.ddr,
    p_due_date_override: parsed.value.dueDateOverride,
    p_maternity_name: parsed.value.maternityName,
    p_maternity_phone: parsed.value.maternityPhone,
    p_display_name: name,
  });
  if (error) return { failed: true };

  redirect({ href: "/", locale: parsed.value.locale });
  return {};
}
