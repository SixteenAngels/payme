import type { View } from '../types'

export function getPageTitle(view: View) {
  const titles: Record<View, string> = {
    dashboard: 'Dashboard',
    employees: 'Employee Directory',
    'employee-detail': 'Employee Detail',
    'employee-form': 'Employee Form',
    payroll: 'Payroll Runs',
    'payroll-detail': 'Payroll Verification',
    approval: 'Approval Workflow',
    execute: 'Execute Payroll',
    reports: 'Reports',
    automation: 'Automation Rules',
    bulk: 'Bulk Disbursement',
    vendors: 'Vendors & Contractors',
    bills: 'Bills & Subscriptions',
    advances: 'Salary Advances',
    payslips: 'Payslips',
    audit: 'Audit Logs',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    wallet: 'Employee Wallet',
    onboarding: 'Organization Onboarding',
    team: 'Team & Roles',
    integrations: 'Integrations',
    tax: 'Tax Filing Center',
    reconciliation: 'Reconciliation',
    'self-service': 'Employee Self-Service',
  }
  return titles[view]
}

export function getPageSubtitle(view: View, syncState: string) {
  if (view === 'employees') return 'Manage workforce records, wallet verification, and compensation profiles.'
  if (view === 'settings') return 'Configure organizations, security, integrations, and payroll policies.'
  if (view === 'wallet') return 'Employee-facing salary advance and payslip experience.'
  if (view === 'onboarding') return 'Set up the first organization, payroll policy, currency, and approval rules.'
  if (view === 'team') return 'Invite owners, admins, approvers, and viewers into the operations console.'
  if (view === 'integrations') return 'Manage Supabase, bank, mobile money, messaging, and webhook connections.'
  if (view === 'tax') return 'Prepare statutory filing packs from approved and paid payroll runs.'
  if (view === 'reconciliation') return 'Match payout batches against provider settlements and payroll runs.'
  if (view === 'self-service') return 'Employee-facing wallet, payslip, advance, and obligation portal.'
  return `Data state: ${syncState}`
}

export function pathToView(pathname: string): View {
  if (pathname.startsWith('/employees/new')) return 'employee-form'
  if (/^\/employees\/[^/]+\/edit$/.test(pathname)) return 'employee-form'
  if (pathname.startsWith('/employees/')) return 'employee-detail'
  if (pathname.startsWith('/employees')) return 'employees'
  if (pathname.startsWith('/payroll/approval')) return 'approval'
  if (pathname.startsWith('/payroll/execute')) return 'execute'
  if (pathname.startsWith('/payroll/')) return 'payroll-detail'
  if (pathname.startsWith('/payroll')) return 'payroll'
  if (pathname.startsWith('/reports')) return 'reports'
  if (pathname.startsWith('/automation')) return 'automation'
  if (pathname.startsWith('/bulk-disbursement')) return 'bulk'
  if (pathname.startsWith('/vendors')) return 'vendors'
  if (pathname.startsWith('/bills')) return 'bills'
  if (pathname.startsWith('/salary-advances')) return 'advances'
  if (pathname.startsWith('/payslips')) return 'payslips'
  if (pathname.startsWith('/audit-logs')) return 'audit'
  if (pathname.startsWith('/notifications')) return 'notifications'
  if (pathname.startsWith('/profile')) return 'profile'
  if (pathname.startsWith('/settings')) return 'settings'
  if (pathname.startsWith('/wallet')) return 'wallet'
  if (pathname.startsWith('/onboarding')) return 'onboarding'
  if (pathname.startsWith('/team')) return 'team'
  if (pathname.startsWith('/integrations')) return 'integrations'
  if (pathname.startsWith('/tax-filings')) return 'tax'
  if (pathname.startsWith('/reconciliation')) return 'reconciliation'
  if (pathname.startsWith('/self-service')) return 'self-service'
  return 'dashboard'
}

export function viewToPath(view: View, employeeId?: string) {
  const paths: Record<View, string> = {
    dashboard: '/',
    employees: '/employees',
    'employee-detail': `/employees/${employeeId || 'selected'}`,
    'employee-form': '/employees/new',
    payroll: '/payroll',
    'payroll-detail': '/payroll/current',
    approval: '/payroll/approval',
    execute: '/payroll/execute',
    reports: '/reports',
    automation: '/automation',
    bulk: '/bulk-disbursement',
    vendors: '/vendors',
    bills: '/bills',
    advances: '/salary-advances',
    payslips: '/payslips',
    audit: '/audit-logs',
    notifications: '/notifications',
    profile: '/profile',
    settings: '/settings',
    wallet: '/wallet',
    onboarding: '/onboarding',
    team: '/team',
    integrations: '/integrations',
    tax: '/tax-filings',
    reconciliation: '/reconciliation',
    'self-service': '/self-service',
  }
  return paths[view]
}

export function employeeIdFromPath(pathname: string) {
  const match = pathname.match(/^\/employees\/([^/]+)/)
  if (!match || match[1] === 'new') return ''
  return decodeURIComponent(match[1])
}
