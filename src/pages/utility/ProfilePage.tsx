import { InfoPanel } from '../../components/ui'
import type { SetView } from '../../types'

export function ProfilePage({ userName, email, role, logout, setView }: { userName: string; email: string; role: string; logout: () => void; setView: SetView }) {
  return (
    <section className="panel form-panel">
      <header>
        <h3>User Profile</h3>
        <button className="ghost" type="button" onClick={() => setView('wallet')}>
          Employee Wallet
        </button>
      </header>
      <InfoPanel title={userName} items={[['Email', email], ['Role', role], ['Session', 'Supabase JWT']]} />
      <button className="dark" type="button" onClick={logout}>
        Sign Out
      </button>
    </section>
  )
}
