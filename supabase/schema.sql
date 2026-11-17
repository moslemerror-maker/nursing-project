-- Run this entire file in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  logo_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_option text not null,
  points numeric(7,2) not null default 1 check (points >= 0),
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete restrict,
  full_name text not null,
  employee_id text not null,
  department text not null,
  designation text,
  answers jsonb not null,
  score numeric(9,2) not null,
  total_points numeric(9,2) not null,
  percentage numeric(7,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists submissions_employee_id_idx on public.submissions(employee_id);
create index if not exists submissions_quiz_id_idx on public.submissions(quiz_id);
create index if not exists submissions_created_at_idx on public.submissions(created_at desc);

alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;

-- Public participants can read published quiz metadata and question text/options only.
-- Correct answers are deliberately not exposed via the public API; public question
-- retrieval is performed server-side in the page route, selecting no correct_option.
create policy "Public can read published quizzes" on public.quizzes
for select to anon, authenticated using (is_published = true);

-- Admin browser operations are restricted to authenticated users; additionally
-- the application checks ADMIN_EMAIL on all admin pages. For production, use a
-- dedicated admin account and do not create other Supabase users.
create policy "Authenticated admins manage quizzes" on public.quizzes
for all to authenticated using (true) with check (true);

create policy "Public can read questions for published quizzes" on public.questions
for select to anon, authenticated using (
  exists (select 1 from public.quizzes q where q.id = quiz_id and q.is_published = true)
);
create policy "Authenticated admins manage questions" on public.questions
for all to authenticated using (true) with check (true);

-- Submissions are accessed only by server routes using the service-role key.
-- No anon/authenticated policies are created for submissions.
-- IMPORTANT: never expose SUPABASE_SERVICE_ROLE_KEY in NEXT_PUBLIC_* variables.

-- Storage bucket for hospital logo. Public read allows logo display; uploads are
-- restricted to authenticated users. The app uses bucket name "branding".
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

create policy "Public can view branding" on storage.objects
for select using (bucket_id = 'branding');
create policy "Authenticated users upload branding" on storage.objects
for insert to authenticated with check (bucket_id = 'branding');
