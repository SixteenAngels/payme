import { Check, CircleDollarSign, ClipboardList, Download, FileText } from '../../components/icons'
import { RecordRow, SummaryStat } from '../../components/ui'
import { formatDisplayMoney, getDisplayNumber } from '../../lib/format'
import type { Row } from '../../types'

export function TaxFilingCenterPage({ payrollRunRows, canExport }: { payrollRunRows: Row[]; canExport: boolean }) {
  const paidRuns = payrollRunRows.filter((row) => String(row.status).toLowerCase() === 'paid')
  const estimatedTax = paidRuns.reduce((total, row) => total + Math.round(getDisplayNumber(row.net_amount ?? row.amount) * 0.075), 0)
  const jurisdictions = ['Nigeria PAYE', 'Ghana PAYE', 'Kenya PAYE', 'South Africa PAYE']

  return (
    <div className="reports-grid">
      <SummaryStat icon={ClipboardList} label="Paid Runs" value={paidRuns.length.toString()} />
      <SummaryStat icon={CircleDollarSign} label="Est. Tax" value={formatDisplayMoney(estimatedTax)} />
      <SummaryStat icon={FileText} label="Filings" value={jurisdictions.length.toString()} />
      <SummaryStat icon={Check} label="Ready" value={paidRuns.length ? 'Yes' : 'No'} />
      <section className="panel report-panel">
        <header><h3>Jurisdiction Filing Queue</h3><button className="primary" type="button" disabled={!canExport}><Download size={18} /> Export Filing Pack</button></header>
        {jurisdictions.map((jurisdiction, index) => <RecordRow key={jurisdiction} title={jurisdiction} meta={`${paidRuns.length} paid runs included`} value={index === 0 ? formatDisplayMoney(estimatedTax) : 'Pending'} status={paidRuns.length ? 'Ready' : 'Waiting'} />)}
      </section>
    </div>
  )
}
