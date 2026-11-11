# Mylune — Architecture Spec v1

Owner: Div (admin, editor, EN). Primary user: his wife (FR). Private app, not commercial. Android-only, no iOS spend.
Status: architecture, Nov 11 2026. Pregnancy at 6 weeks as of today.

---

## 0. Principles (apply to every build/edit session)

1. **Simple over complete.** 4 tabs, large text, one action per card. Built for a non-technical user.
2. **Sourced or absent.** Every health statement cites an allowlisted source. Food-avoid / medication / warning-sign content needs at least 2 independent sources.
3. **Guide, never diagnose.** No medication doses. "Ask your sage-femme / doctor / pharmacist" plus a link.
4. **Content is files, user data is DB.** Div edits content in Git (directly or via Claude). Personal logs live in Supabase.
5. **Bilingual at authoring time, not runtime.** Content is written in EN, translated to FR once (Haiku), and both are stored. No live machine translation of medical text.
6. **Just-in-time content.** Only the next ~4–6 weeks of content need to exist at any time. Cuts AI credit use by roughly 80%.
7. **Minimum AI at runtime.** The app itself calls no LLM. Feed fetching is plain code (RSS), not AI.

---

## 1. Stack (all free tier)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript + Tailwind | Fits Div's existing Vercel account |
| PWA | `@serwist/next` (service worker, offline, installable) | Installed on Android via Chrome → "Add to Home screen" |
| i18n | `next-intl`, locales `fr` (default for her) / `en` | Per-user language setting stored in profile |
| Hosting | Vercel (Hobby) | Auto-deploy from GitHub `main` |
| Auth + DB + cron | Supabase, **EU region (Paris, eu-west-3)** | Google login (one tap for her). Postgres + Row Level Security |
| Push | Web Push (VAPID) via `web-push`, sent by a Supabase Edge Function | Triggered by `pg_cron` every 15 min |
| Feed ingest | Vercel Cron (daily) → fetch YouTube channel RSS → upsert `feed_items` | No API key needed for channel RSS |
| Export | Client-side PDF (`@react-pdf/renderer`) + CSV; Android share sheet via Web Share API | Share sheet → Google Drive / WhatsApp / email. No Drive API integration needed |
| Charts (later) | Lightweight (e.g. `recharts`) | Weight, baby growth vs WHO curves |

**Verify during build (unverified technical assumptions):**
- Supabase free projects pause after ~7 days of inactivity. The daily Vercel cron hitting the DB keeps it awake.
- Vercel Hobby cron limited to once per day. That's why push scheduling sits in Supabase `pg_cron`.

**Google Drive:** v1 uses share-sheet export (manual, zero setup). v2 option: weekly automatic JSON/PDF backup to a Drive folder via a Google service account. Only if wanted.

---

## 2. Pregnancy dating (core logic, everything depends on it)

- Onboarding asks for **date of last period (DDR)**. Optional override: **due date from the dating scan** (échographie de datation, ~12 SA). The dating scan overrides DDR when entered.
- App computes and displays **SA (semaines d'aménorrhée)**, the French medical count. Secondary display: "weeks of pregnancy (SG) = SA − 2".
- Due date: show **both** 40 SA (international convention) and **41 SA (French convention for "terme")**. Verify the French convention against CNGOF/HAS in the content phase.
- **Confirmed from lab report: DDR = 6 Oct 2026.**
  - 11 Nov 2026 = 5 SA + 1 day, i.e. "in the 6th week" (French phrasing, which explains "6 weeks").
  - 40 SA = 13 Jul 2027. 41 SA (French terme) = 20 Jul 2027.
  - Dating scan (T1, ~11–13 SA+6) window ≈ 22 Dec 2026 – 11 Jan 2027. Its date overrides DDR when entered.
- UI wording: show "5 SA + 1 j (6e semaine)" so both ways of counting are visible.
- `lib/dating.ts` is a pure function with unit tests. Day-level precision: "6 SA + 2 days".

---

## 3. Screens (4 tabs + settings)

Bottom nav: **Aujourd'hui / Bébé / Guide / Fil** + a profile icon (top right).

### 3.1 Today (Aujourd'hui), the home screen
- Header: "6 SA + 2 j · Bébé ≈ taille d'une lentille" + small illustration.
- **Today's 3 cards max**: tip of the day, food focus (seasonal), one gentle action (walk / hydrate / rest).
- **Checklist**: daily items she ticks (folic acid if prescribed, water, walk). Items are defined by her reminder setup.
- **Next appointment / admin step** (from the French calendar).
- Quick log button: "Comment je me sens ?" → mood 1–5 + symptom chips + note (10 seconds).
- Permanent small red link: **"Urgence / Quand appeler"**.

### 3.2 Baby (Bébé)
- Week carousel (swipe), defaulting to the current week. Per week:
  - size comparison
  - approximate length/weight
  - 3–5 development bullets
  - "what's changing for you" bullets
  - "this week's to-dos"
- Visuals: original or open-licence illustrations only (see §7). One per week, not daily.
- After birth this tab switches to baby tracking (Phase 3).

### 3.3 Guide
Simple tiles, each opening plain list pages:
- **Alimentation**:
  - eat / limit / avoid, searchable
  - toxo-aware rules (see §5)
  - seasonal produce for the current month in France
  - simple meal ideas
- **Symptômes**: fatigue, nausea, cramps, stomach pain, constipation, sleep, back pain, headaches, mood… Each one: what helps / what to avoid / **call if…**
- **Suivi médical France**: timeline of consultations, scans, blood tests, admin (déclaration, maternity registration, congé maternité, CAF).
- **Bien-être & mental**: rest, stress, partner relationship, perinatal mood resources.
- **Activité**: safe exercise per trimester.
- **Urgence**: warning signs → 15 (SAMU) / maternity emergency department. Her maternity's phone number is pinned at the top (set in settings).
- **Ressources**: curated directory of official sites, each with a one-line description.

### 3.4 Feed (Fil)
Single scroll of cards, newest first. Card types:
- `youtube`: auto-ingested from an allowlist of channels; inline player.
- `instagram`: post URL added manually by Div → rendered via Instagram embed script. Fallback: thumbnail + "Ouvrir dans Instagram".
- `article`: link card (title, source, one-line summary).
- `infographic`: image Div uploads (Supabase Storage).
- `affirmation`: short positive message from Div's curated list.

Plus a **"Comptes suivis"** strip at the top: avatars of curated Instagram/YouTube creators. Tapping one deep-links into the Instagram/YouTube app on that profile.
- Instagram login is not needed. Instagram does not allow third-party apps to pull a feed of other accounts. Deep links plus manual embeds are the robust route.

Filters: tag chips (alimentation, sommeil, accouchement, bien-être…) and **trimester-aware**: items carry `week_min/week_max`.

Exclusion setting: she can hide topics (e.g. birth stories, loss).

### 3.5 Profile / settings
- Language FR/EN
- DDR / due date
- Maternity name + phone
- Toxo/CMV status (see §5)
- **Reminders**: list with on/off toggle, time, days. Starts with 1–2 items; she adds from presets.
- Quiet hours
- Export (PDF / CSV)
- Partner link (invite Div)
- Hidden feed topics

---

## 4. Notifications (user-controlled)

- **Default at install: 2 notifications/day max.** Morning "today" summary (~9:00); one optional action (e.g. walk at 17:00). Everything else is opt-in.
- **Preset library** (she taps to add): walk, hydrate, rest/nap, eat snack (nausea), supplement, posture break, appointment reminder (day before + morning of), weekly "new week" note.
- Quiet hours enforced server-side. Hard cap configurable (default 3/day).
- Mechanism:
  1. `reminders` rows (time, days, timezone Europe/Paris).
  2. `pg_cron` every 15 min calls the Edge Function.
  3. The function selects due reminders and sends web push to `push_subscriptions`.
- Copy is short, kind, and not nagging ("Petite marche de 15 min ?"). Copy lives in content files so Div can edit wording.
- Div can add a one-off "message from Div" push from an admin page (later, optional).

---

## 5. Personalisation flags (her current profile)

| Flag | Current value | Effect |
|---|---|---|
| `toxo_status` | `non_immune` (negative 2 years ago, new result pending) | Strict toxo food rules shown everywhere (meat well-cooked, wash produce, raw cured meats, cat litter, gardening gloves) + monthly-serology reminder. Switch to `immune` if the new result says so. *Verify the monthly-serology rule (HAS/ameli).* |
| `cmv_status` | `immune` | CMV hygiene content shown softer (still informational). |
| `diet` | French omnivore | Meal ideas use French cuisine and French supermarket products. |
| `locale_city` | Paris | Seasonal produce, weather tips (winter → vitamin D, hydration indoors; summer heatwaves near term in July). |

Status values are editable in settings. Content files use `conditions: [toxo_non_immune]` to show/hide.

---

## 6. Data model (Supabase)

```
households(id, created_at)
profiles(user_id PK→auth.users, household_id, role['mother','partner'], display_name,
         locale['fr','en'], ddr date, due_date_override date, toxo_status, cmv_status,
         maternity_name, maternity_phone, quiet_start time, quiet_end time,
         hidden_topics text[], created_at)
reminders(id, household_id, user_id, preset_key, title_fr, title_en, time, days int[],
          enabled bool, tz default 'Europe/Paris')
push_subscriptions(id, user_id, endpoint, p256dh, auth, created_at)
logs(id, household_id, user_id, logged_at timestamptz, type['mood','symptom','weight',
     'note','water','walk','checklist','lab'], value jsonb)
-- 'lab' value: {test, value, unit, ref_range, sampled_on, lab, file_url}  e.g. hCG; photo/PDF of report in Storage
appointments(id, household_id, at timestamptz, kind, title, notes, location)
feed_items(id, type, url, title_fr, title_en, summary_fr, summary_en, source_name,
           thumbnail_url, tags text[], week_min int, week_max int, published_at,
           status['live','hidden'], added_by)
creators(id, platform['instagram','youtube'], handle, channel_id, display_name,
         lang['fr','en'], credential, avatar_url, active bool)
-- Phase 3
babies(id, household_id, name, birth_at, birth_weight_g, birth_length_mm, birth_notes jsonb)
baby_logs(id, baby_id, at, type['feed','sleep','nappy','growth','temp','vaccine','note'], value jsonb)
```

RLS: every row is readable/writable only by members of the same `household_id`. `feed_items` and `creators` are readable by all signed-in users and writable by the admin role only.

---

## 7. Content system (Git, editable by Div)

```
content/
  en/ fr/                       # same structure in both
    weeks/w06.md … w41.md       # frontmatter + body
    symptoms/nausea.md …
    food/items.yaml             # one list, status per item
    food/seasonal.yaml          # month → produce (France)
    calendar/fr-followup.yaml   # French follow-up timeline by SA
    urgent.md
    wellbeing/*.md
    reminders/presets.yaml      # notification copy
    resources.yaml
    affirmations.yaml
  sources.yaml                  # allowlist with IDs
```

**Week file frontmatter**
```yaml
week_sa: 6
size_compare: "lentil"
length_mm: 4          # approximate
illustration: /img/weeks/w06.svg
baby: [..3-5 bullets..]
mother: [..3-5 bullets..]
todo: [..admin/medical items..]
tip_of_day: [..7 short tips, one per day..]
sources: [ameli-grossesse, nhs-week-6]
reviewed: 2026-11-11
```

**Food item**
```yaml
- id: raw-cured-ham
  status: avoid          # eat | limit | avoid
  conditions: [toxo_non_immune]
  why_fr: "..."
  why_en: "..."
  sources: [mangerbouger-grossesse, ameli-toxo]
```

**Source allowlist (sources.yaml)**
- FR (primary): ameli.fr, Santé publique France / 1000 premiers jours, HAS, CNGOF, mangerbouger.fr, service-public.fr, CAF.
- International: NHS, ACOG, WHO, CDC, NICE.
- Peer-reviewed (PubMed) only for specific claims, cited author/year/journal.
- Anything outside the allowlist needs Div's approval.

**Visuals**: no copying from BabyCenter/Flo/etc. Options:
- (a) simple SVG illustrations generated in-house (fruit/size comparison + stylised embryo/foetus)
- (b) open-licence medical illustrations, with licence recorded in frontmatter

**Content production rule (credit saver):**
- Write in EN with Sonnet, using sources fetched in that session.
- Translate to FR with Haiku.
- Div spot-checks.
- Ideally her sage-femme glances at the food/urgent pages once.

**Content backlog to source and verify (priority order):**
1. `urgent.md` (warning signs, numbers)
2. Food rules incl. toxo
3. French follow-up calendar. **Paris flag: maternity registration fills early. Book now** (verify typical timing).
4. Weeks 6–12
5. Symptoms for T1 (nausea, fatigue, cramps, breast tenderness, constipation, mood)
6. Remaining weeks, generated 4–6 weeks ahead

---

## 8. Feed curation

- **Ingest (no AI):** daily Vercel cron reads the RSS of each active YouTube `creators` row → new videos land as `status: hidden` → Div approves in the admin page (one tap). Option: auto-live for highly trusted channels.
- **Manual:** admin page form for "paste URL → choose tags/weeks → publish" (Instagram, article, image).
- **Creator selection criteria:** credentialed (sage-femme, gynéco-obstétricien, pédiatre, IBCLC, registered dietitian) or official body; evidence-based track record; active in last 3 months. Mix: ~70% French creators, ~30% reputable EN.
- **Creator shortlist = separate research task** (one session, Sonnet + web search). Output goes into `creators` table. Not done yet; no names asserted here.

---

## 9. Admin (Div)

- `/admin` route, gated by `role = admin` (Div's account).
- Pages: feed queue (approve/hide), add feed item, creators, send one-off push, view household logs (read-only, with her consent).
- Content edits are **not** in admin. They happen in Git via Claude Code or GitHub web editor. Vercel redeploys in ~1 min.

---

## 10. Design

- Peach/orange palette (Mylène's preference). No dark mode in v1.
  - bg `#FFF8F3` (cream)
  - surface `#FFFFFF`
  - soft `#FDE3D3` (peach tint, cards/chips)
  - accent `#F4A27E` (peach, illustrations/highlights)
  - primary `#D9693F` (deep apricot, buttons/links)
  - text `#3B2F2B`
  - muted `#8A7A72`
  - urgent `#C0392B`
  - Check every text/background pair passes WCAG AA in B1. Use `primary`, not `accent`, for text on white.
- Base font 17–18px, generous spacing, rounded cards, icons with labels (never icon-only).
- Max 3 cards above the fold on Today. No dashboards. No streaks or gamification pressure.
- Every screen passes a "can she use it without asking Div" test.
- Accessibility: contrast AA, tap targets ≥ 44px.

---

## 11. Phases & build plan (small Sonnet sessions)

Each session: read `CLAUDE.md` + the named spec section only, do the task, run checks, commit. One session per row.

| # | Session | Model | Done when |
|---|---|---|---|
| B1 | Scaffold Next.js + Tailwind + next-intl + PWA, deploy to Vercel | Sonnet | Installable on Android, FR/EN toggle works |
| B2 | Supabase project (Paris), schema §6, RLS, Google login, onboarding (DDR, language, maternity) | Sonnet | She can sign in; profile saved |
| B3 | `lib/dating.ts` + tests; content loader (MD/YAML → typed objects) | Sonnet | Tests pass for SA/due-date cases incl. dating-scan override |
| B4 | Today + Baby screens from content | Sonnet | Week 6–8 render in both languages |
| B5 | Guide tiles: food (with toxo conditions), symptoms, calendar, urgent, resources | Sonnet | All tiles navigable, search on food |
| C1 | Content: urgent, food, FR calendar, weeks 6–12, T1 symptoms (EN) | Sonnet + web search | Every item has allowlisted sources |
| C2 | Translate C1 to FR | Haiku | FR files mirror EN 1:1 |
| B6 | Reminders UI + push (VAPID, Edge Function, pg_cron, quiet hours, cap) | Sonnet | Test push lands on her phone at set time |
| B7 | Quick log + history list + PDF/CSV export + share sheet | Sonnet | Export opens Android share sheet → Drive works |
| B8 | Feed: creators, RSS cron, admin queue, embeds, deep links, filters | Sonnet | Feed shows approved items; creator strip deep-links |
| R1 | Creator shortlist research | Sonnet + web search | ~10 FR + ~5 EN vetted creators |
| — | **v1 live** | | |
| P2 | Partner view, weight chart, appointment entry, optional Drive auto-backup | Sonnet | |
| P3 | Postpartum: birth record, baby tracker, WHO growth curves, French vaccine calendar, her recovery & mental health, dad section | Sonnet | Starts ~month 7 of pregnancy |

**Upkeep (cheap, recurring):**
- **Monthly scheduled task (Haiku):** generate the next 4–6 weeks of content in EN+FR from sources, open a PR, Div merges. Plus wording edits Div queued in `TODO-content.md`.
- **Daily (no AI):** YouTube RSS ingest via Vercel cron.
- **Div, ~10 min/week:** approve feed queue, add 2–3 Instagram links.

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Wrong medical/food info | Allowlist sources, ≥2 sources for avoid/urgent, dated `reviewed` field, sage-femme glance |
| Wrong dates (SA vs SG) | DDR input + scan override, both counts visible, tests |
| Notification fatigue | 2/day default, user-set, quiet hours, hard cap |
| Supabase free tier pausing | Daily cron touches DB |
| Push unreliable if Chrome kills service worker / battery saver | Exempt Chrome from battery optimisation (onboarding tip); Today screen still shows checklist |
| Health data privacy | EU region, RLS, Google login, no third-party analytics, no data in logs/AI prompts |
| Credit burn | Just-in-time content, Haiku for translation/upkeep, small scoped sessions, no runtime AI |
| Instagram embeds break | Fallback card with "Ouvrir dans Instagram" link |

---

## 13. Open items

1. ~~Confirm dating~~ Done: DDR 6 Oct 2026.
2. New toxo serology result → set `toxo_status`.
3. App name: **Mylune** (decided). Maternity: Hôpital Antoine-Béclère (AP-HP, Clamart), likely. Phone number to be entered by Div in settings, not hardcoded.
4. ~~Colour~~ Done: peach/orange (§10).
