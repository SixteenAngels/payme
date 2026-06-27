import { WorkflowPage } from '../../components/ui'
import type { SetView } from '../../types'

export function ApprovalWorkflowPage({ setView, updatePayrollStatus, canApprove }: { setView: SetView; updatePayrollStatus: (status: string) => Promise<void>; canApprove: boolean }) {
  return <WorkflowPage title="Payroll Approval Workflow" steps={['Finance review', 'HR confirmation', 'Executive approval', 'Treasury release']} action="Execute Payroll" disabled={!canApprove} onAction={() => updatePayrollStatus('Executing').then(() => setView('execute'))} />
}
