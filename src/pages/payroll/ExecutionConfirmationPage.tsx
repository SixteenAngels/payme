import { WorkflowPage } from '../../components/ui'

export function ExecutionConfirmationPage({ updatePayrollStatus, canApprove }: { updatePayrollStatus: (status: string) => Promise<void>; canApprove: boolean }) {
  return <WorkflowPage title="Execution / Payment Confirmation" steps={['Debit funding wallet', 'Dispatch bank transfers', 'Dispatch mobile money', 'Publish receipts']} action="Mark Complete" disabled={!canApprove} onAction={() => updatePayrollStatus('Paid')} />
}
