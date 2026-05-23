import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  loadMemosCache,
  loadPendingOps,
  saveMemosCache,
} from '../lib/memoCache'
import {
  applyLocalMemoChange,
  flushPendingOps,
  mergeMemos,
  moveMemoInList,
  removeLocalMemo,
  reorderMemos,
  saveMemoOrder,
  sortMemos,
  upsertPendingOp,
  withSortOrder,
} from '../lib/memoSync'
import { useOnlineStatus } from './useOnlineStatus'

const SAVE_DELAY_MS = 500
const SAVED_VISIBLE_MS = 2500

function nowIso() {
  return new Date().toISOString()
}

export function useMemos(userId) {
  const online = useOnlineStatus()
  const [memos, setMemos] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [draft, setDraft] = useState({ title: '', content: '' })
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [syncStatus, setSyncStatus] = useState('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const dirtyRef = useRef(false)
  const skipNextSaveRef = useRef(false)
  const draftRef = useRef(draft)
  const savedTimerRef = useRef(null)
  const syncingRef = useRef(false)
  const memosRef = useRef(memos)
  const prevOnlineRef = useRef(online)
  const pendingCountRef = useRef(0)

  draftRef.current = draft
  memosRef.current = memos
  pendingCountRef.current = pendingCount

  const refreshPendingCount = useCallback(async () => {
    if (!userId) {
      setPendingCount(0)
      pendingCountRef.current = 0
      return
    }
    const ops = await loadPendingOps(userId)
    setPendingCount(ops.length)
    pendingCountRef.current = ops.length
  }, [userId])

  const clearSavedTimer = () => {
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current)
      savedTimerRef.current = null
    }
  }

  const showSaved = useCallback(() => {
    clearSavedTimer()
    setSaveStatus('saved')
    savedTimerRef.current = setTimeout(() => {
      setSaveStatus('idle')
      savedTimerRef.current = null
    }, SAVED_VISIBLE_MS)
  }, [])

  const showLocalSaved = useCallback(() => {
    clearSavedTimer()
    setSaveStatus('local')
    savedTimerRef.current = setTimeout(() => {
      setSaveStatus('idle')
      savedTimerRef.current = null
    }, SAVED_VISIBLE_MS)
  }, [])

  const persistMemos = useCallback(
    async (next) => {
      const sorted = sortMemos(next)
      setMemos(sorted)
      if (userId) await saveMemosCache(userId, sorted)
      return sorted
    },
    [userId],
  )

  const syncToServer = useCallback(async () => {
    if (!userId || !online || syncingRef.current) return null
    const pending = await loadPendingOps(userId)
    if (!pending.length) return null

    syncingRef.current = true
    setSyncStatus('syncing')
    try {
      const { data } = await flushPendingOps(userId)
      await refreshPendingCount()
      if (data) {
        await persistMemos(data)
        setSyncStatus('idle')
        return data
      }
      setSyncStatus('idle')
      return null
    } catch (err) {
      console.error(err)
      setSyncStatus('error')
      return null
    } finally {
      syncingRef.current = false
    }
  }, [userId, online, persistMemos, refreshPendingCount])

  const fetchMemos = useCallback(async () => {
    if (!userId) return

    const cached = await loadMemosCache(userId)
    await refreshPendingCount()

    if (cached.length) {
      await persistMemos(cached)
      setLoading(false)
      if (!activeId && cached[0]) {
        setActiveId(cached[0].id)
        setDraft({ title: cached[0].title, content: cached[0].content })
        dirtyRef.current = false
      }
    }

    if (!online) {
      const pending = await loadPendingOps(userId)
      setSyncStatus(pending.length ? 'pending' : 'offline')
      setLoading(false)
      return cached
    }

    setSyncStatus('syncing')
    try {
      await syncToServer()
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false })

      if (error) throw error

      const localCache = await loadMemosCache(userId)
      const merged = mergeMemos(data ?? [], localCache)
      await persistMemos(merged)
      const pending = await loadPendingOps(userId)
      setSyncStatus(pending.length ? 'pending' : 'idle')
      setLoading(false)
      return merged
    } catch (err) {
      console.error(err)
      if (cached.length) {
        setSyncStatus('offline')
      } else {
        setSyncStatus('error')
      }
      setLoading(false)
      return cached
    }
  }, [userId, online, activeId, persistMemos, syncToServer, refreshPendingCount])

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    ;(async () => {
      const data = await fetchMemos()
      if (cancelled || !data?.length || activeId) return
      const first = data[0]
      setActiveId(first.id)
      setDraft({ title: first.title, content: first.content })
      dirtyRef.current = false
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    const cameOnline = online && !prevOnlineRef.current
    prevOnlineRef.current = online
    if (cameOnline) {
      ;(async () => {
        await syncToServer()
        await fetchMemos()
      })()
    }
  }, [online, userId, syncToServer, fetchMemos])

  useEffect(() => {
    if (!userId || !online) return

    const channel = supabase
      .channel(`memos:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memos',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (pendingCountRef.current > 0) return

          if (payload.eventType === 'INSERT') {
            void persistMemos(
              memosRef.current.some((m) => m.id === payload.new.id)
                ? memosRef.current.map((m) =>
                    m.id === payload.new.id ? payload.new : m,
                  )
                : [payload.new, ...memosRef.current],
            )
            return
          }

          if (payload.eventType === 'UPDATE') {
            void persistMemos(
              memosRef.current.map((m) =>
                m.id === payload.new.id ? payload.new : m,
              ),
            )
            if (payload.new.id === activeId && !dirtyRef.current) {
              skipNextSaveRef.current = true
              setDraft({
                title: payload.new.title,
                content: payload.new.content,
              })
            }
            return
          }

          if (payload.eventType === 'DELETE') {
            void persistMemos(
              removeLocalMemo(memosRef.current, payload.old.id),
            )
            if (payload.old.id === activeId) {
              setActiveId(null)
              setDraft({ title: '', content: '' })
              dirtyRef.current = false
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, online, activeId, persistMemos])

  const selectMemo = useCallback((memo) => {
    clearSavedTimer()
    setActiveId(memo.id)
    setDraft({ title: memo.title, content: memo.content })
    dirtyRef.current = false
    setSaveStatus('idle')
  }, [])

  const applyOrder = useCallback(
    async (nextMemos) => {
      const ordered = withSortOrder(nextMemos)
      setMemos(ordered)
      if (userId) await saveMemosCache(userId, ordered)

      if (!online) {
        await upsertPendingOp(userId, { type: 'reorder', memos: ordered })
        await refreshPendingCount()
        setSyncStatus('pending')
        return ordered
      }

      try {
        await saveMemoOrder(userId, ordered)
      } catch (err) {
        console.error(err)
        await upsertPendingOp(userId, { type: 'reorder', memos: ordered })
        await refreshPendingCount()
        setSyncStatus('pending')
      }
      return ordered
    },
    [userId, online, refreshPendingCount],
  )

  const reorderMemosByIndex = useCallback(
    (fromIndex, toIndex) => {
      applyOrder(reorderMemos(memosRef.current, fromIndex, toIndex))
    },
    [applyOrder],
  )

  const moveMemo = useCallback(
    (id, direction) => {
      applyOrder(moveMemoInList(memosRef.current, id, direction))
    },
    [applyOrder],
  )

  const createMemo = useCallback(async () => {
    if (!userId) return

    const timestamp = nowIso()
    const minOrder = memosRef.current.reduce(
      (min, m) => Math.min(min, m.sort_order ?? 0),
      0,
    )
    const localMemo = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: '제목 없음',
      content: '',
      created_at: timestamp,
      updated_at: timestamp,
      sort_order: minOrder - 1,
    }

    if (!online) {
      await persistMemos(applyLocalMemoChange(memosRef.current, localMemo))
      await upsertPendingOp(userId, { type: 'insert', memo: localMemo })
      await refreshPendingCount()
      setSyncStatus('pending')
      selectMemo(localMemo)
      return
    }

    const { data, error } = await supabase
      .from('memos')
      .insert({
        user_id: userId,
        title: localMemo.title,
        content: localMemo.content,
        sort_order: localMemo.sort_order,
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      await persistMemos(applyLocalMemoChange(memosRef.current, localMemo))
      await upsertPendingOp(userId, { type: 'insert', memo: localMemo })
      await refreshPendingCount()
      setSyncStatus('pending')
      selectMemo(localMemo)
      return
    }

    await persistMemos(applyLocalMemoChange(memosRef.current, data))
    selectMemo(data)
  }, [userId, online, persistMemos, selectMemo, refreshPendingCount])

  const deleteMemo = useCallback(
    async (id) => {
      const pickFallback = (list) => {
        const fallback = list[0]
        if (fallback) selectMemo(fallback)
        else {
          setActiveId(null)
          setDraft({ title: '', content: '' })
          dirtyRef.current = false
        }
      }

      const finalizeDelete = async (next) => {
        const ordered = withSortOrder(next)
        await applyOrder(ordered)
        if (id === activeId) pickFallback(ordered)
      }

      if (!online) {
        const next = removeLocalMemo(memosRef.current, id)
        await upsertPendingOp(userId, { type: 'delete', id })
        await refreshPendingCount()
        setSyncStatus('pending')
        await finalizeDelete(next)
        return
      }

      const { error } = await supabase.from('memos').delete().eq('id', id)
      if (error) {
        console.error(error)
        const next = removeLocalMemo(memosRef.current, id)
        await upsertPendingOp(userId, { type: 'delete', id })
        await refreshPendingCount()
        setSyncStatus('pending')
        await finalizeDelete(next)
        return
      }

      await finalizeDelete(removeLocalMemo(memosRef.current, id))
    },
    [userId, online, activeId, selectMemo, applyOrder, refreshPendingCount],
  )

  const updateDraft = useCallback((field, value) => {
    clearSavedTimer()
    dirtyRef.current = true
    setSaveStatus('pending')
    setDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    if (!activeId || !dirtyRef.current) return

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }

    const timer = setTimeout(async () => {
      const snapshot = draftRef.current
      const timestamp = nowIso()
      setSaveStatus('saving')

      const applyLocal = async () => {
        const current = memosRef.current.find((m) => m.id === activeId)
        if (!current) return
        const updated = {
          ...current,
          title: snapshot.title,
          content: snapshot.content,
          updated_at: timestamp,
        }
        await persistMemos(applyLocalMemoChange(memosRef.current, updated))
        await upsertPendingOp(userId, {
          type: 'update',
          id: activeId,
          title: snapshot.title,
          content: snapshot.content,
          updated_at: timestamp,
        })
        await refreshPendingCount()
        setSyncStatus('pending')
        dirtyRef.current = false
        showLocalSaved()
      }

      if (!online) {
        await applyLocal()
        return
      }

      const { data, error } = await supabase
        .from('memos')
        .update({
          title: snapshot.title,
          content: snapshot.content,
        })
        .eq('id', activeId)
        .select()
        .single()

      if (error) {
        console.error(error)
        await applyLocal()
        return
      }

      dirtyRef.current = false
      await persistMemos(applyLocalMemoChange(memosRef.current, data))
      showSaved()
    }, SAVE_DELAY_MS)

    return () => clearTimeout(timer)
  }, [
    draft,
    activeId,
    online,
    userId,
    persistMemos,
    showSaved,
    showLocalSaved,
    refreshPendingCount,
  ])

  useEffect(() => () => clearSavedTimer(), [])

  return {
    memos,
    activeId,
    draft,
    loading,
    saveStatus,
    syncStatus,
    online,
    pendingCount,
    selectMemo,
    createMemo,
    deleteMemo,
    reorderMemosByIndex,
    moveMemo,
    updateDraft,
    refetch: fetchMemos,
    syncToServer,
  }
}
