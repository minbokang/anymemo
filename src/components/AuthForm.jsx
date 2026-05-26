import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/I18nContext'
import { formatAuthError } from '../lib/authErrors'
import { getRememberMe, loadRememberedEmail } from '../lib/authStorage'
import LanguageToggle from './LanguageToggle'
import PlatformInstallGuide from './PlatformInstallGuide'
import { getContactInfo } from '../lib/contactInfo'

export default function AuthForm() {
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth()
  const { t, locale } = useTranslation()
  const { githubUrl, githubLabel, email: contactEmail, mailto } =
    getContactInfo()
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

  // Google OAuth 후 브라우저 뒤로가기(bfcache) 시 submitting이 true로 남는 문제 방지
  useEffect(() => {
    setSubmitting(false)
    const onPageShow = (event) => {
      if (event.persisted) setSubmitting(false)
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

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

  const handleGoogleSignIn = async () => {
    setError('')
    setMessage('')
    try {
      await signInWithGoogle()
      // 성공 시 Google로 리다이렉트되므로 submitting을 켜지 않음 (뒤로가기 시 stuck 방지)
    } catch (err) {
      setError(formatAuthError(err, locale))
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
      <div className="mb-1 flex items-start justify-between gap-2">
        <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
          AnyMemo
        </h1>
        <LanguageToggle />
      </div>
      <p
        className={`mb-6 text-sm leading-relaxed ${
          mode === 'reset'
            ? 'text-zinc-500 dark:text-zinc-400'
            : 'text-zinc-600 dark:text-zinc-300'
        }`}
      >
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

        {mode !== 'reset' && (
          <>
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
                  {t('auth.orDivider')}
                </span>
              </div>
            </div>
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleSignIn}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 active:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:active:bg-zinc-800"
            >
              <GoogleIcon className="h-5 w-5 shrink-0" />
              {mode === 'signUp'
                ? t('auth.continueWithGoogleSignUp')
                : t('auth.continueWithGoogleSignIn')}
            </button>
          </>
        )}
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

      {mode !== 'reset' && <PlatformInstallGuide />}
    </div>

      <footer className="safe-bottom mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          aria-label={t('auth.contactGithub')}
        >
          {githubLabel}
        </a>
        <span className="mx-2 text-zinc-300 dark:text-zinc-600" aria-hidden>
          ·
        </span>
        <a
          href={mailto}
          className="text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          aria-label={t('auth.contactEmail')}
        >
          {contactEmail}
        </a>
      </footer>
    </div>
  )
}

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
