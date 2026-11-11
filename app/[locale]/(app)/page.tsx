import { setRequestLocale } from "next-intl/server";
import Placeholder from "@/components/Placeholder";
import { redirect } from "@/i18n/navigation";
import { getSession } from "@/lib/session";
import { getCompanionCat } from "@/lib/cat-cookie";

export default async function TodayPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // The app opens at /fr; honour the language saved on the profile.
  const session = await getSession();
  if (session.configured && session.profile && session.profile.locale !== locale) {
    redirect({ href: "/", locale: session.profile.locale });
  }

  const cat = await getCompanionCat();
  return <Placeholder screen="today" cat={cat} />;
}
