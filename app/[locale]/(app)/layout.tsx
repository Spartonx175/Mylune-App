import { redirect } from "@/i18n/navigation";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import { getSession } from "@/lib/session";
import { getCompanionCat } from "@/lib/cat-cookie";

// Per-user pages must never be prerendered at build time.
export const dynamic = "force-dynamic";

// Everything inside (app) needs a signed-in, onboarded user.
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  const cat = await getCompanionCat();

  if (!session.configured || !session.user) redirect({ href: "/login", locale });
  else if (!session.profile) redirect({ href: "/onboarding", locale });

  return (
    <>
      <Header cat={cat} />
      <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-2">{children}</main>
      <TabBar />
    </>
  );
}
