-- APMF Bookshelf Supabase schema
-- IMPORTANT: In Supabase Dashboard > SQL Editor, paste the CONTENTS of this file.
-- Do not paste the file path `supabase/books_schema.sql`; that text is not SQL.
-- Run this script before relying on cross-device syncing.

create table if not exists public.books (
  id text primary key,
  title text not null,
  grade_class text not null check (grade_class in ('6', '7', '8', '9', '10', '11', '12')),
  medium text not null default 'English',
  cover_url text not null,
  book_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure older tables created before these columns existed are upgraded safely.
alter table public.books
  add column if not exists cover_url text not null default '';
alter table public.books
  add column if not exists book_url text not null default '';

do $$
begin
  if exists (
    select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'books' and column_name = 'onedrive_url'
  ) then
    update public.books
    set book_url = onedrive_url
    where (book_url is null or book_url = '') and onedrive_url is not null;
  end if;

  if exists (
    select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'books' and column_name = 'file_url'
  ) then
    update public.books
    set book_url = file_url
    where (book_url is null or book_url = '') and file_url is not null;
  end if;
end $$;

alter table public.books enable row level security;

-- Public users can read the bookshelf.
drop policy if exists "Public read access for books" on public.books;
create policy "Public read access for books"
on public.books
for select
to anon
using (true);

-- This static app currently uses the anon key from the browser, so writes must be allowed
-- for the admin dashboard to save metadata. For production, move admin writes behind
-- Supabase Auth or an Edge Function instead of broad anon write policies.
drop policy if exists "Anon insert access for books" on public.books;
create policy "Anon insert access for books"
on public.books
for insert
to anon
with check (true);

drop policy if exists "Anon update access for books" on public.books;
create policy "Anon update access for books"
on public.books
for update
to anon
using (true)
with check (true);

drop policy if exists "Anon delete access for books" on public.books;
create policy "Anon delete access for books"
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
