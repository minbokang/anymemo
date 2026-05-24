import { useEffect, useRef, useState } from 'react'
import { IconPin, pinIconClass } from './memoIcons'

function IconMoreVertical({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
    </svg>
  )
}

function EditorActionButtons({
  pinned,
  onDownload,
  onDownloadAll,
  onTogglePin,
  onDelete,
  className = '',
}) {
  return (
    <div className={`flex flex-wrap items-center justify-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={onDownload}
        className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        다운로드
      </button>
      <button
        type="button"
        onClick={onDownloadAll}
        className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        전체 다운로드
      </button>
      <button
        type="button"
        onClick={onTogglePin}
        aria-label={pinned ? '고정 해제' : '상단 고정'}
        title={pinned ? '고정 해제' : '상단 고정'}
        className={`inline-flex h-7 min-w-[3.5rem] items-center justify-center gap-1 rounded-md border px-2 text-[11px] font-medium leading-none whitespace-nowrap active:bg-zinc-50 dark:active:bg-zinc-800 ${
          pinned
            ? 'border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400'
            : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
        }`}
      >
        <IconPin
          pinned={pinned}
          className={`h-3 w-3 shrink-0 ${pinIconClass(pinned)}`}
        />
        {pinned ? '고정됨' : '고정'}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-7 items-center justify-center rounded-md border border-red-200 px-2.5 text-[11px] font-medium leading-none whitespace-nowrap text-red-600 active:bg-red-50 dark:border-red-900/70 dark:text-red-400 dark:active:bg-red-950/80"
      >
        삭제
      </button>
    </div>
  )
}

export default function MemoEditorFooter({
  pinned,
  onDownload,
  onDownloadAll,
  onTogglePin,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menuOpen])

  const runMenuAction = (fn) => {
    setMenuOpen(false)
    fn()
  }

  return (
    <div className="editor-footer panel-footer bg-white px-3 py-2 safe-bottom dark:bg-zinc-900 sm:px-4">
      <div className="flex w-full items-start gap-2 md:items-center">
        <p className="min-w-0 flex-1 text-left text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500 sm:text-[11px]">
          <span className="block sm:inline">/달력 · /date · /날짜 — 날짜 선택</span>
          <span className="hidden sm:inline"> · </span>
          <span className="block sm:inline">
            /어제 · /오늘 · /내일 · /모레 — 날짜 삽입 (2025.05.01)
          </span>
        </p>

        <EditorActionButtons
          pinned={pinned}
          onDownload={onDownload}
          onDownloadAll={onDownloadAll}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          className="hidden shrink-0 md:flex"
        />

        <div className="relative shrink-0 md:hidden" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="메모 메뉴"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:active:bg-zinc-800"
          >
            <IconMoreVertical />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 bottom-full z-20 mb-1 min-w-[11rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction(onDownload)}
                className="flex w-full px-3 py-2.5 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
              >
                다운로드
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction(onDownloadAll)}
                className="flex w-full px-3 py-2.5 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
              >
                전체 다운로드
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction(onTogglePin)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
              >
                <IconPin pinned={pinned} className={`h-3.5 w-3.5 ${pinIconClass(pinned)}`} />
                {pinned ? '고정 해제' : '상단 고정'}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction(onDelete)}
                className="flex w-full px-3 py-2.5 text-left text-sm text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-950/80"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
