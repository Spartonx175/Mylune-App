import { createServerClient } from "@supabase/ssr";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getSupabaseEnv } from "./lib/supabase/env";

const intlMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  // Keep the Supabase session fresh; refreshed cookies ride on the same response.
  const env = getSupabaseEnv();
  if (env) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    });
    await supabase.auth.getClaims();
  }

  return response;
}

export const config = {
  // Skip API, auth callback, Next internals, the service worker route and any file with an extension.
  matcher: ["/((?!api|auth|_next|_vercel|serwist|.*\\..*).*)"],
};
