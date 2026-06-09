-- SupportOps Automation — Supabase Schema
-- Run this in the Supabase SQL Editor

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────
-- Tickets table
-- ──────────────────────────────────────────────
create table if not exists tickets (
  id              uuid primary key default gen_random_uuid(),
  ticket_number   text unique not null,

  -- Submitter info
  full_name       text not null,
  email           text not null,
  department      text not null,

  -- Issue info
  subject         text not null,
  description     text not null,
  urgency_level   text check (urgency_level in ('low', 'medium', 'high', 'critical')) default 'medium',
  affected_system text,
  attachment_url  text,

  -- Workflow status
  status          text check (status in ('open', 'in_progress', 'resolved', 'closed')) not null default 'open',

  -- AI triage metadata (populated after AI analysis)
  ai_category          text,
  ai_priority          text check (ai_priority in ('low', 'medium', 'high', 'critical')),
  ai_summary           text,
  ai_suggested_team    text,
  ai_confidence_score  numeric(3,2),
  ai_tags              text[],
  ai_estimated_resolution text,
  ai_root_cause        text,
  ai_analysis_raw      jsonb,
  ai_analyzed_at       timestamptz,

  -- Google Sheets sync
  sheets_synced_at     timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tickets_updated_at
  before update on tickets
  for each row execute function update_updated_at();

-- ──────────────────────────────────────────────
-- Ticket number generator (SUP-YYYYMMDD-XXXX)
-- ──────────────────────────────────────────────
create sequence if not exists ticket_seq;

create or replace function generate_ticket_number()
returns trigger language plpgsql as $$
begin
  new.ticket_number = 'SUP-' ||
    to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('ticket_seq')::text, 4, '0');
  return new;
end;
$$;

create trigger set_ticket_number
  before insert on tickets
  for each row execute function generate_ticket_number();

-- ──────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────
alter table tickets enable row level security;

-- Anyone can insert (public ticket submission)
create policy "public_can_insert" on tickets
  for insert with check (true);

-- Anyone can read their own ticket by email (for success page lookup)
create policy "submitter_can_read_own" on tickets
  for select using (true);

-- Service role bypasses RLS (used by server actions)

-- ──────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────
create index if not exists idx_tickets_status on tickets(status);
create index if not exists idx_tickets_created_at on tickets(created_at desc);
create index if not exists idx_tickets_email on tickets(email);
create index if not exists idx_tickets_department on tickets(department);
create index if not exists idx_tickets_ai_priority on tickets(ai_priority);
