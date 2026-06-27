import { Activity, Check, Landmark, WalletCards } from '../../components/icons'
import { RecordRow, SummaryStat } from '../../components/ui'
import { formatDisplayMoney } from '../../lib/format'
import type { Row } from '../../types'

export function ReconciliationPage({ payrollRunRows }: { payrollRunRows: Row[] }) {
  const rows = payrollRunRows.map((run, index) => ({
    title: String(run.title ?? run.name ?? `Payroll run ${index + 1}`),
    expected: formatDisplayMoney(run.net_amount ?? run.gross_amount ?? run.amount),
    status: String(run.status).toLowerCase() === 'paid' ? 'Matched' : 'Open',
    provider: 'Moolre',
  }))

  return (
    <div className="reports-grid">
      <SummaryStat icon={WalletCards} label="Batches" value={rows.length.toString()} />
      <SummaryStat icon={Check} label="Matched" value={rows.filter((row) => row.status === 'Matched').length.toString()} />
      <SummaryStat icon={Activity} label="Open" value={rows.filter((row) => row.status === 'Open').length.toString()} />
      <SummaryStat icon={Landmark} label="Provider" value="Moolre" />
      <section className="panel report-panel">
        <header>
          <h3>Provider Settlement Matching</h3>
          <span>Payroll to payout ledger</span>
        </header>
        {rows.map((row) => (
          <RecordRow key={row.title} title={row.title} meta={row.provider} value={row.expected} status={row.status} actionLabel="Review" />
        ))}
      </section>
    </div>
  )
}
