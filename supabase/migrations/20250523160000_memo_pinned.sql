alter table public.memos
  add column if not exists pinned boolean not null default false;

create index if not exists memos_user_pinned_sort_idx
  on public.memos (user_id, pinned desc, sort_order);
