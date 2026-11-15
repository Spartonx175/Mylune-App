-- Mylune Phase 2 (SPEC section 14): kick counter, mood/symptom/weight logs, quiz answers,
-- calendar import for appointments, and an approved-only feed.
-- Safe to re-run.

-- Log types: kick (movements), quiz (answer), plus the existing mood, symptom, weight.
alter table public.logs drop constraint if exists logs_type_check;
alter table public.logs add constraint logs_type_check
  check (type in ('mood', 'symptom', 'weight', 'note', 'water', 'walk', 'checklist', 'lab', 'kick', 'quiz'));

-- Appointments: manual entries and imported calendar events.
alter table public.appointments add column if not exists source text not null default 'manual'
  check (source in ('manual', 'ical'));
alter table public.appointments add column if not exists external_uid text;
-- Non-partial unique index so upsert(onConflict) works. Nulls are distinct, so manual rows never clash.
create unique index if not exists appointments_external_uid_idx on public.appointments (household_id, external_uid);

-- Calendar feed address (secret iCal link). Owner only: the partner cannot read it.
create table if not exists public.calendar_feeds (
  user_id uuid primary key references auth.users (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  ical_url text not null,
  last_synced_at timestamptz,
  last_error text
);
alter table public.calendar_feeds enable row level security;
drop policy if exists calendar_feeds_own on public.calendar_feeds;
create policy calendar_feeds_own on public.calendar_feeds for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and household_id = public.current_household_id());

-- Feed: household members only see items Div has approved (status = 'live').
drop policy if exists feed_items_read on public.feed_items;
create policy feed_items_read on public.feed_items for select to authenticated using (status = 'live');
