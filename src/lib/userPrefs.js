const lastMemoKey = (userId) => `anymemo:lastMemo:${userId}`

export function saveLastMemoId(userId, memoId) {
  if (!userId || !memoId) return
  try {
    localStorage.setItem(lastMemoKey(userId), memoId)
  } catch {
    /* ignore */
  }
}

export function loadLastMemoId(userId) {
  if (!userId) return null
  try {
    return localStorage.getItem(lastMemoKey(userId))
  } catch {
    return null
  }
}

export function clearLastMemoId(userId) {
  if (!userId) return
  try {
    localStorage.removeItem(lastMemoKey(userId))
  } catch {
    /* ignore */
  }
}
