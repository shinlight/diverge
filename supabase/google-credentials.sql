-- Divergify — Google refresh-token storage.
--
-- Holds the long-lived Google OAuth refresh token per user so the serverless
-- function (api/google-token.js) can mint fresh access tokens in the
-- background. RLS is enabled with NO policies, so the client (anon / authed
-- user) can never read or write this table — only the service role used by
-- the serverless function can, since it bypasses RLS.

create table if not exists public.google_credentials (
  user_id uuid primary key references auth.users (id) on delete cascade,
  refresh_token text not null,
  updated_at timestamptz not null default now()
);

alter table public.google_credentials enable row level security;

-- Intentionally no policies: deny all client access. The serverless function
-- reaches this table with the service role key only.
