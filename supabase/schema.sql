-- Run this in your Supabase project's SQL Editor.
-- It creates the table, indexes, and storage bucket needed by the form.

create table if not exists production_requests (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  created_at timestamptz not null default now(),
  status text not null default 'new',

  -- Contact
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  company text,
  job_title text,
  heard_about text,

  -- Production
  production_name text not null,
  description text,
  script_status text,
  stakeholders text,
  nda_required text,

  -- Schedule
  decision_deadline date,
  shoot_date date,
  delivery_date date,
  shoot_days int,
  location_count int,

  -- Location
  street text,
  street2 text,
  city text,
  state text,
  zip text,

  -- Scope
  services text[],
  audio_needed text,
  broadcast text[],
  post_needed text,

  -- Deliverables
  deliverables text[],
  accessibility text[],

  -- Talent
  talent_needed text,
  talent_count int,
  talent_type text[],
  talent_demo text,
  union_pref text,
  paid_advertising text,
  usage_years int,

  -- Brand & Music
  brand_assets text,
  brand_notes text,
  music_approach text[],

  -- Budget
  budget_range text,

  -- Other
  notes text,
  files jsonb default '[]'::jsonb
);

create index if not exists production_requests_created_at_idx
  on production_requests (created_at desc);
create index if not exists production_requests_status_idx
  on production_requests (status);
create index if not exists production_requests_ref_idx
  on production_requests (ref);

-- Row Level Security: only the service role (used in API routes) can read/write.
-- This prevents anyone with the anon key from accessing submissions directly.
alter table production_requests enable row level security;

-- Storage bucket for uploaded reference files.
-- Private (not public) — files are accessed via 30-day signed URLs in the email.
insert into storage.buckets (id, name, public)
values ('request-uploads', 'request-uploads', false)
on conflict (id) do nothing;
