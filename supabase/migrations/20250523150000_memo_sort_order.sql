-- 메모 목록 사용자 정렬 순서

alter table public.memos
  add column if not exists sort_order integer not null default 0;

create index if not exists memos_user_sort_idx on public.memos (user_id, sort_order);

-- 기존 데이터: 최신 수정 순으로 sort_order 부여
with ranked as (
  select
    id,
    row_number() over (
      partition by user_id
      order by updated_at desc
    ) - 1 as rn
  from public.memos
)
update public.memos m
set sort_order = ranked.rn
from ranked
where m.id = ranked.id;
