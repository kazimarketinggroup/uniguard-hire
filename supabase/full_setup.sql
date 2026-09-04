-- ============================================================================
-- Uniguard Hire - FULL DATABASE SETUP (PRODUCTION READY - MASTER SETUP)
-- Safe to run on fresh or existing Supabase projects. Completely idempotent.
-- ============================================================================

-- 1. Create Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  applicant_email text not null,
  full_name text not null,
  applied_job text,
  status text not null default 'applied',
  form_data jsonb default '{}'::jsonb,
  vetting_data jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Ensure vetting_data column exists if applications table pre-existed
alter table public.applications add column if not exists vetting_data jsonb default '[]'::jsonb;
create index if not exists applications_user_id_idx on public.applications (user_id);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  location text not null default '',
  pay_rate numeric not null default 0,
  employment_type text not null default 'Full-Time',
  sia_required boolean not null default true,
  status text not null default 'active',
  created_date text not null default '',
  description text not null default '',
  applicants_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  scheduled_at timestamptz,
  duration_minutes integer,
  location text,
  notes text,
  rating integer,
  status text default 'scheduled',
  completed boolean default false,
  created_at timestamptz not null default now()
);

alter table public.interviews add column if not exists notes text;
alter table public.interviews add column if not exists rating integer;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications(id) on delete cascade,
  sender text not null default 'user',
  body text not null,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  read_by_admin boolean not null default false,
  read_by_user boolean not null default false
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.applications(id) on delete set null,
  employee_id text not null unique,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  role_title text not null default '',
  sia_licence_no text not null default '',
  sia_licence_sector text not null default '',
  sia_licence_expiry text not null default '',
  hired_date text not null default '',
  assigned_site text not null default '',
  hourly_rate numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create unique index if not exists employees_one_per_applicant
  on public.employees (applicant_id)
  where applicant_id is not null;

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'Uniguard Security Services UK Ltd',
  company_number text not null default '',
  sia_acs_approved boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.applications(id) on delete cascade,
  applicant_name text not null default '',
  action text not null default '',
  "user" text not null default '',
  created_at timestamptz not null default now()
);

-- 2. Profiles Trigger & Admin Helper
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

-- 3. Default Admin Account Setup
do $$
declare
  v_admin_email text := 'uniguardhire@admin.com';
  v_admin_pass  text := 'UniguardAdmin2026!';
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = v_admin_email;

  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users
      (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
       raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values
      ('00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
       v_admin_email, crypt(v_admin_pass, gen_salt('bf')), now(),
       jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
       '{}'::jsonb, now(), now());
    insert into auth.identities
      (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values
      (gen_random_uuid(), v_uid::text, v_uid,
       jsonb_build_object('sub', v_uid::text, 'email', v_admin_email),
       'email', now(), now(), now());
  else
    update auth.users
       set encrypted_password = crypt(v_admin_pass, gen_salt('bf'))
     where id = v_uid;
    delete from auth.sessions where user_id = v_uid;
  end if;

  insert into public.profiles (id, email, full_name, is_admin)
  values (v_uid, v_admin_email, 'Uniguard Admin', true)
  on conflict (id) do update
    set email = v_admin_email, is_admin = true;
end $$;

-- 4. Enable Row Level Security (RLS) & Policies
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.jobs enable row level security;
alter table public.interviews enable row level security;
alter table public.messages enable row level security;
alter table public.employees enable row level security;
alter table public.settings enable row level security;
alter table public.activity_logs enable row level security;

-- Profiles RLS
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select to authenticated using (auth.uid() = id or public.is_admin());

-- Applications RLS
drop policy if exists "applications insert own" on public.applications;
create policy "applications insert own" on public.applications for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "applications select own or admin" on public.applications;
create policy "applications select own or admin" on public.applications for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "applications update admin" on public.applications;
create policy "applications update admin" on public.applications for update to authenticated using (public.is_admin());

-- Jobs RLS
drop policy if exists "jobs select all" on public.jobs;
create policy "jobs select all" on public.jobs for select to anon, authenticated using (true);
drop policy if exists "jobs insert admin" on public.jobs;
create policy "jobs insert admin" on public.jobs for insert to authenticated with check (public.is_admin());
drop policy if exists "jobs update admin" on public.jobs;
create policy "jobs update admin" on public.jobs for update to authenticated using (public.is_admin());
drop policy if exists "jobs delete admin" on public.jobs;
create policy "jobs delete admin" on public.jobs for delete to authenticated using (public.is_admin());

-- Interviews RLS
drop policy if exists "interviews insert admin" on public.interviews;
create policy "interviews insert admin" on public.interviews for insert to authenticated with check (public.is_admin());
drop policy if exists "interviews select owner or admin" on public.interviews;
create policy "interviews select owner or admin" on public.interviews for select to authenticated using (public.is_admin() or exists (select 1 from public.applications a where a.id = public.interviews.application_id and a.user_id = auth.uid()));
drop policy if exists "interviews update admin" on public.interviews;
create policy "interviews update admin" on public.interviews for update to authenticated using (public.is_admin());

-- Messages RLS & Security Trigger
create or replace function public.force_message_sender() returns trigger language plpgsql security definer set search_path = public as $$
declare is_admin bool := public.is_admin();
begin
  if tg_op = 'INSERT' then new.sender := case when is_admin then 'admin' else 'user' end;
  elsif new.sender is distinct from old.sender then raise exception 'sender is managed by the server and cannot be changed'; end if;
  if not is_admin then new.read_by_admin := false; if tg_op = 'INSERT' then new.read_by_user := true; end if; end if;
  return new;
end; $$;

drop trigger if exists messages_force_sender on public.messages;
create trigger messages_force_sender before insert or update on public.messages for each row execute function public.force_message_sender();

drop policy if exists "messages insert own thread or admin" on public.messages;
create policy "messages insert own thread or admin" on public.messages for insert to authenticated with check (public.is_admin() or exists (select 1 from public.applications a where a.id = public.messages.application_id and a.user_id = auth.uid()));
drop policy if exists "messages select own thread or admin" on public.messages;
create policy "messages select own thread or admin" on public.messages for select to authenticated using (public.is_admin() or exists (select 1 from public.applications a where a.id = public.messages.application_id and a.user_id = auth.uid()));
drop policy if exists "messages update own thread or admin" on public.messages;
create policy "messages update own thread or admin" on public.messages for update to authenticated using (public.is_admin() or exists (select 1 from public.applications a where a.id = public.messages.application_id and a.user_id = auth.uid()));
drop policy if exists "messages delete admin" on public.messages;
create policy "messages delete admin" on public.messages for delete to authenticated using (public.is_admin());

-- Employees RLS
drop policy if exists "employees admin all" on public.employees;
create policy "employees admin all" on public.employees for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Settings RLS
drop policy if exists "settings admin all" on public.settings;
create policy "settings admin all" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Activity Logs RLS
drop policy if exists "activity_logs admin all" on public.activity_logs;
create policy "activity_logs admin all" on public.activity_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5. Storage Evidence Bucket & Policies
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidence', 
  'evidence', 
  true, 
  10485760, 
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update set 
  public = true, 
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

drop policy if exists "evidence upload own or admin" on storage.objects;
create policy "evidence upload own or admin"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'evidence'
      and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
    );

drop policy if exists "evidence select own or admin" on storage.objects;
create policy "evidence select own or admin"
    on storage.objects for select to authenticated
    using (
      bucket_id = 'evidence'
      and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
    );

-- 6. Enable Realtime Publications (Safe Idempotent Block)
do $$ begin alter publication supabase_realtime add table public.applications; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.interviews; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.jobs; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.employees; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.settings; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.activity_logs; exception when duplicate_object then null; end $$;
