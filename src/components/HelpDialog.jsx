import { useEffect, useRef } from 'react'
import { useTranslation } from '../context/I18nContext'

function HelpSection({ title, children }) {
  return (
    <section className="border-b border-zinc-100 py-4 last:border-0 dark:border-zinc-800">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {title}
      </h3>
      <ul className="space-y-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {children}
      </ul>
    </section>
  )
}

function HelpItem({ children }) {
  return <li>{children}</li>
}

export default function HelpDialog({ open, onClose }) {
  const { t } = useTranslation()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/30 backdrop-blur-[2px] dark:bg-black/50"
        onClick={onClose}
        aria-label={t('common.close')}
      />
      <div className="relative flex max-h-[min(85dvh,32rem)] w-full max-w-md flex-col rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 sm:max-h-[min(80vh,36rem)]">
        <div className="shrink-0 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2
            id="help-dialog-title"
            className="text-base font-medium text-zinc-900 dark:text-zinc-100"
          >
            {t('help.title')}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t('help.intro')}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
          <HelpSection title={t('help.sectionPlatforms')}>
            <HelpItem>{t('help.platformWeb')}</HelpItem>
            <HelpItem>{t('help.platformPwa')}</HelpItem>
            <HelpItem>{t('help.platformDesktopMac')}</HelpItem>
            <HelpItem>{t('help.platformDesktopWindows')}</HelpItem>
            <HelpItem>{t('help.platformMobile')}</HelpItem>
          </HelpSection>
          <HelpSection title={t('help.sectionShortcuts')}>
            <HelpItem>{t('help.shortcutNewMemo')}</HelpItem>
            <HelpItem>{t('help.shortcutSearch')}</HelpItem>
            <HelpItem>{t('help.shortcutEscape')}</HelpItem>
          </HelpSection>
          <HelpSection title={t('help.sectionSlash')}>
            <HelpItem>{t('help.slashCalendar')}</HelpItem>
            <HelpItem>{t('help.slashRelative')}</HelpItem>
          </HelpSection>
          <HelpSection title={t('help.sectionEdit')}>
            <HelpItem>{t('help.editPin')}</HelpItem>
            <HelpItem>{t('help.editReorder')}</HelpItem>
            <HelpItem>{t('help.editExport')}</HelpItem>
          </HelpSection>
          <HelpSection title={t('help.sectionTrash')}>
            <HelpItem>{t('help.trashBody')}</HelpItem>
          </HelpSection>
          <HelpSection title={t('help.sectionSync')}>
            <HelpItem>{t('help.syncBody')}</HelpItem>
          </HelpSection>
          <HelpSection title={t('help.sectionStats')}>
            <HelpItem>{t('help.statsBody')}</HelpItem>
          </HelpSection>
          <HelpSection title={t('help.sectionLang')}>
            <HelpItem>{t('help.langBody')}</HelpItem>
          </HelpSection>
        </div>
        <div className="shrink-0 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-zinc-900 text-sm font-medium text-white active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
