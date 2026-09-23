-- ============================================================================
-- 018 — SECURITY HARDENING: Account Lockout & Profile Protection
-- ============================================================================

-- 1. Add lockout columns to profiles (safe — additive only)
alter table public.profiles
  add column if not exists failed_login_count integer not null default 0;
alter table public.profiles
  add column if not exists locked_until timestamptz;

-- 2. Function to record failed login attempts and lock after 5 failures
create or replace function public.record_failed_login(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.profiles
    set failed_login_count = failed_login_count + 1
    where email = p_email;

  select failed_login_count into v_count
    from public.profiles
    where email = p_email;

  -- Lock account for 15 minutes after 5 failed attempts
  if v_count >= 5 then
    update public.profiles
      set locked_until = now() + interval '15 minutes'
      where email = p_email;
  end if;
end;
$$;

-- 3. Function to check if an account is currently locked
create or replace function public.is_account_locked(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select locked_until > now() from public.profiles where email = p_email),
    false
  );
$$;

-- 4. Function to reset failed login counter on successful login
create or replace function public.reset_failed_logins(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set failed_login_count = 0, locked_until = null
    where email = p_email;
end;
$$;

-- 5. Prevent non-admin users from modifying admin/super-admin profiles
create or replace function public.protect_admin_profiles()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only the user themselves or an existing admin can modify admin/auditor profiles
  if old.is_admin = true or old.is_auditor = true then
    if auth.uid() != old.id and not public.is_admin() then
      raise exception 'Cannot modify admin or super admin profiles';
    end if;
  end if;
  -- Prevent privilege escalation: non-admins cannot grant themselves admin/auditor
  if new.is_admin = true and old.is_admin = false and not public.is_admin() then
    raise exception 'Cannot self-grant admin privileges';
  end if;
  if new.is_auditor = true and old.is_auditor = false and not public.is_admin() then
    raise exception 'Cannot self-grant super admin privileges';
  end if;
  return new;
end;
$$;

create or replace trigger protect_admin_profiles_trigger
  before update on public.profiles
  for each row execute function public.protect_admin_profiles();
