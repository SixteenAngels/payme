import { useAutoPayData } from '../../hooks/useAutoPayData'
import type { Employee } from '../../lib/autopay-data'
import type { SetView } from '../../types'
import { ApprovalHistory, PayrollProgressSteps, PayrollSummaryPanel, PayrollTitleBar, RemunerationTable } from './PayrollDetailSections'

export function PayrollDetailPage({
  employees,
  payrollRun,
  setView,
  canApprove,
}: {
  employees: Employee[]
  payrollRun: ReturnType<typeof useAutoPayData>['payrollSummary']
  setView: SetView
  canApprove: boolean
}) {
  const isLocked = ['Executing', 'Paid'].includes(payrollRun.status)

  return (
    <div className="payroll-layout">
      <PayrollProgressSteps status={payrollRun.status} />
      <PayrollTitleBar canApprove={canApprove} isLocked={isLocked} payrollRun={payrollRun} setView={setView} />
      <RemunerationTable employees={employees} isLocked={isLocked} />
      <PayrollSummaryPanel canApprove={canApprove} isLocked={isLocked} payrollRun={payrollRun} setView={setView} />
      <ApprovalHistory payrollRun={payrollRun} />
    </div>
  )
}
