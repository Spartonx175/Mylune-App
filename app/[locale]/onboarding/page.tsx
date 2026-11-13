import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import LocaleToggle from "@/components/LocaleToggle";
import OnboardingForm from "@/components/OnboardingForm";
import { CatMascot } from "@/components/CatMascot";
import { getCompanionCat } from "@/lib/cat-cookie";
import { getSession } from "@/lib/session";
import { claimPartnerAccess } from "@/lib/partner";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("onboarding");
  const session = await getSession();
  const cat = await getCompanionCat();

  if (!session.configured || !session.user) redirect({ href: "/login", locale });
  else if (session.profile) redirect({ href: "/", locale });
  // Partner gateway: a listed partner email skips this form (no medical details asked).
  else if (await claimPartnerAccess(locale)) redirect({ href: "/", locale });

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-3 pb-12">
      <div className="flex justify-end">
        <LocaleToggle />
      </div>
      <CatMascot cat={cat} className="mx-auto mt-2 h-32 w-32" />
      <h1 className="mb-2 mt-2 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-6 text-lg">{t("subtitle")}</p>
      <OnboardingForm />
    </main>
  );
}
