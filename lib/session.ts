import { cache } from "react";
import { createClient } from "./supabase/server";

export type Profile = {
  user_id: string;
  locale: "fr" | "en";
  display_name: string | null;
  ddr: string | null;
  due_date_override: string | null;
  maternity_name: string | null;
  maternity_phone: string | null;
};

export type Session =
  | { configured: false }
  | { configured: true; user: null; profile: null }
  | { configured: true; user: { id: string; email: string | null; name: string | null }; profile: Profile | null };

/** Current user + profile, fetched once per request. */
export const getSession = cache(async (): Promise<Session> => {
  const supabase = await createClient();
  if (!supabase) return { configured: false };

  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return { configured: true, user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, locale, display_name, ddr, due_date_override, maternity_name, maternity_phone")
    .eq("user_id", u.id)
    .maybeSingle();

  const meta = u.user_metadata as { full_name?: string; name?: string } | undefined;
  return {
    configured: true,
    user: { id: u.id, email: u.email ?? null, name: meta?.full_name ?? meta?.name ?? null },
    profile: (profile as Profile | null) ?? null,
  };
});
