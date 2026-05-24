import { splitHighlight } from '../lib/memoPreview'

export default function HighlightText({ text, query, className = '' }) {
  const parts = splitHighlight(text, query)
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.match ? (
          <mark
            key={i}
            className="rounded bg-amber-200/80 px-0.5 text-inherit dark:bg-amber-500/40"
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </span>
  )
}
