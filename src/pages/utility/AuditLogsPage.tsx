import { RecordRow } from '../../components/ui'
import type { Row } from '../../types'

export function AuditLogsPage({ rows }: { rows: Row[] }) {
  return <section className="panel"><header><h3>Audit Logs</h3><span>Immutable activity trail</span></header>{rows.map((event, index) => <RecordRow key={`${String(event.actor ?? event.id ?? index)}-${String(event.time ?? event.created_at ?? '')}`} title={String(event.action)} meta={`${String(event.actor ?? 'System')} - ${String(event.time ?? event.created_at ?? '')}`} value={String(event.type ?? event.entity_type)} status="Logged" />)}</section>
}
