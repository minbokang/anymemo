import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { formatAuthError } from '../lib/authErrors'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    try {
      if (mode === 'signUp') {
        const { user } = await signUp(email, password)
        if (user && !user.confirmed_at) {
          setMessage('가입 완료. 이메일 확인 링크를 보냈습니다. (확인 비활성화 시 바로 로그인됩니다)')
        } else {
          setMessage('가입 및 로그인되었습니다.')
        }
      } else {
        await signIn(email, password)
        setMessage('로그인되었습니다.')
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-xl font-medium text-zinc-900">AnyMemo</h1>
      <p className="mb-6 text-sm text-zinc-500">
        {mode === 'signIn' ? '이메일로 로그인' : '새 계정 만들기'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-zinc-600">이메일</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
          {mode === 'signUp' && (
            <span className="mt-1 block text-xs text-zinc-400">
              테스트 시 Gmail 등 실제 메일 주소를 사용하세요 (test@test.com 불가)
            </span>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-zinc-600">비밀번호</span>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === 'signIn' ? 'current-password' : 'new-password'
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />
        </label>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="text-sm text-emerald-700" role="status">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {submitting
            ? '처리 중…'
            : mode === 'signIn'
              ? '로그인'
              : '회원가입'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'signIn' ? 'signUp' : 'signIn')
          setError('')
          setMessage('')
        }}
        className="mt-4 w-full text-center text-sm text-zinc-500 hover:text-zinc-800"
      >
        {mode === 'signIn'
          ? '계정이 없으신가요? 회원가입'
          : '이미 계정이 있으신가요? 로그인'}
      </button>
    </div>
  )
}
