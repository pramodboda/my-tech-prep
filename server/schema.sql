-- TechPrep schema — run once against your Neon database.
-- Neon console → SQL Editor → paste this and run, OR:
--   psql "$DATABASE_URL" -f schema.sql

create extension if not exists pgcrypto; -- provides gen_random_uuid()

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

create table if not exists technologies (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  name       text not null,
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_technologies_user_id on technologies(user_id);

create table if not exists topics (
  id            uuid primary key default gen_random_uuid(),
  technology_id uuid not null references technologies(id) on delete cascade,
  name          text not null,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_topics_technology_id on topics(technology_id);

create table if not exists questions (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid not null references topics(id) on delete cascade,
  question     text not null default '',
  deep_answer  text not null default '',
  short_answer text not null default '',
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_questions_topic_id on questions(topic_id);

-- Keeps updated_at current on every edit, same behavior Prisma's @updatedAt gave us
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_questions_updated_at on questions;
create trigger trg_questions_updated_at
  before update on questions
  for each row execute function set_updated_at();
