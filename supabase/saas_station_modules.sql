-- SignalBoost SaaS Station modules: Spreadsheets + Promote
-- Run in Supabase SQL editor. Tables are RLS scoped by auth.uid().

create extension if not exists pgcrypto;

create table if not exists public.sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Operations Sheet',
  data jsonb not null default '{"version":2,"columns":[],"rows":[]}'::jsonb,
  rows integer not null default 0,
  cols integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'paused' check (status in ('active','paused','archived')),
  audience text not null default '',
  tone text not null default '',
  goal text not null default '',
  offer text not null default '',
  landing_url text not null default 'https://www.signalboostapp.com',
  package jsonb not null default '{"headline":"","subheadline":"","body":"","cta":"","links":{"email":"","social":"","paid":""}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sheets_set_updated_at on public.sheets;
create trigger sheets_set_updated_at before update on public.sheets for each row execute function public.set_updated_at();

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at before update on public.campaigns for each row execute function public.set_updated_at();

alter table public.sheets enable row level security;
alter table public.campaigns enable row level security;

drop policy if exists "sheets owner select" on public.sheets;
drop policy if exists "sheets owner insert" on public.sheets;
drop policy if exists "sheets owner update" on public.sheets;
drop policy if exists "sheets owner delete" on public.sheets;
create policy "sheets owner select" on public.sheets for select using (auth.uid() = user_id);
create policy "sheets owner insert" on public.sheets for insert with check (auth.uid() = user_id);
create policy "sheets owner update" on public.sheets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "sheets owner delete" on public.sheets for delete using (auth.uid() = user_id);

drop policy if exists "campaigns owner select" on public.campaigns;
drop policy if exists "campaigns owner insert" on public.campaigns;
drop policy if exists "campaigns owner update" on public.campaigns;
drop policy if exists "campaigns owner delete" on public.campaigns;
create policy "campaigns owner select" on public.campaigns for select using (auth.uid() = user_id);
create policy "campaigns owner insert" on public.campaigns for insert with check (auth.uid() = user_id);
create policy "campaigns owner update" on public.campaigns for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "campaigns owner delete" on public.campaigns for delete using (auth.uid() = user_id);
