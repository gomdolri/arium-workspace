-- ARIUM Workspace - Supabase Schema
-- Supabase 대시보드 > SQL Editor 에서 이 전체를 붙여넣고 실행하세요

create table if not exists projects (
  id text primary key,
  name text not null,
  client text not null,
  description text,
  status text not null default 'planning',
  start_date text not null,
  end_date text,
  progress integer default 0,
  members text[] default '{}',
  created_at text not null
);

create table if not exists tasks (
  id text primary key,
  project_id text not null,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  assignee_id text not null,
  due_date text,
  progress integer default 0,
  created_at text not null
);

create table if not exists comments (
  id text primary key,
  task_id text not null,
  user_id text not null,
  text text not null,
  created_at text not null
);

create table if not exists productions (
  id text primary key,
  project_id text not null,
  product_name text not null,
  vendor text not null,
  quantity integer default 0,
  status text not null default 'contact',
  sample_date text,
  production_date text,
  completion_date text,
  notes text,
  created_at text not null
);

create table if not exists deliveries (
  id text primary key,
  project_id text not null,
  production_id text,
  recipient text not null,
  items text not null,
  quantity integer default 0,
  status text not null default 'preparing',
  due_date text not null,
  tracking_number text,
  carrier text,
  notes text,
  created_at text not null
);

create table if not exists checklist_items (
  id text primary key,
  delivery_id text not null,
  label text not null,
  checked boolean default false
);

create table if not exists calendar_events (
  id text primary key,
  title text not null,
  date text not null,
  end_date text,
  type text not null default 'other',
  project_id text,
  assignee_ids text[] default '{}',
  color text
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  message text not null,
  type text not null,
  read boolean default false,
  created_at text not null,
  link text
);

-- RLS 비활성화 (내부 팀 전용 툴)
alter table projects disable row level security;
alter table tasks disable row level security;
alter table comments disable row level security;
alter table productions disable row level security;
alter table deliveries disable row level security;
alter table checklist_items disable row level security;
alter table calendar_events disable row level security;
alter table notifications disable row level security;
