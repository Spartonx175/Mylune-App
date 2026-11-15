"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { addAppointment, connectCalendar, deleteAppointment, disconnectCalendar, syncCalendar, type Result } from "@/app/track-actions";

function useErrorText() {
  const t = useTranslations("track.errors");
  return (res: Result) => {
    if (res.ok) return null;
    return t.has(res.error) ? t(res.error) : t("save_failed");
  };
}

export function AddAppointmentForm() {
  const t = useTranslations("appts");
  const errorText = useErrorText();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await addAppointment(name, when, where);
          setError(errorText(res));
          if (res.ok) {
            setName("");
            setWhen("");
            setWhere("");
          }
        });
      }}
    >
      <label className="block">
        <span className="mb-1 block text-base text-muted-text">{t("name")}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} className="min-h-14 w-full rounded-2xl border-2 border-soft bg-surface px-4 text-lg" />
      </label>
      <label className="block">
        <span className="mb-1 block text-base text-muted-text">{t("when")}</span>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required className="min-h-14 w-full rounded-2xl border-2 border-soft bg-surface px-4 text-lg" />
      </label>
      <label className="block">
        <span className="mb-1 block text-base text-muted-text">{t("where")}</span>
        <input value={where} onChange={(e) => setWhere(e.target.value)} maxLength={160} className="min-h-14 w-full rounded-2xl border-2 border-soft bg-surface px-4 text-lg" />
      </label>
      <button type="submit" disabled={pending} className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-white disabled:opacity-60">
        {t("save")}
      </button>
      {error && <p role="alert" className="text-base text-urgent">{error}</p>}
    </form>
  );
}

export function DeleteAppointmentButton({ id }: { id: string }) {
  const t = useTranslations("appts");
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await deleteAppointment(id)))}
      className="min-h-11 rounded-xl px-3 text-base font-semibold text-primary-text underline"
    >
      {t("remove")}
    </button>
  );
}

export function CalendarForm({ connected, lastSynced, lastError }: { connected: boolean; lastSynced: string | null; lastError: string | null }) {
  const t = useTranslations("appts");
  const errorText = useErrorText();
  const [pending, start] = useTransition();
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(lastError ? errorText({ ok: false, error: lastError }) : null);

  return (
    <div className="space-y-3">
      <p className="text-base text-muted-text">{t("calHelp")}</p>
      {connected ? (
        <>
          {lastSynced && <p className="text-base text-muted-text">{t("calLast", { date: lastSynced })}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await syncCalendar();
                  setError(errorText(res));
                  setMessage(res.ok ? t("calDone", { n: Number(res.message ?? 0) }) : null);
                })
              }
              className="min-h-14 flex-1 rounded-2xl bg-primary px-5 text-lg font-bold text-white disabled:opacity-60"
            >
              {t("calSync")}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await disconnectCalendar();
                  setError(errorText(res));
                  setMessage(null);
                })
              }
              className="min-h-14 rounded-2xl bg-soft px-5 text-base font-semibold text-ink disabled:opacity-60"
            >
              {t("calRemove")}
            </button>
          </div>
        </>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await connectCalendar(url);
              setError(errorText(res));
              setMessage(res.ok ? t("calDone", { n: Number(res.message ?? 0) }) : null);
              if (res.ok) setUrl("");
            });
          }}
        >
          <label className="block">
            <span className="mb-1 block text-base text-muted-text">{t("calLabel")}</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              autoComplete="off"
              className="min-h-14 w-full rounded-2xl border-2 border-soft bg-surface px-4 text-base"
            />
          </label>
          <button type="submit" disabled={pending} className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-white disabled:opacity-60">
            {t("calSave")}
          </button>
        </form>
      )}
      {message && (
        <p role="status" className="text-base text-muted-text">
          {message}
        </p>
      )}
      {error && <p role="alert" className="text-base text-urgent">{error}</p>}
    </div>
  );
}
