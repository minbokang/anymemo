import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DEFAULT_LOCALE, localeToBcp47, translate } from '../i18n/translate'
import { loadLocale, saveLocale } from '../lib/userPrefs'

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(loadLocale)

  const setLocale = useCallback((next) => {
    const value = typeof next === 'function' ? next(loadLocale()) : next
    saveLocale(value)
    setLocaleState(value)
  }, [])

  useEffect(() => {
    document.documentElement.lang = localeToBcp47(locale)
  }, [locale])

  const t = useCallback(
    (key, vars) => translate(key, vars, locale),
    [locale],
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      bcp47: localeToBcp47(locale),
    }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key, vars) => translate(key, vars, DEFAULT_LOCALE),
      bcp47: localeToBcp47(DEFAULT_LOCALE),
    }
  }
  return ctx
}
