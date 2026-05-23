import { idbDelete, idbGet, idbSet } from './idb'

const memosKey = (userId) => `memos:${userId}`
const pendingKey = (userId) => `pending:${userId}`

const migratedUsers = new Set()

function readLocalStorage(key) {
  try {
    const raw = localStorage.getItem(`anymemo:${key}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function removeLocalStorage(key) {
  try {
    localStorage.removeItem(`anymemo:${key}`)
  } catch {
    /* ignore */
  }
}

/** 기존 localStorage 데이터를 IndexedDB로 1회 이전 */
async function migrateFromLocalStorage(userId) {
  if (migratedUsers.has(userId)) return
  migratedUsers.add(userId)

  const legacyMemos = readLocalStorage(`memos:${userId}`)
  const legacyPending = readLocalStorage(`pending:${userId}`)

  if (legacyMemos && !(await idbGet(memosKey(userId)))) {
    await idbSet(memosKey(userId), legacyMemos)
    removeLocalStorage(`memos:${userId}`)
  }

  if (legacyPending && !(await idbGet(pendingKey(userId)))) {
    await idbSet(pendingKey(userId), legacyPending)
    removeLocalStorage(`pending:${userId}`)
  }
}

export async function loadMemosCache(userId) {
  if (!userId) return []
  await migrateFromLocalStorage(userId)
  const data = await idbGet(memosKey(userId))
  return Array.isArray(data) ? data : []
}

export async function saveMemosCache(userId, memos) {
  if (!userId) return
  await idbSet(memosKey(userId), memos)
}

export async function loadPendingOps(userId) {
  if (!userId) return []
  await migrateFromLocalStorage(userId)
  const data = await idbGet(pendingKey(userId))
  return Array.isArray(data) ? data : []
}

export async function savePendingOps(userId, ops) {
  if (!userId) return
  await idbSet(pendingKey(userId), ops)
}

export async function clearPendingOps(userId) {
  if (!userId) return
  await idbDelete(pendingKey(userId))
}

export async function clearUserCache(userId) {
  if (!userId) return
  await idbDelete(memosKey(userId))
  await idbDelete(pendingKey(userId))
  removeLocalStorage(`memos:${userId}`)
  removeLocalStorage(`pending:${userId}`)
  migratedUsers.delete(userId)
}
