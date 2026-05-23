import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  loadMemosCache,
  loadPendingOps,
  saveMemosCache,
} from '../lib/memoCache'
import {
  clearLastMemoId,
  loadLastMemoId,
  saveLastMemoId,
} from '../lib/userPrefs'
import {
  applyLocalMemoChange,
  flushPendingOps,
  mergeMemos,
  moveMemoInList,
  queueMissingServerMemos,
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

export function useMemos(userId, { notify } = {}) {
  const online = useOnlineStatus()
  const notifyRef = useRef(notify)
  notifyRef.current = notify

  const pushNotice = useCallback((message, variant = 'error') => {
    notifyRef.current?.(message, variant)
  }, [])
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
  const initialSelectDoneRef = useRef(false)

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
      pushNotice('동기화에 실패했습니다. 나중에 다시 시도됩니다.')
      return null
    } finally {
      syncingRef.current = false
    }
  }, [userId, online, persistMemos, refreshPendingCount, pushNotice])

  const pullServerMemos = useCallback(async () => {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data ?? []
  }, [])

  const fetchMemos = useCallback(async () => {
    if (!userId) return

    const cached = await loadMemosCache(userId)
    await refreshPendingCount()

    if (!online) {
      if (cached.length) await persistMemos(cached)
      const pending = await loadPendingOps(userId)
      setSyncStatus(pending.length ? 'pending' : 'offline')
      setLoading(false)
      return cached
    }

    setLoading(true)
    setSyncStatus('syncing')
    try {
      // 온라인: 서버 목록을 먼저 받고, 대기 작업(삭제는 마지막) 반영
      let serverMemos = await pullServerMemos()
      let localCache = await loadMemosCache(userId)

      const queued = await queueMissingServerMemos(
        userId,
        serverMemos,
        localCache,
      )
      if (queued > 0) {
        pushNotice(
          `${queued}개 메모가 서버에 없어 업로드를 시도합니다.`,
          'info',
        )
      }

      try {
        await syncToServer()
      } catch (syncErr) {
        console.error(syncErr)
      }

      serverMemos = await pullServerMemos()
      localCache = await loadMemosCache(userId)
      const pending = await loadPendingOps(userId)
      const merged = pending.length
        ? mergeMemos(serverMemos, localCache)
        : sortMemos(serverMemos)

      await persistMemos(merged)
      setSyncStatus(pending.length ? 'pending' : 'idle')
      setLoading(false)
      return merged
    } catch (err) {
      console.error(err)
      if (cached.length) {
        await persistMemos(cached)
        setSyncStatus('offline')
        pushNotice('서버 목록을 불러오지 못했습니다. 저장된 메모를 표시합니다.')
      } else {
        setSyncStatus('error')
        pushNotice('메모 목록을 불러오지 못했습니다.')
      }
      setLoading(false)
      return cached
    }
  }, [
    userId,
    online,
    persistMemos,
    syncToServer,
    refreshPendingCount,
    pushNotice,
    pullServerMemos,
  ])

  const restoreLastMemo = useCallback(
    (list) => {
      if (!list?.length || initialSelectDoneRef.current) return
      initialSelectDoneRef.current = true
      const lastId = loadLastMemoId(userId)
      const target =
        (lastId && list.find((m) => m.id === lastId)) || list[0]
      setActiveId(target.id)
      setDraft({ title: target.title, content: target.content })
      dirtyRef.current = false
    },
    [userId],
  )

  useEffect(() => {
    if (!userId) return
    initialSelectDoneRef.current = false
    let cancelled = false

    ;(async () => {
      const data = await fetchMemos()
      if (cancelled) return
      restoreLastMemo(data)
    })()

    return () => {
      cancelled = true
    }
  }, [userId, fetchMemos, restoreLastMemo])

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

    const onVisible = () => {
      if (document.visibilityState === 'visible') void fetchMemos()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [userId, online, fetchMemos])

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
          if (payload.eventType === 'INSERT') {
            void persistMemos(
              applyLocalMemoChange(memosRef.current, payload.new),
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

  const selectMemo = useCallback(
    (memo) => {
      clearSavedTimer()
      setActiveId(memo.id)
      setDraft({ title: memo.title, content: memo.content })
      dirtyRef.current = false
      setSaveStatus('idle')
      saveLastMemoId(userId, memo.id)
    },
    [userId],
  )

  const togglePin = useCallback(
    async (id) => {
      const memo = memosRef.current.find((m) => m.id === id)
      if (!memo || !userId) return
      const pinned = !memo.pinned
      const next = sortMemos(
        memosRef.current.map((m) => (m.id === id ? { ...m, pinned } : m)),
      )
      await persistMemos(next)

      if (!online) {
        await upsertPendingOp(userId, {
          type: 'update',
          id,
          title: memo.title,
          content: memo.content,
          updated_at: memo.updated_at,
          pinned,
        })
        await refreshPendingCount()
        setSyncStatus('pending')
        return
      }

      const { error } = await supabase
        .from('memos')
        .update({ pinned })
        .eq('id', id)
      if (error) {
        console.error(error)
        await upsertPendingOp(userId, {
          type: 'update',
          id,
          title: memo.title,
          content: memo.content,
          updated_at: memo.updated_at,
          pinned,
        })
        await refreshPendingCount()
        setSyncStatus('pending')
      }
    },
    [userId, online, persistMemos, refreshPendingCount],
  )

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
      pinned: false,
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
      const deletedIndex = memosRef.current.findIndex((m) => m.id === id)
      const wasActive = id === activeId

      const pickFallback = (list) => {
        if (!list.length) {
          if (loadLastMemoId(userId) === id) clearLastMemoId(userId)
          setActiveId(null)
          setDraft({ title: '', content: '' })
          dirtyRef.current = false
          setSaveStatus('idle')
          return
        }
        const idx =
          deletedIndex < 0
            ? 0
            : Math.min(deletedIndex, list.length - 1)
        selectMemo(list[idx])
      }

      const finalizeDelete = async (next) => {
        const ordered = withSortOrder(next)
        await applyOrder(ordered)
        if (wasActive) pickFallback(ordered)
        else if (loadLastMemoId(userId) === id) clearLastMemoId(userId)
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
        pushNotice('삭제에 실패했습니다. 연결되면 다시 시도합니다.')
        const next = removeLocalMemo(memosRef.current, id)
        await upsertPendingOp(userId, { type: 'delete', id })
        await refreshPendingCount()
        setSyncStatus('pending')
        await finalizeDelete(next)
        return
      }

      await finalizeDelete(removeLocalMemo(memosRef.current, id))
    },
    [
      userId,
      online,
      activeId,
      selectMemo,
      applyOrder,
      refreshPendingCount,
      pushNotice,
    ],
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
        setSaveStatus('error')
        pushNotice('저장에 실패했습니다. 기기에 임시 저장했습니다.')
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
    pushNotice,
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
    togglePin,
    updateDraft,
    refetch: fetchMemos,
    syncToServer,
    syncNow: async () => {
      await syncToServer()
      return fetchMemos()
    },
  }
}
