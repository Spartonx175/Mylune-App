"use server";

import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

/** Remember the chosen language on the signed-in user's profile. No-op when signed out. */
export async function saveLocalePreference(locale: string) {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) return;
  const supabase = await createClient();
  if (!supabase) return;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("profiles").update({ locale }).eq("user_id", data.user.id);
}

export async function signOut(locale: string) {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect({ href: "/login", locale });
}
