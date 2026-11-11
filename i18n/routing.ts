import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Always open in French (her language) unless the toggle cookie says otherwise.
  localeDetection: false,
});
