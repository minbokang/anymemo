import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  clearRememberedEmail,
  clearSupabaseAuthFromLocalStorage,
  saveRememberedEmail,
  setRememberMe,
} from '../lib/authStorage'
import { clearUserCache } from '../lib/memoCache'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  const signIn = async (email, password, { rememberMe = true } = {}) => {
    setRememberMe(rememberMe)
    if (!rememberMe) {
      clearSupabaseAuthFromLocalStorage()
      clearRememberedEmail()
    } else {
      saveRememberedEmail(email)
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const uid = session?.user?.id
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    if (uid) await clearUserCache(uid)
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        // 매번 Google 계정 선택 화면 표시 (브라우저에 로그인된 계정으로 자동 진입 방지)
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) throw error
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      signInWithGoogle,
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
