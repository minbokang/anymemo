import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_MS = 4000

/**
 * @returns {{ toast: { message: string, variant: string } | null, showToast: (message: string, variant?: string) => void, dismissToast: () => void }}
 */
export function useToast() {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback(
    (message, variant = 'error') => {
      if (!message) return
      dismissToast()
      setToast({ message, variant })
      timerRef.current = setTimeout(dismissToast, DEFAULT_MS)
    },
    [dismissToast],
  )

  useEffect(() => () => dismissToast(), [dismissToast])

  return { toast, showToast, dismissToast }
}
