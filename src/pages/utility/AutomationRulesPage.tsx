import { ModuleGrid } from '../../components/ui'

export function AutomationRulesPage() {
  return <ModuleGrid modules={[['Recurring Payroll', 'Monthly full organization run.'], ['Auto Reconciliation', 'Match provider callbacks to ledger entries.'], ['Tax Filing', 'Prepare PAYE packages by jurisdiction.'], ['Notifications', 'Email and SMS reminders before payout.']]} />
}
