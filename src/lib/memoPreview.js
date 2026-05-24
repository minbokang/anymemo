/** 목록용 본문 미리보기 (첫 줄, 최대 길이) */
export function memoPreview(content, maxLen = 56) {
  const line = (content || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((s) => s.trim())
    .find(Boolean)
  if (!line) return ''
  if (line.length <= maxLen) return line
  return `${line.slice(0, maxLen)}…`
}

/** 검색어 하이라이트용 분할 */
export function splitHighlight(text, query) {
  const q = query.trim()
  if (!q || !text) return [{ text: text || '', match: false }]
  const lower = text.toLowerCase()
  const qLower = q.toLowerCase()
  const idx = lower.indexOf(qLower)
  if (idx < 0) return [{ text, match: false }]
  return [
    { text: text.slice(0, idx), match: false },
    { text: text.slice(idx, idx + q.length), match: true },
    { text: text.slice(idx + q.length), match: false },
  ].filter((p) => p.text.length > 0)
}
