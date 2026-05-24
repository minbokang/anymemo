import { useTranslation } from '../context/I18nContext'
import { computeMemoStats, formatCount } from '../lib/memoStats'
import WeeklyCreatedChart from './WeeklyCreatedChart'

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  )
}

export default function StatsPage({ memos, trashMemos, loading, onBack }) {
  const { t, locale } = useTranslation()
  const stats = computeMemoStats({ memos, trashMemos })

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-zinc-600 active:bg-zinc-100 dark:text-zinc-300 dark:active:bg-zinc-800"
        >
          {t('stats.backToMemos')}
        </button>
        <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t('stats.title')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('list.loading')}
          </p>
        ) : (
          <div className="mx-auto max-w-lg space-y-6">
            <section>
              <WeeklyCreatedChart memos={memos} trashMemos={trashMemos} />
            </section>

            <section>
              <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('stats.sectionMemos')}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatCard
                  label={t('stats.total')}
                  value={formatCount(stats.total, locale)}
                />
                <StatCard
                  label={t('stats.pinned')}
                  value={formatCount(stats.pinned, locale)}
                />
                <StatCard
                  label={t('stats.trash')}
                  value={formatCount(stats.trash, locale)}
                  hint={t('stats.trashHint')}
                />
                <StatCard
                  label={t('stats.untitled')}
                  value={formatCount(stats.untitled, locale)}
                />
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('stats.sectionActivity')}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatCard
                  label={t('stats.updatedToday')}
                  value={formatCount(stats.updatedToday, locale)}
                  hint={t('stats.updatedTodayHint')}
                />
                <StatCard
                  label={t('stats.updatedThisWeek')}
                  value={formatCount(stats.updatedThisWeek, locale)}
                  hint={t('stats.updatedThisWeekHint')}
                />
                <div className="col-span-2">
                  <StatCard
                    label={t('stats.empty')}
                    value={formatCount(stats.empty, locale)}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                {t('stats.sectionVolume')}
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatCard
                  label={t('stats.totalChars')}
                  value={formatCount(stats.totalChars, locale)}
                  hint={t('stats.totalCharsHint')}
                />
                <StatCard
                  label={t('stats.avgChars')}
                  value={formatCount(stats.avgChars, locale)}
                  hint={t('stats.avgCharsHint')}
                />
              </div>
            </section>

            <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
              {t('stats.footerNote')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
