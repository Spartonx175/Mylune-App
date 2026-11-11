-- Mylune B2: schema (SPEC section 6, Phase 3 baby tables excluded), RLS, onboarding RPC.
-- Run once in Supabase > SQL Editor (project agxifnlxxncfortasrgx, region Paris).
-- Idempotent enough to re-run on an empty project; do not re-run on a project holding data.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables

create table public.households (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  role text not null default 'mother' check (role in ('mother', 'partner')),
  display_name text,
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  ddr date,
  due_date_override date,
  toxo_status text not null default 'non_immune' check (toxo_status in ('non_immune', 'immune', 'unknown')),
  cmv_status text not null default 'unknown' check (cmv_status in ('non_immune', 'immune', 'unknown')),
  maternity_name text,
  maternity_phone text,
  quiet_start time,
  quiet_end time,
  hidden_topics text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index profiles_household_idx on public.profiles (household_id);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  preset_key text,
  title_fr text,
  title_en text,
  time time not null,
  days int[] not null default '{1,2,3,4,5,6,7}',
  enabled boolean not null default true,
  tz text not null default 'Europe/Paris'
);
create index reminders_household_idx on public.reminders (household_id);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table public.logs (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_at timestamptz not null default now(),
  type text not null check (type in ('mood', 'symptom', 'weight', 'note', 'water', 'walk', 'checklist', 'lab')),
  value jsonb not null default '{}'
);
create index logs_household_time_idx on public.logs (household_id, logged_at desc);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  at timestamptz not null,
  kind text,
  title text not null,
  notes text,
  location text
);
create index appointments_household_idx on public.appointments (household_id, at);

create table public.feed_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('youtube', 'instagram', 'article', 'infographic', 'affirmation')),
  url text,
  title_fr text,
  title_en text,
  summary_fr text,
  summary_en text,
  source_name text,
  thumbnail_url text,
  tags text[] not null default '{}',
  week_min int,
  week_max int,
  published_at timestamptz,
  status text not null default 'hidden' check (status in ('live', 'hidden')),
  added_by uuid references auth.users (id) on delete set null
);

create table public.creators (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram', 'youtube')),
  handle text,
  channel_id text,
  display_name text not null,
  lang text check (lang in ('fr', 'en')),
  credential text,
  avatar_url text,
  active boolean not null default true
);

-- ---------------------------------------------------------------- helpers

-- Household of the signed-in user. SECURITY DEFINER so policies can call it without recursing into profiles RLS.
create or replace function public.current_household_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select household_id from public.profiles where user_id = auth.uid()
$$;
revoke all on function public.current_household_id() from public, anon;
grant execute on function public.current_household_id() to authenticated;

-- ---------------------------------------------------------------- RLS

alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.reminders enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.logs enable row level security;
alter table public.appointments enable row level security;
alter table public.feed_items enable row level security;
alter table public.creators enable row level security;

-- households: members read; creation only through complete_onboarding().
create policy households_select on public.households for select to authenticated
  using (id = public.current_household_id());

-- profiles: read self + household members; update only own row; insert only through complete_onboarding().
create policy profiles_select on public.profiles for select to authenticated
  using (user_id = auth.uid() or household_id = public.current_household_id());
create policy profiles_update_own on public.profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and household_id = public.current_household_id());

-- household-scoped tables: members only, all operations.
create policy reminders_household on public.reminders for all to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id() and user_id = auth.uid());
create policy logs_household on public.logs for all to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id() and user_id = auth.uid());
create policy appointments_household on public.appointments for all to authenticated
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

-- push subscriptions: own rows only.
create policy push_own on public.push_subscriptions for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- feed + creators: any signed-in user reads. No write policy yet: admin writes arrive with B8
-- (until then, write through the SQL editor / service role, which bypass RLS).
create policy feed_items_read on public.feed_items for select to authenticated using (true);
create policy creators_read on public.creators for select to authenticated using (true);

-- ---------------------------------------------------------------- onboarding

-- Creates the household and the profile atomically for the calling user. Validates inputs server-side.
create or replace function public.complete_onboarding(
  p_locale text,
  p_ddr date,
  p_due_date_override date,
  p_maternity_name text,
  p_maternity_phone text,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_household uuid;
  v_today date := (now() at time zone 'Europe/Paris')::date;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where user_id = v_uid) then
    raise exception 'already onboarded' using errcode = '23505';
  end if;
  if p_locale not in ('fr', 'en') then
    raise exception 'invalid locale' using errcode = '22023';
  end if;
  if p_ddr is null or p_ddr > v_today or p_ddr < v_today - 300 then
    raise exception 'invalid ddr' using errcode = '22023';
  end if;
  if p_due_date_override is not null and (p_due_date_override < v_today - 30 or p_due_date_override > v_today + 330) then
    raise exception 'invalid due date' using errcode = '22023';
  end if;

  insert into public.households default values returning id into v_household;

  insert into public.profiles (user_id, household_id, role, display_name, locale, ddr, due_date_override, maternity_name, maternity_phone)
  values (
    v_uid, v_household, 'mother',
    nullif(trim(p_display_name), ''), p_locale, p_ddr, p_due_date_override,
    nullif(trim(p_maternity_name), ''), nullif(trim(p_maternity_phone), '')
  );
end;
$$;
revoke all on function public.complete_onboarding(text, date, date, text, text, text) from public, anon;
grant execute on function public.complete_onboarding(text, date, date, text, text, text) to authenticated;
