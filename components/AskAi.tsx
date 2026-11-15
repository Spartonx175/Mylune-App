"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Opens an AI assistant in a new tab with a generic question prompt on the clipboard.
// The app sends NOTHING about her: no name, dates, medicines or symptoms. She types her own question after the prompt.
export default function AskAi({ prompt }: { prompt: string }) {
  const t = useTranslations("ask");
  const [copied, setCopied] = useState(false);

  const open = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    window.open("https://claude.ai/new", "_blank", "noopener,noreferrer");
  };

  return (
    <section className="rounded-3xl bg-soft p-6">
      <h2 className="text-xl font-semibold text-primary-text">{t("title")}</h2>
      <p className="mt-1 text-lg">{t("text")}</p>
      <button
        type="button"
        onClick={open}
        className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary-text px-6 text-lg font-semibold text-white"
      >
        {t("button")}
      </button>
      <p role="status" className="mt-3 text-base text-muted-text">
        {copied ? t("copied") : t("note")}
      </p>
    </section>
  );
}
