import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Always open in French (her language); browser language and cookie are ignored. Per-user language lands with profiles in B2.
  localeDetection: false,
});
