import { Check, Filter, Users } from '../../components/icons'
import { RecordRow, SummaryLine } from '../../components/ui'
import { useAutoPayData } from '../../hooks/useAutoPayData'
import type { Employee } from '../../lib/autopay-data'
import type { SetView } from '../../types'

type PayrollSummary = ReturnType<typeof useAutoPayData>['payrollSummary']

export function PayrollProgressSteps({ status }: { status: string }) {
  const statusOrder = ['Draft', 'Verification', 'Approval', 'Executing', 'Paid']
  const statusIndex = Math.max(statusOrder.indexOf(status), 0)

  return (
    <section className="steps">
      {statusOrder.map((step, index) => (
        <div className={`step ${index < statusIndex ? 'done' : index === statusIndex ? 'current' : ''}`} key={step}>
          <span>{index < statusIndex ? <Check size={20} /> : index + 1}</span>
          <strong>{step}</strong>
        </div>
      ))}
    </section>
  )
}

export function PayrollTitleBar({ payrollRun, isLocked, canApprove, setView }: { payrollRun: PayrollSummary; isLocked: boolean; canApprove: boolean; setView: SetView }) {
  return (
    <section className="payroll-title">
      <div>
        <h3>{payrollRun.title}</h3>
        <p>
          <Users size={18} /> Total Employees: {payrollRun.totalEmployees} <span className="pill info">{payrollRun.status}</span>
        </p>
      </div>
      <div>
        <button className="ghost" type="button" disabled={isLocked}>
          Save Draft
        </button>
        <button className="primary" type="button" disabled={!canApprove || isLocked} onClick={() => setView('approval')}>
          Proceed to Approval
        </button>
      </div>
    </section>
  )
}

export function RemunerationTable({ employees, isLocked }: { employees: Employee[]; isLocked: boolean }) {
  return (
    <section className="panel remuneration">
      <header>
        <h3>Employee Remuneration Details</h3>
        <button className="ghost" type="button">
          <Filter size={17} /> Filter
        </button>
      </header>
      <div className="rem-head">
        <span>Employee</span>
        <span>Phone / Wallet</span>
        <span>Base Salary</span>
        <span>Bonus</span>
        <span>Deduction</span>
      </div>
      {employees.map((employee) => (
        <div className="rem-row" key={employee.id}>
          <div className="employee-cell">
            <span className="avatar-fallback">{employee.initials}</span>
            <div>
              <strong>{employee.name}</strong>
              <small>{employee.status}</small>
            </div>
          </div>
          <span>{employee.phone}</span>
          <strong>{employee.salary}</strong>
          <input aria-label={`${employee.name} bonus`} defaultValue="0" disabled={isLocked} />
          <input aria-label={`${employee.name} deduction`} defaultValue="0" disabled={isLocked} />
        </div>
      ))}
    </section>
  )
}

export function PayrollSummaryPanel({ payrollRun, isLocked, canApprove, setView }: { payrollRun: PayrollSummary; isLocked: boolean; canApprove: boolean; setView: SetView }) {
  return (
    <aside className="panel payroll-summary">
      <h3>Payroll Summary</h3>
      <SummaryLine label="Gross Pay" value={payrollRun.grossPay} />
      <SummaryLine label="Total Bonuses" value={payrollRun.bonuses} tone="blue" />
      <SummaryLine label="Total Deductions" value={payrollRun.deductions} tone="red" />
      <SummaryLine label="Statutory Taxes" value={payrollRun.taxes} />
      <SummaryLine label="Disbursement Fees" value={payrollRun.fees} />
      <SummaryLine
        label={`Platform Fee ${payrollRun.platformFeeRate}`}
        value={payrollRun.platformFeeExempt ? 'Exempt' : payrollRun.platformFee}
        tone={payrollRun.platformFeeExempt ? 'blue' : undefined}
      />
      <div className="net-total">
        <span>Total Debit</span>
        <strong>{payrollRun.totalDebit}</strong>
      </div>
      <SummaryLine label="Employee Disbursement" value={payrollRun.net} />
      <button className="dark wide sticky-action" type="button" disabled={!canApprove || isLocked} onClick={() => setView('approval')}>
        {isLocked ? 'Locked' : 'Approve Payroll'}
      </button>
      <p>Funds are released only after final execution.</p>
    </aside>
  )
}

export function ApprovalHistory({ payrollRun }: { payrollRun: PayrollSummary }) {
  const statusOrder = ['Draft', 'Verification', 'Approval', 'Executing', 'Paid']
  const statusIndex = Math.max(statusOrder.indexOf(payrollRun.status), 0)

  return (
    <section className="panel approval-history">
      <header>
        <h3>Approval History</h3>
        <span>Workflow status</span>
      </header>
      {statusOrder.map((step, index) => (
        <RecordRow
          key={step}
          title={step}
          meta={`Stage ${index + 1}`}
          value={index < statusIndex ? 'Complete' : index === statusIndex ? 'Current' : 'Pending'}
          status={index < statusIndex ? 'Logged' : index === statusIndex ? 'Active' : 'Open'}
        />
      ))}
    </section>
  )
}
