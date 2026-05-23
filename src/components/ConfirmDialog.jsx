import { useEffect, useRef } from 'react'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  confirming = false,
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !confirming) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel, confirming])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-zinc-900/30 backdrop-blur-[2px] dark:bg-black/50 ${
          confirming ? 'pointer-events-none' : ''
        }`}
        onClick={onCancel}
        aria-label="닫기"
        tabIndex={confirming ? -1 : 0}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 sm:shadow-xl">
        <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div className="flex gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400"
              aria-hidden
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  d="M6 6l8 8M14 6l-8 8"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <h2
                id="confirm-dialog-title"
                className="text-base font-medium text-zinc-900 dark:text-zinc-100"
              >
                {title}
              </h2>
              <p
                id="confirm-dialog-desc"
                className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
              >
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 active:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:active:bg-zinc-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-red-600 text-sm font-medium text-white active:bg-red-700 disabled:opacity-70 dark:bg-red-600 dark:active:bg-red-500"
          >
            {confirming ? '삭제 중…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
