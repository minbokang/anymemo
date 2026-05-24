import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { formatAuthError } from '../lib/authErrors'
import { getRememberMe, loadRememberedEmail } from '../lib/authStorage'

export default function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth()
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
        setMessage('비밀번호 재설정 링크를 이메일로 보냈습니다.')
        return
      }
      if (mode === 'signUp') {
        const { user } = await signUp(email, password)
        if (user && !user.confirmed_at) {
          setMessage('가입 완료. 이메일 확인 링크를 보냈습니다. (확인 비활성화 시 바로 로그인됩니다)')
        } else {
          setMessage('가입 및 로그인되었습니다.')
        }
      } else {
        await signIn(email, password, { rememberMe })
        setMessage('로그인되었습니다.')
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-5 shadow-sm safe-bottom dark:border-zinc-700 dark:bg-zinc-900 sm:p-6">
      <h1 className="mb-1 text-xl font-medium text-zinc-900 dark:text-zinc-100">
        AnyMemo
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {mode === 'signIn' && '이메일로 로그인'}
        {mode === 'signUp' && '새 계정 만들기'}
        {mode === 'reset' && '비밀번호 재설정 링크 받기'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
            이메일
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
              테스트 시 Gmail 등 실제 메일 주소를 사용하세요 (test@test.com 불가)
            </span>
          )}
        </label>

        {mode !== 'reset' && (
          <label className="block">
            <span className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400">
              비밀번호
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
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? '숨기기' : '보기'}
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
              로그인 상태 유지 (이메일 기억)
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
            ? '처리 중…'
            : mode === 'signIn'
              ? '로그인'
              : mode === 'signUp'
                ? '회원가입'
                : '링크 보내기'}
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
          비밀번호를 잊으셨나요?
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
            ? '계정이 없으신가요? 회원가입'
            : '이미 계정이 있으신가요? 로그인'}
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
          로그인으로 돌아가기
        </button>
      )}
    </div>
  )
}
