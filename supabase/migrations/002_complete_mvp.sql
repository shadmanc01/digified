-- digified complete MVP backend
-- Run after 001_profiles.sql in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists social_links jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists moderation_status text not null default 'active';

create table if not exists public.cameras (
  id uuid primary key default gen_random_uuid(),
  manufacturer text not null default '', name text not null, slug text unique not null,
  description text, image_url text, aliases text[] not null default '{}', created_at timestamptz not null default now()
);
create table if not exists public.lenses (
  id uuid primary key default gen_random_uuid(),
  manufacturer text not null default '', name text not null, slug text unique not null,
  aliases text[] not null default '{}', created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text unique not null, slug text unique not null
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  caption text, location text, visibility text not null default 'public' check (visibility in ('public','private')),
  camera_id uuid references public.cameras(id) on delete set null, lens_id uuid references public.lenses(id) on delete set null,
  focal_length text, aperture text, shutter_speed text, iso integer, taken_at timestamptz,
  hashtags text[] not null default '{}', moderation_status text not null default 'active',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null unique, width integer, height integer, alt_text text, position integer not null default 0,
  exif jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.post_categories (
  post_id uuid references public.posts(id) on delete cascade, category_id uuid references public.categories(id) on delete cascade,
  primary key (post_id, category_id)
);
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(), post_id uuid unique not null references public.posts(id) on delete cascade,
  name text, film_simulation text, editing_software text, notes text, fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create table if not exists public.likes (
  user_id uuid references public.profiles(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, post_id)
);
create table if not exists public.saved_posts (
  user_id uuid references public.profiles(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, post_id)
);
create table if not exists public.reposts (
  user_id uuid references public.profiles(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, post_id)
);
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, parent_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000), moderation_status text not null default 'active',
  created_at timestamptz not null default now()
);
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null, is_public boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.collection_posts (
  collection_id uuid references public.collections(id) on delete cascade, post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (collection_id, post_id)
);
create table if not exists public.saved_recipes (
  user_id uuid references public.profiles(id) on delete cascade, recipe_id uuid references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, recipe_id)
);
create table if not exists public.user_cameras (
  user_id uuid references public.profiles(id) on delete cascade, camera_id uuid references public.cameras(id) on delete cascade,
  notes text, created_at timestamptz not null default now(), primary key (user_id, camera_id)
);
create table if not exists public.user_lenses (
  user_id uuid references public.profiles(id) on delete cascade, lens_id uuid references public.lenses(id) on delete cascade,
  notes text, created_at timestamptz not null default now(), primary key (user_id, lens_id)
);
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade, last_read_at timestamptz,
  primary key (conversation_id, user_id)
);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade, body text,
  shared_post_id uuid references public.posts(id) on delete set null, created_at timestamptz not null default now(),
  check (coalesce(char_length(body), 0) > 0 or shared_post_id is not null)
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade, type text not null, entity_id uuid,
  read_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade, blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (blocker_id, blocked_id), check (blocker_id <> blocked_id)
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment','user')), target_id uuid not null,
  reason text not null, status text not null default 'open', created_at timestamptz not null default now()
);

create index if not exists posts_public_created_idx on public.posts (visibility, moderation_status, created_at desc);
create index if not exists posts_owner_created_idx on public.posts (owner_id, created_at desc);
create index if not exists posts_camera_idx on public.posts (camera_id, created_at desc);
create index if not exists posts_lens_idx on public.posts (lens_id, created_at desc);
create index if not exists comments_post_idx on public.comments (post_id, created_at);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

insert into public.categories(name,slug) values
('Street','street'),('Portrait','portrait'),('Landscape','landscape'),('Wildlife','wildlife'),('Travel','travel'),
('Architecture','architecture'),('Automotive','automotive'),('Sports','sports'),('Night','night'),('Nature','nature'),
('Documentary','documentary'),('Macro','macro'),('Food','food'),('Fashion','fashion'),('Events','events'),
('Still Life','still-life'),('Astrophotography','astrophotography'),('Black & White','black-and-white'),('Urban','urban'),('Abstract','abstract')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos','photos',false,26214400,array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do update set public=false, file_size_limit=26214400, allowed_mime_types=excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

alter table public.cameras enable row level security; alter table public.lenses enable row level security;
alter table public.categories enable row level security; alter table public.posts enable row level security;
alter table public.post_images enable row level security; alter table public.post_categories enable row level security;
alter table public.recipes enable row level security; alter table public.follows enable row level security;
alter table public.likes enable row level security; alter table public.saved_posts enable row level security;
alter table public.reposts enable row level security; alter table public.comments enable row level security;
alter table public.collections enable row level security; alter table public.collection_posts enable row level security;
alter table public.saved_recipes enable row level security; alter table public.user_cameras enable row level security;
alter table public.user_lenses enable row level security; alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security; alter table public.messages enable row level security;
alter table public.notifications enable row level security; alter table public.blocks enable row level security;
alter table public.reports enable row level security;

create policy "gear entities readable" on public.cameras for select using (true);
create policy "authenticated can add cameras" on public.cameras for insert to authenticated with check (true);
create policy "authenticated can normalize cameras" on public.cameras for update to authenticated using (true) with check (true);
create policy "gear entities lenses readable" on public.lenses for select using (true);
create policy "authenticated can add lenses" on public.lenses for insert to authenticated with check (true);
create policy "authenticated can normalize lenses" on public.lenses for update to authenticated using (true) with check (true);
create policy "categories readable" on public.categories for select using (true);
create policy "posts readable by visibility" on public.posts for select using ((visibility='public' and moderation_status='active') or owner_id=auth.uid());
create policy "owners insert posts" on public.posts for insert to authenticated with check (owner_id=auth.uid());
create policy "owners update posts" on public.posts for update using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "owners delete posts" on public.posts for delete using (owner_id=auth.uid());
create policy "post images readable" on public.post_images for select using (exists(select 1 from public.posts p where p.id=post_id and ((p.visibility='public' and p.moderation_status='active') or p.owner_id=auth.uid())));
create policy "owners manage images" on public.post_images for all to authenticated using (exists(select 1 from public.posts p where p.id=post_id and p.owner_id=auth.uid())) with check (exists(select 1 from public.posts p where p.id=post_id and p.owner_id=auth.uid()));
create policy "post categories readable" on public.post_categories for select using (true);
create policy "owners manage post categories" on public.post_categories for all to authenticated using (exists(select 1 from public.posts p where p.id=post_id and p.owner_id=auth.uid())) with check (exists(select 1 from public.posts p where p.id=post_id and p.owner_id=auth.uid()));
create policy "recipes readable" on public.recipes for select using (exists(select 1 from public.posts p where p.id=post_id and ((p.visibility='public' and p.moderation_status='active') or p.owner_id=auth.uid())));
create policy "owners manage recipes" on public.recipes for all to authenticated using (exists(select 1 from public.posts p where p.id=post_id and p.owner_id=auth.uid())) with check (exists(select 1 from public.posts p where p.id=post_id and p.owner_id=auth.uid()));
create policy "follows readable" on public.follows for select using (true);
create policy "manage own follows" on public.follows for all to authenticated using (follower_id=auth.uid()) with check (follower_id=auth.uid());
create policy "likes readable" on public.likes for select using (true);
create policy "manage own likes" on public.likes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "own saved posts" on public.saved_posts for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "reposts readable" on public.reposts for select using (true);
create policy "manage own reposts" on public.reposts for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "comments readable" on public.comments for select using (moderation_status='active');
create policy "create own comments" on public.comments for insert to authenticated with check (user_id=auth.uid());
create policy "manage own comments" on public.comments for update using (user_id=auth.uid());
create policy "delete own comments" on public.comments for delete using (user_id=auth.uid());
create policy "collections visible" on public.collections for select using (is_public or owner_id=auth.uid());
create policy "manage own collections" on public.collections for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "collection posts visible" on public.collection_posts for select using (exists(select 1 from public.collections c where c.id=collection_id and (c.is_public or c.owner_id=auth.uid())));
create policy "manage collection posts" on public.collection_posts for all to authenticated using (exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=auth.uid())) with check (exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=auth.uid()));
create policy "own saved recipes" on public.saved_recipes for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "user cameras readable" on public.user_cameras for select using (true);
create policy "manage own cameras" on public.user_cameras for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "user lenses readable" on public.user_lenses for select using (true);
create policy "manage own lenses" on public.user_lenses for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "members read conversations" on public.conversations for select using (exists(select 1 from public.conversation_members cm where cm.conversation_id=id and cm.user_id=auth.uid()));
create policy "authenticated create conversations" on public.conversations for insert to authenticated with check (true);
create policy "members update conversations" on public.conversations for update using (exists(select 1 from public.conversation_members cm where cm.conversation_id=id and cm.user_id=auth.uid()));
create or replace function public.is_conversation_member(cid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from conversation_members where conversation_id=cid and user_id=auth.uid()) $$;
grant execute on function public.is_conversation_member(uuid) to authenticated;
create policy "members read membership" on public.conversation_members for select using (public.is_conversation_member(conversation_id));
create policy "add own conversation membership" on public.conversation_members for insert to authenticated with check (user_id=auth.uid());
create policy "members update own membership" on public.conversation_members for update using (user_id=auth.uid());
create policy "members read messages" on public.messages for select using (exists(select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));
create policy "members send messages" on public.messages for insert to authenticated with check (sender_id=auth.uid() and exists(select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));
create policy "own notifications" on public.notifications for select using (user_id=auth.uid());
create policy "update own notifications" on public.notifications for update using (user_id=auth.uid());
create policy "own blocks" on public.blocks for all to authenticated using (blocker_id=auth.uid()) with check (blocker_id=auth.uid());
create policy "create reports" on public.reports for insert to authenticated with check (reporter_id=auth.uid());
create policy "view own reports" on public.reports for select using (reporter_id=auth.uid());

create policy "upload own photos" on storage.objects for insert to authenticated with check (bucket_id='photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "read permitted photos" on storage.objects for select using (bucket_id='photos' and exists(select 1 from public.post_images pi join public.posts p on p.id=pi.post_id where pi.storage_path=name and ((p.visibility='public' and p.moderation_status='active') or p.owner_id=auth.uid())));
create policy "delete own photos" on storage.objects for delete to authenticated using (bucket_id='photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar uploads" on storage.objects for insert to authenticated with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar updates" on storage.objects for update to authenticated using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "avatar reads" on storage.objects for select using (bucket_id='avatars');

create or replace function public.add_notification() returns trigger language plpgsql security definer set search_path=public as $$
declare owner uuid; actor_id uuid; kind text; entity uuid;
begin
  if tg_table_name='follows' then owner:=new.following_id; actor_id:=new.follower_id; kind:='follow'; entity:=new.follower_id;
  elsif tg_table_name='likes' then select owner_id into owner from posts where id=new.post_id; actor_id:=new.user_id; kind:='like'; entity:=new.post_id;
  elsif tg_table_name='comments' then select owner_id into owner from posts where id=new.post_id; actor_id:=new.user_id; kind:='comment'; entity:=new.post_id;
  elsif tg_table_name='reposts' then select owner_id into owner from posts where id=new.post_id; actor_id:=new.user_id; kind:='repost'; entity:=new.post_id;
  else return new; end if;
  if owner is distinct from actor_id then
    insert into notifications(user_id,actor_id,type,entity_id) values(owner,actor_id,kind,entity);
  end if; return new;
end $$;
drop trigger if exists follows_notify on public.follows; create trigger follows_notify after insert on public.follows for each row execute function public.add_notification();
drop trigger if exists likes_notify on public.likes; create trigger likes_notify after insert on public.likes for each row execute function public.add_notification();
drop trigger if exists comments_notify on public.comments; create trigger comments_notify after insert on public.comments for each row execute function public.add_notification();
drop trigger if exists reposts_notify on public.reposts; create trigger reposts_notify after insert on public.reposts for each row execute function public.add_notification();

create or replace function public.start_conversation(other_user uuid) returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
  if other_user=auth.uid() then raise exception 'You cannot message yourself'; end if;
  select cm1.conversation_id into cid from conversation_members cm1 join conversation_members cm2 on cm1.conversation_id=cm2.conversation_id
  where cm1.user_id=auth.uid() and cm2.user_id=other_user and (select count(*) from conversation_members c where c.conversation_id=cm1.conversation_id)=2 limit 1;
  if cid is null then insert into conversations default values returning id into cid; insert into conversation_members values(cid,auth.uid(),now()),(cid,other_user,null); end if;
  return cid;
end $$;
grant execute on function public.start_conversation(uuid) to authenticated;

create or replace function public.notify_message() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into notifications(user_id,actor_id,type,entity_id)
  select user_id,new.sender_id,'message',new.conversation_id from conversation_members
  where conversation_id=new.conversation_id and user_id<>new.sender_id;
  return new;
end $$;
drop trigger if exists messages_notify on public.messages;
create trigger messages_notify after insert on public.messages for each row execute function public.notify_message();

create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path=public,auth as $$
begin delete from auth.users where id=auth.uid(); end $$;
grant execute on function public.delete_my_account() to authenticated;
