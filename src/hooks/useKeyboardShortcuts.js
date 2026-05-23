import { useEffect } from 'react'

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export function useKeyboardShortcuts({
  onNewMemo,
  onFocusSearch,
  onEscape,
  enabled = true,
}) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e) => {
      const mod = e.metaKey || e.ctrlKey

      if (e.key === 'Escape') {
        onEscape?.()
        return
      }

      if (e.key === '/' && !mod && !isEditableTarget(e.target)) {
        e.preventDefault()
        onFocusSearch?.()
        return
      }

      if (mod && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        onNewMemo?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onNewMemo, onFocusSearch, onEscape])
}
