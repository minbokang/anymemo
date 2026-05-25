import { useMemo } from 'react'
import { useTranslation } from '../context/I18nContext'
import {
  detectInstallPlatform,
  getPlatformInstallLinks,
} from '../lib/platformInstall'

function PlatformRow({ active, label, hint, children }) {
  return (
    <li
      className={`rounded-lg border px-3 py-2.5 ${
        active
          ? 'border-zinc-400 bg-zinc-50 dark:border-zinc-500 dark:bg-zinc-800/80'
          : 'border-zinc-100 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {label}
            {active && (
              <span className="ml-1.5 text-[10px] font-normal text-zinc-500 dark:text-zinc-400">
                · {hint}
              </span>
            )}
          </p>
          {children}
        </div>
      </div>
    </li>
  )
}

function ActionLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-flex min-h-8 items-center rounded-md border border-zinc-300 px-2.5 text-xs font-medium text-zinc-700 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:active:bg-zinc-800"
    >
      {children}
    </a>
  )
}

export default function PlatformInstallGuide() {
  const { t } = useTranslation()
  const current = useMemo(() => detectInstallPlatform(), [])
  const { appUrl, releasesUrl, macDownload, windowsDownload } =
    getPlatformInstallLinks()

  const recommendedLabel = t('installGuide.recommendedHere')

  return (
    <section
      className="mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800"
      aria-labelledby="install-guide-title"
    >
      <h2
        id="install-guide-title"
        className="mb-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400"
      >
        {t('installGuide.title')}
      </h2>
      <p className="mb-3 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {t('installGuide.subtitle')}
      </p>
      <ul className="space-y-2">
        <PlatformRow
          active={current === 'web'}
          label={t('installGuide.web')}
          hint={recommendedLabel}
        >
          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
            {appUrl.replace(/^https?:\/\//, '')}
          </p>
          <ActionLink href={appUrl}>{t('installGuide.openWeb')}</ActionLink>
        </PlatformRow>

        <PlatformRow
          active={current === 'ios' || current === 'android'}
          label={t('installGuide.mobile')}
          hint={recommendedLabel}
        >
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t('installGuide.mobileHint')}
          </p>
        </PlatformRow>

        <PlatformRow
          active={current === 'mac'}
          label={t('installGuide.mac')}
          hint={recommendedLabel}
        >
          <ActionLink href={macDownload}>
            {t('installGuide.downloadMac')}
          </ActionLink>
        </PlatformRow>

        <PlatformRow
          active={current === 'windows'}
          label={t('installGuide.windows')}
          hint={recommendedLabel}
        >
          <ActionLink href={windowsDownload}>
            {t('installGuide.downloadWindows')}
          </ActionLink>
        </PlatformRow>
      </ul>
      <p className="mt-3 text-center">
        <a
          href={releasesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {t('installGuide.allDownloads')}
        </a>
      </p>
    </section>
  )
}
