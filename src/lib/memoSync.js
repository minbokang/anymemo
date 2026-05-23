import { supabase } from '../supabaseClient'
import {
  clearPendingOps,
  loadPendingOps,
  saveMemosCache,
  savePendingOps,
} from './memoCache'

export function sortMemos(memos) {
  return [...memos].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
  )
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
      })
      if (error) throw error
    } else if (op.type === 'update') {
      const { error } = await supabase
        .from('memos')
        .update({
          title: op.title,
          content: op.content,
          updated_at: op.updated_at,
        })
        .eq('id', op.id)
      if (error) throw error
    } else if (op.type === 'delete') {
      const { error } = await supabase.from('memos').delete().eq('id', op.id)
      if (error) throw error
    }
  }

  await clearPendingOps(userId)

  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error

  const merged = sortMemos(data ?? [])
  await saveMemosCache(userId, merged)
  return { ok: true, data: merged }
}

export function applyLocalMemoChange(memos, memo) {
  const next = memos.some((m) => m.id === memo.id)
    ? memos.map((m) => (m.id === memo.id ? memo : m))
    : [memo, ...memos]
  return sortMemos(next)
}

export function removeLocalMemo(memos, id) {
  return memos.filter((m) => m.id !== id)
}
