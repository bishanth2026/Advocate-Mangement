create table public.case_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  case_id text not null,
  document_name text not null,
  category text not null default 'Other',
  original_file_name text not null,
  mime_type text not null,
  file_size bigint not null,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  storage_path text not null,
  constraint case_documents_file_size_chk check (file_size >= 0 and file_size <= 20971520)
);

create index case_documents_workspace_created_idx
  on public.case_documents (workspace_id, created_at desc);
create index case_documents_workspace_case_idx
  on public.case_documents (workspace_id, case_id);

alter table public.case_documents enable row level security;
revoke all on table public.case_documents from anon;
grant select, insert, delete on table public.case_documents to authenticated;

create policy "Workspace members can view case documents"
on public.case_documents for select to authenticated
using ((select private.is_workspace_member(workspace_id)));

create policy "Workspace members can upload case documents"
on public.case_documents for insert to authenticated
with check (
  (select private.is_workspace_member(workspace_id))
  and uploaded_by = (select auth.uid())
);

create policy "Workspace members can delete case documents"
on public.case_documents for delete to authenticated
using ((select private.is_workspace_member(workspace_id)));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'advocatedesk-documents',
  'advocatedesk-documents',
  false,
  20971520,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = 20971520,
    allowed_mime_types = excluded.allowed_mime_types,
    updated_at = now();

create policy "Workspace members can upload case document files"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'advocatedesk-documents'
  and (storage.foldername(name))[1] is not null
  and (select private.is_workspace_member(((storage.foldername(name))[1])::uuid))
  and owner_id = (select auth.uid()::text)
);

create policy "Workspace members can read case document files"
on storage.objects for select to authenticated
using (
  bucket_id = 'advocatedesk-documents'
  and (storage.foldername(name))[1] is not null
  and (select private.is_workspace_member(((storage.foldername(name))[1])::uuid))
);

create policy "Workspace members can delete case document files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'advocatedesk-documents'
  and (storage.foldername(name))[1] is not null
  and (select private.is_workspace_member(((storage.foldername(name))[1])::uuid))
);
