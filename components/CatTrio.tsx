import { useTranslations } from "next-intl";
import { CATS } from "@/lib/cats";
import CatPhoto from "./CatPhoto";

/** The three household cats side by side, with their names. */
export default function CatTrio({ size = 88 }: { size?: number }) {
  const t = useTranslations("cats");
  return (
    <ul className="flex items-start justify-center gap-5">
      {CATS.map((cat) => (
        <li key={cat} className="flex flex-col items-center gap-1">
          <CatPhoto cat={cat} size={size} />
          <span className="text-base font-medium">{t(`names.${cat}`)}</span>
        </li>
      ))}
    </ul>
  );
}
