const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/**
 * @param {string | Date | null | undefined} value
 * @returns {string}
 */
export function formatRelativeTime(value) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) {
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (diffMs < MINUTE) return '방금'
  if (diffMs < HOUR) return `${Math.floor(diffMs / MINUTE)}분 전`
  if (diffMs < DAY) return `${Math.floor(diffMs / HOUR)}시간 전`
  if (diffMs < WEEK) return `${Math.floor(diffMs / DAY)}일 전`

  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}
