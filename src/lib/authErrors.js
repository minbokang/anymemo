import { translate } from '../i18n/translate'
import { loadLocale } from './userPrefs'

export function formatAuthError(error, locale = loadLocale()) {
  const msg = error?.message ?? ''
  const code = error?.code ?? error?.error_code ?? ''
  const t = (key) => translate(`errors.auth.${key}`, {}, locale)

  if (
    code === 'email_address_invalid' ||
    msg.includes('is invalid') ||
    msg.includes('invalid format')
  ) {
    return t('emailInvalid')
  }

  if (msg.includes('rate limit')) {
    return t('rateLimit')
  }

  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return t('alreadyRegistered')
  }

  if (msg.includes('Invalid login credentials')) {
    return t('invalidCredentials')
  }

  if (msg.includes('Email not confirmed')) {
    return t('emailNotConfirmed')
  }

  if (msg.includes('For security purposes')) {
    return t('securityWait')
  }

  return msg || t('generic')
}
