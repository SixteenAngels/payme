import { Check, CircleDollarSign, Download, FileText, WalletCards } from '../../components/icons'
import { RecordRow, SummaryStat } from '../../components/ui'
import type { Employee } from '../../lib/autopay-data'
import { downloadCsv, formatDisplayMoney, getDisplayNumber } from '../../lib/format'
import type { Row } from '../../types'

export function ReportsPage({ employees, payrollRunRows, payslipRows, advanceRows, canExport }: { employees: Employee[]; payrollRunRows: Row[]; payslipRows: Row[]; advanceRows: Row[]; canExport: boolean }) {
  const grossTotal = payrollRunRows.reduce((total, row) => total + getDisplayNumber(row.gross_amount ?? row.amount), 0)
  const paidRuns = payrollRunRows.filter((row) => String(row.status).toLowerCase() === 'paid').length

  return (
    <div className="reports-grid">
      <SummaryStat icon={WalletCards} label="Payroll Total" value={formatDisplayMoney(grossTotal)} />
      <SummaryStat icon={FileText} label="Payslips" value={payslipRows.length.toString()} />
      <SummaryStat icon={CircleDollarSign} label="Advances" value={advanceRows.length.toString()} />
      <SummaryStat icon={Check} label="Paid Runs" value={paidRuns.toString()} />
      <section className="panel report-panel">
        <header><h3>Report Center</h3><button className="primary" type="button" disabled={!canExport} onClick={() => downloadCsv('autopay-export.csv', [...employees, ...payrollRunRows, ...payslipRows, ...advanceRows])}><Download size={18} /> Export CSV</button></header>
        {[
          ['Payroll Summary', `${payrollRunRows.length} payroll runs across ${employees.length} employees.`],
          ['Tax Filings', 'PAYE and statutory packages are generated from paid payroll runs.'],
          ['Reconciliation', `${paidRuns} paid runs ready for bank and mobile money settlement review.`],
          ['Payslip Archive', `${payslipRows.length} employee payslip records available.`],
        ].map(([title, copy]) => <RecordRow key={title} title={title} meta={copy} value="Ready" status="Report" />)}
      </section>
    </div>
  )
}
