const DATE_PICKER_PATTERN = /\/(?:달력|date|날짜)$/
const RELATIVE_DATE_PATTERN = /\/(어제|오늘|내일|모레)$/

const RELATIVE_DAY_OFFSET = { 어제: -1, 오늘: 0, 내일: 1, 모레: 2 }

export function findDatePickerTrigger(text, cursorPos) {
  const before = text.slice(0, cursorPos)
  const match = before.match(DATE_PICKER_PATTERN)
  if (!match) return null
  const trigger = match[0]
  return {
    trigger,
    start: cursorPos - trigger.length,
    end: cursorPos,
  }
}

export function findRelativeDateTrigger(text, cursorPos) {
  const before = text.slice(0, cursorPos)
  const match = before.match(RELATIVE_DATE_PATTERN)
  if (!match) return null
  const trigger = match[0]
  const label = match[1]
  return {
    trigger,
    start: cursorPos - trigger.length,
    end: cursorPos,
    dayOffset: RELATIVE_DAY_OFFSET[label],
  }
}
