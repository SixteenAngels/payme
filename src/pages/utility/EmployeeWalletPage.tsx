import { ChevronRight, Download, FileText, Home, ShieldCheck } from '../../components/icons'
import { EmptyState } from '../../components/ui'
import type { Employee } from '../../lib/autopay-data'
import type { Row } from '../../types'

export function EmployeeWalletPage({
  employee,
  payslipRows,
  advanceRows,
  obligationRows,
}: {
  employee?: Employee
  payslipRows: Row[]
  advanceRows: Row[]
  obligationRows: Row[]
}) {
  const firstAdvance = advanceRows[0]
  const hasWalletData = Boolean(employee || payslipRows.length || advanceRows.length || obligationRows.length)

  if (!hasWalletData) {
    return (
      <div className="mobile-wallet">
        <section className="wallet-section">
          <EmptyState title="No wallet records yet" copy="Employee wallet details will appear after employees, payslips, advances, or obligations are synced." />
        </section>
      </div>
    )
  }

  return (
    <div className="mobile-wallet">
      <section className="wallet-hero">
        <div>
          <h2>{employee ? `Hi, ${employee.name.split(' ')[0]}` : 'Employee wallet'}</h2>
          <p>{employee?.employeeCode ?? 'Payroll profile'}</p>
        </div>
        {employee?.avatarUrl && <img src={employee.avatarUrl} alt="" />}
        <div className="earnings-card">
          <span>Current Salary</span>
          <strong>{employee?.salary || 'Not set'}</strong>
          <div className="progress-label"><span>Status: {employee?.status ?? 'Pending'}</span><i /></div>
          <hr />
          <span>Available Advance</span>
          <strong>{String(firstAdvance?.amount ?? 'Not requested')}</strong>
        </div>
      </section>
      <button className="advance-button" type="button">
        Request Salary Advance <ChevronRight size={32} />
      </button>
      <section className="wallet-section">
        <header><h3>Recent Payslips</h3><button type="button">See All</button></header>
        {payslipRows.length ? (
          payslipRows.slice(0, 2).map((payslip, index) => (
            <article className="payslip" key={String(payslip.id ?? payslip.title ?? payslip.period_label ?? index)}>
              <FileText size={28} />
              <div>
                <strong>{String(payslip.title ?? payslip.period_label ?? 'Payslip')}</strong>
                <span>{String(payslip.amount ?? payslip.status ?? 'Available')}</span>
              </div>
              <Download size={24} />
            </article>
          ))
        ) : (
          <EmptyState title="No payslips" copy="Published payslips will appear here." />
        )}
      </section>
      <section className="obligations">
        <header><h3>Upcoming Obligations</h3><span>Managed</span></header>
        {obligationRows.length ? (
          obligationRows.slice(0, 2).map((obligation, index) => (
            <article key={String(obligation.id ?? obligation.title ?? index)}>
              {index === 0 ? <Home /> : <ShieldCheck />}
              <span>{String(obligation.title ?? 'Obligation')}</span>
              <strong>{String(obligation.amount ?? 'Pending')}</strong>
              <small>{String(obligation.next_due_date ?? obligation.status ?? '')}</small>
            </article>
          ))
        ) : (
          <EmptyState title="No obligations" copy="Recurring employee obligations will appear here." />
        )}
      </section>
    </div>
  )
}
