export function IconPin({ pinned, className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle
        cx="10"
        cy="10"
        r={pinned ? 4.5 : 4}
        fill={pinned ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={pinned ? 0 : 0.5}
      />
    </svg>
  )
}

export function pinIconClass(pinned) {
  return pinned
    ? 'text-amber-600 dark:text-amber-500'
    : 'text-zinc-500 dark:text-zinc-400'
}
