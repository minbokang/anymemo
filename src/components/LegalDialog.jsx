import { useEffect, useRef } from 'react'
import { useTranslation } from '../context/I18nContext'
import { LegalBody } from './LegalPage'

export default function LegalDialog({
  type,
  onClose,
  onAgree,
  onSelectType,
  agreeLabel,
  closeLabel,
}) {
  const { t } = useTranslation()
  const closeRef = useRef(null)
  const title =
    type === 'consent'
      ? t('legal.googleConsentTitle')
      : type
        ? t(`legal.${type}`)
        : ''

  useEffect(() => {
    if (!type) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [type, onClose])

  if (!type) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] dark:bg-black/60"
        onClick={onClose}
        aria-label={t('common.close')}
      />
      <div className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 sm:max-h-[85vh]">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2
            id="legal-dialog-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
          {type === 'consent' ? (
            <div className="space-y-5">
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {t('legal.googleConsentDescription')}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onSelectType?.('terms')}
                  className="rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t('legal.reviewTerms')} →
                </button>
                <button
                  type="button"
                  onClick={() => onSelectType?.('privacy')}
                  className="rounded-lg border border-zinc-200 px-4 py-3 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {t('legal.reviewPrivacy')} →
                </button>
              </div>
              <p className="text-xs leading-5 text-zinc-400 dark:text-zinc-500">
                {t('legal.googleConsentHint')}
              </p>
            </div>
          ) : (
            <LegalBody type={type} />
          )}
        </div>
        <div className="shrink-0 border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 text-sm font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:active:bg-zinc-800"
            >
              {closeLabel || t('common.close')}
            </button>
            {onAgree && (
              <button
                type="button"
                onClick={onAgree}
                className="inline-flex h-10 flex-[1.5] items-center justify-center rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
              >
                {agreeLabel || t('legal.agree')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
