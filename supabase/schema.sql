-- Divergify — profiles table + avatars storage
-- Paste this whole file into the Supabase SQL Editor and run it.
-- Safe to run more than once (idempotent).

-- 1) profiles table -------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  nickname     text,
  name         text,
  display_mode text not null default 'nickname',
  avatar_url   text,
  plan         text not null default 'free',
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS: each user sees and edits only their own profile
drop policy if exists "Profiles: select own" on public.profiles;
create policy "Profiles: select own"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
  on public.profiles for update using (auth.uid() = id);

-- 2) auto-create a profile row on signup ---------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, name, display_mode)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name',
             new.raw_user_meta_data->>'nickname',
             split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'displayMode', 'nickname')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) backfill profiles for users created before this table ----------------
insert into public.profiles (id, nickname, name, display_mode)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'nickname', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'name',
           u.raw_user_meta_data->>'nickname',
           split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'displayMode', 'nickname')
from auth.users u
on conflict (id) do nothing;

-- 4) avatars storage bucket (public read) --------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- storage policies: users manage files in a folder named by their uid
drop policy if exists "Avatars: public read" on storage.objects;
create policy "Avatars: public read"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "Avatars: user upload" on storage.objects;
create policy "Avatars: user upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Avatars: user update" on storage.objects;
create policy "Avatars: user update"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Avatars: user delete" on storage.objects;
create policy "Avatars: user delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
