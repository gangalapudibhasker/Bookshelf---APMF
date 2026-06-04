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

-- All-permissions policy for public/anon users
drop policy if exists "all perms" on public.books;
create policy "all perms"
on public.books
as PERMISSIVE
for ALL
to public
using (true)
with check (true);

-- Enable realtime for live sync
alter publication supabase_realtime add table public.books;

-- Storage: Create book-shelf bucket
insert into storage.buckets (id, name, public)
values ('book-shelf', 'book-shelf', true)
on conflict (id) do update set public = true;

-- Storage: All-permissions policy for book-shelf bucket
drop policy if exists "storage all perms" on storage.objects;
create policy "storage all perms"
on storage.objects
as PERMISSIVE
for ALL
to public
using (bucket_id = 'book-shelf')
with check (bucket_id = 'book-shelf');
