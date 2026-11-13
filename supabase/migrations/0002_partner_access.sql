-- Mylune: partner gateway. A signed-in user whose verified Google email is on the partner_emails list skips onboarding:
-- claim_partner_access() creates a 'partner' profile with no medical data, in the mother's household when she exists.
-- The list itself is data, inserted with the SQL editor (never committed): insert into public.partner_emails values ('name@example.com');
-- RLS is on with no policies, so nobody can read or change the list through the API.

create table public.partner_emails (
  email text primary key check (email = lower(email))
);
alter table public.partner_emails enable row level security;

create or replace function public.claim_partner_access(p_locale text default 'en')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(auth.jwt() ->> 'email');
  v_verified text := auth.jwt() -> 'user_metadata' ->> 'email_verified';
  v_household uuid;
  v_locale text := case when p_locale in ('fr', 'en') then p_locale else 'en' end;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles where user_id = v_uid) then
    return true;
  end if;
  if v_email is null or v_verified is distinct from 'true' then
    return false;
  end if;
  if not exists (select 1 from public.partner_emails where email = v_email) then
    return false;
  end if;

  -- Join the mother's household if she has one, otherwise start one that she will join at onboarding.
  select household_id into v_household from public.profiles where role = 'mother' order by created_at limit 1;
  if v_household is null then
    insert into public.households default values returning id into v_household;
  end if;

  insert into public.profiles (user_id, household_id, role, locale)
  values (v_uid, v_household, 'partner', v_locale);
  return true;
end;
$$;
revoke all on function public.claim_partner_access(text) from public, anon;
grant execute on function public.claim_partner_access(text) to authenticated;

-- complete_onboarding now joins a household that a partner opened before the mother signed in.
-- Single-household app, sign-in limited to test users in Google: replace with invite codes before opening sign-up (P2).
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

  select p.household_id into v_household
  from public.profiles p
  where p.role = 'partner'
    and not exists (select 1 from public.profiles m where m.household_id = p.household_id and m.role = 'mother')
  order by p.created_at
  limit 1;
  if v_household is null then
    insert into public.households default values returning id into v_household;
  end if;

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
