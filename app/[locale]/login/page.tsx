import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import GoogleButton from "@/components/GoogleButton";
import LocaleToggle from "@/components/LocaleToggle";
import CatTrio from "@/components/CatTrio";
import { getSession } from "@/lib/session";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("auth");
  const session = await getSession();

  if (session.configured && session.user) redirect({ href: "/", locale });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 py-3">
      <div className="flex justify-end">
        <LocaleToggle />
      </div>
      <div className="my-auto py-10">
        <div className="mb-8">
          <CatTrio />
        </div>
        <h1 className="mb-2 text-4xl font-bold text-primary-text">Mylune</h1>
        <p className="mb-8 text-xl">{t("subtitle")}</p>
        {error && (
          <p role="alert" className="mb-4 text-base font-medium text-urgent">
            {t("error")}
          </p>
        )}
        {session.configured ? (
          <GoogleButton />
        ) : (
          <p role="alert" className="rounded-2xl bg-soft p-4 text-base">
            {t("notConfigured")}
          </p>
        )}
      </div>
    </main>
  );
}
