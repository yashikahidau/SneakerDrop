create extension if not exists pgcrypto;

create table if not exists public.sneakers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tagline text not null,
  category text not null default 'Footwear',
  price numeric(10, 2) not null check (price >= 0),
  image_url text not null,
  description text not null,
  material_notes text,
  construction_notes text,
  availability_status text not null default 'coming_soon'
    check (availability_status in ('available', 'coming_soon', 'sold_out', 'archived')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.sneakers add column if not exists material_notes text;
alter table public.sneakers add column if not exists construction_notes text;
alter table public.sneakers add column if not exists category text not null default 'Footwear';
alter table public.sneakers drop constraint if exists sneakers_availability_status_check;
alter table public.sneakers add constraint sneakers_availability_status_check
  check (availability_status in ('available', 'coming_soon', 'sold_out', 'archived'));

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  sneaker_id uuid not null references public.sneakers(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint waitlist_sneaker_email_unique unique (sneaker_id, email)
);

-- Upgrade existing databases created with the earlier strict email constraint.
alter table public.waitlist drop constraint if exists waitlist_email_format;

create index if not exists waitlist_sneaker_id_idx on public.waitlist(sneaker_id);
create index if not exists waitlist_created_at_idx on public.waitlist(created_at desc);
create index if not exists sneakers_created_at_idx on public.sneakers(created_at desc);

-- Keep the public catalogue synchronized with product changes made in the Atelier.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'sneakers'
     ) then
    execute 'alter publication supabase_realtime add table public.sneakers';
  end if;
end;
$$;

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

-- Remove restrictive INSERT policies that would override the intended visitor
-- insert policy. Other command policies, such as SELECT, remain unchanged.
do $$
declare
  policy_name text;
begin
  for policy_name in
    select pol.polname
    from pg_policy as pol
    where pol.polrelid = 'public.waitlist'::regclass
      and not pol.polpermissive
      and pol.polcmd in ('a', '*')
  loop
    execute format('drop policy %I on public.waitlist', policy_name);
  end loop;
end;
$$;
