-- APMF Bookshelf - Clean Schema
-- Paste this entire script into Supabase SQL Editor and run it.

-- Drop everything and start fresh
drop table if exists public.books;

-- Create books table with only essential metadata
create table public.books (
  id text primary key,
  title text not null,
  grade text not null,
  medium text not null default 'English',
  cover_url text not null,
  book_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.books enable row level security;

-- Policy: Public read access
drop policy if exists "Public read" on public.books;
create policy "Public read"
on public.books
for select
to anon
using (true);

-- Policy: Allow insert
drop policy if exists "Allow insert" on public.books;
create policy "Allow insert"
on public.books
for insert
to anon
with check (true);

-- Policy: Allow update
drop policy if exists "Allow update" on public.books;
create policy "Allow update"
on public.books
for update
to anon
using (true)
with check (true);

-- Policy: Allow delete
drop policy if exists "Allow delete" on public.books;
create policy "Allow delete"
on public.books
for delete
to anon
using (true);

-- Enable realtime for live sync
alter publication supabase_realtime add table public.books;

-- Storage: Create book-shelf bucket
insert into storage.buckets (id, name, public)
values ('book-shelf', 'book-shelf', true)
on conflict (id) do update set public = true;

-- Storage Policy: Public read
drop policy if exists "Public read storage" on storage.objects;
create policy "Public read storage"
on storage.objects
for select
to anon
using (bucket_id = 'book-shelf');

-- Storage Policy: Allow upload
drop policy if exists "Allow upload" on storage.objects;
create policy "Allow upload"
on storage.objects
for insert
to anon
with check (bucket_id = 'book-shelf');

-- Storage Policy: Allow update
drop policy if exists "Allow storage update" on storage.objects;
create policy "Allow storage update"
on storage.objects
for update
to anon
using (bucket_id = 'book-shelf')
with check (bucket_id = 'book-shelf');
