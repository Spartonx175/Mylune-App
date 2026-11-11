# Changelog

- 2026-11-11 B1: scaffold Next.js 16 + Tailwind 4 + next-intl (fr default, en) + Serwist PWA, SPEC §10 palette (AA-safe text variants), 4-tab shell with placeholder screens, FR/EN toggle.
- 2026-11-11 B1 fix: manifest id + start_url /fr (no redirect) to help Android install detection.
- 2026-11-11 B2: Supabase schema + RLS + complete_onboarding RPC (supabase/migrations/0001_init.sql), Google login, onboarding, profile + sign-out, language saved on profile. Needs docs/SETUP-supabase.md steps done by Div.
- 2026-11-11 B3: lib/dating.ts (SA/SG, 40 and 41 SA due dates, dating-scan window, trimester, due-date override) + content loader (weeks, food, sources) with source/allowlist validation; 20 new tests.
- 2026-11-11 C1 slice 1: content/sources.yaml (23 pages read), content/en/urgent.md, content/en/food/items.yaml (toxo-aware), tests/content-c1.test.ts. Caffeine, 114 and some urgent signs deferred, see TODO.
- 2026-11-11 Cats: three household cats as cropped photos (public/cats), drawn animated mascots in their coat colours, companion-cat picker on Profile (cookie, per phone) that changes mascot and soft tint; shown on login, onboarding, Baby tab, loading and empty states.
- 2026-11-11 Cats: real names (Ohana ginger, Luna tabby, Loomis ragdoll).
- 2026-11-11 C1 slice 2a: content/en/weeks/w06-w12 (NHS week pages + ameli follow-up pages), 24 new sources in sources.yaml, tests/content-weeks.test.ts. size_compare kumquat added for w10.
- 2026-11-11 C1 slice 2b/2c: content/en/symptoms (6 files), content/en/calendar/fr-followup.yaml (22 steps), loadSymptom/listSymptoms/loadCalendar in lib/content/load.ts (dose check, 2-source rule for symptoms), fixtures + tests/content-symptoms-calendar.test.ts. Gaps in TODO.md.
- 2026-11-11 B4: Today (progress ring with SA + days, countdown, due dates, baby size + tip of the day, coming-up steps; max 3 cards) and Baby (week chips, in-house fruit illustrations, baby/you/to-do lists, sources, 41-week trimester timeline) from content; falls back to EN until C2 French lands; content files traced into the Vercel build.
- 2026-11-11 C2: French mirror of all EN content (content/fr: urgent, food items with why_fr, weeks 6-12, 6 symptoms, follow-up calendar), EN food why_fr set to the French text, tests/content-fr.test.ts (FR loads, mirrors EN, no [FR TODO]).
