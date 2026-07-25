-- 로그인 사용자가 본인 계정을 삭제할 수 있게 함 (memos는 auth.users ON DELETE CASCADE)

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

comment on function public.delete_own_account() is
  'Deletes the calling auth user; related memos are removed by ON DELETE CASCADE.';
