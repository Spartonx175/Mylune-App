import { createClient } from "./supabase/server";

/**
 * Partner gateway: asks the database whether the signed-in (verified) email is on the partner list and, if so,
 * creates a partner profile so onboarding is skipped. The list lives in the database (table partner_emails), not in code.
 */
export async function claimPartnerAccess(locale: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("claim_partner_access", { p_locale: locale });
  return !error && data === true;
}
