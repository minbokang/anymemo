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

function ChevronIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function PlatformInstallGuide() {
  const { t } = useTranslation()
  const current = useMemo(() => detectInstallPlatform(), [])
  const { appUrl, releasesUrl, macDownload, windowsDownload } =
    getPlatformInstallLinks()

  const recommendedLabel = t('installGuide.recommendedHere')

  return (
    <details className="group mt-6 border-t border-zinc-100 pt-5 dark:border-zinc-800">
      <summary className="cursor-pointer list-none rounded-lg py-1 outline-none select-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-500">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2
              id="install-guide-title"
              className="text-xs font-semibold tracking-wide text-zinc-600 uppercase dark:text-zinc-300"
            >
              {t('installGuide.title')}
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
              <span className="group-open:hidden">{t('installGuide.expandHint')}</span>
              <span className="hidden group-open:inline">
                {t('installGuide.collapseHint')}
              </span>
            </p>
          </div>
          <ChevronIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180 dark:text-zinc-500" />
        </div>
      </summary>

      <div className="pt-3">
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
      </div>
    </details>
  )
}
