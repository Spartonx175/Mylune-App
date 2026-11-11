import { setRequestLocale } from "next-intl/server";
import Placeholder from "@/components/Placeholder";
import { getCompanionCat } from "@/lib/cat-cookie";
import BigSisters from "@/components/BigSisters";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cat = await getCompanionCat();
  return (
    <>
      <BigSisters />
      <Placeholder screen="baby" cat={cat} />
    </>
  );
}
