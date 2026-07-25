export function IconHelp({ className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="10" cy="10" r="7" />
      <path
        strokeLinecap="round"
        d="M10 13.25v.25M10 9.5c0-1.25 1.25-1.5 1.5-2.25a1.75 1.75 0 10-3.5 0"
      />
    </svg>
  )
}

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

export function IconMoreVertical({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <circle cx="10" cy="4" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="10" cy="16" r="1.5" />
    </svg>
  )
}

export function IconReorder({ className = 'h-4 w-4' }) {
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
        strokeLinejoin="round"
        d="M6 8.5L10 4.5l4 4M6 11.5l4 4 4-4"
      />
    </svg>
  )
}

/** Minimal diagonal pin — ring head outline / solid head when pinned */
export function IconPin({ pinned, className = 'h-4 w-4' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      {/* shaft + tip */}
      <path
        d="M13.2 6.8L6.2 16.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* head */}
      <circle
        cx="13.85"
        cy="5.35"
        r="2.35"
        fill={pinned ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function pinIconClass(pinned) {
  return pinned
    ? 'text-rose-500 dark:text-rose-400'
    : 'text-zinc-400 dark:text-zinc-500'
}
