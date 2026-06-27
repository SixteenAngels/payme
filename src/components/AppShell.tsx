import { useState, type ReactNode } from 'react'
import {
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  Download,
  Menu,
  Plus,
  Search,
  X,
} from './icons'
import { NavButton, StatusBanner } from './ui'
import { downloadCsv } from '../lib/format'
import { operationsNav, primaryNav } from '../lib/navigation'
import { getPageSubtitle, getPageTitle } from '../lib/routing'
import type { useAuth } from '../hooks/useAuth'
import type { useAutoPayData } from '../hooks/useAutoPayData'
import type { SetView, View } from '../types'

type AppShellProps = {
  auth: ReturnType<typeof useAuth>
  data: ReturnType<typeof useAutoPayData>
  view: View
  setView: SetView
  children: ReactNode
}

export function AppShell({ auth, data, view, setView, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navigate = (nextView: View) => {
    setView(nextView)
    setMobileNavOpen(false)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-block">
          <button className="mobile-close icon-button" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
          <h1>AutoPay Africa</h1>
          <p>Enterprise Admin</p>
        </div>

        <nav className="side-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <NavButton active={view === item.id} icon={item.icon} key={item.id} label={item.label} onClick={() => navigate(item.id)} />
          ))}
        </nav>

        <nav className="side-nav side-nav-compact" aria-label="Operations">
          <span>Operations</span>
          {operationsNav.map((item) => (
            <NavButton active={view === item.id} icon={item.icon} key={item.id} label={item.label} onClick={() => navigate(item.id)} />
          ))}
        </nav>

        <button className="primary wide" type="button" disabled={!auth.permissions.canManagePayroll} onClick={() => navigate('payroll')}>
          <Plus size={20} />
          Initiate Payroll
        </button>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button className="menu-button icon-button" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <label className="global-search">
            <Search size={22} />
            <input placeholder="Search records, employees, transactions..." />
          </label>
          <button className="ghost org-switch" type="button" onClick={() => setView('settings')}>
            <BriefcaseBusiness size={18} />
            Org Switcher
          </button>
          <button className="icon-button notify" type="button" onClick={() => setView('notifications')} aria-label="Notifications">
            <Bell size={21} />
          </button>
          <button className="profile-chip" type="button" onClick={() => setView('profile')}>
            <span>
              <strong>{auth.userName}</strong>
              <small>
                {auth.role} - {data.syncState}
              </small>
            </span>
            <span className="avatar-fallback">{auth.userName.slice(0, 2).toUpperCase()}</span>
          </button>
        </header>

        <main className="content" aria-labelledby="page-title">
          <div className="page-heading">
            <div>
              <h2 id="page-title">{getPageTitle(view)}</h2>
              <p>{getPageSubtitle(view, data.syncState)}</p>
            </div>
            <div className="heading-actions">
              <button
                className="ghost"
                type="button"
                disabled={!auth.permissions.canExport}
                onClick={() => downloadCsv('autopay-export.csv', [...data.employees, ...data.payrollRunRows])}
              >
                <Download size={19} />
                Export Data
              </button>
              <button className="primary" type="button" disabled={!auth.permissions.canManagePayroll} onClick={() => setView('payroll')}>
                <CircleDollarSign size={20} />
                Initiate Payroll
              </button>
            </div>
          </div>

          {data.dataError && <StatusBanner tone="warning" title="Supabase data warning" copy={`${data.dataError} Live records could not be loaded.`} />}
          {data.dataMessage && <StatusBanner title="Saved" copy={data.dataMessage} />}
          {data.isDataLoading && <StatusBanner title="Loading Supabase data" copy="Fetching protected operations records with the active session token." />}

          {children}
        </main>
      </div>

      <nav className="mobile-tabbar" aria-label="Mobile primary">
        {primaryNav.slice(0, 5).map((item) => {
          const Icon = item.icon
          return (
            <button className={view === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => setView(item.id)}>
              <Icon size={21} />
              <span>{item.label.replace('Employee Directory', 'People').replace('Payroll Runs', 'Payroll')}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
