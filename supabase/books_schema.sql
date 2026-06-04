-- APMF Bookshelf Supabase schema
-- IMPORTANT: In Supabase Dashboard > SQL Editor, paste the CONTENTS of this file.
-- Do not paste the file path `supabase/books_schema.sql`; that text is not SQL.
-- Run this script before relying on cross-device syncing.

-- The app stores bookshelf metadata in the existing public.curriculum table.
create table if not exists public.curriculum (
  id text not null,
  title text not null,
  subject text null,
  description text null,
  "fileAttachment" text null,
  "fileName" text null,
  "classLevel" text null,
  "coverImage" text null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint curriculum_pkey primary key (id)
) tablespace pg_default;

-- Safe compatibility for projects where the table already existed but is missing
-- one of the nullable columns used by the static app.
alter table public.curriculum add column if not exists subject text null;
alter table public.curriculum add column if not exists description text null;
alter table public.curriculum add column if not exists "fileAttachment" text null;
alter table public.curriculum add column if not exists "fileName" text null;
alter table public.curriculum add column if not exists "classLevel" text null;
alter table public.curriculum add column if not exists "coverImage" text null;
alter table public.curriculum add column if not exists created_at timestamp with time zone not null default timezone('utc'::text, now());

create index if not exists idx_curriculum_class_level on public.curriculum("classLevel");
create index if not exists idx_curriculum_subject on public.curriculum(subject);

alter table public.curriculum enable row level security;

-- Public read access for the deployed static site.
drop policy if exists "Allow public read access on curriculum" on public.curriculum;
create policy "Allow public read access on curriculum"
on public.curriculum
for select
to anon
using (true);

-- The admin UI runs as a static browser app with the anon key, so it needs anon
-- write policies. Without these, uploads can succeed in Storage while metadata
-- upserts fail.
drop policy if exists "Allow anon insert on curriculum" on public.curriculum;
create policy "Allow anon insert on curriculum"
on public.curriculum
for insert
to anon
with check (true);

drop policy if exists "Allow anon update on curriculum" on public.curriculum;
create policy "Allow anon update on curriculum"
on public.curriculum
for update
to anon
using (true)
with check (true);

drop policy if exists "Allow anon delete on curriculum" on public.curriculum;
create policy "Allow anon delete on curriculum"
on public.curriculum
for delete
to anon
using (true);

-- Enable realtime broadcasts for the curriculum table so open browsers refresh automatically.
do $$
begin
  alter publication supabase_realtime add table public.curriculum;
exception
  when duplicate_object then null;
end $$;

-- Storage setup for cover/file uploads used by the app.
-- You may create this bucket in the dashboard instead:
-- Storage > New bucket > Name: book-shelf > Public bucket: enabled.
insert into storage.buckets (id, name, public)
values ('book-shelf', 'book-shelf', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read access for book shelf files" on storage.objects;
create policy "Public read access for book shelf files"
on storage.objects
for select
to anon
using (bucket_id = 'book-shelf');

drop policy if exists "Anon upload access for book shelf files" on storage.objects;
create policy "Anon upload access for book shelf files"
on storage.objects
for insert
to anon
with check (bucket_id = 'book-shelf');

drop policy if exists "Anon update access for book shelf files" on storage.objects;
create policy "Anon update access for book shelf files"
on storage.objects
for update
to anon
using (bucket_id = 'book-shelf')
with check (bucket_id = 'book-shelf');
