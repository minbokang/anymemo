const REMEMBER_KEY = 'anymemo:rememberMe'
const EMAIL_KEY = 'anymemo:rememberEmail'

export function getRememberMe() {
  try {
    return localStorage.getItem(REMEMBER_KEY) !== '0'
  } catch {
    return true
  }
}

export function setRememberMe(remember) {
  try {
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
  } catch {
    /* ignore */
  }
}

export function loadRememberedEmail() {
  try {
    return localStorage.getItem(EMAIL_KEY) || ''
  } catch {
    return ''
  }
}

export function saveRememberedEmail(email) {
  try {
    if (email) localStorage.setItem(EMAIL_KEY, email)
    else localStorage.removeItem(EMAIL_KEY)
  } catch {
    /* ignore */
  }
}

export function clearRememberedEmail() {
  try {
    localStorage.removeItem(EMAIL_KEY)
  } catch {
    /* ignore */
  }
}

function pickStorage() {
  return getRememberMe() ? localStorage : sessionStorage
}

/** Supabase Auth용 — 기억하기 해제 시 세션만 유지(탭/브라우저 종료 시 로그아웃) */
export const authStorage = {
  getItem(key) {
    return pickStorage().getItem(key)
  },
  setItem(key, value) {
    pickStorage().setItem(key, value)
  },
  removeItem(key) {
    pickStorage().removeItem(key)
    const other = pickStorage() === localStorage ? sessionStorage : localStorage
    other.removeItem(key)
  },
}

export function clearSupabaseAuthFromLocalStorage() {
  try {
    const prefix = 'sb-'
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix) && key.includes('-auth-token')) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    /* ignore */
  }
}
