import { RecordRow, SummaryLine } from '../../components/ui'
import type { Employee } from '../../lib/autopay-data'
import type { Row } from '../../types'
import { EmployeeWalletPage } from './EmployeeWalletPage'

export function EmployeeSelfServicePage({
  payslipRows,
  advanceRows,
  obligationRows,
  employee,
}: {
  payslipRows: Row[]
  advanceRows: Row[]
  obligationRows: Row[]
  employee?: Employee
}) {
  return (
    <div className="self-service-grid">
      <EmployeeWalletPage advanceRows={advanceRows} employee={employee} obligationRows={obligationRows} payslipRows={payslipRows} />
      <section className="panel portal-panel">
        <header><h3>Self-Service Records</h3><span>Employee-facing</span></header>
        <SummaryLine label="Payslips" value={payslipRows.length.toString()} />
        <SummaryLine label="Salary advances" value={advanceRows.length.toString()} />
        <SummaryLine label="Available services" value="Payslips, advances, wallet, obligations" />
        {payslipRows.slice(0, 3).map((row, index) => <RecordRow key={String(row.id ?? row.title ?? index)} title={String(row.title ?? row.period_label ?? 'Payslip')} meta={String(row.status ?? 'Published')} value={String(row.amount ?? 'Available')} status="Self-service" />)}
      </section>
    </div>
  )
}
