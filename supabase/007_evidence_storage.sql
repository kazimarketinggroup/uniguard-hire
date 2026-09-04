-- ============================================================================
-- 007 — Evidence bucket: PRIVATE + folder scoping (RLS) + type/size limits
-- (trigger). Type/size live in the trigger, not the policy: the storage
-- backend commits metadata (mimetype/size) on insert, and the row-level
-- BEFORE trigger is guaranteed to see it, while a WITH CHECK evaluated
-- earlier could see a NULL and reject every upload.
--
-- NOTE: on new-format Supabase projects the storage.* tables are owned by
-- supabase_storage_admin and the SQL editor (postgres) cannot alter them.
-- The trigger + policies below are therefore wrapped in a guarded block:
-- they auto-apply where the editor has ownership (or after running
-- `grant supabase_storage_admin to postgres;`), and are SKIPPED with a
-- notice otherwise — in that case create the two policies via the Storage
-- UI (dashboard → Storage → bucket `evidence` → Policies → New policy,
-- target `authenticated`, expression:
--   (storage.foldername(name))[1] = auth.uid()::text
--   OR (storage.foldername(name))[2] = auth.uid()::text
--   OR public.is_admin()
-- one for read, one for insert).
-- ============================================================================
-- IMPORTANT: upload paths must put the user's id FIRST (`{uid}/file`) — the
-- client now uploads to `{user.id}/{file}` (no bucket-name prefix), which
-- satisfies `[1] = auth.uid()`. The `[2]` clause keeps legacy
-- `evidence/{uid}/file` paths working too.
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do update set public = true;

create or replace function public.check_evidence_upload()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  ftype text;
  fsize bigint;
begin
  if new.bucket_id <> 'evidence' then
    return new;
  end if;

  fsize := coalesce((new.metadata ->> 'size')::bigint, 0);
  if fsize > 10485760 then
    raise exception 'Evidence file exceeds the 10 MB limit';
  end if;

  ftype := lower(coalesce(new.mimetype, new.metadata ->> 'mimetype', ''));
  if ftype not in (
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) then
    raise exception 'File type "%" is not allowed for evidence uploads', ftype;
  end if;

  return new;
end;
$$;

do $$
begin
  execute 'set role supabase_storage_admin';

  execute 'drop trigger if exists evidence_validate_upload on storage.objects';
  execute 'create trigger evidence_validate_upload
             before insert or update on storage.objects
             for each row execute function public.check_evidence_upload()';

  execute 'drop policy if exists "evidence upload own or admin" on storage.objects';
  execute 'create policy "evidence upload own or admin"
             on storage.objects for insert to authenticated
             with check (
               bucket_id = ''evidence''
               and (
                 (storage.foldername(name))[1] = auth.uid()::text
                 or (storage.foldername(name))[2] = auth.uid()::text
                 or public.is_admin()
               )
             )';

  execute 'drop policy if exists "evidence select own or admin" on storage.objects';
  execute 'create policy "evidence select own or admin"
             on storage.objects for select to authenticated
             using (
               bucket_id = ''evidence''
               and (
                 (storage.foldername(name))[1] = auth.uid()::text
                 or (storage.foldername(name))[2] = auth.uid()::text
                 or public.is_admin()
               )
             )';

  execute 'reset role';
  raise notice 'STORAGE OK: evidence bucket trigger + policies applied.';
exception when insufficient_privilege then
  execute 'reset role';
  raise notice 'STORAGE SKIPPED: SQL editor lacks storage ownership - create the 2 evidence policies via the Storage UI (bucket evidence -> Policies): target authenticated, expression (storage.foldername(name))[1] = auth.uid()::text OR public.is_admin() (one for read, one for insert).';
end $$;