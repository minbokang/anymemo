-- anymemo: memos 테이블 + RLS
-- Supabase 대시보드 → SQL Editor 에서 실행하거나 apply-migration 스크립트 사용

create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memos_user_id_idx on public.memos (user_id);

alter table public.memos enable row level security;

drop policy if exists "Users can view own memos" on public.memos;
create policy "Users can view own memos"
  on public.memos
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own memos" on public.memos;
create policy "Users can insert own memos"
  on public.memos
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own memos" on public.memos;
create policy "Users can update own memos"
  on public.memos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own memos" on public.memos;
create policy "Users can delete own memos"
  on public.memos
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_memos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists memos_updated_at on public.memos;
create trigger memos_updated_at
  before update on public.memos
  for each row
  execute function public.set_memos_updated_at();

-- [3단계] Realtime용 (이미 추가됐으면 무시)
do $$
begin
  alter publication supabase_realtime add table public.memos;
exception
  when duplicate_object then null;
end;
$$;
