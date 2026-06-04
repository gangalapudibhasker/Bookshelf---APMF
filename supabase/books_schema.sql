-- APMF Bookshelf Supabase schema
-- IMPORTANT: In Supabase Dashboard > SQL Editor, paste the CONTENTS of this file.
-- Do not paste the file path `supabase/books_schema.sql`; that text is not SQL.
-- Run this script before relying on cross-device syncing.

-- Books table used by app.js. The app maps its form fields as follows:
-- title -> title, medium -> author, cover URL -> cover_image, book URL -> file_attachment,
-- selected class -> theme ('Class 6'...'Class 12').
create table if not exists public.books (
  id text primary key,
  title text not null,
  author text not null,
  cover_image text,
  file_attachment text,
  file_name text,
  color text not null,
  accent_color text not null,
  genre text not null,
  year integer not null,
  description text not null,
  theme text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If an older version of this project already created public.books, add the columns
-- required by the schema above without dropping existing data.
alter table public.books add column if not exists author text not null default 'APMF';
alter table public.books add column if not exists cover_image text;
alter table public.books add column if not exists file_attachment text;
alter table public.books add column if not exists file_name text;
alter table public.books add column if not exists color text not null default '#1e3a8a';
alter table public.books add column if not exists accent_color text not null default '#60a5fa';
alter table public.books add column if not exists genre text not null default 'Mathematics';
alter table public.books add column if not exists year integer not null default extract(year from now())::integer;
alter table public.books add column if not exists description text not null default '';
alter table public.books add column if not exists theme text;
alter table public.books add column if not exists created_at timestamptz default now();
alter table public.books add column if not exists updated_at timestamptz default now();

-- Compatibility for the earlier APMF schema that used grade_class/medium/cover_url/book_url
-- as NOT NULL columns. Keep those columns if they exist, but make them harmless so
-- inserts using the current schema do not fail.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'books' and column_name = 'grade_class') then
    alter table public.books alter column grade_class set default '10';
    alter table public.books alter column grade_class drop not null;
  end if;

  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'books' and column_name = 'medium') then
    alter table public.books alter column medium set default 'English';
    alter table public.books alter column medium drop not null;
  end if;

  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'books' and column_name = 'cover_url') then
    alter table public.books alter column cover_url set default '';
    alter table public.books alter column cover_url drop not null;
  end if;

  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'books' and column_name = 'book_url') then
    alter table public.books alter column book_url set default '#';
    alter table public.books alter column book_url drop not null;
  end if;
end $$;

create table if not exists public.curriculum (
  id text primary key,
  title text not null,
  subject text not null,
  description text not null,
  file_attachment text,
  file_name text,
  class_level text,
  cover_image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.resources (
  id text primary key,
  title text not null,
  type text not null check (type in ('Document', 'Video', 'Link', 'Software')),
  category text not null,
  description text not null,
  url text,
  file_attachment text,
  file_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_books_genre on public.books(genre);
create index if not exists idx_books_year on public.books(year);
create index if not exists idx_curriculum_class_level on public.curriculum(class_level);
create index if not exists idx_curriculum_subject on public.curriculum(subject);
create index if not exists idx_resources_type on public.resources(type);
create index if not exists idx_resources_category on public.resources(category);

alter table public.books enable row level security;
alter table public.curriculum enable row level security;
alter table public.resources enable row level security;

-- Public read policies for the deployed static site.
drop policy if exists "Allow public read access on books" on public.books;
create policy "Allow public read access on books"
on public.books
for select
to anon
using (true);

drop policy if exists "Allow public read access on curriculum" on public.curriculum;
create policy "Allow public read access on curriculum"
on public.curriculum
for select
to anon
using (true);

drop policy if exists "Allow public read access on resources" on public.resources;
create policy "Allow public read access on resources"
on public.resources
for select
to anon
using (true);

-- The admin UI runs as a static browser app with the anon key, so it needs anon
-- write policies. Without these, uploads can succeed in Storage while metadata
-- upserts fail with "Metadata Sync Failed".
drop policy if exists "Allow anon insert on books" on public.books;
create policy "Allow anon insert on books"
on public.books
for insert
to anon
with check (true);

drop policy if exists "Allow anon update on books" on public.books;
create policy "Allow anon update on books"
on public.books
for update
to anon
using (true)
with check (true);

drop policy if exists "Allow anon delete on books" on public.books;
create policy "Allow anon delete on books"
on public.books
for delete
to anon
using (true);

-- Enable realtime broadcasts for the books table so open browsers refresh automatically.
do $$
begin
  alter publication supabase_realtime add table public.books;
exception
  when duplicate_object then null;
end $$;

-- Storage setup for cover uploads. You may create this bucket in the dashboard instead:
-- Storage > New bucket > Name: book-shelf > Public bucket: enabled.
insert into storage.buckets (id, name, public)
values ('book-shelf', 'book-shelf', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read access for book shelf covers" on storage.objects;
create policy "Public read access for book shelf covers"
on storage.objects
for select
to anon
using (bucket_id = 'book-shelf');

drop policy if exists "Anon upload access for book shelf covers" on storage.objects;
create policy "Anon upload access for book shelf covers"
on storage.objects
for insert
to anon
with check (bucket_id = 'book-shelf');

drop policy if exists "Anon update access for book shelf covers" on storage.objects;
create policy "Anon update access for book shelf covers"
on storage.objects
for update
to anon
using (bucket_id = 'book-shelf')
with check (bucket_id = 'book-shelf');
