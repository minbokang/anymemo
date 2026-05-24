-- updated_at: 제목·본문이 바뀔 때만 갱신 (고정·순서·휴지통은 유지)

create or replace function public.set_memos_updated_at()
returns trigger
language plpgsql
as $$
begin
  if (new.title is distinct from old.title)
     or (new.content is distinct from old.content) then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end;
$$;
