import { RecordRow } from '../../components/ui'
import type { Row } from '../../types'

export function SalaryAdvancesPage({ rows, approveAdvance, canApprove }: { rows: Row[]; approveAdvance: (index: number) => Promise<void>; canApprove: boolean }) {
  return <section className="panel"><header><h3>Salary Advance Requests</h3><button className="ghost" type="button">Policy Settings</button></header>{rows.map((request, index) => <RecordRow key={String(request.employee ?? request.id ?? index)} title={String(request.employee ?? request.id ?? 'Advance request')} meta={`Risk: ${String(request.risk ?? 'Pending')}`} value={String(request.amount)} status={String(request.status)} actionLabel="Approve" disabled={!canApprove} onClick={() => approveAdvance(index)} />)}</section>
}
