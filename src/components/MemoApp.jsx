import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useMemos } from '../hooks/useMemos'
import { useRelativeTimeTick } from '../hooks/useRelativeTimeTick'
import { useToast } from '../hooks/useToast'
import { exportAllMemos, exportMemo } from '../lib/exportMemos'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { memoPreview } from '../lib/memoPreview'
import ConfirmDialog from './ConfirmDialog'
import HighlightText from './HighlightText'
import InstallPrompt from './InstallPrompt'
import Toast from './Toast'

function IconSun({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="10" cy="10" r="3.25" />
      <path strokeLinecap="round" d="M10 2.25v1.75M10 16v1.75M2.25 10h1.75M16 10h1.75M4.4 4.4l1.24 1.24M14.36 14.36l1.24 1.24M4.4 15.6l1.24-1.24M14.36 5.64l1.24-1.24" />
    </svg>
  )
}

function IconMoon({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.8 12.1a5.2 5.2 0 01-6.8-6.8 6.1 6.1 0 106.8 6.8z"
      />
    </svg>
  )
}

function IconPin({ pinned, className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle
        cx="10"
        cy="10"
        r={pinned ? 4.5 : 4}
        fill={pinned ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={pinned ? 0 : 2}
      />
    </svg>
  )
}

function pinIconClass(pinned) {
  return pinned
    ? 'text-amber-600 dark:text-amber-500'
    : 'text-zinc-500 dark:text-zinc-400'
}

function SaveIndicator({ status, className = '' }) {
  const config = {
    pending: {
      label: '입력 대기',
      className:
        'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    },
    saving: {
      label: '저장 중…',
      className: 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    },
    saved: {
      label: '저장됨',
      className:
        'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    },
    local: {
      label: '로컬 저장',
      className:
        'bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    },
    error: {
      label: '저장 실패',
      className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
    },
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

function SyncIndicator({ online, syncStatus, pendingCount, onSync }) {
  const badgeClass =
    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs'

  let label = '서버 동기화됨'
  let colors =
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'

  if (!online) {
    label = `오프라인${pendingCount > 0 ? ` · ${pendingCount}` : ''}`
    colors = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
  } else if (syncStatus === 'syncing') {
    label = '동기화 중…'
    colors = 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
  } else if (syncStatus === 'pending' || pendingCount > 0) {
    label = `대기${pendingCount > 0 ? ` ${pendingCount}` : ''}`
    colors = 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
  } else if (syncStatus === 'error') {
    label = '동기화 실패'
    colors = 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200'
  }

  const canTap =
    online && onSync && syncStatus !== 'syncing'

  if (!canTap) {
    return (
      <span className={`${badgeClass} ${colors}`} role="status">
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onSync}
      className={`${badgeClass} ${colors} active:opacity-80`}
      title="탭하여 서버와 동기화"
      aria-label={`${label}, 탭하여 동기화`}
    >
      {label}
    </button>
  )
}

function MemoListItem({
  memo,
  index,
  total,
  isActive,
  isDragOver,
  searchActive,
  searchQuery,
  timeTick,
  onSelect,
  onTogglePin,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  void timeTick
  const preview = memoPreview(memo.content)
  return (
    <li
      className={`mb-1 ${isDragOver ? 'rounded-lg ring-2 ring-zinc-300 dark:ring-zinc-600' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className={`flex items-stretch rounded-lg ${
          isActive
            ? 'bg-zinc-100 dark:bg-zinc-800'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
        }`}
      >
        <button
          type="button"
          draggable={!searchActive}
          onDragStart={onDragStart}
          onClick={(e) => e.preventDefault()}
          className={`hidden shrink-0 touch-none items-center px-2 text-zinc-400 md:flex ${
            searchActive ? 'cursor-default opacity-30' : 'cursor-grab active:cursor-grabbing'
          }`}
          aria-label="순서 변경 드래그"
          title={searchActive ? '검색 중 순서 변경 불가' : '드래그하여 순서 변경'}
        >
          ⠿
        </button>
        <div className="flex shrink-0 flex-col border-r border-zinc-100 dark:border-zinc-700 md:hidden">
          <button
            type="button"
            disabled={index === 0 || searchActive}
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            className="min-h-9 flex-1 px-2 text-xs text-zinc-500 disabled:opacity-30 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-700"
            aria-label="위로"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={index === total - 1 || searchActive}
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            className="min-h-9 flex-1 px-2 text-xs text-zinc-500 disabled:opacity-30 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-700"
            aria-label="아래로"
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="min-h-11 min-w-0 flex-1 px-3 py-3 text-left active:bg-zinc-100 dark:active:bg-zinc-700"
        >
          <p className="truncate text-base font-medium text-zinc-800 dark:text-zinc-100 sm:text-sm">
            <HighlightText
              text={memo.title || '제목 없음'}
              query={searchQuery}
            />
          </p>
          {preview && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
              <HighlightText text={preview} query={searchQuery} />
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {formatRelativeTime(memo.updated_at)}
          </p>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin()
          }}
          className={`flex min-h-11 w-11 shrink-0 items-center justify-center border-l active:bg-zinc-100 dark:active:bg-zinc-700 ${
            memo.pinned
              ? 'border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30'
              : 'border-zinc-100 dark:border-zinc-700'
          }`}
          aria-label={memo.pinned ? '고정 해제' : '상단 고정'}
          title={memo.pinned ? '고정 해제' : '상단 고정'}
        >
          <IconPin
            pinned={memo.pinned}
            className={`h-5 w-5 ${pinIconClass(memo.pinned)}`}
          />
        </button>
      </div>
    </li>
  )
}

export default function MemoApp() {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [mobilePane, setMobilePane] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [memoToDelete, setMemoToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const searchInputRef = useRef(null)
  const timeTick = useRelativeTimeTick()
  const { toast, showToast, dismissToast } = useToast()
  const {
    memos,
    trashMemos,
    activeId,
    draft,
    loading,
    refreshing,
    saveStatus,
    syncStatus,
    online,
    pendingCount,
    selectMemo,
    createMemo,
    deleteMemo,
    restoreMemo,
    permanentDeleteMemo,
    reorderMemosByIndex,
    moveMemo,
    togglePin,
    updateDraft,
    syncNow,
  } = useMemos(user?.id, { notify: showToast })

  const dragIdRef = useRef(null)
  const [dragOverId, setDragOverId] = useState(null)

  const activeMemo = memos.find((m) => m.id === activeId)
  const searchActive = searchQuery.trim().length > 0

  const filteredMemos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return memos
    return memos.filter(
      (m) =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.content || '').toLowerCase().includes(q),
    )
  }, [memos, searchQuery])

  const handleSelectMemo = (memo) => {
    selectMemo(memo)
    setMobilePane('editor')
  }

  const handleCreateMemo = async () => {
    await createMemo()
    setMobilePane('editor')
  }

  const handleDeleteMemo = (memo) => setMemoToDelete(memo)

  const confirmDeleteMemo = async () => {
    if (!memoToDelete || deleting) return
    setDeleting(true)
    try {
      await deleteMemo(memoToDelete.id)
      setMemoToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!activeId) setMobilePane('list')
  }, [activeId])

  useKeyboardShortcuts({
    onNewMemo: () => void handleCreateMemo(),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onEscape: () => {
      if (searchQuery.trim()) {
        setSearchQuery('')
        return
      }
      if (memoToDelete && !deleting) {
        setMemoToDelete(null)
        return
      }
      if (showTrash) {
        setShowTrash(false)
        return
      }
      setMobilePane('list')
    },
  })

  const showListOnMobile = mobilePane === 'list'
  const showEditorOnMobile = mobilePane === 'editor'

  return (
    <div className="flex h-svh flex-col bg-zinc-50 supports-[height:100dvh]:h-dvh dark:bg-zinc-950">
      <InstallPrompt />
      <header className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2 safe-top dark:border-zinc-800 dark:bg-zinc-900 sm:px-4 sm:py-2.5">
        <span className="shrink-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          AnyMemo
        </span>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2">
          <SyncIndicator
            online={online}
            syncStatus={syncStatus}
            pendingCount={pendingCount}
            onSync={() => void syncNow()}
          />
          <button
            type="button"
            onClick={() => void syncNow()}
            disabled={!online || refreshing}
            className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 active:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-400 dark:active:bg-zinc-800"
            title="전체 새로고침"
            aria-label="전체 새로고침"
          >
            <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          </button>
          <SaveIndicator status={saveStatus} className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:active:bg-zinc-800"
            aria-label={isDark ? '라이트 모드' : '다크 모드'}
            title={isDark ? '라이트 모드' : '다크 모드'}
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
          <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 dark:text-zinc-400 md:inline">
            {user.email}
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="min-h-9 shrink-0 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:active:bg-zinc-800 sm:px-3"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex w-full flex-col border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:w-64 md:shrink-0 md:border-r lg:w-72 ${
            showListOnMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="space-y-2 border-b border-zinc-100 p-2 dark:border-zinc-800 sm:p-3">
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="메모 검색… (/ 키)"
              className="min-h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 sm:text-sm"
            />
            {!showTrash && (
              <button
                type="button"
                onClick={handleCreateMemo}
                className="min-h-11 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
              >
                + 새 메모
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowTrash((v) => !v)
                setMobilePane('list')
              }}
              className={`min-h-9 w-full rounded-lg border px-3 py-2 text-xs font-medium ${
                showTrash
                  ? 'border-zinc-400 bg-zinc-100 text-zinc-800 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200'
                  : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
              }`}
            >
              {showTrash
                ? '← 메모 목록'
                : `휴지통${trashMemos.length > 0 ? ` (${trashMemos.length})` : ''}`}
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
            {loading && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                불러오는 중…
              </li>
            )}
            {!loading && !showTrash && memos.length === 0 && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                메모가 없습니다
              </li>
            )}
            {!loading && showTrash && trashMemos.length === 0 && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                휴지통이 비었습니다
              </li>
            )}
            {!loading &&
              !showTrash &&
              memos.length > 0 &&
              filteredMemos.length === 0 && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                검색 결과 없음
              </li>
            )}
            {showTrash &&
              trashMemos.map((memo) => (
                <li
                  key={memo.id}
                  className="mb-1 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                >
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {memo.title || '제목 없음'}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    삭제 {formatRelativeTime(memo.deleted_at)}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void restoreMemo(memo.id)}
                      className="rounded-md border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-600"
                    >
                      복원
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            '영구 삭제하면 복구할 수 없습니다. 계속할까요?',
                          )
                        ) {
                          void permanentDeleteMemo(memo.id)
                        }
                      }}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 dark:border-red-900 dark:text-red-400"
                    >
                      영구 삭제
                    </button>
                  </div>
                </li>
              ))}
            {!showTrash &&
              filteredMemos.map((memo, index) => (
              <MemoListItem
                key={memo.id}
                memo={memo}
                index={index}
                total={filteredMemos.length}
                isActive={memo.id === activeId}
                isDragOver={dragOverId === memo.id}
                searchActive={searchActive}
                searchQuery={searchQuery}
                timeTick={timeTick}
                onSelect={() => handleSelectMemo(memo)}
                onTogglePin={() => togglePin(memo.id)}
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
                  const toIndex = memos.findIndex((m) => m.id === memo.id)
                  if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
                    reorderMemosByIndex(fromIndex, toIndex)
                  }
                  dragIdRef.current = null
                  setDragOverId(null)
                }}
              />
            ))}
          </ul>
          <p className="panel-footer hidden px-3 text-[10px] leading-none text-zinc-400 dark:text-zinc-500 md:flex">
            {showTrash
              ? '7일 후 자동 삭제 · Esc 목록'
              : '⌘N 새 메모 · / 검색 · Esc 검색 지우기'}
          </p>
        </aside>

        <section
          className={`min-w-0 flex-1 flex-col bg-white dark:bg-zinc-900 ${
            showEditorOnMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeMemo ? (
            <>
              {/* 모바일 전용: ← 목록 · 저장 상태 (데스크톱은 상단 앱 헤더에 표시) */}
              <div className="flex min-w-0 shrink-0 items-center gap-2 border-b border-zinc-100 px-3 py-1.5 dark:border-zinc-800 md:hidden sm:px-4">
                <button
                  type="button"
                  onClick={() => setMobilePane('list')}
                  className="inline-flex h-8 shrink-0 items-center rounded-lg px-2 text-sm font-medium leading-none text-zinc-600 active:bg-zinc-100 dark:text-zinc-300 dark:active:bg-zinc-800"
                  aria-label="목록으로"
                >
                  ← 목록
                </button>
                <SaveIndicator status={saveStatus} className="ml-auto sm:hidden" />
              </div>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => updateDraft('title', e.target.value)}
                placeholder="제목"
                className="border-b border-zinc-100 bg-white px-3 py-3 text-lg font-medium text-zinc-900 outline-none placeholder:text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:px-4"
              />
              <textarea
                value={draft.content}
                onChange={(e) => updateDraft('content', e.target.value)}
                placeholder="내용을 입력하세요…"
                className="min-h-0 flex-1 resize-none bg-white px-3 py-3 text-base leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:px-4 sm:text-sm"
              />
              <div className="panel-footer flex flex-wrap items-center justify-end gap-1 bg-white px-3 py-2 safe-bottom dark:bg-zinc-900 sm:px-4 md:py-0">
                <button
                  type="button"
                  onClick={() => exportMemo(activeMemo, 'md')}
                  className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                 보내기
                </button>
                <button
                  type="button"
                  onClick={() => exportAllMemos(memos, 'md')}
                  className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => togglePin(activeMemo.id)}
                  aria-label={activeMemo.pinned ? '고정 해제' : '상단 고정'}
                  title={activeMemo.pinned ? '고정 해제' : '상단 고정'}
                  className={`inline-flex h-7 min-w-[3.5rem] items-center justify-center gap-1 rounded-md border px-2 text-[11px] font-medium leading-none whitespace-nowrap active:bg-zinc-50 dark:active:bg-zinc-800 ${
                    activeMemo.pinned
                      ? 'border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400'
                      : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  <IconPin
                    pinned={activeMemo.pinned}
                    className={`h-3 w-3 shrink-0 ${pinIconClass(activeMemo.pinned)}`}
                  />
                  {activeMemo.pinned ? '고정됨' : '고정'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMemo(activeMemo)}
                  className="inline-flex h-7 items-center justify-center rounded-md border border-red-200 px-2.5 text-[11px] font-medium leading-none whitespace-nowrap text-red-600 active:bg-red-50 dark:border-red-900/70 dark:text-red-400 dark:active:bg-red-950/80"
                >
                  삭제
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                메모를 선택하거나 새 메모를 만드세요
              </p>
              <button
                type="button"
                onClick={handleCreateMemo}
                className="min-h-11 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm text-white active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
              >
                새 메모 만들기
              </button>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={memoToDelete != null}
        title="메모를 삭제할까요?"
        description={
          memoToDelete
            ? `「${memoToDelete.title?.trim() || '제목 없음'}」을(를) 휴지통으로 옮깁니다. 7일 후 자동 삭제됩니다.`
            : ''
        }
        confirmLabel="삭제"
        cancelLabel="취소"
        confirming={deleting}
        onConfirm={() => void confirmDeleteMemo()}
        onCancel={() => {
          if (!deleting) setMemoToDelete(null)
        }}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
