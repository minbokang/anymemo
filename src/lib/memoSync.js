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

async function applyPendingOp(userId, op) {
  if (op.type === 'insert') {
    const { error } = await supabase.from('memos').insert({
      id: op.memo.id,
      user_id: userId,
      title: op.memo.title,
      content: op.memo.content,
      created_at: op.memo.created_at,
      updated_at: op.memo.updated_at,
      sort_order: op.memo.sort_order ?? 0,
      pinned: op.memo.pinned ?? false,
    })
    if (error && error.code !== '23505') throw error
    return
  }
  if (op.type === 'update') {
    const payload = {
      title: op.title,
      content: op.content,
      updated_at: op.updated_at,
    }
    if (op.pinned !== undefined) payload.pinned = op.pinned
    const { error } = await supabase.from('memos').update(payload).eq('id', op.id)
    if (error) throw error
    return
  }
  if (op.type === 'reorder') {
    await saveMemoOrder(userId, op.memos)
    return
  }
  if (op.type === 'delete') {
    const { error } = await supabase
      .from('memos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', op.id)
    if (error) throw error
  }
}

const TRASH_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

/** 7일 지난 휴지통 메모 영구 삭제 */
export async function purgeExpiredTrash(userId) {
  const cutoff = new Date(Date.now() - TRASH_RETENTION_MS).toISOString()
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('user_id', userId)
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff)
  if (error) throw error
}

export async function flushPendingOps(userId) {
  const ops = await loadPendingOps(userId)
  if (!ops.length) return { ok: true, data: null }

  // 삭제는 마지막에 — 서버 목록을 먼저 받은 뒤 반영하기 위함
  const inserts = ops.filter((o) => o.type === 'insert')
  const updates = ops.filter((o) => o.type === 'update')
  const reorders = ops.filter((o) => o.type === 'reorder')
  const deletes = ops.filter((o) => o.type === 'delete')

  for (const op of [...inserts, ...updates, ...reorders, ...deletes]) {
    await applyPendingOp(userId, op)
  }

  await clearPendingOps(userId)

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .is('deleted_at', null)
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

/** 로컬에만 있고 서버에 없는 메모 → insert 대기열에 넣기 */
export async function queueMissingServerMemos(userId, serverMemos, localMemos) {
  const serverIds = new Set(serverMemos.map((m) => m.id))
  let queued = 0
  for (const memo of localMemos) {
    if (!serverIds.has(memo.id)) {
      await upsertPendingOp(userId, { type: 'insert', memo })
      queued += 1
    }
  }
  return queued
}
