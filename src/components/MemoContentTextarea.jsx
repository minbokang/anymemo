import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '../context/I18nContext'
import {
  formatMemoDate,
  fromDateInputValue,
  memoDateAfterDays,
  toDateInputValue,
} from '../lib/dateFormat'
import {
  findDatePickerTrigger,
  findRelativeDateTrigger,
} from '../lib/slashDateTrigger'

export default function MemoContentTextarea({ value, onChange, className }) {
  const { t } = useTranslation()
  const textareaRef = useRef(null)
  const valueRef = useRef(value)
  const pickerRangeRef = useRef(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()))

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const applyReplacement = useCallback(
    (range, insert) => {
      if (!range) return
      const { start, end } = range
      const current = valueRef.current
      const next = current.slice(0, start) + insert + current.slice(end)
      valueRef.current = next
      onChange(next)
      const cursor = start + insert.length
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (!el) return
        el.focus()
        el.selectionStart = cursor
        el.selectionEnd = cursor
      })
    },
    [onChange],
  )

  const closePicker = useCallback(
    (removeTrigger = false) => {
      const range = pickerRangeRef.current
      if (removeTrigger && range) {
        applyReplacement(range, '')
      }
      pickerRangeRef.current = null
      setPickerOpen(false)
    },
    [applyReplacement],
  )

  const openPicker = useCallback((range) => {
    pickerRangeRef.current = { start: range.start, end: range.end }
    setSelectedDate(toDateInputValue(new Date()))
    setPickerOpen(true)
  }, [])

  const confirmDate = useCallback(() => {
    const range = pickerRangeRef.current
    if (!range) return
    const date = fromDateInputValue(selectedDate)
    if (!date) return
    applyReplacement(range, formatMemoDate(date))
    pickerRangeRef.current = null
    setPickerOpen(false)
  }, [applyReplacement, selectedDate])

  useEffect(() => {
    if (!pickerOpen) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      closePicker(true)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [pickerOpen, closePicker])

  const syncTriggers = useCallback(
    (text, cursorPos) => {
      const relative = findRelativeDateTrigger(text, cursorPos)
      if (relative) {
        applyReplacement(
          { start: relative.start, end: relative.end },
          memoDateAfterDays(relative.dayOffset),
        )
        closePicker(false)
        return
      }

      const datePicker = findDatePickerTrigger(text, cursorPos)
      if (datePicker) {
        if (
          pickerRangeRef.current?.start === datePicker.start &&
          pickerRangeRef.current?.end === datePicker.end &&
          pickerOpen
        ) {
          return
        }
        openPicker(datePicker)
        return
      }

      if (pickerOpen) {
        closePicker(false)
      }
    },
    [applyReplacement, closePicker, openPicker, pickerOpen],
  )

  const handleChange = (e) => {
    const text = e.target.value
    const cursorPos = e.target.selectionStart ?? text.length
    onChange(text)
    valueRef.current = text
    syncTriggers(text, cursorPos)
  }

  const handleTextareaClick = (e) => {
    if (pickerOpen) return
    const el = e.currentTarget
    if (el.selectionStart !== el.selectionEnd) return
    const pos = el.selectionStart ?? value.length
    syncTriggers(value, pos)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onClick={handleTextareaClick}
        placeholder={t('memo.contentPlaceholder')}
        className={className}
      />
      {pickerOpen && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label={t('datePicker.closeAria')}
            className="absolute inset-0 z-10 bg-zinc-900/10 dark:bg-black/20"
            onClick={() => closePicker(true)}
          />
          <div
            className="absolute top-3 left-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
            role="dialog"
            aria-label={t('datePicker.title')}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {t('datePicker.title')}
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onInput={(e) => setSelectedDate(e.currentTarget.value)}
              className="min-h-10 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDate}
                className="min-h-9 flex-1 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:active:bg-zinc-200"
              >
                {t('datePicker.insert')}
              </button>
              <button
                type="button"
                onClick={() => closePicker(true)}
                className="min-h-9 rounded-md border border-zinc-300 px-3 text-xs text-zinc-600 active:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:active:bg-zinc-700"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
