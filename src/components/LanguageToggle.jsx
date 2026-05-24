import { useTranslation } from '../context/I18nContext'

export default function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation()

  const next = locale === 'ko' ? 'en' : 'ko'
  const label = locale === 'ko' ? t('lang.switchToEn') : t('lang.switchToKo')

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className="min-h-9 shrink-0 rounded-lg border border-zinc-300 px-2 py-1.5 text-xs font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:active:bg-zinc-800 sm:px-2.5"
      aria-label={t('lang.switchAria')}
      title={label}
    >
      {locale === 'ko' ? 'EN' : 'KO'}
    </button>
  )
}
