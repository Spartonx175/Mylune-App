import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SerwistProvider } from "@serwist/turbopack/react";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import TabBar from "@/components/TabBar";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "app" });
  return {
    title: t("name"),
    description: t("tagline"),
    applicationName: t("name"),
    appleWebApp: { capable: true, title: t("name") },
  };
}

export const viewport: Viewport = {
  themeColor: "#FFF8F3",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <SerwistProvider swUrl="/serwist/sw.js">
            <Header />
            <main className="mx-auto w-full max-w-xl px-4 pb-28 pt-2">{children}</main>
            <TabBar />
          </SerwistProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
