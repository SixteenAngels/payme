import { WorkflowPage } from '../../components/ui'

export function BulkDisbursementPage() {
  return <WorkflowPage title="Bulk Disbursement Engine" steps={['Upload CSV', 'Validate recipients', 'Run duplicate checks', 'Submit for approval']} action="Stage Batch" />
}
