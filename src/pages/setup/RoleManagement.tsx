import { useState } from 'react'
import { Plus } from '../../components/icons'
import { RecordRow } from '../../components/ui'
import type { Row } from '../../types'

export function RoleManagement({ rows, inviteTeamMember, canManage }: { rows: Row[]; inviteTeamMember: (email: string, role: string) => Promise<void>; canManage: boolean }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')

  return (
    <section className="panel role-panel">
      <header><h3>Role Management</h3><span>Owner, admin, approver, viewer</span></header>
      <div className="inline-form">
        <input type="email" placeholder="teammate@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <select value={role} onChange={(event) => setRole(event.target.value)}><option>owner</option><option>admin</option><option>approver</option><option>viewer</option></select>
        <button className="primary" type="button" disabled={!canManage || !email} onClick={() => inviteTeamMember(email, role).then(() => setEmail(''))}><Plus size={18} /> Invite</button>
      </div>
      {rows.map((member, index) => <RecordRow key={String(member.id ?? member.email ?? index)} title={String(member.email ?? member.user_id ?? `Member ${index + 1}`)} meta={`Added ${String(member.created_at ?? 'recently')}`} value={String(member.role ?? 'viewer')} status={String(member.status ?? 'Active')} />)}
    </section>
  )
}
