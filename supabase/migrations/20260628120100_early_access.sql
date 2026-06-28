-- DiVerge — early access: allowlist + waitlist + server-side enforcement.
--
-- ⚠️ Running this turns ON the lock: after the trigger exists, NO new signup
-- succeeds unless the email is in early_access_allowlist (existing users are
-- unaffected — it fires only on INSERT). Your founder email is seeded below;
-- add the rest before inviting testers. Safe to re-run (idempotent).

-- 1. Tables -----------------------------------------------------------------
create table if not exists public.early_access_allowlist (
  email    text primary key,
  added_at timestamptz not null default now()
);

create table if not exists public.waitlist (
  email        text primary key,
  requested_at timestamptz not null default now()
);

alter table public.early_access_allowlist enable row level security;
alter table public.waitlist               enable row level security;

-- 2. Admin helper (bypasses RLS to read the flag) ---------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

-- 3. Policies ---------------------------------------------------------------
-- Admins fully manage the allowlist.
drop policy if exists "admins manage allowlist" on public.early_access_allowlist;
create policy "admins manage allowlist" on public.early_access_allowlist
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Anyone (even logged-out) may request a slot; only admins read/clear it.
drop policy if exists "anyone can request" on public.waitlist;
create policy "anyone can request" on public.waitlist
  for insert to anon, authenticated with check (true);

drop policy if exists "admins read waitlist" on public.waitlist;
create policy "admins read waitlist" on public.waitlist
  for select to authenticated using (public.is_admin());

drop policy if exists "admins clear waitlist" on public.waitlist;
create policy "admins clear waitlist" on public.waitlist
  for delete to authenticated using (public.is_admin());

-- 4. Seed testers (add more rows as you invite people) ----------------------
insert into public.early_access_allowlist (email) values
  ('igor.bragato@gmail.com')
on conflict do nothing;

-- 5. Enforce at signup (covers email + OAuth) -------------------------------
create or replace function public.enforce_allowlist()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.email is null
     or not exists (
       select 1 from public.early_access_allowlist a
       where a.email = lower(new.email)
     ) then
    raise exception 'Not on the early-access allowlist';
  end if;
  return new;
end; $$;

drop trigger if exists enforce_allowlist_before_insert on auth.users;
create trigger enforce_allowlist_before_insert
  before insert on auth.users
  for each row execute function public.enforce_allowlist();
