export function IconChart({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeWidth="0.75"
        d="M3.5 15.5h13"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 15.5V12M10 15.5V9M15.5 15.5V5.5"
      />
    </svg>
  )
}

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
    ? 'text-red-600 dark:text-red-500'
    : 'text-zinc-500 dark:text-zinc-400'
}
