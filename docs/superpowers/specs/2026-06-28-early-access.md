# Early access — enablement runbook

Date: 2026-06-28

Goal: open Divergify to a controlled set of real testers. Access model: **email
allowlist** — only invited emails can sign up / sign in; everyone else lands on a
waitlist.

## Done in code (this commit)
- `lib/access/accessService.js` — allowlist + waitlist (mock localStorage, with
  swap points to Supabase). Seeded with the admin emails so it's testable.
- **Login enforcement**: `LoginPage` blocks non-allowlisted emails (mock mode) and
  adds them to the waitlist with a friendly message. In real mode the lock is the
  Supabase auth hook below (the client check can't be trusted alone).
- **Admin → Early access** section: manage the allowlist and approve waitlist
  requests (mock now; swap to the tables below).
- **Gate hardening**: `middleware.js` no longer hardcodes credentials (the repo is
  public). It reads `GATE_USER` / `GATE_PASS` / `GATE_TOKEN` from env and is
  **fail-closed** (denies everyone if unset).

## Your steps (server-side / config)

### 1. Secure the curtain now (the old password leaked — public repo)
On Vercel → Project → Settings → Environment Variables (Production), set and then
**redeploy**:
```
GATE_USER  = <a username>
GATE_PASS  = <a NEW strong password>   # rotate — "$D1V3rg32026$" is burned
GATE_TOKEN = <a long random string>    # e.g. `openssl rand -hex 24`
```
Until these are set, the gate denies everyone (including you). This is interim —
step 4 retires the curtain entirely.

### 2. Create the tables (Supabase → SQL editor)
```sql
create table public.early_access_allowlist (
  email text primary key,
  added_at timestamptz default now()
);
create table public.waitlist (
  email text primary key,
  requested_at timestamptz default now()
);

alter table public.early_access_allowlist enable row level security;
alter table public.waitlist enable row level security;

-- Admins (profiles.is_admin) manage the allowlist; anyone may request a slot.
create policy "admins manage allowlist" on public.early_access_allowlist
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "anyone can request" on public.waitlist
  for insert to anon, authenticated with check (true);
create policy "admins read waitlist" on public.waitlist
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- seed your testers
insert into public.early_access_allowlist (email) values
  ('igor.bragato@gmail.com')
  on conflict do nothing;
```

### 3. Enforce the allowlist at signup (the real lock)
A trigger on `auth.users` rejects non-allowlisted emails (covers email **and**
OAuth signups):
```sql
create or replace function public.enforce_allowlist()
returns trigger language plpgsql security definer as $$
begin
  if not exists (
    select 1 from public.early_access_allowlist a
    where a.email = lower(new.email)
  ) then
    raise exception 'Not on the early-access allowlist';
  end if;
  return new;
end; $$;

create trigger enforce_allowlist_before_insert
  before insert on auth.users
  for each row execute function public.enforce_allowlist();
```
The raised message surfaces to the client as the sign-up error.

### 4. Retire the curtain (after step 3 is verified)
Once you confirm a non-allowlisted email is rejected and an allowlisted one gets
in, the shared-password curtain is redundant: delete `middleware.js` (and
optionally remove `@vercel/edge`) and redeploy. Access is then controlled purely
by the allowlist.

### 5. Google OAuth for external testers
The OAuth consent screen is in **Testing**: add each tester's Google account
under *Test users* (max 100). Note: for sensitive/restricted scopes, unverified
apps issue refresh tokens that **expire after 7 days** — for a smoother test,
submit the app for verification.

## Swap points to wire the admin UI to real data
In `accessService.js`, replace the localStorage bodies:
- `loadAllowlist` / `addAllowed` / `removeAllowed` → `supabase.from('early_access_allowlist')`.
- `loadWaitlist` / `removeFromWaitlist` → `supabase.from('waitlist')`.
- `addToWaitlist` (from LoginPage) → `supabase.from('waitlist').insert(...)` (anon policy above).
- Drop the mock `isAllowed` check in `LoginPage` for real mode (the auth hook enforces).

## Still on the go-live checklist (separate)
RLS on the existing tables (`messages`, `google_credentials`, `feedback`,
`profiles`), privacy policy + terms + account deletion. See the production
checklist.
