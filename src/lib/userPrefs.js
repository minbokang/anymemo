const lastMemoKey = (userId) => `anymemo:lastMemo:${userId}`
const APP_VIEW_KEY = 'anymemo:app-view'

export function loadAppView() {
  try {
    return sessionStorage.getItem(APP_VIEW_KEY) === 'stats' ? 'stats' : 'memos'
  } catch {
    return 'memos'
  }
}

export function saveAppView(view) {
  try {
    sessionStorage.setItem(APP_VIEW_KEY, view)
  } catch {
    /* ignore */
  }
}

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
