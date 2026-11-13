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

## C1 slice 2 notes (weeks 6-12, T1 symptoms, FR calendar, EN) - for Div
- **Weeks 6-12 have ONE development/size source (NHS week pages).** No second allowlisted page was readable: acog.org returns 402, 1000jours.fr resets the connection, has-sante.fr and caf.fr block bots, ameli has no week-by-week page. Sizes (mm) and development bullets are therefore single-source (NHS) plus ameli for the follow-up/todo items. Add a second source for each week when one is reachable (1000jours.fr, CNGOF).
- **Fruit ids:** NHS uses pea/grape/raspberry/strawberry/apricot/fig/plum. Mapped to the allowed ids by length: lentil (6 mm), blueberry (10), raspberry (16), olive (22), fig (41), plum (54). **Added `kumquat` for w10 (30 mm)**: no id in the list fits; the Today/Baby session must draw it.
- **Breast tenderness** has no dedicated page on an allowlisted site (no NHS page, nothing on ameli). The file is built from the week pages + ameli early-signs + NHS "common health problems" and gives no remedies; comfort tips (bra, etc.) are missing for lack of a source.
- **Fatigue** has only NHS tiredness + NHS week pages (the ameli fatigue page is general, not pregnancy). **Constipation** has NHS common-health-problems + NHS stomach pain only. A French source is wanted for both.
- **Maternity registration timing (Paris):** no allowlisted source found. Entry `maternity-registration` is `unverified: true` with no sources. Question for Div: approve service-public.gouv.fr (service-public.fr redirects there) or a Paris/AP-HP page?
- **No "8th-month interview" found.** ameli lists an early prenatal interview (4th month), a mandatory anaesthetist consultation in the 8th month (included), and a postnatal interview 4-8 weeks after birth (not in the calendar: it is after birth, not on the SA scale; page ameli-retour-maison is in sources.yaml for it).
- **Months to SA are approximate** (ameli speaks in months; the file header documents the mapping). Please check with the sage-femme.
- **Declaration deadline:** ameli says "before the end of the 3rd month" (about 14 SA); the sage-femme référente page says the *referent-midwife* form is due before the end of the 5th month. Not the same thing; both stated correctly in the file.
- Prevention check-up (before 24 weeks) and the first-consultation test list each come from ONE ameli page (ameli-programme-suivi); ameli-toxo-serologie is the second source only for the toxoplasmosis test.
- ameli-aliments-eviter, nhs-foods-to-avoid and nhs-alcohol (already in sources.yaml from slice 1) are reused for the food tips in the week files.

## Checker part 1 (foods: meat, fish, egg, dairy, cheese) - for Div
- **Not covered by any allowlisted page I could read (so left as general/careful or omitted):** meringue and île flottante, caesar dressing as its own item, plant-based cheese substitutes (mangerbouger says avoid; only 1 source, ameli only mentions soy), raw egg in ice cream/sorbet at artisans, horse meat, snails, soft-serve machines, halal/kosher specifics.
- **Pâté / foie gras in sealed tins or jars:** French pages say avoid all pâté. Only CDC says shelf-stable sealed is safer. Marked `careful` (2 sources: CDC + mangerbouger) with "ask your midwife". Please confirm you are happy with that.
- **Cured meats:** NHS toxo page (2023) says avoid salami/Parma ham; NHS food page (2026) says heat until steaming. Cold = avoid, heated through = careful, following mangerbouger/ameli.
- **Blue cheese (roquefort), pasteurised soft blue:** no French page names them. Roquefort raw = avoid (raw-milk rule); pasteurised blue = careful, cooked only (NHS). Worth a midwife check.
- **Fresh goat cheese:** pasteurised and without rind marked ok (NHS + mangerbouger's "other pasteurised cheeses allowed"); no French page names chèvre. Same for mozzarella, burrata, feta, skyr.
- **Sandwiches, takeaway, deli salads, kebab:** no ameli/mangerbouger rule names them; verdicts are built from ameli (restaurant: meat well done, no raw vegetables), CDC (deli salads, sandwiches) and NHS. Check wording.
- **Fish page sources:** Santé publique France listeria page returned 404 and 1000jours.fr connection reset; no HAS/CNGOF page read for food, so French support is ameli + mangerbouger only.
- **Mercury/tuna frequency:** French pages say "limit" without numbers, so no numbers are in the app; NHS gives numbers but they were left out on purpose (stricter French wording followed).
- Sources.yaml has 5 new entries (CDC food-pregnant-women, 3 CDC listeria pages, NHS healthy diet); the CDC meat-fish page title is copied as shown on the site, typo included ("Pâte").

## Partner gateway notes (2026-11-13)
- Partner emails live only in the database table `partner_emails` (insert with the SQL editor); no email is committed. The partner gets no medical data in his profile and sees the mother's dates on Today/Baby.
- `complete_onboarding` joins a household that a partner opened before the mother signed in. Safe while Google sign-in is limited to test users; replace with invite codes (P2) before opening sign-up.
- Partner view is read-only for now: partner role cannot edit the mother's profile (RLS), logs/reminders are shared household data (P2 defines the partner UI).

## Checker part 2 (foods: produce, grains, pulses, nuts, sweets, fats, herbs; drinks) - for Div
- **Left out, no allowlisted page read mentions them (or only one does):** kidney beans undercooked/raw dried, papaya, honey, sweeteners, chia/flax/sesame/tahini, wasabi, fish sauce, kombucha, kefir, rooibos, decaf coffee, ginger/verveine/fennel/raspberry-leaf/hibiscus teas, alcohol-free beer/wine, tempeh-free soy alternatives. Need a 2nd source (retry 1000jours.fr, cngof.fr, santepubliquefrance.fr; its toxoplasmose page returned 404, NHS caffeine/herbal-tea pages 404).
- **Caffeine has no numbers in the app:** the loader's dose check rejects any "mg" figure. Sources do give some (NHS: 200 mg/day limit; ameli quotes Santé Canada 300 mg/day), and they disagree. Decide whether to allow caffeine amounts (loosen the dose check for caffeine) or keep "limit it".
- **Soy:** ameli and mangerbouger say to avoid soy foods and drinks as a precaution; NHS recommends unsweetened soya drink. Marked tofu, tempeh, edamame, soy milk, cooked bean sprouts `careful` (ask midwife). Soy sauce `ok` occasionally (both French pages).
- **Herbal teas:** mint and chamomile are `ok` on ONE source (NHS: no more than 4 cups/day). Everything else herbal is missing for lack of a 2nd source. Liquorice tea `avoid` (ameli + NHS).
- **Fresh-pressed juice and smoothies:** `careful`, built from CDC (unpasteurised juice riskier) + ameli toxo (skip raw produce of unknown washing). No French page mentions juice. Midwife check wanted.
- **Houmous/falafel/tabbouleh, bagged salad, pre-cut fruit:** no French page names them; verdicts rely on NHS/CDC (keep chilled, use-by) + ameli rinse/eating-out rule. Tabbouleh and houmous are also in part 1 `deli-salads` (counter versions are `avoid` there).
- **Staples (rice, pasta, bread, oils, sugar, spices, nuts):** no page restricts them; `ok` cites NHS healthy-diet and "most foods are safe" only. Nutrient `best` tips (spinach, mâche, watercress, melon, chickpeas, almonds, walnuts, chestnuts = folate; lentils = iron) come from ameli's nutrition page; calcium water too. Iodine and omega-3 plant sources: no source says them, so none tipped.
- **Food cooked with alcohol:** `avoid` on mangerbouger + ameli zero-alcohol + NHS (general no-alcohol rule), though only mangerbouger mentions cooked dishes. Confirm.
- 2 new sources: ameli-alimentation-grossesse, ameli-zero-alcool. Page dates: ameli pages 2026; NHS alcohol page review date (13 Mar 2026) has passed.

## Checker part 3 (medicines, exercise) notes, 2026-11-13, for Div
- **Left out for lack of a second allowlisted source:** Spasfon/phloroglucinol (CRAT only), Smecta (CRAT antidiarrhoeal page only), nasal saline is included but rests on CRAT + NHS decongestant page; iron, magnesium, iodine, omega-3, probiotics (no allowlisted page read), valerian specifically (covered only inside the herbal-remedies item), oral fluconazole/antifungals, ergot-type migraine medicines, mucolytics (ambroxol/acetylcysteine), topical anti-inflammatory gels, low-dose prescribed aspirin as its own item (folded into the aspirin text, NHS only), sex in pregnancy, dancing and cardio machines.
- **Sex in pregnancy:** nhs.uk/pregnancy/keeping-well/sex/ redirects to tommys.org (not on the allowlist); ameli has no page; ACOG pages return HTTP 402. Question: approve tommys.org (or another source) so this can be added?
- **ACOG** (acog.org) exercise and travel pages were blocked (402), so exercise leans on ameli, NHS, CDC. mangerbouger.fr activity pages were not found at the guessed URLs (404): no mangerbouger source cited for exercise.
- **Verdict policy:** `ok` only where CRAT/ANSM clearly say compatible. Folic acid and vitamin D are `careful` ("ask first") because they rest on NHS pages only; relax to `ok` if you accept the NHS as enough for national-recommendation vitamins. Doxylamine, domperidone, metoclopramide, codeine, tramadol are `careful` (prescription or second-line); the ANSM says avoid doxylamine in the last three months.
- **NSAID threshold:** CRAT and ANSM both forbid anti-inflammatories from 24 weeks of amenorrhoea (6th month); before that, only on a doctor's say-so. ANSM wording is "6th month", CRAT "24 SA"; the content says 24 weeks.
- **Stale NHS pages used:** Medicines in pregnancy (reviewed 2022), Antihistamines (2023), Travelling (2022) are past their review dates. The nhs-travelling page backs both flights and driving (`ok` with one source each). Re-check when the NHS updates them.
- **Not read:** CRAT has no levothyroxine, antibiotic (amoxicillin), vitamin or iron pages reachable in the listing; the thyroid item cites the NHS page, the NHS hub and the CRAT general-principles page (stopping a long-term treatment can destabilise it). Have the pharmacist or sage-femme glance at medicines.yaml before Mylune shows it.
- French brand names in `names` are search synonyms I wrote from knowledge, not from the sources; worth a quick pharmacy check.
