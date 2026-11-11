# TODO / open questions

## From B1 (for Div)
- **Palette contrast (SPEC §10 asked for an AA check):** spec `primary` #D9693F is 3.48:1 on white and `muted` #8A7A72 is 4.11:1, so both fail AA for body text. Kept the spec values as `primary`/`muted` (fills, decoration) and added `primary-text` #A04D2E and `muted-text` #73655F, used for all text, buttons and nav. Confirm you are happy with this, or pick different hexes. Checked in `tests/palette.test.ts`.
- **Serwist variant:** SPEC §1 names `@serwist/next`, which needs webpack; Next 16 builds with Turbopack. Used `@serwist/turbopack` (same Serwist runtime, route-handler based). Offline precache currently covers static assets only; page shells are cached at runtime (NetworkFirst). Offline page fallback is not built yet.
- **Language detection:** the app always opens in French; the FR/EN toggle is not remembered across visits yet (browser language and cookie are ignored on purpose). Remembering it per user is B2 (profile.locale).
- **Android install:** verify on a real phone after the Vercel deploy (Chrome > menu > "Add to Home screen" / "Install app"). Service worker registration could not be tested in the in-app preview browser.
- Profile screen is a placeholder reached from the top-right icon; the language toggle lives in the header for now (SPEC §3.5 puts language in settings).

## BLOCKED: deploy (B1)
- `git ls-remote https://github.com/Spartonx175/Mylune-App.git` returns "Repository not found" and no GitHub credential is stored on this PC. The B1 commit exists locally only (branch `main`, remote `origin` already added). Needed from Div: create the repo (or sign in to GitHub via Git Credential Manager), then `git push -u origin main`; Vercel project mylune-app auto-deploys from `main`. No Vercel CLI is installed here either.
