import { useTranslation } from '../context/I18nContext'

export default function Toast({ toast, onDismiss }) {
  const { t } = useTranslation()
  if (!toast) return null

  const styles = {
    error:
      'border-red-200 bg-white text-red-800 dark:border-red-900/60 dark:bg-zinc-900 dark:text-red-300',
    info: 'border-sky-200 bg-white text-sky-900 dark:border-sky-900/60 dark:bg-zinc-900 dark:text-sky-200',
    default:
      'border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
  }
  const tone = styles[toast.variant] ?? styles.default

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${tone}`}
      >
        <p className="min-w-0 flex-1 leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md px-1 text-xs font-medium opacity-60 hover:opacity-100"
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
