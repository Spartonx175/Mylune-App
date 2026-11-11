import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CatId } from "@/lib/cats";

/** Round portrait of one of the household cats. */
export default function CatPhoto({ cat, size = 80, className = "" }: { cat: CatId; size?: number; className?: string }) {
  const t = useTranslations("cats");
  return (
    <Image
      src={`/cats/${cat}.webp`}
      alt={t("photoAlt", { name: t(`names.${cat}`) })}
      width={size}
      height={size}
      unoptimized
      className={`rounded-full border-4 border-surface object-cover shadow-sm ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
