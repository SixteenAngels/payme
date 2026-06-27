import { Bell, Check, ShieldCheck, Users } from '../../components/icons'
import { SummaryStat } from '../../components/ui'
import type { Row } from '../../types'
import { RoleManagement } from './RoleManagement'

export function TeamPage({ rows, inviteTeamMember, canManage }: { rows: Row[]; inviteTeamMember: (email: string, role: string) => Promise<void>; canManage: boolean }) {
  const owners = rows.filter((row) => String(row.role) === 'owner').length
  const approvers = rows.filter((row) => String(row.role) === 'approver').length

  return (
    <div className="reports-grid">
      <SummaryStat icon={ShieldCheck} label="Owners" value={owners.toString()} />
      <SummaryStat icon={Users} label="Members" value={rows.length.toString()} />
      <SummaryStat icon={Check} label="Approvers" value={approvers.toString()} />
      <SummaryStat icon={Bell} label="Pending" value={rows.filter((row) => String(row.status).toLowerCase() === 'invited').length.toString()} />
      <RoleManagement canManage={canManage} inviteTeamMember={inviteTeamMember} rows={rows} />
    </div>
  )
}
