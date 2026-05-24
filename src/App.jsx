import { useAuth } from './context/AuthContext'
import { useTranslation } from './context/I18nContext'
import AuthForm from './components/AuthForm'
import MemoApp from './components/MemoApp'

function App() {
  const { user, loading } = useAuth()
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
        {t('app.loading')}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-50 p-4 safe-top safe-bottom dark:bg-zinc-950">
        <AuthForm />
      </div>
    )
  }

  return <MemoApp />
}

export default App
