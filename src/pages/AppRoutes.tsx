import { DirectoryPage } from '../components/ui'
import type { useAuth } from '../hooks/useAuth'
import type { useAutoPayData } from '../hooks/useAutoPayData'
import type { SetView, View } from '../types'
import { DashboardPage } from './DashboardPage'
import { EmployeeDetailPage } from './employees/EmployeeDetailPage'
import { EmployeeFormPage } from './employees/EmployeeFormPage'
import { EmployeesPage } from './employees/EmployeesPage'
import { ApprovalWorkflowPage } from './payroll/ApprovalWorkflowPage'
import { ExecutionConfirmationPage } from './payroll/ExecutionConfirmationPage'
import { PayrollDetailPage } from './payroll/PayrollDetailPage'
import { PayrollRunsPage } from './payroll/PayrollRunsPage'
import { ReconciliationPage } from './reports/ReconciliationPage'
import { ReportsPage } from './reports/ReportsPage'
import { TaxFilingCenterPage } from './reports/TaxFilingCenterPage'
import { IntegrationsPage } from './setup/IntegrationsPage'
import { OnboardingPage } from './setup/OnboardingPage'
import { SettingsPage } from './setup/SettingsPage'
import { TeamPage } from './setup/TeamPage'
import { AuditLogsPage } from './utility/AuditLogsPage'
import { AutomationRulesPage } from './utility/AutomationRulesPage'
import { BulkDisbursementPage } from './utility/BulkDisbursementPage'
import { EmployeeSelfServicePage } from './utility/EmployeeSelfServicePage'
import { EmployeeWalletPage } from './utility/EmployeeWalletPage'
import { NotificationsPage } from './utility/NotificationsPage'
import { PayslipsPage } from './utility/PayslipsPage'
import { ProfilePage } from './utility/ProfilePage'
import { SalaryAdvancesPage } from './utility/SalaryAdvancesPage'

type AppRoutesProps = {
  auth: ReturnType<typeof useAuth>
  data: ReturnType<typeof useAutoPayData>
  view: View
  selectedEmployeeId: string
  formEmployeeId: string
  setView: SetView
  openEmployee: (employeeId: string) => void
  openEmployeeForm: (employeeId?: string) => void
}

export function AppRoutes({
  auth,
  data,
  view,
  selectedEmployeeId,
  formEmployeeId,
  setView,
  openEmployee,
  openEmployeeForm,
}: AppRoutesProps) {
  const selectedEmployee = data.employees.find((employee) => employee.id === selectedEmployeeId) ?? data.employees[0]
  const formEmployee = data.employees.find((employee) => employee.id === formEmployeeId)

  switch (view) {
    case 'dashboard':
      return <DashboardPage metrics={data.dashboardMetrics} payrollRunRows={data.payrollRunRows} setView={setView} />
    case 'employees':
      return <EmployeesPage canManage={auth.permissions.canManageEmployees} employees={data.employees} importEmployeesFromCsv={data.importEmployeesFromCsv} openEmployee={openEmployee} openEmployeeForm={openEmployeeForm} />
    case 'employee-detail':
      return selectedEmployee ? <EmployeeDetailPage employee={selectedEmployee} openEmployeeForm={openEmployeeForm} /> : null
    case 'employee-form':
      return <EmployeeFormPage employee={formEmployee} saveEmployee={data.saveEmployee} setView={setView} />
    case 'payroll':
      return <PayrollRunsPage canManage={auth.permissions.canManagePayroll} rows={data.payrollRunRows} setView={setView} />
    case 'payroll-detail':
      return <PayrollDetailPage canApprove={auth.permissions.canApprovePayroll} employees={data.employees} payrollRun={data.payrollSummary} setView={setView} />
    case 'approval':
      return <ApprovalWorkflowPage canApprove={auth.permissions.canApprovePayroll} setView={setView} updatePayrollStatus={data.updatePayrollStatus} />
    case 'execute':
      return <ExecutionConfirmationPage canApprove={auth.permissions.canApprovePayroll} updatePayrollStatus={data.updatePayrollStatus} />
    case 'reports':
      return <ReportsPage canExport={auth.permissions.canExport} employees={data.employees} payrollRunRows={data.payrollRunRows} payslipRows={data.payslipRows} advanceRows={data.advanceRows} />
    case 'automation':
      return <AutomationRulesPage />
    case 'bulk':
      return <BulkDisbursementPage />
    case 'vendors':
      return <DirectoryPage canManage={auth.permissions.canManageSettings} onAdd={data.addVendor} rows={data.vendorRows.map((row) => String(row.name))} title="Vendors & Contractors" />
    case 'bills':
      return <DirectoryPage canManage={auth.permissions.canManageSettings} onAdd={data.addObligation} rows={data.obligationRows.map((row) => String(row.title))} title="Bills & Subscriptions" />
    case 'advances':
      return <SalaryAdvancesPage approveAdvance={data.approveAdvance} canApprove={auth.permissions.canApprovePayroll} rows={data.advanceRows} />
    case 'payslips':
      return <PayslipsPage rows={data.payslipRows} />
    case 'audit':
      return <AuditLogsPage rows={data.auditRows} />
    case 'notifications':
      return <NotificationsPage rows={data.notificationRows} />
    case 'profile':
      return <ProfilePage email={auth.session?.user.email ?? ''} logout={auth.logout} role={auth.role} setView={setView} userName={auth.userName} />
    case 'settings':
      return <SettingsPage auditRows={data.auditRows} canManage={auth.permissions.canManageSettings} inviteTeamMember={data.inviteTeamMember} isSupabaseConfigured={auth.isSupabaseConfigured} onboarding={data.onboarding} role={auth.role} saveOnboarding={data.saveOnboarding} setView={setView} syncState={data.syncState} teamRows={data.teamRows} />
    case 'onboarding':
      return <OnboardingPage canManage={auth.permissions.canManageSettings} onboarding={data.onboarding} saveOnboarding={data.saveOnboarding} />
    case 'team':
      return <TeamPage canManage={auth.permissions.canManageSettings} inviteTeamMember={data.inviteTeamMember} rows={data.teamRows} />
    case 'integrations':
      return <IntegrationsPage isSupabaseConfigured={auth.isSupabaseConfigured} syncState={data.syncState} />
    case 'tax':
      return <TaxFilingCenterPage canExport={auth.permissions.canExport} payrollRunRows={data.payrollRunRows} />
    case 'reconciliation':
      return <ReconciliationPage payrollRunRows={data.payrollRunRows} />
    case 'self-service':
      return <EmployeeSelfServicePage advanceRows={data.advanceRows} employee={data.employees[0]} obligationRows={data.obligationRows} payslipRows={data.payslipRows} />
    case 'wallet':
      return <EmployeeWalletPage advanceRows={data.advanceRows} employee={data.employees[0]} obligationRows={data.obligationRows} payslipRows={data.payslipRows} />
    default:
      return null
  }
}
