-- SignalBoost SaaS module tables: Spreadsheets and Promote campaigns.
-- Requires the accounts table to exist before this migration runs.

create extension if not exists "uuid-ossp";

-- ───────────────────────────────
-- TABLE: spreadsheets
-- ───────────────────────────────
create table if not exists spreadsheets (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ───────────────────────────────
-- TABLE: spreadsheet_columns
-- ───────────────────────────────
create table if not exists spreadsheet_columns (
  id uuid primary key default uuid_generate_v4(),
  sheet_id uuid references spreadsheets(id) on delete cascade,
  name text not null,
  type text check (type in ('text','number','date','select','checkbox')),
  created_at timestamp with time zone default now()
);

-- ───────────────────────────────
-- TABLE: spreadsheet_rows
-- ───────────────────────────────
create table if not exists spreadsheet_rows (
  id uuid primary key default uuid_generate_v4(),
  sheet_id uuid references spreadsheets(id) on delete cascade,
  data jsonb not null, -- stores row values keyed by column id
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for fast filtering/sorting
create index if not exists idx_spreadsheets_account_id on spreadsheets(account_id);
create index if not exists idx_spreadsheet_columns_sheet_id on spreadsheet_columns(sheet_id);
create index if not exists idx_spreadsheet_rows_sheet_id on spreadsheet_rows(sheet_id);

-- ───────────────────────────────
-- TABLE: campaigns (Promote module)
-- ───────────────────────────────
create table if not exists campaigns (
  id uuid primary key default uuid_generate_v4(),
  account_id uuid references accounts(id) on delete cascade,
  headline text not null,
  subheadline text,
  body text,
  cta text,
  utm_links jsonb, -- stores channel → UTM link mapping
  status text check (status in ('active','paused','archived')) default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ───────────────────────────────
-- TABLE: campaign_variations
-- ───────────────────────────────
create table if not exists campaign_variations (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references campaigns(id) on delete cascade,
  audience text,
  tone text,
  rewritten_copy jsonb, -- AI rewritten content
  created_at timestamp with time zone default now()
);

-- Indexes for campaign tracking
create index if not exists idx_campaigns_account_id on campaigns(account_id);
create index if not exists idx_campaign_variations_campaign_id on campaign_variations(campaign_id);
