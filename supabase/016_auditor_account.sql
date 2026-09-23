-- ============================================================================
-- 016 — AUDITOR ACCOUNT & READ-ONLY VETTING AUDIT POLICIES
-- ============================================================================
-- 1. Ensure profiles table has is_auditor column
alter table public.profiles
  add column if not exists is_auditor boolean not null default false;

-- 2. Helper function to check if the current user is an auditor
create or replace function public.is_auditor()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (select p.is_auditor from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

-- 3. Create or update the auditor user account
do $$
declare
  v_auditor_email text := 'auditor@uniguard.co.uk';
  v_auditor_pass  text := 'AuditorPass2026!';
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = v_auditor_email;

  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users
      (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
       raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values
      ('00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
       v_auditor_email, crypt(v_auditor_pass, gen_salt('bf')), now(),
       jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
       jsonb_build_object('full_name', 'Compliance Auditor'), now(), now());

    insert into auth.identities
      (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values
      (v_uid::text, v_uid,
       jsonb_build_object('sub', v_uid::text, 'email', v_auditor_email),
       'email', now(), now(), now());
  else
    update auth.users
       set encrypted_password = crypt(v_auditor_pass, gen_salt('bf'))
     where id = v_uid;
  end if;

  -- Ensure profile row with is_auditor = true and is_admin = false (read only)
  insert into public.profiles (id, email, full_name, is_admin, is_auditor)
  values (v_uid, v_auditor_email, 'Compliance Auditor (Read-Only)', false, true)
  on conflict (id) do update
    set email = v_auditor_email, is_admin = false, is_auditor = true;
end $$;

-- 4. RLS Policies: Grant Auditors READ-ONLY (SELECT) access across tables

-- Profiles
drop policy if exists "profiles select auditor" on public.profiles;
create policy "profiles select auditor"
  on public.profiles for select to authenticated
  using (public.is_auditor());

-- Applications
drop policy if exists "applications select own or admin or auditor" on public.applications;
create policy "applications select own or admin or auditor"
  on public.applications for select to authenticated
  using (user_id = auth.uid() or public.is_admin() or public.is_auditor());

-- Interviews
drop policy if exists "interviews select owner or admin or auditor" on public.interviews;
create policy "interviews select owner or admin or auditor"
  on public.interviews for select to authenticated
  using (public.is_admin() or public.is_auditor() or exists (
    select 1 from public.applications a
    where a.id = public.interviews.application_id and a.user_id = auth.uid()
  ));

-- Messages
drop policy if exists "messages select participant or admin or auditor" on public.messages;
create policy "messages select participant or admin or auditor"
  on public.messages for select to authenticated
  using (public.is_admin() or public.is_auditor() or exists (
    select 1 from public.applications a
    where a.id = public.messages.application_id and a.user_id = auth.uid()
  ));

-- Employees
drop policy if exists "employees select auditor" on public.employees;
create policy "employees select auditor"
  on public.employees for select to authenticated
  using (public.is_auditor());

-- Activity logs
drop policy if exists "activity_logs select auditor" on public.activity_logs;
create policy "activity_logs select auditor"
  on public.activity_logs for select to authenticated
  using (public.is_auditor());
