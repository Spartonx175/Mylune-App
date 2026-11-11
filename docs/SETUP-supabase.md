# B2 setup: Supabase + Google login (one-time, done by Div)

Secrets rule (CLAUDE.md): the Google client secret goes only into the Supabase dashboard. Never paste it in chat or the repo. Never use the Supabase `service_role` / secret key in this app.

## 1. Create the tables (Supabase SQL editor)
1. Open https://supabase.com/dashboard/project/agxifnlxxncfortasrgx/sql/new and sign in.
2. In File Explorer open `Documents\Mylune App\supabase\migrations\0001_init.sql` with Notepad. Press Ctrl+A, then Ctrl+C.
3. Click into the big empty editor in Supabase, press Ctrl+V, click **Run** (bottom right). Expect "Success. No rows returned".
4. Left menu > **Table Editor**: you should see `households`, `profiles`, `reminders`, `logs`, `appointments`, `feed_items`, `creators`, `push_subscriptions`. Run it only once.

## 2. Copy the public key
1. Supabase > gear icon **Project Settings** > **API Keys**.
2. Copy the **Publishable key** (starts with `sb_publishable_`). Do NOT copy the "secret" or "service_role" key.
3. The URL is already in `.env.example`: `https://agxifnlxxncfortasrgx.supabase.co`.

## 3. Google OAuth client (Google Cloud)
1. https://console.cloud.google.com > project picker (top bar) > **New project** > name `Mylune` > **Create**, then select it.
2. Menu > **APIs & Services** > **OAuth consent screen** (may be called **Google Auth Platform**) > **Get started**. App name `Mylune`, support email = yours, Audience **External**, contact email = yours, accept, **Create**.
3. **Audience** tab > **Publish app** > confirm. (In "Testing" mode, logins expire every 7 days and only listed test users can sign in. Basic email/profile sign-in needs no Google review.)
4. **Clients** (or **Credentials**) > **Create client** > type **Web application**, name `Mylune web`.
   - Authorized JavaScript origins: `https://mylune-app.vercel.app`
   - Authorized redirect URIs: `https://agxifnlxxncfortasrgx.supabase.co/auth/v1/callback`
   - **Create**. Keep the Client ID and Client secret on screen for step 4.

## 4. Turn on Google in Supabase
1. Supabase > **Authentication** > **Sign In / Providers** > **Google**.
2. Switch **Enable** on, paste Client ID and Client secret, **Save**.
3. **Authentication** > **URL Configuration**: Site URL `https://mylune-app.vercel.app`; under Redirect URLs click **Add URL**, enter `https://mylune-app.vercel.app/**`, **Save**.

## 5. Give Vercel the public settings
1. Vercel > project **mylune-app** > **Settings** > **Environment Variables**.
2. Add `NEXT_PUBLIC_SUPABASE_URL` = `https://agxifnlxxncfortasrgx.supabase.co` (all environments), **Save**.
3. Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the publishable key from step 2, **Save**.
4. **Deployments** > latest row > **⋯** > **Redeploy** (these values are baked in at build time).

## 6. Test
Open the app, tap **Continuer avec Google**, sign in, fill the form (DDR for her is 2026-10-06), then open **Profil** to see the saved values.
