import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n/translate'

const lastMemoKey = (userId) => `anymemo:lastMemo:${userId}`
const APP_VIEW_KEY = 'anymemo:app-view'
const LOCALE_KEY = 'anymemo:locale'

export function loadLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored
  } catch {
    /* ignore */
  }
  const lang = typeof navigator !== 'undefined' ? navigator.language : ''
  return lang.toLowerCase().startsWith('en') ? 'en' : DEFAULT_LOCALE
}

export function saveLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return
  try {
    localStorage.setItem(LOCALE_KEY, locale)
  } catch {
    /* ignore */
  }
}

export function loadAppView() {
  try {
    return sessionStorage.getItem(APP_VIEW_KEY) === 'stats' ? 'stats' : 'memos'
  } catch {
    return 'memos'
  }
}

export function saveAppView(view) {
  try {
    sessionStorage.setItem(APP_VIEW_KEY, view)
  } catch {
    /* ignore */
  }
}

export function saveLastMemoId(userId, memoId) {
  if (!userId || !memoId) return
  try {
    localStorage.setItem(lastMemoKey(userId), memoId)
  } catch {
    /* ignore */
  }
}

export function loadLastMemoId(userId) {
  if (!userId) return null
  try {
    return localStorage.getItem(lastMemoKey(userId))
  } catch {
    return null
  }
}

export function clearLastMemoId(userId) {
  if (!userId) return
  try {
    localStorage.removeItem(lastMemoKey(userId))
  } catch {
    /* ignore */
  }
}
