import { getTranslations, setRequestLocale } from "next-intl/server";
import { signOut } from "@/app/actions";
import { getSession } from "@/lib/session";

// A plain calendar date (YYYY-MM-DD) shown as-is, without timezone shifting.
const showDate = (iso: string | null, locale: string) =>
  iso ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`)) : null;

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getSession();
  if (!session.configured || !session.user || !session.profile) return null;

  const { user, profile } = session;
  const none = t("profile.none");
  const rows: [string, string][] = [
    [t("profile.language"), profile.locale === "fr" ? "Français" : "English"],
    [t("profile.ddr"), showDate(profile.ddr, locale) ?? none],
    [t("profile.due"), showDate(profile.due_date_override, locale) ?? none],
    [t("profile.maternity"), profile.maternity_name ?? none],
    [t("profile.phone"), profile.maternity_phone ?? none],
  ];

  return (
    <section className="py-4">
      <h1 className="mb-4 text-3xl font-bold">{t("nav.profile")}</h1>

      <div className="mb-4 rounded-3xl bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary-text">{t("profile.account")}</h2>
        <p className="mt-1 text-xl font-semibold">{profile.display_name ?? user.name ?? user.email}</p>
        {user.email && <p className="text-base text-muted-text">{user.email}</p>}
      </div>

      <dl className="mb-6 rounded-3xl bg-surface p-6 shadow-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="border-b border-soft py-3 last:border-0">
            <dt className="text-base text-muted-text">{k}</dt>
            <dd className="text-lg">{v}</dd>
          </div>
        ))}
      </dl>

      <form action={signOut.bind(null, locale)}>
        <button
          type="submit"
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-soft px-6 text-lg font-semibold text-ink"
        >
          {t("auth.signOut")}
        </button>
      </form>
    </section>
  );
}
