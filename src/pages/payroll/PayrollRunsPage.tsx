import { Plus } from '../../components/icons'
import { RecordRow } from '../../components/ui'
import type { Row, SetView } from '../../types'

export function PayrollRunsPage({ rows, setView, canManage }: { rows: Row[]; setView: SetView; canManage: boolean }) {
  return <div className="employee-view"><section className="filter-strip"><button className="primary" type="button" disabled={!canManage} onClick={() => setView('payroll-detail')}><Plus size={18} /> New Run</button><button className="ghost" type="button" disabled={!canManage}>Import Adjustments</button><button className="ghost" type="button">Validate Wallets</button></section><section className="panel"><header><h3>Payroll Run List</h3><span>{rows.length} runs</span></header>{rows.map((run, index) => <RecordRow key={String(run.id ?? run.name ?? index)} title={String(run.name ?? run.title)} meta={`${String(run.period ?? 'Current period')} - ${String(run.employees ?? 'Pending')} employees`} value={String(run.amount ?? run.net_amount ?? run.gross_amount ?? 'Pending')} status={String(run.status)} onClick={() => setView('payroll-detail')} />)}</section></div>
}
