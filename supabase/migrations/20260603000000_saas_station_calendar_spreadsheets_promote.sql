-- SignalBoost SaaS Station unified upgrade: Calendar + Spreadsheets + Promote
create extension if not exists pgcrypto;

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid references public.calendar_services(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text not null default 'UTC',
  recurrence jsonb not null default '{"rule":"none","frequency":"none","exceptions":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spreadsheets (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spreadsheet_columns (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.spreadsheets(id) on delete cascade,
  name text not null,
  type text not null check (type in ('text','number','date','select','checkbox')),
  created_at timestamptz not null default now()
);

create table if not exists public.spreadsheet_rows (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.spreadsheets(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references auth.users(id) on delete cascade,
  headline text,
  subheadline text,
  body text,
  cta text,
  utm_links jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns add column if not exists account_id uuid references auth.users(id) on delete cascade;
alter table public.campaigns add column if not exists headline text;
alter table public.campaigns add column if not exists subheadline text;
alter table public.campaigns add column if not exists body text;
alter table public.campaigns add column if not exists cta text;
alter table public.campaigns add column if not exists utm_links jsonb not null default '{}'::jsonb;
alter table public.campaigns add column if not exists status text not null default 'active';
do $$ begin
  alter table public.campaigns alter column name drop not null;
exception when undefined_column then null; end $$;
do $$ begin
  alter table public.campaigns alter column user_id drop not null;
exception when undefined_column then null; end $$;
do $$ begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'campaigns' and column_name = 'user_id') then
    execute 'update public.campaigns set account_id = coalesce(account_id, user_id) where account_id is null';
  end if;
end $$;

create table if not exists public.campaign_variations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  audience text,
  tone text,
  rewritten_copy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists idx_calendar_events_account_id on public.calendar_events(account_id);
create index if not exists idx_calendar_events_service_time on public.calendar_events(service_id, start_time);
create index if not exists idx_spreadsheets_account_id on public.spreadsheets(account_id);
create index if not exists idx_spreadsheet_columns_sheet_id on public.spreadsheet_columns(sheet_id);
create index if not exists idx_spreadsheet_rows_sheet_id on public.spreadsheet_rows(sheet_id);
create index if not exists idx_campaigns_account_id on public.campaigns(account_id);
create index if not exists idx_campaign_variations_campaign_id on public.campaign_variations(campaign_id);

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
drop trigger if exists spreadsheets_set_updated_at on public.spreadsheets;
create trigger spreadsheets_set_updated_at before update on public.spreadsheets for each row execute function public.set_updated_at();
drop trigger if exists spreadsheet_rows_set_updated_at on public.spreadsheet_rows;
create trigger spreadsheet_rows_set_updated_at before update on public.spreadsheet_rows for each row execute function public.set_updated_at();
drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at before update on public.campaigns for each row execute function public.set_updated_at();

alter table public.calendar_events enable row level security;
alter table public.spreadsheets enable row level security;
alter table public.spreadsheet_columns enable row level security;
alter table public.spreadsheet_rows enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_variations enable row level security;

drop policy if exists "calendar events owner select" on public.calendar_events;
create policy "calendar events owner select" on public.calendar_events for select using (auth.uid() = account_id);
drop policy if exists "calendar events owner insert" on public.calendar_events;
create policy "calendar events owner insert" on public.calendar_events for insert with check (auth.uid() = account_id);
drop policy if exists "calendar events owner update" on public.calendar_events;
create policy "calendar events owner update" on public.calendar_events for update using (auth.uid() = account_id) with check (auth.uid() = account_id);
drop policy if exists "calendar events owner delete" on public.calendar_events;
create policy "calendar events owner delete" on public.calendar_events for delete using (auth.uid() = account_id);

drop policy if exists "spreadsheets owner select" on public.spreadsheets;
create policy "spreadsheets owner select" on public.spreadsheets for select using (auth.uid() = account_id);
drop policy if exists "spreadsheets owner insert" on public.spreadsheets;
create policy "spreadsheets owner insert" on public.spreadsheets for insert with check (auth.uid() = account_id);
drop policy if exists "spreadsheets owner update" on public.spreadsheets;
create policy "spreadsheets owner update" on public.spreadsheets for update using (auth.uid() = account_id) with check (auth.uid() = account_id);
drop policy if exists "spreadsheets owner delete" on public.spreadsheets;
create policy "spreadsheets owner delete" on public.spreadsheets for delete using (auth.uid() = account_id);
drop policy if exists "spreadsheet columns owner all" on public.spreadsheet_columns;
create policy "spreadsheet columns owner all" on public.spreadsheet_columns for all using (exists (select 1 from public.spreadsheets s where s.id = sheet_id and s.account_id = auth.uid())) with check (exists (select 1 from public.spreadsheets s where s.id = sheet_id and s.account_id = auth.uid()));
drop policy if exists "spreadsheet rows owner all" on public.spreadsheet_rows;
create policy "spreadsheet rows owner all" on public.spreadsheet_rows for all using (exists (select 1 from public.spreadsheets s where s.id = sheet_id and s.account_id = auth.uid())) with check (exists (select 1 from public.spreadsheets s where s.id = sheet_id and s.account_id = auth.uid()));

drop policy if exists "campaigns owner select" on public.campaigns;
create policy "campaigns owner select" on public.campaigns for select using (auth.uid() = account_id);
drop policy if exists "campaigns owner insert" on public.campaigns;
create policy "campaigns owner insert" on public.campaigns for insert with check (auth.uid() = account_id);
drop policy if exists "campaigns owner update" on public.campaigns;
create policy "campaigns owner update" on public.campaigns for update using (auth.uid() = account_id) with check (auth.uid() = account_id);
drop policy if exists "campaigns owner delete" on public.campaigns;
create policy "campaigns owner delete" on public.campaigns for delete using (auth.uid() = account_id);
drop policy if exists "campaign variations owner all" on public.campaign_variations;
create policy "campaign variations owner all" on public.campaign_variations for all using (exists (select 1 from public.campaigns c where c.id = campaign_id and c.account_id = auth.uid())) with check (exists (select 1 from public.campaigns c where c.id = campaign_id and c.account_id = auth.uid()));
