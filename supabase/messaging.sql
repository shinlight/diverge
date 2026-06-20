-- DiVerge — internal messaging (user-to-user direct messages)
-- Paste into the Supabase SQL Editor and run. Safe to run more than once.

-- 1) messages table ------------------------------------------------------
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content      text not null check (char_length(content) <= 4000),
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists messages_pair_idx
  on public.messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx
  on public.messages (recipient_id, created_at);

alter table public.messages enable row level security;

-- RLS: you can read messages you sent or received
drop policy if exists "Messages: read own" on public.messages;
create policy "Messages: read own" on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- you can only send as yourself
drop policy if exists "Messages: send as self" on public.messages;
create policy "Messages: send as self" on public.messages for insert
  with check (auth.uid() = sender_id);

-- you can mark messages addressed to you as read
drop policy if exists "Messages: mark read" on public.messages;
create policy "Messages: mark read" on public.messages for update
  using (auth.uid() = recipient_id);

-- 2) realtime: stream new messages to recipients --------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- 3) directory: authenticated users can read profiles to find people ------
--    (so you can start a conversation; emails stay private in auth.users)
drop policy if exists "Profiles: read for directory" on public.profiles;
create policy "Profiles: read for directory" on public.profiles for select
  to authenticated using (true);
