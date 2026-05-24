import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('anymemo:pwa-install-dismissed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  if (dismissed || isStandalone || !deferred) return null

  return (
    <div className="border-b border-sky-200 bg-sky-50 px-3 py-2 dark:border-sky-900/50 dark:bg-sky-950/40 sm:px-4">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 text-xs text-sky-900 dark:text-sky-200 sm:text-sm">
          AnyMemo를 홈 화면에 추가하면 앱처럼 쓸 수 있습니다.
        </p>
        <button
          type="button"
          onClick={async () => {
            await deferred.prompt()
            setDeferred(null)
          }}
          className="shrink-0 rounded-md bg-sky-700 px-2.5 py-1 text-xs font-medium text-white active:bg-sky-800 dark:bg-sky-600"
        >
          설치
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true)
            try {
              localStorage.setItem('anymemo:pwa-install-dismissed', '1')
            } catch {
              /* ignore */
            }
          }}
          className="shrink-0 px-1 text-xs text-sky-700/70 dark:text-sky-300/70"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
