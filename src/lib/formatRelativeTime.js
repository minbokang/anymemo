import { localeToBcp47 } from '../i18n/translate'
import { loadLocale } from './userPrefs'
import { translate } from '../i18n/translate'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY

/**
 * @param {string | Date | null | undefined} value
 * @param {string} [locale]
 * @returns {string}
 */
export function formatRelativeTime(value, locale = loadLocale()) {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const bcp47 = localeToBcp47(locale)
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) {
    return date.toLocaleString(bcp47, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (diffMs < MINUTE) return translate('time.justNow', {}, locale)
  if (diffMs < HOUR) {
    return translate(
      'time.minutesAgo',
      { n: Math.floor(diffMs / MINUTE) },
      locale,
    )
  }
  if (diffMs < DAY) {
    return translate(
      'time.hoursAgo',
      { n: Math.floor(diffMs / HOUR) },
      locale,
    )
  }
  if (diffMs < WEEK) {
    return translate('time.daysAgo', { n: Math.floor(diffMs / DAY) }, locale)
  }

  const now = new Date()
  const sameYear = date.getFullYear() === now.getFullYear()

  return date.toLocaleDateString(bcp47, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}
