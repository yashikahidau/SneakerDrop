create extension if not exists pgcrypto;

create table if not exists public.sneakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null,
  price numeric(10, 2) not null check (price >= 0),
  image_url text not null,
  description text not null,
  availability_status text not null default 'coming_soon'
    check (availability_status in ('available', 'coming_soon', 'sold_out')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  sneaker_id uuid not null references public.sneakers(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint waitlist_sneaker_email_unique unique (sneaker_id, email),
  constraint waitlist_email_format check (email ~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$')
);

create index if not exists waitlist_sneaker_id_idx on public.waitlist(sneaker_id);
create index if not exists waitlist_created_at_idx on public.waitlist(created_at desc);
create index if not exists sneakers_created_at_idx on public.sneakers(created_at desc);

alter table public.sneakers enable row level security;
alter table public.waitlist enable row level security;

drop policy if exists "Sneakers are publicly readable" on public.sneakers;
create policy "Sneakers are publicly readable"
  on public.sneakers for select
  to anon, authenticated
  using (true);

drop policy if exists "Visitors may join the waitlist" on public.waitlist;
create policy "Visitors may join the waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);
