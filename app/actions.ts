"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { CAT_COOKIE, isCat } from "@/lib/cats";
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

/** Remember the companion cat on this device (cookie, one year). */
export async function saveCat(cat: string) {
  if (!isCat(cat)) return;
  (await cookies()).set(CAT_COOKIE, cat, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
}
