import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'
import { formatAuthError } from '../lib/authErrors'
import { getRememberMe, loadRememberedEmail } from '../lib/authStorage'
import LanguageToggle from './LanguageToggle'

export default function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth()
  const { t, locale } = useTranslation()
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState(() =>
    getRememberMe() ? loadRememberedEmail() : '',
  )
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(getRememberMe)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'signIn' && rememberMe) {
      const saved = loadRememberedEmail()
      if (saved) setEmail(saved)
    }
  }, [mode, rememberMe])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      if (mode === 'reset') {
        await resetPassword(email)
        setMessage(t('auth.resetSent'))
        return
      }
      if (mode === 'signUp') {
        const { user } = await signUp(email, password)
        if (user && !user.confirmed_at) {
          setMessage(t('auth.signUpConfirm'))
        } else {
          setMessage(t('auth.signUpSuccess'))
        }
      } else {
        await signIn(email, password, { rememberMe })
        setMessage(t('auth.signInSuccess'))
      }
    } catch (err) {
      setError(formatAuthError(err, locale))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-5 shadow-sm safe-bottom dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
          AnyMemo
        </h1>
        <LanguageToggle />
      </div>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {mode === 'signIn' && t('auth.subtitleSignIn')}
        {mode === 'signUp' && t('auth.subtitleSignUp')}
        {mode === 'reset' && t('auth.subtitleReset')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            {t('auth.email')}
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400 sm:text-sm"
          />
          {mode === 'signUp' && (
            <span className="mt-1 block text-xs text-zinc-400 dark:text-zinc-500">
              {t('auth.emailSignUpHint')}
            </span>
          )}
        </label>

        {mode !== 'reset' && (
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              {t('auth.password')}
            </span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete={
                  mode === 'signIn' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white py-2.5 pr-12 pl-3 text-base outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-400 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-2 min-h-9 -translate-y-1/2 rounded-md px-2 text-xs text-zinc-500 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
                aria-label={
                  showPassword
                    ? t('auth.hidePasswordAria')
                    : t('auth.showPasswordAria')
                }
              >
                {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </div>
          </label>
        )}

        {mode === 'signIn' && (
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-600"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {t('auth.rememberMe')}
            </span>
          </label>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white active:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
        >
          {submitting
            ? t('auth.processing')
            : mode === 'signIn'
              ? t('auth.signIn')
              : mode === 'signUp'
                ? t('auth.signUp')
                : t('auth.sendLink')}
        </button>
      </form>

      {mode === 'signIn' && (
        <button
          type="button"
          onClick={() => {
            setMode('reset')
            setError('')
            setMessage('')
          }}
          className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {t('auth.forgotPassword')}
        </button>
      )}

      {mode !== 'reset' ? (
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signIn' ? 'signUp' : 'signIn')
            setError('')
            setMessage('')
          }}
          className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {mode === 'signIn'
            ? t('auth.switchToSignUp')
            : t('auth.switchToSignIn')}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setMode('signIn')
            setError('')
            setMessage('')
          }}
          className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {t('auth.backToSignIn')}
        </button>
      )}
    </div>
  )
}
