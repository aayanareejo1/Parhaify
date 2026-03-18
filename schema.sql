-- StudyFlow Database Schema
-- Run this in Supabase Dashboard > SQL Editor

-- ─────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  code text not null,
  name text not null,
  color text default '#6366f1',
  instructor text,
  credits int,
  created_at timestamptz default now()
);
alter table courses enable row level security;
create policy "users manage own courses" on courses for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- ASSIGNMENTS
-- ─────────────────────────────────────────────
create table if not exists assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  type text,
  due_date date,
  due_time text,
  priority text default 'Medium',
  status text default 'Not Started',
  notes text,
  created_at timestamptz default now()
);
alter table assignments enable row level security;
create policy "users manage own assignments" on assignments for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- NOTES (includes meeting notes via is_meeting_note flag)
-- ─────────────────────────────────────────────
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete set null,
  club_id uuid,
  title text not null,
  content text,
  is_meeting_note boolean default false,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table notes enable row level security;
create policy "users manage own notes" on notes for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TIME BLOCKS
-- ─────────────────────────────────────────────
create table if not exists time_blocks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete set null,
  title text not null,
  date date not null,
  start_time text,
  end_time text,
  color text,
  created_at timestamptz default now()
);
alter table time_blocks enable row level security;
create policy "users manage own time_blocks" on time_blocks for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- STUDY LOGS
-- ─────────────────────────────────────────────
create table if not exists study_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade,
  date date,
  hours numeric,
  notes text,
  created_at timestamptz default now()
);
alter table study_logs enable row level security;
create policy "users manage own study_logs" on study_logs for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- STUDY PROMPTS
-- ─────────────────────────────────────────────
create table if not exists study_prompts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt text,
  output_type text,
  output_type_label text,
  course_id uuid,
  course_name text,
  source_file text,
  saved_at timestamptz default now()
);
alter table study_prompts enable row level security;
create policy "users manage own study_prompts" on study_prompts for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- REFLECTIONS
-- ─────────────────────────────────────────────
create table if not exists reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mood int,
  wins text,
  struggles text,
  notes text,
  week text,
  created_at timestamptz default now()
);
alter table reflections enable row level security;
create policy "users manage own reflections" on reflections for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- CLUBS
-- ─────────────────────────────────────────────
create table if not exists clubs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  short_name text,
  color text,
  role text,
  description text,
  created_at timestamptz default now()
);
alter table clubs enable row level security;
create policy "users manage own clubs" on clubs for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- CLUB TASKS
-- ─────────────────────────────────────────────
create table if not exists club_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  club_id uuid references clubs(id) on delete cascade,
  title text not null,
  type text,
  due_date date,
  due_time text,
  priority text default 'Medium',
  status text default 'Not Started',
  notes text,
  created_at timestamptz default now()
);
alter table club_tasks enable row level security;
create policy "users manage own club_tasks" on club_tasks for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- MEETINGS
-- ─────────────────────────────────────────────
create table if not exists meetings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  club_id uuid references clubs(id) on delete cascade,
  title text not null,
  date date,
  time text,
  location text,
  attendees text,
  agenda text,
  note_id uuid,
  created_at timestamptz default now()
);
alter table meetings enable row level security;
create policy "users manage own meetings" on meetings for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TASKS (general, standalone)
-- ─────────────────────────────────────────────
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text,
  due_date date,
  due_time text,
  priority text default 'Medium',
  status text default 'Not Started',
  notes text,
  color text,
  created_at timestamptz default now()
);
alter table tasks enable row level security;
create policy "users manage own tasks" on tasks for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- SPACES
-- ─────────────────────────────────────────────
create table if not exists spaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  icon text,
  color text,
  created_at timestamptz default now()
);
alter table spaces enable row level security;
create policy "users manage own spaces" on spaces for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- SPACE SECTIONS
-- ─────────────────────────────────────────────
create table if not exists space_sections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  space_id uuid references spaces(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);
alter table space_sections enable row level security;
create policy "users manage own space_sections" on space_sections for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- SPACE TASKS
-- ─────────────────────────────────────────────
create table if not exists space_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  space_id uuid references spaces(id) on delete cascade,
  section_id uuid references space_sections(id) on delete cascade,
  title text not null,
  due_date date,
  due_time text,
  priority text default 'Medium',
  status text default 'Not Started',
  notes text,
  created_at timestamptz default now()
);
alter table space_tasks enable row level security;
create policy "users manage own space_tasks" on space_tasks for all using (auth.uid() = user_id);
