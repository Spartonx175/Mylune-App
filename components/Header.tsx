import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LocaleToggle from "./LocaleToggle";
import Logo from "./Logo";

// The companion cat stays on Today and in Profile; the header carries the brand mark.
export default function Header() {
  const t = useTranslations();
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-between gap-2 px-4 py-3">
      <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary-text">
        <Logo size={38} />
        {t("app.name")}
      </Link>
      <div className="flex items-center gap-2">
        <LocaleToggle />
        <Link
          href="/profile"
          className="flex min-h-11 min-w-12 flex-col items-center justify-center text-sm font-semibold text-ink"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span>{t("nav.profile")}</span>
        </Link>
      </div>
    </header>
  );
}
