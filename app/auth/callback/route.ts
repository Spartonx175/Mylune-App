import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

// Google sign-in lands here with ?code=...; exchange it for a session, then go to the app.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const requested = searchParams.get("locale");
  const locale = routing.locales.find((l) => l === requested) ?? routing.defaultLocale;

  const code = searchParams.get("code");
  const supabase = await createClient();
  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/${locale}`);
  }
  return NextResponse.redirect(`${origin}/${locale}/login?error=1`);
}
