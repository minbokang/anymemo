import { getUntitledTitles } from '../i18n/translate'
import { localeToBcp47 } from '../i18n/translate'
import { loadLocale } from './userPrefs'

const DAY_MS = 24 * 60 * 60 * 1000
const UNTITLED_TITLES = new Set(getUntitledTitles())

function textLength(memo) {
  return (memo.title?.length ?? 0) + (memo.content?.length ?? 0)
}

function isUntitled(memo) {
  const t = memo.title?.trim()
  return !t || UNTITLED_TITLES.has(t)
}

function isEmpty(memo) {
  return isUntitled(memo) && !(memo.content?.trim())
}

function parseTime(iso) {
  if (!iso) return null
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? null : t
}

/**
 * @param {{ memos: object[], trashMemos: object[] }} input
 */
export function computeMemoStats({ memos, trashMemos }) {
  const now = Date.now()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekAgo = now - 7 * DAY_MS

  let pinned = 0
  let totalChars = 0
  let untitled = 0
  let empty = 0
  let updatedToday = 0
  let updatedThisWeek = 0

  for (const memo of memos) {
    if (memo.pinned) pinned += 1
    totalChars += textLength(memo)
    if (isUntitled(memo)) untitled += 1
    if (isEmpty(memo)) empty += 1

    const updated = parseTime(memo.updated_at)
    if (updated != null) {
      if (updated >= todayStart.getTime()) updatedToday += 1
      if (updated >= weekAgo) updatedThisWeek += 1
    }
  }

  const avgChars =
    memos.length > 0 ? Math.round(totalChars / memos.length) : 0

  return {
    total: memos.length,
    pinned,
    trash: trashMemos.length,
    totalChars,
    avgChars,
    untitled,
    empty,
    updatedToday,
    updatedThisWeek,
  }
}

export function formatCount(n, locale = loadLocale()) {
  return n.toLocaleString(localeToBcp47(locale))
}

function startOfLocalDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function localDayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function weekdayShort(date, locale) {
  return date.toLocaleDateString(localeToBcp47(locale), { weekday: 'short' })
}

/**
 * 최근 7일(오늘 포함) 일별 새 메모 작성 수. 작성 없는 날은 count 0.
 * @param {object[]} memos
 * @param {object[]} [trashMemos]
 * @param {string} [locale]
 */
export function computeWeeklyCreatedSeries(
  memos,
  trashMemos = [],
  locale = loadLocale(),
) {
  const today = startOfLocalDay(new Date())
  const todayKey = localDayKey(today)
  const days = []

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - offset)
    const key = localDayKey(date)
    days.push({
      key,
      date,
      count: 0,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: weekdayShort(date, locale),
      isToday: key === todayKey,
    })
  }

  const indexByKey = Object.fromEntries(days.map((d, i) => [d.key, i]))
  const all = [...memos, ...trashMemos]

  for (const memo of all) {
    const created = parseTime(memo.created_at)
    if (created == null) continue
    const key = localDayKey(new Date(created))
    const idx = indexByKey[key]
    if (idx !== undefined) days[idx].count += 1
  }

  return days
}
