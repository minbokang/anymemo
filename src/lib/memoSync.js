import { supabase } from '../supabaseClient'
import {
  clearPendingOps,
  loadPendingOps,
  saveMemosCache,
  savePendingOps,
} from './memoCache'

export function sortMemos(memos) {
  return [...memos].sort((a, b) => {
    const pinDiff = Number(b.pinned) - Number(a.pinned)
    if (pinDiff !== 0) return pinDiff
    const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0)
    if (orderDiff !== 0) return orderDiff
    return new Date(b.updated_at) - new Date(a.updated_at)
  })
}

/** 배열 순서대로 sort_order 0..n-1 재할당 */
export function withSortOrder(memos) {
  return memos.map((memo, index) => ({ ...memo, sort_order: index }))
}

export function reorderMemos(memos, fromIndex, toIndex) {
  if (fromIndex === toIndex) return memos
  const next = [...memos]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return withSortOrder(next)
}

export function moveMemoInList(memos, id, direction) {
  const index = memos.findIndex((m) => m.id === id)
  if (index < 0) return memos
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= memos.length) return memos
  return reorderMemos(memos, index, target)
}

/** 서버 목록과 로컬 캐시를 updated_at 기준으로 병합 */
export function mergeMemos(serverMemos, localMemos) {
  const map = new Map()

  for (const memo of serverMemos) {
    map.set(memo.id, memo)
  }

  for (const memo of localMemos) {
    const existing = map.get(memo.id)
    if (!existing) {
      map.set(memo.id, memo)
      continue
    }
    if (new Date(memo.updated_at) >= new Date(existing.updated_at)) {
      map.set(memo.id, { ...existing, ...memo })
    }
  }

  return sortMemos([...map.values()])
}

export async function upsertPendingOp(userId, op) {
  const ops = await loadPendingOps(userId)
  if (op.type === 'update') {
    const without = ops.filter(
      (item) => !(item.type === 'update' && item.id === op.id),
    )
    await savePendingOps(userId, [...without, op])
    return
  }
  if (op.type === 'reorder') {
    const without = ops.filter((item) => item.type !== 'reorder')
    await savePendingOps(userId, [...without, op])
    return
  }
  if (op.type === 'delete') {
    const without = ops.filter(
      (item) =>
        !(
          (item.type === 'insert' && item.memo.id === op.id) ||
          (item.type === 'update' && item.id === op.id) ||
          (item.type === 'delete' && item.id === op.id)
        ),
    )
    await savePendingOps(userId, [...without, op])
    return
  }
  await savePendingOps(userId, [...ops, op])
}

export async function flushPendingOps(userId) {
  const ops = await loadPendingOps(userId)
  if (!ops.length) return { ok: true, data: null }

  for (const op of ops) {
    if (op.type === 'insert') {
      const { error } = await supabase.from('memos').insert({
        id: op.memo.id,
        user_id: userId,
        title: op.memo.title,
        content: op.memo.content,
        created_at: op.memo.created_at,
        updated_at: op.memo.updated_at,
        sort_order: op.memo.sort_order ?? 0,
      })
      if (error) throw error
    } else if (op.type === 'update') {
      const payload = {
        title: op.title,
        content: op.content,
        updated_at: op.updated_at,
      }
      if (op.pinned !== undefined) payload.pinned = op.pinned
      const { error } = await supabase.from('memos').update(payload).eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'reorder') {
      await saveMemoOrder(userId, op.memos)
    } else if (op.type === 'delete') {
      const { error } = await supabase.from('memos').delete().eq('id', op.id)
      if (error) throw error
    }
  }

  await clearPendingOps(userId)

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) throw error

  const merged = sortMemos(data ?? [])
  await saveMemosCache(userId, merged)
  return { ok: true, data: merged }
}

export function applyLocalMemoChange(memos, memo) {
  const exists = memos.some((m) => m.id === memo.id)
  if (exists) {
    return sortMemos(memos.map((m) => (m.id === memo.id ? { ...m, ...memo } : m)))
  }
  const minOrder = memos.reduce(
    (min, m) => Math.min(min, m.sort_order ?? 0),
    0,
  )
  return sortMemos([{ ...memo, sort_order: minOrder - 1 }, ...memos])
}

export async function saveMemoOrder(userId, memos) {
  const ordered = withSortOrder(memos)
  const results = await Promise.all(
    ordered.map((memo) =>
      supabase
        .from('memos')
        .update({ sort_order: memo.sort_order })
        .eq('id', memo.id)
        .eq('user_id', userId),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
  return ordered
}

export function removeLocalMemo(memos, id) {
  return memos.filter((m) => m.id !== id)
}
