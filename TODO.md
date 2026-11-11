# TODO / open questions

## From B1 (for Div)
- **Palette contrast (SPEC §10 asked for an AA check):** spec `primary` #D9693F is 3.48:1 on white and `muted` #8A7A72 is 4.11:1, so both fail AA for body text. Kept the spec values as `primary`/`muted` (fills, decoration) and added `primary-text` #A04D2E and `muted-text` #73655F, used for all text, buttons and nav. Confirm you are happy with this, or pick different hexes. Checked in `tests/palette.test.ts`.
- **Serwist variant:** SPEC §1 names `@serwist/next`, which needs webpack; Next 16 builds with Turbopack. Used `@serwist/turbopack` (same Serwist runtime, route-handler based). Offline precache currently covers static assets only; page shells are cached at runtime (NetworkFirst). Offline page fallback is not built yet.
- **Language:** app opens at /fr; once signed in, the language saved on the profile wins (Today redirects, the FR/EN toggle saves to profile.locale). Browser language is ignored on purpose.
- **Android install:** verify on a real phone after the Vercel deploy (Chrome > menu > "Add to Home screen" / "Install app"). Service worker registration could not be tested in the in-app preview browser.
- Profile screen is a placeholder reached from the top-right icon; the language toggle lives in the header for now (SPEC §3.5 puts language in settings).

## BLOCKED: deploy (B1)
- `git ls-remote https://github.com/Spartonx175/Mylune-App.git` returns "Repository not found" and no GitHub credential is stored on this PC. The B1 commit exists locally only (branch `main`, remote `origin` already added). Needed from Div: create the repo (or sign in to GitHub via Git Credential Manager), then `git push -u origin main`; Vercel project mylune-app auto-deploys from `main`. No Vercel CLI is installed here either.

## From B2 (for Div)
- Run the setup in `docs/SETUP-supabase.md` (SQL, Google OAuth, Vercel env vars). Until the env vars are set the live app shows "La connexion n'est pas encore configurée."
- **Admin role:** SPEC §9 gates /admin and feed/creator writes on `role = admin`, but §6 profiles.role only allows mother/partner. Not invented here. feed_items/creators have read-only RLS; admin writes arrive with B8 (decide: add `is_admin` column or role value).
- **Partner (Div) joining her household** is P2 (partner link/invite). For now every new sign-in creates its own household, so Div signing in creates a separate test household.
- Profile screen is read-only in B2; editing DDR/maternity/toxo flags comes later (SPEC §3.5).
- Toxo default is `non_immune` (strict rules, SPEC §5); CMV default `unknown`. Confirm.
- Unverified: Google sign-in from inside the installed app (WebAPK) returning to the app. Test on the phone.

## B3 notes (2026-11-11)
- DATING DECISION NEEDED (Div): the clinic's due date may differ from the DDR-based date in SPEC section 2. lib/dating.ts supports both: a due date entered in onboarding overrides the DDR (equivalent DDR = due date - 280 days). Confirm with the clinic which due date she should enter.
- No health conditions are stored in the repo or the DB (only toxo_status). Adding condition flags would be a feature beyond SPEC (ask first).
- content/sources.yaml has the allowlist and no entries yet; entries are added with the C1 content (each read and dated).

## C1 slice 1 notes (urgent + food, EN) - for Div
- **Missing 2nd source, so NOT written (add when a source is read):** caffeine (only NHS foods page read; WHO guideline PDF returned 403), general herbal teas other than liquorice (NHS only), liver is cited to two NHS pages (no FR/other source found).
- **114 (SMS emergency for deaf/hard of hearing) not included:** no allowlisted page that states it was readable (service-public.fr redirects to service-public.gouv.fr, which is NOT on the allowlist; approve adding service-public.gouv.fr?). 15 and 112 are stated on one page only (ameli crise suicidaire); 3114 on two ameli pages.
- **Urgent topics left out for lack of 2 sources:** loss of fluid, regular painful contractions before term, fever. Reduced baby movements is cited to two NHS pages only; a French source (CNGOF/HAS/ameli) is still wanted. Retry 1000jours.fr (connection reset) and cngof.fr.
- **French vs UK differences:** pâté, soft cheeses and dry-cured meats follow the stricter French rule. NHS lists pâté as "be careful". Please have the sage-femme glance at food + urgent.
- **Maternity guide PDF** (ameli guide-maternite-2023.pdf) was unreadable by the fetch tool; not cited.
- urgent.md is not yet read by a loader (no loadUrgent in lib/content); the test checks sections and sources. Add a loader when the Today/urgent screen is built.
- why_fr is "[FR TODO] " + EN text; C2 (Haiku) translates.
