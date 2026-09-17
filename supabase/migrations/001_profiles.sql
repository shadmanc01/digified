create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._]{3,30}$'),
  display_name text not null,
  bio text check (char_length(bio) <= 300),
  avatar_url text,
  location text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, username, display_name, bio, location, website)
select
  id,
  lower(coalesce(raw_user_meta_data ->> 'username', split_part(email, '@', 1))),
  coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)),
  nullif(raw_user_meta_data ->> 'bio', ''),
  nullif(raw_user_meta_data ->> 'location', ''),
  nullif(raw_user_meta_data ->> 'website', '')
from auth.users
on conflict do nothing;
