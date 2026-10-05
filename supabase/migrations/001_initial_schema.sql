-- GrantFinder initial schema
-- Business profiles, the grant catalogue, match results, applications and the
-- small amount of plan/usage bookkeeping needed for the free tier limits.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Business profiles (one per user)
-- ---------------------------------------------------------------------------
create table business_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz default now(),
  matched_at timestamptz,                  -- last time matching ran against this profile
  company_name text not null,
  uen text,
  industry text,
  annual_revenue_range text check (annual_revenue_range in ('under_100k', '100k_1m', '1m_10m', '10m_100m', 'over_100m')),
  employee_count integer check (employee_count >= 0),
  years_operating integer check (years_operating >= 0),
  is_local_shareholding_30_percent boolean default true,
  business_stage text check (business_stage in ('idea', 'early_stage', 'growth', 'established')),
  planned_initiatives text[] default '{}', -- digitalization, automation, overseas_expansion, productivity, innovation, sustainability, workforce
  project_notes text                       -- free text: what they actually want to fund
);

-- ---------------------------------------------------------------------------
-- Grant catalogue (public, read only for users, maintained by the service role)
-- ---------------------------------------------------------------------------
create table grants (
  id uuid primary key default uuid_generate_v4(),
  updated_at timestamptz default now(),
  slug text unique not null,
  name text not null,
  short_name text,
  provider text not null,                  -- 'Enterprise Singapore', 'IMDA', 'SkillsFuture SG'
  funding_cap text,
  funding_cap_sgd numeric,                 -- numeric upper bound for charts, null when there is no fixed cap
  funding_percent text,                    -- 'up to 50% of qualifying costs'
  eligible_business_stages text[] default '{}',
  eligible_industries text[] default '{}', -- empty means open to all industries
  eligible_initiatives text[] default '{}',
  min_local_shareholding_percent integer default 30,
  sme_only boolean default false,          -- group turnover <= S$100m or employment <= 200
  max_years_operating integer,             -- for startup schemes
  application_complexity text check (application_complexity in ('simple', 'moderate', 'complex')),
  description text,
  plain_english text,                      -- one paragraph, no jargon
  requirements text[] default '{}',        -- extra conditions to verify yourself
  covers text[] default '{}',              -- what the money can be spent on
  narrative_focus text,                    -- what assessors tend to look for in the write up
  official_url text
);

-- ---------------------------------------------------------------------------
-- Match results (latest run per grant per user)
-- ---------------------------------------------------------------------------
create table grant_matches (
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id uuid not null references grants(id) on delete cascade,
  matched_at timestamptz default now(),
  match_score integer not null check (match_score between 0 and 100),
  likely_eligible boolean not null,
  reasoning text,
  blockers text[] default '{}',
  source text not null default 'rules' check (source in ('ai', 'rules')),
  primary key (user_id, grant_id)
);

-- ---------------------------------------------------------------------------
-- Applications the user is tracking
-- ---------------------------------------------------------------------------
create table grant_applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_id uuid not null references grants(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text default 'considering' check (status in ('considering', 'preparing', 'submitted', 'approved', 'rejected')),
  title text,
  project_description text,
  expected_outcomes text,
  narrative_draft jsonb,                   -- { project_justification, expected_outcomes_section, implementation_plan, missing_information[] }
  narrative_drafted_at timestamptz,
  requested_amount numeric check (requested_amount >= 0),
  target_submit_date date,
  notes text
);

-- ---------------------------------------------------------------------------
-- Plans and usage. Both are written only by the service role.
-- ---------------------------------------------------------------------------
create table subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

create table usage_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('ai_match', 'narrative_draft')),
  created_at timestamptz default now()
);

-- Indexes
create index idx_grants_stage on grants using gin(eligible_business_stages);
create index idx_grants_initiative on grants using gin(eligible_initiatives);
create index idx_applications_user on grant_applications(user_id, status);
create index idx_matches_user on grant_matches(user_id, match_score desc);
create index idx_usage_user_kind on usage_events(user_id, kind, created_at desc);

-- RLS
alter table business_profiles enable row level security;
alter table grants enable row level security;
alter table grant_matches enable row level security;
alter table grant_applications enable row level security;
alter table subscriptions enable row level security;
alter table usage_events enable row level security;

create policy "public_grants" on grants for select using (true);
create policy "own_profile" on business_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_matches" on grant_matches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_applications" on grant_applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "read_own_subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "read_own_usage" on usage_events for select using (auth.uid() = user_id);
