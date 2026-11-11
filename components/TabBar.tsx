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
    icon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" {...stroke} />,
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
      className="fixed inset-x-0 bottom-0 z-10 border-t border-soft bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-xl">
        {tabs.map(({ key, href, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 text-sm font-semibold ${
                  active ? "text-primary-text" : "text-muted-text"
                }`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-full ${active ? "bg-soft" : ""}`}>
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
