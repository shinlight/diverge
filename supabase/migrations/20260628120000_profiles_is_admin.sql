-- DiVerge — add an admin flag to profiles.
-- Needed by: admin dashboard gate + the early-access RLS policies (which check
-- public.is_admin()). Safe to re-run.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Mark the founding admin by email. Adjust / add rows as needed.
update public.profiles p
set is_admin = true
from auth.users u
where u.id = p.id
  and lower(u.email) = 'igor.bragato@gmail.com';
