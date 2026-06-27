import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  type IconComponent,
} from '../components/icons'
import type { View } from '../types'

export const primaryNav: Array<{ id: View; label: string; icon: IconComponent }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employee Directory', icon: Users },
  { id: 'payroll', label: 'Payroll Runs', icon: WalletCards },
  { id: 'reports', label: 'Reports', icon: ClipboardList },
  { id: 'automation', label: 'Automation', icon: Sparkles },
  { id: 'team', label: 'Team & Roles', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export const quickModules: Array<{ id: View; title: string; copy: string; icon: IconComponent }> = [
  { id: 'bulk', title: 'Bulk Disbursement', copy: 'Upload, validate, and stage thousands of payouts.', icon: Users },
  { id: 'vendors', title: 'Vendors & Contractors', copy: 'Manage recurring suppliers and contract payments.', icon: BriefcaseBusiness },
  { id: 'bills', title: 'Bills & Subscriptions', copy: 'Track rent, utilities, insurance, and services.', icon: CalendarDays },
  { id: 'advances', title: 'Salary Advances', copy: 'Review requests against accrued earnings.', icon: CircleDollarSign },
  { id: 'payslips', title: 'Payslips', copy: 'Publish and download employee payslips.', icon: FileText },
  { id: 'audit', title: 'Audit Logs', copy: 'Review every sensitive payroll action.', icon: ShieldCheck },
  { id: 'onboarding', title: 'Org Setup', copy: 'Country, currency, cadence, and approval rules.', icon: Settings },
  { id: 'integrations', title: 'Integrations', copy: 'Bank, mobile money, email, SMS, and webhooks.', icon: Landmark },
  { id: 'tax', title: 'Tax Filing Center', copy: 'PAYE and statutory filing readiness by jurisdiction.', icon: ClipboardList },
  { id: 'reconciliation', title: 'Reconciliation', copy: 'Match payroll runs to provider settlement batches.', icon: Check },
  { id: 'self-service', title: 'Employee Portal', copy: 'Mobile payslips, advances, wallet, and obligations.', icon: Home },
]

export const operationsNav: Array<{ id: View; label: string; icon: IconComponent }> = [
  { id: 'onboarding', label: 'Org Setup', icon: Settings },
  { id: 'integrations', label: 'Integrations', icon: Landmark },
  { id: 'tax', label: 'Tax Filing', icon: ClipboardList },
  { id: 'reconciliation', label: 'Reconciliation', icon: Check },
  { id: 'self-service', label: 'Self-Service', icon: Home },
]
