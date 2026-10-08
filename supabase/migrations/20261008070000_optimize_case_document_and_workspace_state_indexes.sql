create index if not exists case_documents_uploaded_by_idx
  on public.case_documents (uploaded_by);

drop index if exists public.practice_records_workspace_record_key_uidx;
