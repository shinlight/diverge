# Supabase migrations

SQL migrations for Divergify. Apply them **in filename order**.

## How to apply

**Option A — Supabase CLI (recommended)**
```bash
# once: link the local project to your Supabase project
supabase link --project-ref <your-project-ref>
# apply every migration not yet applied
supabase db push
```

**Option B — SQL editor (no CLI)**
Open Supabase → SQL editor and run each file's contents, oldest first:
1. `migrations/20260628120000_profiles_is_admin.sql`
2. `migrations/20260628120100_early_access.sql`

## What they do

| File | Effect |
|------|--------|
| `…_profiles_is_admin.sql` | Adds `profiles.is_admin`; marks the founder admin by email. |
| `…_early_access.sql` | Creates `early_access_allowlist` + `waitlist`, RLS, seeds the founder, and a `before insert on auth.users` trigger that **rejects non-allowlisted signups** (email + OAuth). |

⚠️ The second migration **switches early access ON**. Add every tester's email to
`early_access_allowlist` before inviting them (your founder email is seeded).
Existing users are unaffected — the trigger only fires on new signups.

## After applying — wire the app to these tables
In `src/lib/access/accessService.js`, swap the localStorage bodies for Supabase:
- `loadAllowlist` / `addAllowed` / `removeAllowed` → `supabase.from('early_access_allowlist')`
- `loadWaitlist` / `removeFromWaitlist` → `supabase.from('waitlist')`
- `addToWaitlist` (called from `LoginPage`) → `supabase.from('waitlist').insert(...)`
- In `LoginPage`, the mock `isAllowed` check is skipped in real mode — the trigger
  enforces it; surface its error message on failed sign-up.

Then verify: a non-allowlisted email is rejected, an allowlisted one gets in. Once
confirmed, the shared-password curtain (`middleware.js`) can be deleted.

See `docs/superpowers/specs/2026-06-28-early-access.md` for the full runbook.
