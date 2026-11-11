"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

export default function GoogleButton() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [failed, setFailed] = useState(false);

  async function signIn() {
    setFailed(false);
    const supabase = createClient();
    if (!supabase) return setFailed(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?locale=${locale}` },
    });
    if (error) setFailed(true);
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-text px-6 text-lg font-semibold text-white"
      >
        {t("google")}
      </button>
      {failed && (
        <p role="alert" className="mt-3 text-base font-medium text-urgent">
          {t("error")}
        </p>
      )}
    </div>
  );
}
