import { translate } from '../i18n/translate'
import { loadLocale } from './userPrefs'

function untitledLabel(locale = loadLocale()) {
  return translate('common.untitled', {}, locale)
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function memoToMarkdown(memo, locale) {
  const title = memo.title?.trim() || untitledLabel(locale)
  return `# ${title}\n\n${memo.content || ''}\n`
}

function memoToText(memo, locale) {
  const title = memo.title?.trim() || untitledLabel(locale)
  return `${title}\n${'—'.repeat(Math.min(title.length, 40))}\n\n${memo.content || ''}\n`
}

function safeFilename(name) {
  return (name || 'memo')
    .replace(/[^\w\u3131-\uD79D\s-]/g, '')
    .trim()
    .slice(0, 40) || 'memo'
}

export function exportMemo(memo, format = 'md', locale = loadLocale()) {
  const base = safeFilename(memo.title)
  if (format === 'txt') {
    downloadBlob(`${base}.txt`, memoToText(memo, locale), 'text/plain;charset=utf-8')
    return
  }
  downloadBlob(
    `${base}.md`,
    memoToMarkdown(memo, locale),
    'text/markdown;charset=utf-8',
  )
}

export function exportAllMemos(memos, format = 'md', locale = loadLocale()) {
  const date = new Date().toISOString().slice(0, 10)
  if (format === 'txt') {
    const body = memos
      .map((m, i) => `--- ${i + 1} ---\n${memoToText(m, locale)}`)
      .join('\n')
    downloadBlob(`anymemo-${date}.txt`, body, 'text/plain;charset=utf-8')
    return
  }
  const body = memos.map((m) => memoToMarkdown(m, locale)).join('\n---\n\n')
  downloadBlob(`anymemo-${date}.md`, body, 'text/markdown;charset=utf-8')
}
