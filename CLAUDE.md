# CLAUDE.md — Mylune (repo rules for every session)

Read this file + ONLY the SPEC.md section named in the task. Do not read the whole repo.

## Context
Private bilingual (fr/en) PWA for one household. Android only. Next.js + Tailwind + next-intl + Supabase (Paris) + Vercel.
Admin/editor: Div (EN). Primary user: his wife (FR, non-technical).

## Hard rules
- Simplicity first: 4 tabs, large text, max 3 cards on Today. Never add features not in SPEC.md without asking.
- Health content: every statement cites an ID from content/sources.yaml. Food-avoid, medication and urgent content need at least 2 sources. No medication doses. No diagnosis.
- No runtime LLM calls. No third-party analytics. No personal data in logs.
- Content = files in /content/{en,fr}. EN is authored first; FR must mirror EN keys 1:1.
- Never copy images or text from commercial pregnancy apps/sites.
- Dates: SA (semaines d'aménorrhée) is the primary count. Use lib/dating.ts only; never re-implement.
- Timezone: Europe/Paris.

## Session hygiene (credit saving)
- One task per session. Plan in ≤5 bullets, then do it.
- Run `npm run lint && npm test` before committing. Commit with a clear message.
- Append a 1-line entry to CHANGELOG.md.
- If blocked, stop and write the question in TODO.md instead of guessing.

## Models
- Sonnet: build sessions, content authoring with sources.
- Haiku: FR translation, wording edits, monthly content top-up.

## Project links
- Repo: github.com/Spartonx175/Mylune-App
- Vercel: mylune-app/mylune-app
- Supabase project ref: agxifnlxxncfortasrgx
- Secrets (Supabase service_role key, VAPID private key) go ONLY in Vercel/Supabase env vars, never in the repo or chat.
