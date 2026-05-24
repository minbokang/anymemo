import { useEffect, useMemo, useState } from 'react'
import { computeWeeklyCreatedSeries } from '../lib/memoStats'

const BAR_MAX_HEIGHT = 120
const MIN_BAR_PX = 6
const STAGGER_MS = 48

function seriesSignature(series) {
  return series.map((d) => `${d.key}:${d.count}`).join('|')
}

export default function WeeklyCreatedChart({ memos, trashMemos }) {
  const series = useMemo(
    () => computeWeeklyCreatedSeries(memos, trashMemos),
    [memos, trashMemos],
  )
  const signature = useMemo(() => seriesSignature(series), [series])
  const maxCount = Math.max(...series.map((d) => d.count), 1)
  const weekTotal = series.reduce((sum, d) => sum + d.count, 0)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(false)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true))
    })
    return () => cancelAnimationFrame(id)
  }, [signature])

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-700/80 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              최근 7일 작성
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              새 메모 · 작성일 기준
            </p>
          </div>
          <p className="shrink-0 text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
            총{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {weekTotal}개
            </span>
          </p>
        </div>
      </div>

      <div
        className={`chart-week px-4 pt-4 pb-4 sm:px-5 ${animate ? 'chart-week--animate' : ''}`}
        role="img"
        aria-label={`최근 7일 작성 그래프, 합계 ${weekTotal}개`}
      >
        <div
          className="relative overflow-visible"
          style={{ paddingTop: 18, height: BAR_MAX_HEIGHT + 18 }}
        >
          <div
            className="absolute right-0 bottom-0 left-0 grid grid-cols-7 items-end gap-2 sm:gap-3"
            style={{ height: BAR_MAX_HEIGHT }}
          >
            {series.map((day, index) => {
              const targetHeight =
                day.count === 0
                  ? 0
                  : Math.max(
                      MIN_BAR_PX,
                      Math.round((day.count / maxCount) * BAR_MAX_HEIGHT),
                    )
              const delay = `${index * STAGGER_MS}ms`
              const countDelay = `${index * STAGGER_MS + 280}ms`

              return (
                <div
                  key={day.key}
                  className="flex h-full items-end justify-center"
                  title={`${day.label} (${day.weekday})${
                    day.count > 0 ? `: ${day.count}개` : ''
                  }`}
                >
                  {day.count > 0 && (
                    <div
                      className="relative shrink-0"
                      style={{ height: targetHeight }}
                    >
                      <span
                        className="chart-bar-count pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold leading-none tabular-nums text-zinc-800 dark:text-zinc-100"
                        style={{
                          bottom: '100%',
                          marginBottom: 4,
                          '--count-delay': countDelay,
                        }}
                      >
                        {day.count}
                      </span>
                      <div
                        className={`chart-bar ${
                          day.isToday ? 'chart-bar--today' : ''
                        }`}
                        style={{
                          height: targetHeight,
                          '--bar-delay': delay,
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div
            className="chart-week-baseline absolute right-0 bottom-0 left-0"
            aria-hidden
          />
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2 sm:gap-3">
          {series.map((day) => (
            <div key={`${day.key}-label`} className="text-center">
              <span
                className={`block text-[11px] font-medium leading-none ${
                  day.isToday
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {day.isToday ? '오늘' : day.weekday}
              </span>
              {!day.isToday && (
                <span className="mt-0.5 block text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                  {day.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
