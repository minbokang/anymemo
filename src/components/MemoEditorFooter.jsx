import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../context/I18nContext'
import { IconPin, IconMoreVertical, pinIconClass } from './memoIcons'

function EditorActionButtons({
  onCopy,
  pinned,
  onDownload,
  onDownloadAll,
  onTogglePin,
  onDelete,
  className = '',
}) {
  const { t } = useTranslation()
  return (
    <div className={`flex flex-wrap items-center justify-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        {t('editor.copy')}
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        {t('editor.download')}
      </button>
      <button
        type="button"
        onClick={onDownloadAll}
        className="inline-flex h-7 items-center justify-center rounded-md border border-zinc-200 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
      >
        {t('editor.downloadAll')}
      </button>
      <button
        type="button"
        onClick={onTogglePin}
        aria-label={pinned ? t('pin.unpin') : t('pin.pin')}
        title={pinned ? t('pin.unpin') : t('pin.pin')}
        className={`inline-flex h-7 min-w-[3.5rem] items-center justify-center gap-1 rounded-md border px-2 text-[11px] font-medium leading-none whitespace-nowrap active:bg-zinc-50 dark:active:bg-zinc-800 ${
          pinned
            ? 'border-red-200 text-red-700 dark:border-red-900/60 dark:text-red-400'
            : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400'
        }`}
      >
        <IconPin
          pinned={pinned}
          className={`h-3 w-3 shrink-0 ${pinIconClass(pinned)}`}
        />
        {pinned ? t('pin.pinned') : t('pin.pinAction')}
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-7 items-center justify-center rounded-md border border-red-200 px-2.5 text-[11px] font-medium leading-none whitespace-nowrap text-red-600 active:bg-red-50 dark:border-red-900/70 dark:text-red-400 dark:active:bg-red-950/80"
      >
        {t('editor.delete')}
      </button>
    </div>
  )
}

export default function MemoEditorFooter({
  onCopy,
  pinned,
  onDownload,
  onDownloadAll,
  onTogglePin,
  onDelete,
}) {
  const { t } = useTranslation()
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
    <div className="panel-footer bg-white px-3 safe-bottom dark:bg-zinc-900 sm:px-4">
      <div className="flex w-full min-w-0 items-center gap-2">
        <p
          className="min-w-0 flex-1 truncate text-left text-[9px] leading-none text-zinc-400 dark:text-zinc-500"
          title={t('slashDate.hintTitle')}
        >
          <span className="hidden lg:inline">{t('slashDate.hintFull')}</span>
          <span className="hidden md:inline lg:hidden">
            {t('slashDate.hintMedium')}
          </span>
          <span className="md:hidden">{t('slashDate.hintShort')}</span>
        </p>

        <EditorActionButtons
            onCopy={onCopy}
            pinned={pinned}
            onDownload={onDownload}
            onDownloadAll={onDownloadAll}
            onTogglePin={onTogglePin}
            onDelete={onDelete}
            className="hidden md:flex"
          />

          <div className="relative md:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={t('memo.menuAria')}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="inline-flex h-7 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:active:bg-zinc-800"
            >
              <IconMoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 bottom-full z-20 mb-1 min-w-[11rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onCopy)}
                  className="flex w-full px-3 py-2.5 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
                >
                  {t('editor.copy')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onDownload)}
                  className="flex w-full px-3 py-2.5 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
                >
                  {t('editor.download')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onDownloadAll)}
                  className="flex w-full px-3 py-2.5 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
                >
                  {t('editor.downloadAll')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onTogglePin)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-700 active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-700"
                >
                  <IconPin
                    pinned={pinned}
                    className={`h-3.5 w-3.5 ${pinIconClass(pinned)}`}
                  />
                  {pinned ? t('pin.unpin') : t('pin.pin')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction(onDelete)}
                  className="flex w-full px-3 py-2.5 text-left text-sm text-red-600 active:bg-red-50 dark:text-red-400 dark:active:bg-red-950/80"
                >
                  {t('editor.delete')}
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
