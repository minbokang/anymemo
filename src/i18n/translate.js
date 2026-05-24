import { en } from './locales/en.js'
import { ko } from './locales/ko.js'

export const SUPPORTED_LOCALES = ['ko', 'en']
export const DEFAULT_LOCALE = 'ko'

const messages = { ko, en }

export function localeToBcp47(locale) {
  return locale === 'en' ? 'en-US' : 'ko-KR'
}

function getMessage(locale, key) {
  const parts = key.split('.')
  let node = messages[locale] ?? messages[DEFAULT_LOCALE]
  for (const part of parts) {
    node = node?.[part]
    if (node == null) return null
  }
  return typeof node === 'string' ? node : null
}

/**
 * @param {string} key - dot path, e.g. `auth.signIn`
 * @param {Record<string, string | number>} [vars]
 * @param {string} [locale]
 */
export function translate(key, vars = {}, locale = DEFAULT_LOCALE) {
  const loc = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
  let text =
    getMessage(loc, key) ??
    getMessage(DEFAULT_LOCALE, key) ??
    key

  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{{${name}}}`, String(value))
  }
  return text
}

export function getUntitledTitles() {
  return [translate('common.untitled', {}, 'ko'), translate('common.untitled', {}, 'en')]
}
