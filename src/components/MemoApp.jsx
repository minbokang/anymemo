import { useAuth } from '../context/AuthContext'
import { useMemos } from '../hooks/useMemos'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SaveIndicator({ status, className = '' }) {
  const config = {
    pending: { label: '입력 대기', className: 'bg-amber-50 text-amber-800' },
    saving: { label: '저장 중…', className: 'bg-sky-50 text-sky-800' },
    saved: { label: '저장됨', className: 'bg-emerald-50 text-emerald-800' },
    local: { label: '로컬 저장', className: 'bg-violet-50 text-violet-800' },
    error: { label: '저장 실패', className: 'bg-red-50 text-red-700' },
  }[status]

  if (!config) return null

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className} ${className}`}
      role="status"
      aria-live="polite"
    >
      {config.label}
    </span>
  )
}

function SyncIndicator({ online, syncStatus, pendingCount }) {
  if (!online) {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
        오프라인
        {pendingCount > 0 ? ` · 동기화 ${pendingCount}건` : ''}
      </span>
    )
  }
  if (syncStatus === 'syncing') {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">
        동기화 중…
      </span>
    )
  }
  if (syncStatus === 'pending' || pendingCount > 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        동기화 대기 {pendingCount > 0 ? `(${pendingCount})` : ''}
      </span>
    )
  }
  if (syncStatus === 'error') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
        동기화 실패
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
      온라인
    </span>
  )
}

export default function MemoApp() {
  const { user, signOut } = useAuth()
  const {
    memos,
    activeId,
    draft,
    loading,
    saveStatus,
    syncStatus,
    online,
    pendingCount,
    selectMemo,
    createMemo,
    deleteMemo,
    updateDraft,
  } = useMemos(user?.id)

  const activeMemo = memos.find((m) => m.id === activeId)

  return (
    <div className="flex h-svh flex-col bg-zinc-50">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5">
        <span className="text-sm font-medium text-zinc-900">AnyMemo</span>
        <div className="flex items-center gap-2">
          <SyncIndicator
            online={online}
            syncStatus={syncStatus}
            pendingCount={pendingCount}
          />
          <SaveIndicator status={saveStatus} />
          <span className="max-w-[180px] truncate text-xs text-zinc-500">
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white md:w-64">
          <div className="border-b border-zinc-100 p-2">
            <button
              type="button"
              onClick={createMemo}
              className="w-full rounded bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              + 새 메모
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto p-2">
            {loading && (
              <li className="px-2 py-3 text-xs text-zinc-400">불러오는 중…</li>
            )}
            {!loading && memos.length === 0 && (
              <li className="px-2 py-3 text-xs text-zinc-400">
                메모가 없습니다
              </li>
            )}
            {memos.map((memo) => (
              <li key={memo.id}>
                <button
                  type="button"
                  onClick={() => selectMemo(memo)}
                  className={`mb-1 w-full rounded px-2 py-2 text-left transition-colors ${
                    memo.id === activeId
                      ? 'bg-zinc-100'
                      : 'hover:bg-zinc-50'
                  }`}
                >
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {memo.title || '제목 없음'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-400">
                    {formatDate(memo.updated_at)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {activeMemo ? (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-2">
                <SaveIndicator status={saveStatus} />
                <button
                  type="button"
                  onClick={() => deleteMemo(activeMemo.id)}
                  className="ml-auto rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => updateDraft('title', e.target.value)}
                placeholder="제목"
                className="border-b border-zinc-100 px-4 py-3 text-lg font-medium text-zinc-900 outline-none placeholder:text-zinc-300"
              />
              <textarea
                value={draft.content}
                onChange={(e) => updateDraft('content', e.target.value)}
                placeholder="내용을 입력하세요…"
                className="min-h-0 flex-1 resize-none px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-300"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center">
              <p className="text-sm text-zinc-500">
                메모를 선택하거나 새 메모를 만드세요
              </p>
              <button
                type="button"
                onClick={createMemo}
                className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
              >
                새 메모 만들기
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
