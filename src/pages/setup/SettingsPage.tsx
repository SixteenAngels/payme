import { Check, ClipboardList, Home, Landmark, Settings, ShieldCheck, type IconComponent } from '../../components/icons'
import { ActionCard, RecordRow, SummaryLine } from '../../components/ui'
import type { OnboardingInput } from '../../hooks/useAutoPayData'
import type { Row, SetView, View } from '../../types'
import { OnboardingPanel } from './OnboardingPanel'
import { RoleManagement } from './RoleManagement'

export function SettingsPage({
  auditRows,
  isSupabaseConfigured,
  role,
  canManage,
  onboarding,
  saveOnboarding,
  setView,
  teamRows,
  inviteTeamMember,
  syncState,
}: {
  auditRows: Row[]
  isSupabaseConfigured: boolean
  role: string
  canManage: boolean
  onboarding: OnboardingInput
  saveOnboarding: (input: OnboardingInput) => Promise<void>
  setView: SetView
  teamRows: Row[]
  inviteTeamMember: (email: string, role: string) => Promise<void>
  syncState: string
}) {
  const launchPages: Array<{ id: View; title: string; copy: string; icon: IconComponent }> = [
    { id: 'onboarding', title: 'Organization Setup', copy: 'Country, currency, cadence, and approval policy.', icon: Settings },
    { id: 'team', title: 'Team & Roles', copy: 'Invite owners, admins, approvers, and viewers.', icon: ShieldCheck },
    { id: 'integrations', title: 'Integrations', copy: 'Connect Supabase, payout providers, messaging, and webhooks.', icon: Landmark },
    { id: 'tax', title: 'Tax Filing Center', copy: 'Prepare statutory filing packs by jurisdiction.', icon: ClipboardList },
    { id: 'reconciliation', title: 'Reconciliation', copy: 'Match provider settlements to payroll runs.', icon: Check },
    { id: 'self-service', title: 'Employee Self-Service', copy: 'Payslips, wallet, advances, and obligations.', icon: Home },
  ]

  return (
    <div className="settings-grid">
      <section className="panel launch-hub">
        <header><h3>Production Pages</h3><span>Dedicated workflows</span></header>
        <div className="launch-grid">
          {launchPages.map((page) => <ActionCard key={page.id} {...page} onClick={() => setView(page.id)} />)}
        </div>
      </section>
      <OnboardingPanel canManage={canManage} onboarding={onboarding} saveOnboarding={saveOnboarding} />
      <RoleManagement canManage={canManage} inviteTeamMember={inviteTeamMember} rows={teamRows} />
      <ObservabilityPanel auditRows={auditRows} isSupabaseConfigured={isSupabaseConfigured} role={role} syncState={syncState} />
    </div>
  )
}

function ObservabilityPanel({ auditRows, isSupabaseConfigured, syncState, role }: { auditRows: Row[]; isSupabaseConfigured: boolean; syncState: string; role: string }) {
  const checks = [
    ['Supabase REST', isSupabaseConfigured ? syncState : 'Missing env'],
    ['Current role', role],
    ['Error boundary', 'Active'],
    ['Audit trail', `${auditRows.length} events`],
    ['PWA smoke', 'Configured'],
  ]

  return (
    <section className="panel observability-panel">
      <header><h3>Production Observability</h3><span>Launch guardrails</span></header>
      <div className="ops-checks">
        {checks.map(([label, value]) => <SummaryLine key={label} label={label} value={value} tone={value === 'Missing env' ? 'red' : undefined} />)}
      </div>
      <div className="audit-preview">
        {auditRows.slice(0, 4).map((event, index) => <RecordRow key={`${String(event.action)}-${index}`} title={String(event.action)} meta={String(event.created_at ?? event.time ?? 'Recent')} value={String(event.entity_type ?? event.type ?? 'System')} status="Logged" />)}
      </div>
    </section>
  )
}
