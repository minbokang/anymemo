import { useRef, useState } from 'react'
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
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5 sm:text-xs ${config.className} ${className}`}
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
      <span className="inline-flex shrink-0 items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 sm:text-xs">
        오프라인{pendingCount > 0 ? ` · ${pendingCount}` : ''}
      </span>
    )
  }
  if (syncStatus === 'syncing') {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800 sm:text-xs">
        동기화 중…
      </span>
    )
  }
  if (syncStatus === 'pending' || pendingCount > 0) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 sm:text-xs">
        대기{pendingCount > 0 ? ` ${pendingCount}` : ''}
      </span>
    )
  }
  if (syncStatus === 'error') {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 sm:text-xs">
        동기화 실패
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 sm:text-xs">
      온라인
    </span>
  )
}

function MemoListItem({
  memo,
  index,
  total,
  isActive,
  isDragOver,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  return (
    <li
      className={`mb-1 ${isDragOver ? 'rounded-lg ring-2 ring-zinc-300' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className={`flex items-stretch overflow-hidden rounded-lg ${
          isActive ? 'bg-zinc-100' : 'hover:bg-zinc-50'
        }`}
      >
        <button
          type="button"
          draggable
          onDragStart={onDragStart}
          onClick={(e) => e.preventDefault()}
          className="hidden shrink-0 cursor-grab touch-none items-center px-2 text-zinc-400 active:cursor-grabbing md:flex"
          aria-label="순서 변경 드래그"
          title="드래그하여 순서 변경"
        >
          ⠿
        </button>
        <div className="flex shrink-0 flex-col border-r border-zinc-100 md:hidden">
          <button
            type="button"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            className="min-h-9 flex-1 px-2 text-xs text-zinc-500 disabled:opacity-30 active:bg-zinc-100"
            aria-label="위로"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            className="min-h-9 flex-1 px-2 text-xs text-zinc-500 disabled:opacity-30 active:bg-zinc-100"
            aria-label="아래로"
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="min-h-11 min-w-0 flex-1 px-3 py-3 text-left active:bg-zinc-100"
        >
          <p className="truncate text-base font-medium text-zinc-800 sm:text-sm">
            {memo.title || '제목 없음'}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {formatDate(memo.updated_at)}
          </p>
        </button>
      </div>
    </li>
  )
}

export default function MemoApp() {
  const { user, signOut } = useAuth()
  const [mobilePane, setMobilePane] = useState('list')
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
    reorderMemosByIndex,
    moveMemo,
    updateDraft,
  } = useMemos(user?.id)

  const dragIdRef = useRef(null)
  const [dragOverId, setDragOverId] = useState(null)

  const activeMemo = memos.find((m) => m.id === activeId)

  const handleSelectMemo = (memo) => {
    selectMemo(memo)
    setMobilePane('editor')
  }

  const handleCreateMemo = async () => {
    await createMemo()
    setMobilePane('editor')
  }

  const showListOnMobile = mobilePane === 'list'
  const showEditorOnMobile = mobilePane === 'editor'

  return (
    <div className="flex h-svh flex-col bg-zinc-50 supports-[height:100dvh]:h-dvh">
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2 safe-top sm:px-4 sm:py-2.5">
        <span className="shrink-0 text-sm font-medium text-zinc-900">AnyMemo</span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <SyncIndicator
            online={online}
            syncStatus={syncStatus}
            pendingCount={pendingCount}
          />
          <SaveIndicator status={saveStatus} className="hidden sm:inline-flex" />
          <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 md:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="min-h-9 shrink-0 rounded border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-700 active:bg-zinc-100 sm:px-3"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* 메모 목록 */}
        <aside
          className={`flex w-full flex-col border-zinc-200 bg-white md:w-64 md:shrink-0 md:border-r lg:w-72 ${
            showListOnMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="border-b border-zinc-100 p-2 sm:p-3">
            <button
              type="button"
              onClick={handleCreateMemo}
              className="min-h-11 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white active:bg-zinc-800"
            >
              + 새 메모
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
            {loading && (
              <li className="px-2 py-3 text-sm text-zinc-400">불러오는 중…</li>
            )}
            {!loading && memos.length === 0 && (
              <li className="px-2 py-3 text-sm text-zinc-400">메모가 없습니다</li>
            )}
            {memos.map((memo, index) => (
              <MemoListItem
                key={memo.id}
                memo={memo}
                index={index}
                total={memos.length}
                isActive={memo.id === activeId}
                isDragOver={dragOverId === memo.id}
                onSelect={() => handleSelectMemo(memo)}
                onMoveUp={() => moveMemo(memo.id, 'up')}
                onMoveDown={() => moveMemo(memo.id, 'down')}
                onDragStart={() => {
                  dragIdRef.current = memo.id
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverId(memo.id)
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => {
                  e.preventDefault()
                  const fromIndex = memos.findIndex(
                    (m) => m.id === dragIdRef.current,
                  )
                  if (fromIndex >= 0 && fromIndex !== index) {
                    reorderMemosByIndex(fromIndex, index)
                  }
                  dragIdRef.current = null
                  setDragOverId(null)
                }}
              />
            ))}
          </ul>
        </aside>

        {/* 편집 영역 */}
        <section
          className={`min-w-0 flex-1 flex-col bg-white ${
            showEditorOnMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeMemo ? (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2 safe-top sm:px-4">
                <button
                  type="button"
                  onClick={() => setMobilePane('list')}
                  className="min-h-10 shrink-0 rounded-lg px-2 text-sm font-medium text-zinc-600 active:bg-zinc-100 md:hidden"
                  aria-label="목록으로"
                >
                  ← 목록
                </button>
                <SaveIndicator status={saveStatus} className="sm:hidden" />
                <button
                  type="button"
                  onClick={() => deleteMemo(activeMemo.id)}
                  className="ml-auto min-h-10 shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 active:bg-red-50"
                >
                  삭제
                </button>
              </div>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => updateDraft('title', e.target.value)}
                placeholder="제목"
                className="border-b border-zinc-100 px-3 py-3 text-lg font-medium text-zinc-900 outline-none placeholder:text-zinc-300 sm:px-4"
              />
              <textarea
                value={draft.content}
                onChange={(e) => updateDraft('content', e.target.value)}
                placeholder="내용을 입력하세요…"
                className="min-h-0 flex-1 resize-none px-3 py-3 text-base leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-300 sm:px-4 sm:text-sm"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-zinc-500">
                메모를 선택하거나 새 메모를 만드세요
              </p>
              <button
                type="button"
                onClick={handleCreateMemo}
                className="min-h-11 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm text-white active:bg-zinc-800"
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
