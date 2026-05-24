/** 메모 본문용 날짜: 2025.05.01 */
export function formatMemoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export function memoDateAfterDays(dayOffset) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  return formatMemoDate(d)
}

export function todayMemoDate() {
  return memoDateAfterDays(0)
}

export function toDateInputValue(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateInputValue(value) {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
