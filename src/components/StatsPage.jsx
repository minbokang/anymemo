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
  const stats = computeMemoStats({ memos, trashMemos })

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 shrink-0 items-center rounded-lg px-2 text-sm font-medium text-zinc-600 active:bg-zinc-100 dark:text-zinc-300 dark:active:bg-zinc-800"
        >
          ← 메모
        </button>
        <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">통계</h1>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">불러오는 중…</p>
        ) : (
          <div className="mx-auto max-w-lg space-y-6">
            <section>
              <WeeklyCreatedChart memos={memos} trashMemos={trashMemos} />
            </section>

            <section>
              <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                메모
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatCard label="전체" value={formatCount(stats.total)} />
                <StatCard label="고정" value={formatCount(stats.pinned)} />
                <StatCard
                  label="휴지통"
                  value={formatCount(stats.trash)}
                  hint="삭제된 메모"
                />
                <StatCard
                  label="제목 없음"
                  value={formatCount(stats.untitled)}
                />
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                활동
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatCard
                  label="오늘 수정"
                  value={formatCount(stats.updatedToday)}
                  hint="내용·제목 변경 기준"
                />
                <StatCard
                  label="7일 안 수정"
                  value={formatCount(stats.updatedThisWeek)}
                  hint="최근 일주일"
                />
                <div className="col-span-2">
                  <StatCard label="빈 메모" value={formatCount(stats.empty)} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                분량
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <StatCard
                  label="총 글자"
                  value={formatCount(stats.totalChars)}
                  hint="제목 + 본문"
                />
                <StatCard
                  label="메모당 평균"
                  value={formatCount(stats.avgChars)}
                  hint="글자 수"
                />
              </div>
            </section>

            <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
              기기에 불러온 메모 기준 · 고정·순서 변경은 수정 수에 포함되지 않습니다
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
