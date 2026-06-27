import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react'
import './App.css'
import { AppShell } from './components/AppShell'
import { useAppNavigation } from './hooks/useAppNavigation'
import { useAuth } from './hooks/useAuth'
import { useAutoPayData } from './hooks/useAutoPayData'
import { AppRoutes } from './pages/AppRoutes'
import { AuthPage } from './pages/AuthPage'

function App() {
  const auth = useAuth()
  const data = useAutoPayData(auth.session?.access_token, auth.session?.user.id)
  const navigation = useAppNavigation()

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return

    let hadController = Boolean(navigator.serviceWorker.controller)

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              worker.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      })
      .catch(() => undefined)

    const reloadOnControllerChange = () => {
      if (!hadController) {
        hadController = true
        return
      }

      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', reloadOnControllerChange)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', reloadOnControllerChange)
  }, [])

  if (!auth.session) return <AuthPage {...auth} />

  return (
    <ErrorBoundary>
      <AppShell auth={auth} data={data} view={navigation.view} setView={navigation.setView}>
        <AppRoutes
          auth={auth}
          data={data}
          view={navigation.view}
          selectedEmployeeId={navigation.selectedEmployeeId}
          formEmployeeId={navigation.formEmployeeId}
          setView={navigation.setView}
          openEmployee={navigation.openEmployee}
          openEmployeeForm={navigation.openEmployeeForm}
        />
      </AppShell>
    </ErrorBoundary>
  )
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AutoPay runtime error', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <h1>AutoPay Africa</h1>
          <p>Something went wrong while rendering the operations console.</p>
          {this.state.message && <p className="form-error">{this.state.message}</p>}
          <button className="primary" type="button" onClick={() => window.location.reload()}>Reload App</button>
        </section>
      </main>
    )
  }
}

export default App
