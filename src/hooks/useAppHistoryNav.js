import { useCallback, useEffect, useRef } from 'react'
import { loadAppView, saveAppView } from '../lib/userPrefs'

/** @typedef {{ view: 'memos' | 'stats' | 'trash', pane: 'list' | 'editor', memoId: string | null }} AppNavState */

const AUTH_HASH_RE = /access_token|refresh_token|error=|type=recovery/i

export function isMobileAppLayout() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}

/** @returns {AppNavState} */
export function parseAppNavFromHash() {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw || AUTH_HASH_RE.test(raw)) {
    return { view: 'memos', pane: 'list', memoId: null }
  }
  if (raw === 'stats') {
    return { view: 'stats', pane: 'list', memoId: null }
  }
  if (raw === 'trash') {
    return { view: 'trash', pane: 'list', memoId: null }
  }
  const memoMatch = /^m\/([^/?#]+)$/.exec(raw)
  if (memoMatch) {
    const mobile = isMobileAppLayout()
    return {
      view: 'memos',
      pane: mobile ? 'editor' : 'list',
      memoId: memoMatch[1],
    }
  }
  return { view: 'memos', pane: 'list', memoId: null }
}

/** @param {AppNavState} nav */
function navToHash(nav) {
  if (nav.view === 'stats') return '#stats'
  if (nav.view === 'trash') return '#trash'
  if (nav.memoId) return `#m/${nav.memoId}`
  return ''
}

/** @param {AppNavState} nav */
function navUrl(nav) {
  return `${window.location.pathname}${window.location.search}${navToHash(nav)}`
}

/** @param {History['state']} eventState */
function navFromHistoryState(eventState) {
  if (eventState?.anymemo) return eventState.anymemo
  return parseAppNavFromHash()
}

function memoNav(memoId) {
  const mobile = isMobileAppLayout()
  return {
    view: 'memos',
    pane: mobile ? 'editor' : 'list',
    memoId,
  }
}

/**
 * Sync memos ↔ stats ↔ trash and per-memo navigation with browser history.
 */
export function useAppHistoryNav({
  appView,
  mobilePane,
  showTrash,
  activeId,
  memos,
  setAppView,
  setMobilePane,
  setShowTrash,
  selectMemoById,
  clearMemoSelection,
}) {
  const readyRef = useRef(false)
  const initRef = useRef(false)
  const applyingRef = useRef(false)

  const applyNav = useCallback(
    /** @param {AppNavState} nav */
    (nav) => {
      applyingRef.current = true
      setShowTrash(nav.view === 'trash')

      if (nav.view === 'stats') {
        setAppView('stats')
        saveAppView('stats')
        setMobilePane('list')
        applyingRef.current = false
        return
      }

      setAppView('memos')
      saveAppView('memos')

      if (nav.view === 'trash') {
        setMobilePane('list')
        clearMemoSelection()
        applyingRef.current = false
        return
      }

      const mobile = isMobileAppLayout()
      if (mobile) {
        setMobilePane(nav.memoId ? 'editor' : 'list')
      }
      if (nav.memoId) {
        selectMemoById(nav.memoId)
      } else {
        clearMemoSelection()
      }
      applyingRef.current = false
    },
    [
      setAppView,
      setMobilePane,
      setShowTrash,
      selectMemoById,
      clearMemoSelection,
    ],
  )

  const pushNav = useCallback(
    /** @param {AppNavState} nav */
    (nav) => {
      history.pushState({ anymemo: nav }, '', navUrl(nav))
      applyNav(nav)
    },
    [applyNav],
  )

  const replaceNav = useCallback(
    /** @param {AppNavState} nav */
    (nav) => {
      history.replaceState({ anymemo: nav }, '', navUrl(nav))
      applyNav(nav)
    },
    [applyNav],
  )

  useEffect(() => {
    const onPopState = (event) => {
      if (!readyRef.current) return
      applyNav(navFromHistoryState(event.state))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [applyNav])

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true
    const fromHash = parseAppNavFromHash()
    const hasAppHash =
      window.location.hash === '#stats' ||
      window.location.hash === '#trash' ||
      window.location.hash.startsWith('#m/')
    const initial = hasAppHash
      ? fromHash
      : {
          view: loadAppView() === 'stats' ? 'stats' : 'memos',
          pane: 'list',
          memoId: null,
        }
    replaceNav(initial)
    readyRef.current = true
  }, [replaceNav])

  useEffect(() => {
    if (!readyRef.current || applyingRef.current) return
    const fromHash = parseAppNavFromHash()
    if (fromHash.view === 'trash' || showTrash) return

    if (fromHash.memoId && memos.some((m) => m.id === fromHash.memoId)) {
      if (fromHash.memoId !== activeId) {
        selectMemoById(fromHash.memoId)
        if (isMobileAppLayout()) setMobilePane('editor')
      }
      return
    }
    if (
      activeId &&
      appView === 'memos' &&
      window.location.hash !== `#m/${activeId}` &&
      !fromHash.memoId
    ) {
      replaceNav(memoNav(activeId))
    }
  }, [
    memos,
    activeId,
    appView,
    showTrash,
    selectMemoById,
    setMobilePane,
    replaceNav,
  ])

  const navigateToMemo = useCallback(
    (memoId) => {
      if (!memoId) return
      const mobile = isMobileAppLayout()
      const hash = `#m/${memoId}`
      // 모바일 목록에서 이미 선택된 메모를 다시 탭해도 에디터로 진입
      if (
        mobile &&
        mobilePane === 'list' &&
        activeId === memoId &&
        window.location.hash === hash &&
        !showTrash
      ) {
        setMobilePane('editor')
        return
      }
      if (
        activeId === memoId &&
        window.location.hash === hash &&
        !showTrash &&
        (!mobile || mobilePane === 'editor')
      ) {
        return
      }
      pushNav(memoNav(memoId))
    },
    [activeId, showTrash, mobilePane, setMobilePane, pushNav],
  )

  const openStats = useCallback(() => {
    pushNav({ view: 'stats', pane: 'list', memoId: null })
  }, [pushNav])

  const closeStats = useCallback(() => {
    if (appView === 'stats') history.back()
  }, [appView])

  const toggleStats = useCallback(() => {
    if (appView === 'stats') closeStats()
    else openStats()
  }, [appView, closeStats, openStats])

  const openTrash = useCallback(() => {
    pushNav({ view: 'trash', pane: 'list', memoId: null })
  }, [pushNav])

  const closeTrash = useCallback(() => {
    if (showTrash) history.back()
  }, [showTrash])

  const toggleTrash = useCallback(() => {
    if (showTrash) closeTrash()
    else openTrash()
  }, [showTrash, closeTrash, openTrash])

  const backToMemoList = useCallback(() => {
    if (!isMobileAppLayout()) return
    if (mobilePane === 'editor') history.back()
    else replaceNav({ view: 'memos', pane: 'list', memoId: null })
  }, [mobilePane, replaceNav])

  return {
    openStats,
    closeStats,
    toggleStats,
    openTrash,
    closeTrash,
    toggleTrash,
    navigateToMemo,
    backToMemoList,
  }
}
