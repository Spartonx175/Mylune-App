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
    <section className="hero p-6">
      <div aria-hidden="true" className="glass absolute -right-8 -top-10 h-36 w-36 rounded-full opacity-60" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-text">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3ZM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />
          </svg>
        </span>
        <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
      </div>
      <p className="relative mt-3 text-lg text-white">{t("text")}</p>
      <button
        type="button"
        onClick={open}
        className="relative mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-white px-6 text-lg font-extrabold text-primary-text shadow-[0_12px_22px_-12px_rgba(0,0,0,0.5)] transition active:scale-95"
      >
        {t("button")}
      </button>
      <p role="status" className="relative mt-3 text-base text-white">
        {copied ? t("copied") : t("note")}
      </p>
    </section>
  );
}
