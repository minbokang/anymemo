import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'
import { useTheme } from '../context/ThemeContext'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useMemos } from '../hooks/useMemos'
import { useRelativeTimeTick } from '../hooks/useRelativeTimeTick'
import { useToast } from '../hooks/useToast'
import { exportAllMemos, exportMemo } from '../lib/exportMemos'
import { formatRelativeTime } from '../lib/formatRelativeTime'
import { memoPreview } from '../lib/memoPreview'
import { loadAppView, saveAppView } from '../lib/userPrefs'
import ConfirmDialog from './ConfirmDialog'
import HelpDialog from './HelpDialog'
import HighlightText from './HighlightText'
import InstallPrompt from './InstallPrompt'
import MemoContentTextarea from './MemoContentTextarea'
import MemoEditorFooter from './MemoEditorFooter'
import { IconChart, IconHelp, IconPin, pinIconClass } from './memoIcons'
import StatsPage from './StatsPage'
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

function SaveIndicator({ status, className = '' }) {
  const { t } = useTranslation()
  const config = {
    pending: {
      label: t('save.pending'),
      className:
        'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    },
    saving: {
      label: t('save.saving'),
      className: 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
    },
    saved: {
      label: t('save.saved'),
      className:
        'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    },
    local: {
      label: t('save.local'),
      className:
        'bg-violet-50 text-violet-800 dark:bg-violet-950 dark:text-violet-200',
    },
    error: {
      label: t('save.error'),
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
  const { t } = useTranslation()
  const badgeClass =
    'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium sm:text-xs'

  let label = t('sync.synced')
  let colors =
    'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'

  if (!online) {
    label =
      pendingCount > 0
        ? t('sync.offlineWithCount', { count: pendingCount })
        : t('sync.offline')
    colors = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
  } else if (syncStatus === 'syncing') {
    label = t('sync.syncing')
    colors = 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
  } else if (syncStatus === 'pending' || pendingCount > 0) {
    label =
      pendingCount > 0
        ? t('sync.pendingWithCount', { count: pendingCount })
        : t('sync.pending')
    colors = 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
  } else if (syncStatus === 'error') {
    label = t('sync.error')
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
      title={t('sync.tapToSync')}
      aria-label={t('sync.tapToSyncAria', { label })}
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
  const { t, locale } = useTranslation()
  const preview = memoPreview(memo.content)
  const displayTitle = memo.title?.trim() || t('common.untitled')
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
          aria-label={t('reorder.dragAria')}
          title={searchActive ? t('reorder.dragDisabled') : t('reorder.dragHint')}
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
            aria-label={t('reorder.moveUp')}
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
            aria-label={t('reorder.moveDown')}
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
              text={displayTitle}
              query={searchQuery}
            />
          </p>
          {preview && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
              <HighlightText text={preview} query={searchQuery} />
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {formatRelativeTime(memo.updated_at, locale)}
          </p>
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin()
          }}
          className="flex min-h-11 w-11 shrink-0 items-center justify-center active:bg-zinc-100 dark:active:bg-zinc-700"
          aria-label={memo.pinned ? t('pin.unpin') : t('pin.pin')}
          title={memo.pinned ? t('pin.unpin') : t('pin.pin')}
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
  const { t, locale } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const [mobilePane, setMobilePane] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [memoToDelete, setMemoToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [appView, setAppViewState] = useState(loadAppView)
  const setAppView = useCallback((next) => {
    setAppViewState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      saveAppView(value)
      return value
    })
  }, [])
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
    enabled: appView === 'memos' && !helpOpen,
    onNewMemo: () => void handleCreateMemo(),
    onFocusSearch: () => searchInputRef.current?.focus(),
    onEscape: () => {
      if (helpOpen) {
        setHelpOpen(false)
        return
      }
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
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            AnyMemo
          </span>
          <span className="hidden min-w-0 max-w-[200px] truncate text-xs text-zinc-500 md:inline md:max-w-[280px] dark:text-zinc-400">
            {user.email}
          </span>
        </div>
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
            title={t('sync.refreshAll')}
            aria-label={t('sync.refreshAll')}
          >
            <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          </button>
          <SaveIndicator status={saveStatus} className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:active:bg-zinc-800"
            aria-label={t('nav.help')}
            title={t('nav.helpTitle')}
          >
            <IconHelp />
          </button>
          <button
            type="button"
            onClick={() => setAppView((v) => (v === 'stats' ? 'memos' : 'stats'))}
            className={`flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border active:bg-zinc-100 dark:active:bg-zinc-800 ${
              appView === 'stats'
                ? 'border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-100'
                : 'border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-400'
            }`}
            aria-label={
              appView === 'stats' ? t('nav.backToMemos') : t('nav.stats')
            }
            title={
              appView === 'stats' ? t('nav.memosTitle') : t('nav.statsTitle')
            }
            aria-current={appView === 'stats' ? 'page' : undefined}
          >
            <IconChart />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:active:bg-zinc-800"
            aria-label={isDark ? t('theme.lightMode') : t('theme.darkMode')}
            title={isDark ? t('theme.lightMode') : t('theme.darkMode')}
          >
            {isDark ? <IconSun /> : <IconMoon />}
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="min-h-9 shrink-0 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-xs text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:active:bg-zinc-800 sm:px-3"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </header>

      {appView === 'stats' ? (
        <StatsPage
          memos={memos}
          trashMemos={trashMemos}
          loading={loading}
          onBack={() => setAppView('memos')}
        />
      ) : (
      <div className="flex min-h-0 flex-1">
        <aside
          className={`flex w-full flex-col border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:w-64 md:shrink-0 md:border-r lg:w-72 ${
            showListOnMobile ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="space-y-2 border-b border-zinc-100 p-2 dark:border-zinc-800 sm:p-3">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="min-h-10 w-full rounded-lg border border-zinc-300 bg-white py-2 pr-9 pl-3 text-base outline-none placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400 sm:text-sm"
              />
              {!searchQuery && (
                <kbd
                  className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] leading-none text-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-500"
                  aria-hidden
                >
                  /
                </kbd>
              )}
            </div>
            {!showTrash && (
              <button
                type="button"
                onClick={handleCreateMemo}
                className="min-h-11 w-full rounded-lg bg-zinc-900 px-3 py-2.5 text-sm font-medium text-white active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
              >
                {t('memo.new')}
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
                ? t('trash.backToList')
                : trashMemos.length > 0
                  ? t('trash.toggleWithCount', { count: trashMemos.length })
                  : t('trash.toggle')}
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
            {loading && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                {t('list.loading')}
              </li>
            )}
            {!loading && !showTrash && memos.length === 0 && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                {t('list.empty')}
              </li>
            )}
            {!loading && showTrash && trashMemos.length === 0 && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                {t('trash.empty')}
              </li>
            )}
            {!loading &&
              !showTrash &&
              memos.length > 0 &&
              filteredMemos.length === 0 && (
              <li className="px-2 py-3 text-sm text-zinc-400 dark:text-zinc-500">
                {t('list.noResults')}
              </li>
            )}
            {showTrash &&
              trashMemos.map((memo) => (
                <li
                  key={memo.id}
                  className="mb-1 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                >
                  <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                    {memo.title?.trim() || t('common.untitled')}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {t('trash.deletedPrefix')}{' '}
                    {formatRelativeTime(memo.deleted_at, locale)}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void restoreMemo(memo.id)}
                      className="rounded-md border border-zinc-200 px-2 py-1 text-xs dark:border-zinc-600"
                    >
                      {t('trash.restore')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(t('trash.permanentDeleteConfirm'))) {
                          void permanentDeleteMemo(memo.id)
                        }
                      }}
                      className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 dark:border-red-900 dark:text-red-400"
                    >
                      {t('trash.permanentDelete')}
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
          <p className="panel-footer hidden w-full items-center px-3 text-[10px] leading-none text-zinc-400 safe-bottom dark:text-zinc-500 md:flex">
            {showTrash ? (
              t('trash.footerHint')
            ) : (
              <>
                <span className="min-w-0 truncate">{t('list.footerHint')}</span>
                <span className="mx-1.5 shrink-0">·</span>
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="shrink-0 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {t('nav.help')}
                </button>
              </>
            )}
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
                  aria-label={t('list.backToListAria')}
                >
                  {t('list.backToList')}
                </button>
                <SaveIndicator status={saveStatus} className="ml-auto sm:hidden" />
              </div>
              <input
                type="text"
                value={draft.title}
                onChange={(e) => updateDraft('title', e.target.value)}
                placeholder={t('memo.titlePlaceholder')}
                className="border-b border-zinc-100 bg-white px-3 py-3 text-lg font-medium text-zinc-900 outline-none placeholder:text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:px-4"
              />
              <MemoContentTextarea
                value={draft.content}
                onChange={(content) => updateDraft('content', content)}
                className="min-h-0 flex-1 resize-none bg-white px-3 py-3 text-base leading-relaxed text-zinc-800 outline-none placeholder:text-zinc-300 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:px-4 sm:text-sm"
              />
              <MemoEditorFooter
                pinned={activeMemo.pinned}
                onDownload={() => exportMemo(activeMemo, 'md', locale)}
                onDownloadAll={() => exportAllMemos(memos, 'md', locale)}
                onTogglePin={() => togglePin(activeMemo.id)}
                onDelete={() => handleDeleteMemo(activeMemo)}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t('memo.emptyState')}
              </p>
              <button
                type="button"
                onClick={handleCreateMemo}
                className="min-h-11 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm text-white active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
              >
                {t('memo.createNew')}
              </button>
            </div>
          )}
        </section>
      </div>
      )}

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />

      <ConfirmDialog
        open={memoToDelete != null}
        title={t('delete.title')}
        description={
          memoToDelete
            ? t('delete.description', {
                title: memoToDelete.title?.trim() || t('common.untitled'),
              })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
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
