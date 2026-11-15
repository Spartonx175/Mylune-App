"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const tabs = [
  {
    key: "today",
    href: "/",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" {...stroke} />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" {...stroke} />
      </>
    ),
  },
  {
    key: "baby",
    href: "/baby",
    icon: <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z" {...stroke} />,
  },
  {
    key: "guide",
    href: "/guide",
    icon: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" {...stroke} />
        <path d="M8 7h7" {...stroke} />
      </>
    ),
  },
  {
    key: "feed",
    href: "/feed",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" {...stroke} />
        <path d="M8 9h8M8 13h8M8 17h5" {...stroke} />
      </>
    ),
  },
] as const;

export default function TabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("main")}
      className="fixed inset-x-3 bottom-3 z-10 mx-auto max-w-xl rounded-[28px] border border-white/70 bg-white/85 pb-[env(safe-area-inset-bottom)] shadow-[0_18px_40px_-14px_rgba(143,61,34,0.55)] backdrop-blur-xl"
    >
      <ul className="flex">
        {tabs.map(({ key, href, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-sm font-bold ${
                  active ? "text-primary-text" : "text-muted-text"
                }`}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                    active ? "bg-primary-text text-white shadow-[0_8px_16px_-6px_rgba(143,61,34,0.9)]" : ""
                  }`}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
                    {icon}
                  </svg>
                </span>
                <span>{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
