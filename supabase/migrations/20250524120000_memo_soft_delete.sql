alter table public.memos
  add column if not exists deleted_at timestamptz;

create index if not exists memos_user_active_idx
  on public.memos (user_id, updated_at desc)
  where deleted_at is null;

create index if not exists memos_user_trash_idx
  on public.memos (user_id, deleted_at desc)
  where deleted_at is not null;
