import { useEffect, useState } from 'react'
import {
  type Employee,
} from '../lib/autopay-data'
import { insertIntoSupabase, invokeSupabaseFunction, isSupabaseConfigured, selectFromSupabase, updateSupabase } from '../lib/supabase'

type SupabaseEmployee = {
  id: string
  full_name: string
  employee_code: string
  role: string
  department: string
  payment_method: Employee['paymentMethod']
  salary_structure: string
  status: Employee['status']
  phone: string
  salary_display: string
  avatar_url: string
}

export type OperationRecord = Record<string, string | number | boolean | null | undefined>

export type OnboardingInput = {
  organizationName: string
  country: string
  currency: string
  payrollCadence: string
  approvalThreshold: string
  platformFeeRate: string
  platformFeeExempt: boolean
}

export type EmployeeInput = {
  name: string
  role: string
  department: string
  paymentMethod: Employee['paymentMethod']
  salaryStructure: string
  status: Employee['status']
  phone: string
  salary: string
  avatarUrl: string
}

export function useAutoPayData(accessToken?: string, userId?: string) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollRunRows, setPayrollRunRows] = useState<OperationRecord[]>([])
  const [vendorRows, setVendorRows] = useState<OperationRecord[]>([])
  const [obligationRows, setObligationRows] = useState<OperationRecord[]>([])
  const [advanceRows, setAdvanceRows] = useState<OperationRecord[]>([])
  const [payslipRows, setPayslipRows] = useState<OperationRecord[]>([])
  const [auditRows, setAuditRows] = useState<OperationRecord[]>([])
  const [notificationRows, setNotificationRows] = useState<OperationRecord[]>([])
  const [teamRows, setTeamRows] = useState<OperationRecord[]>([])
  const [onboarding, setOnboarding] = useState<OnboardingInput>({
    organizationName: '',
    country: '',
    currency: '',
    payrollCadence: 'Monthly',
    approvalThreshold: '0',
    platformFeeRate: '1',
    platformFeeExempt: false,
  })
  const [dataError, setDataError] = useState('')
  const [dataMessage, setDataMessage] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(Boolean(accessToken && isSupabaseConfigured))
  const [syncState, setSyncState] = useState(isSupabaseConfigured ? 'Syncing' : 'Setup Required')
  const [organizationId, setOrganizationId] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadEmployees() {
      if (!isSupabaseConfigured) return
      if (!accessToken) {
        setSyncState('Auth Required')
        return
      }

      const memberships = await selectFromSupabase<OperationRecord>(
        'organization_members',
        'select=organization_id,role,created_at,user_id&limit=20',
        accessToken,
      )
      const discoveredOrganizationId = String(memberships.data?.[0]?.organization_id ?? '')
      if (discoveredOrganizationId) setOrganizationId(discoveredOrganizationId)

      const { data, error } = await selectFromSupabase<SupabaseEmployee>(
        'employees',
        'select=id,full_name,employee_code,role,department,payment_method,salary_structure,status,phone,salary_display,avatar_url&limit=5',
        accessToken,
      )

      if (!mounted) return
      setIsDataLoading(false)

      if (error) {
        setDataError(error.message)
        setSyncState(discoveredOrganizationId ? 'Needs Data' : 'Needs Onboarding')
      } else if (data?.length) {
        setEmployees(data.map(mapSupabaseEmployee))
        setSyncState('Active')
      } else {
        setSyncState(discoveredOrganizationId ? 'Needs Data' : 'Needs Onboarding')
      }

      const [organizations, policies, runs, loadedVendors, obligations, advances, loadedPayslips, logs, loadedNotifications, invites] = await Promise.all([
        discoveredOrganizationId
          ? selectFromSupabase<OperationRecord>('organizations', `select=id,name,country,platform_fee_rate,platform_fee_exempt&id=eq.${discoveredOrganizationId}&limit=1`, accessToken)
          : Promise.resolve({ data: null, error: null }),
        discoveredOrganizationId
          ? selectFromSupabase<OperationRecord>('payroll_policies', `select=payroll_cadence,approval_threshold,country,currency&organization_id=eq.${discoveredOrganizationId}&limit=1`, accessToken)
          : Promise.resolve({ data: null, error: null }),
        selectFromSupabase<OperationRecord>('payroll_runs', 'select=id,title,period_start,period_end,status,gross_amount,net_amount,created_at&order=created_at.desc&limit=10', accessToken),
        selectFromSupabase<OperationRecord>('vendors', 'select=id,name,category,payment_method,status&limit=10', accessToken),
        selectFromSupabase<OperationRecord>('recurring_obligations', 'select=id,title,obligation_type,amount,cadence,next_due_date,status&limit=10', accessToken),
        selectFromSupabase<OperationRecord>('salary_advances', 'select=id,amount,status,created_at&limit=10', accessToken),
        selectFromSupabase<OperationRecord>('payslips', 'select=id,period_label,status,created_at&limit=10', accessToken),
        selectFromSupabase<OperationRecord>('audit_logs', 'select=id,action,entity_type,created_at&order=created_at.desc&limit=20', accessToken),
        selectFromSupabase<OperationRecord>('notifications', 'select=id,title,body,read_at,created_at&order=created_at.desc&limit=20', accessToken),
        selectFromSupabase<OperationRecord>('organization_invites', 'select=id,email,role,status,created_at&order=created_at.desc&limit=20', accessToken),
      ])

      if (!mounted) return
      const organization = organizations.data?.[0]
      const policy = policies.data?.[0]
      if (organization || policy) {
        setOnboarding((current) => ({
          ...current,
          organizationName: String(organization?.name ?? current.organizationName),
          country: String(policy?.country ?? organization?.country ?? current.country),
          currency: String(policy?.currency ?? current.currency),
          payrollCadence: String(policy?.payroll_cadence ?? current.payrollCadence),
          approvalThreshold: String(policy?.approval_threshold ?? current.approvalThreshold),
          platformFeeRate: String(organization?.platform_fee_rate ?? current.platformFeeRate),
          platformFeeExempt: Boolean(organization?.platform_fee_exempt ?? current.platformFeeExempt),
        }))
      }
      if (runs.data?.length) setPayrollRunRows(runs.data)
      if (loadedVendors.data?.length) setVendorRows(loadedVendors.data)
      if (obligations.data?.length) setObligationRows(obligations.data)
      if (advances.data?.length) setAdvanceRows(advances.data)
      if (loadedPayslips.data?.length) setPayslipRows(loadedPayslips.data)
      if (logs.data?.length) setAuditRows(logs.data)
      if (loadedNotifications.data?.length) setNotificationRows(loadedNotifications.data)
      if (invites.data?.length) setTeamRows(invites.data)
      else if (memberships.data?.length) setTeamRows(memberships.data)
    }

    loadEmployees()

    return () => {
      mounted = false
    }
  }, [accessToken])

  async function saveEmployee(input: EmployeeInput, existingId?: string) {
    setDataError('')
    setDataMessage('')

    const localEmployee: Employee = {
      id: existingId || crypto.randomUUID(),
      name: input.name,
      initials: getInitials(input.name),
      employeeCode: existingId ? employees.find((employee) => employee.id === existingId)?.employeeCode || `AP-${Date.now()}` : `AP-${Date.now()}`,
      role: input.role,
      department: input.department,
      paymentMethod: input.paymentMethod,
      salaryStructure: input.salaryStructure,
      status: input.status,
      phone: input.phone,
      salary: input.salary,
      avatarUrl: input.avatarUrl,
    }

    setEmployees((currentEmployees) =>
      existingId
        ? currentEmployees.map((employee) => (employee.id === existingId ? localEmployee : employee))
        : [localEmployee, ...currentEmployees],
    )

    if (!isSupabaseConfigured || !accessToken) {
      setDataError('Connect Supabase before saving employee records.')
      return
    }

    if (!existingId && !organizationId) {
      setDataError('Complete organization onboarding before creating employees in Supabase.')
      return
    }

    const payload = {
      ...(!existingId ? { organization_id: organizationId } : {}),
      full_name: input.name,
      employee_code: localEmployee.employeeCode,
      role: input.role,
      department: input.department,
      payment_method: input.paymentMethod,
      salary_structure: input.salaryStructure,
      status: input.status,
      phone: input.phone,
      salary_display: input.salary,
      avatar_url: input.avatarUrl,
    }

    const result = existingId
      ? await updateSupabase<SupabaseEmployee>('employees', `id=eq.${existingId}`, payload, accessToken)
      : await insertIntoSupabase<SupabaseEmployee>('employees', payload, accessToken)

    if (result.error) {
      setDataError(result.error.message)
      return
    }

    if (result.data) {
      const savedEmployee = mapSupabaseEmployee(result.data)
      setEmployees((currentEmployees) =>
        currentEmployees.map((employee) => (employee.id === localEmployee.id ? savedEmployee : employee)),
      )
    }

    setDataMessage('Employee saved to Supabase.')
  }

  async function updatePayrollStatus(status: string) {
    setDataError('')
    setDataMessage('')
    const activeRun = payrollRunRows[0]

    setPayrollRunRows((currentRows) =>
      currentRows.map((row, index) => (index === 0 ? { ...row, status } : row)),
    )
    addAuditEvent(`Payroll status moved to ${status}`, 'Payroll')

    if (!isSupabaseConfigured || !accessToken) {
      setDataMessage(`Payroll status changed locally to ${status}.`)
      return
    }

    if (!activeRun?.id || !isUuid(String(activeRun.id))) {
      setDataMessage(`Payroll status changed locally to ${status}. Create or load a Supabase payroll run to persist it.`)
      return
    }

    const result = await updateSupabase<OperationRecord>(
      'payroll_runs',
      `id=eq.${String(activeRun.id)}`,
      { status },
      accessToken,
    )

    if (result.error) {
      setDataError(result.error.message)
      return
    }

    if (status !== 'Executing') {
      setDataMessage(`Payroll status saved as ${status}.`)
      return
    }

    if (!organizationId) {
      setDataMessage('Payroll moved to execution. Complete organization onboarding to stage a disbursement batch.')
      return
    }

    const payoutAmount = getNumericAmount(activeRun.net_amount ?? activeRun.gross_amount ?? activeRun.amount)
    const platformFeeRate = onboarding.platformFeeExempt ? 0 : getNumericAmount(onboarding.platformFeeRate)
    const platformFeeAmount = Math.round(payoutAmount * platformFeeRate) / 100
    const batchResult = await insertIntoSupabase<OperationRecord>(
      'disbursement_batches',
      {
        organization_id: organizationId,
        payroll_run_id: activeRun.id,
        status: 'Staged',
        total_amount: payoutAmount + platformFeeAmount,
        payout_amount: payoutAmount,
        platform_fee_rate: platformFeeRate,
        platform_fee_amount: platformFeeAmount,
        platform_fee_exempt: onboarding.platformFeeExempt,
      },
      accessToken,
    )

    if (batchResult.error) {
      setDataError(batchResult.error.message)
      return
    }

    const batchId = batchResult.data?.id
    if (!batchId) {
      setDataMessage('Payroll moved to execution. Supabase did not return a disbursement batch id.')
      return
    }

    const execution = await invokeSupabaseFunction<{ status: string }>(
      'execute-disbursement',
      {
        payrollRunId: activeRun.id,
        disbursementBatchId: batchId,
      },
      accessToken,
    )

    if (execution.error) {
      setDataMessage('Disbursement batch staged in Supabase. Deploy the execute-disbursement Edge Function to submit provider payouts.')
      return
    }

    setDataMessage(`Disbursement batch ${execution.data?.status ?? 'submitted'} through the Edge Function.`)
  }

  async function addVendor(name: string) {
    const row = { name, category: 'General', paymentMethod: 'Bank Transfer', status: 'Active' }
    setVendorRows((currentRows) => [row, ...currentRows])
    addAuditEvent(`Added vendor ${name}`, 'Vendor')
    await persistGeneric('vendors', {
      organization_id: organizationId,
      name,
      category: 'General',
      payment_method: 'Bank Transfer',
      status: 'Active',
    })
  }

  async function addObligation(title: string) {
    const row = { title, type: 'Bill', amount: '0', cadence: 'Monthly', status: 'Active' }
    setObligationRows((currentRows) => [row, ...currentRows])
    addAuditEvent(`Added obligation ${title}`, 'Obligation')
    await persistGeneric('recurring_obligations', {
      organization_id: organizationId,
      title,
      obligation_type: 'Bill',
      amount: 0,
      cadence: 'Monthly',
      next_due_date: new Date().toISOString().slice(0, 10),
      status: 'Active',
    })
  }

  async function approveAdvance(index: number) {
    setDataError('')
    setDataMessage('')
    const selectedAdvance = advanceRows[index]

    setAdvanceRows((currentRows) =>
      currentRows.map((row, rowIndex) => (rowIndex === index ? { ...row, status: 'Approved' } : row)),
    )
    addAuditEvent('Approved salary advance request', 'Salary Advance')

    if (!isSupabaseConfigured || !accessToken) {
      setDataMessage('Salary advance approved locally.')
      return
    }

    if (!selectedAdvance?.id || !isUuid(String(selectedAdvance.id))) {
      setDataMessage('Salary advance approved locally. Load a Supabase advance row to persist this action.')
      return
    }

    const result = await updateSupabase<OperationRecord>(
      'salary_advances',
      `id=eq.${String(selectedAdvance.id)}`,
      { status: 'Approved' },
      accessToken,
    )

    if (result.error) {
      setDataError(result.error.message)
      return
    }

    setDataMessage('Salary advance approval saved to Supabase.')
  }

  async function importEmployeesFromCsv(file: File) {
    const text = await file.text()
    const rows = text
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.split(',').map((cell) => cell.trim()))
      .filter((cells) => cells.length >= 5 && cells[0])

    const importedEmployees = rows.map(([name, role, department, phone, salary], index) => ({
      id: crypto.randomUUID(),
      name,
      initials: getInitials(name),
      employeeCode: `CSV-${Date.now()}-${index + 1}`,
      role,
      department,
      paymentMethod: 'Mobile Money' as const,
      salaryStructure: 'Monthly Fixed',
      status: 'Onboarding' as const,
      phone,
      salary,
      avatarUrl: '',
    }))

    setEmployees((currentEmployees) => [...importedEmployees, ...currentEmployees])
    addAuditEvent(`Imported ${importedEmployees.length} employees`, 'Employee')
    setDataMessage(`Imported ${importedEmployees.length} employees from CSV.`)
  }

  async function saveOnboarding(input: OnboardingInput) {
    setDataError('')
    setDataMessage('')
    setOnboarding(input)
    addAuditEvent(`Updated onboarding for ${input.organizationName}`, 'Organization')

    if (!isSupabaseConfigured || !accessToken) {
      setDataMessage('Onboarding saved locally. Connect Supabase to persist organization settings.')
      return
    }

    let activeOrganizationId = organizationId

    if (activeOrganizationId) {
      const result = await updateSupabase<OperationRecord>(
        'organizations',
        `id=eq.${activeOrganizationId}`,
        {
          name: input.organizationName,
          country: input.country,
          platform_fee_rate: getNumericAmount(input.platformFeeRate),
          platform_fee_exempt: input.platformFeeExempt,
        },
        accessToken,
      )

      if (result.error) {
        setDataError(result.error.message)
        return
      }
    } else {
      const created = await insertIntoSupabase<OperationRecord>(
        'organizations',
        {
          name: input.organizationName,
          country: input.country,
          platform_fee_rate: getNumericAmount(input.platformFeeRate),
          platform_fee_exempt: input.platformFeeExempt,
        },
        accessToken,
      )

      if (created.error || !created.data?.id) {
        setDataError(created.error?.message ?? 'Supabase did not return the created organization id.')
        return
      }

      activeOrganizationId = String(created.data.id)
      setOrganizationId(activeOrganizationId)

      if (userId) {
        const membership = await insertIntoSupabase<OperationRecord>(
          'organization_members',
          { organization_id: activeOrganizationId, user_id: userId, role: 'owner' },
          accessToken,
        )

        if (membership.error) {
          setDataError(membership.error.message)
          return
        }
      }
    }

    const policyPayload = {
      organization_id: activeOrganizationId,
      payroll_cadence: input.payrollCadence,
      approval_threshold: getNumericAmount(input.approvalThreshold),
      country: input.country,
      currency: input.currency,
    }

    const policyUpdate = await updateSupabase<OperationRecord>(
      'payroll_policies',
      `organization_id=eq.${activeOrganizationId}`,
      policyPayload,
      accessToken,
    )

    if (policyUpdate.error) {
      setDataError(policyUpdate.error.message)
      return
    }

    if (!policyUpdate.data) {
      const policyInsert = await insertIntoSupabase<OperationRecord>('payroll_policies', policyPayload, accessToken)
      if (policyInsert.error) {
        setDataError(policyInsert.error.message)
        return
      }
    }

    setDataMessage('Organization onboarding saved to Supabase.')
  }

  async function inviteTeamMember(email: string, role: string) {
    setDataError('')
    setDataMessage('')
    const row = { id: crypto.randomUUID(), email, role, status: 'Invited', created_at: new Date().toISOString() }
    setTeamRows((currentRows) => [row, ...currentRows])
    addAuditEvent(`Invited ${email} as ${role}`, 'Access')

    if (!isSupabaseConfigured || !accessToken || !organizationId) {
      setDataError('Connect Supabase and complete onboarding before sending invitations.')
      return
    }

    const result = await insertIntoSupabase<OperationRecord>(
      'organization_invites',
      {
        organization_id: organizationId,
        email,
        role,
        status: 'Invited',
      },
      accessToken,
    )

    if (result.error) setDataError(result.error.message)
    else setDataMessage('Team invitation event saved to Supabase.')
  }

  function addAuditEvent(action: string, entityType: string) {
    const event = {
      actor: 'Current user',
      action,
      time: 'Just now',
      type: entityType,
      created_at: new Date().toISOString(),
      entity_type: entityType,
    }
    setAuditRows((currentRows) => [event, ...currentRows])
  }

  async function persistGeneric(table: string, payload: Record<string, unknown>) {
    if (!isSupabaseConfigured || !accessToken || !organizationId) {
      setDataError('Connect Supabase and complete onboarding before saving records.')
      return
    }

    const result = await insertIntoSupabase(table, payload, accessToken)
    if (result.error) setDataError(result.error.message)
    else setDataMessage('Saved to Supabase.')
  }

  return {
    employees,
    payrollRunRows,
    vendorRows,
    obligationRows,
    advanceRows,
    payslipRows,
    auditRows,
    notificationRows,
    teamRows,
    onboarding,
    dashboardMetrics: getDashboardMetrics(employees, payrollRunRows, obligationRows, syncState),
    payrollSummary: getPayrollSummary(payrollRunRows, employees, onboarding),
    dataError,
    dataMessage,
    isDataLoading,
    addObligation,
    addVendor,
    approveAdvance,
    inviteTeamMember,
    importEmployeesFromCsv,
    saveEmployee,
    saveOnboarding,
    updatePayrollStatus,
    syncState,
  }
}

function getDashboardMetrics(
  employees: Employee[],
  payrollRunRows: OperationRecord[],
  obligationRows: OperationRecord[],
  syncState: string,
) {
  const activeEmployees = employees.filter((employee) => employee.status === 'Active').length
  const nextRun = payrollRunRows[0]
  const nextPayroll = formatDateRange(nextRun?.period_start, nextRun?.period_end) || String(nextRun?.period ?? 'Not scheduled')
  const totalDisbursement = formatMoney(nextRun?.net_amount ?? nextRun?.gross_amount ?? nextRun?.amount)
  const upcomingCount = obligationRows.filter((row) => String(row.status ?? '').toLowerCase() !== 'inactive').length

  return {
    nextPayroll,
    totalDisbursement,
    totalEmployees: employees.length,
    activeEmployees,
    upcomingCount,
    automationState: syncState,
  }
}

function getPayrollSummary(payrollRunRows: OperationRecord[], employees: Employee[], onboarding: OnboardingInput) {
  const currency = onboarding.currency || 'NGN'
  const activeRun = payrollRunRows[0]
  if (!activeRun) {
    return {
      title: 'No payroll run selected',
      status: 'Draft',
      totalEmployees: employees.length,
      grossPay: formatMoney(0, currency),
      bonuses: formatMoney(0, currency),
      deductions: formatMoney(0, currency),
      taxes: formatMoney(0, currency),
      fees: formatMoney(0, currency),
      platformFee: formatMoney(0, currency),
      platformFeeRate: `${onboarding.platformFeeExempt ? 0 : getNumericAmount(onboarding.platformFeeRate)}%`,
      platformFeeExempt: onboarding.platformFeeExempt,
      net: formatMoney(0, currency),
      totalDebit: formatMoney(0, currency),
    }
  }

  const gross = getNumericAmount(activeRun?.gross_amount ?? activeRun?.amount)
  const net = getNumericAmount(activeRun?.net_amount ?? activeRun?.amount)
  const deductions = getNumericAmount(activeRun?.deduction_amount ?? Math.max(gross - net, 0))
  const taxes = getNumericAmount(activeRun?.tax_amount ?? 0)
  const fees = getNumericAmount(activeRun?.fee_amount ?? 0)
  const platformFeeRate = onboarding.platformFeeExempt ? 0 : getNumericAmount(onboarding.platformFeeRate)
  const platformFee = getNumericAmount(activeRun?.platform_fee_amount ?? Math.round((net || gross) * platformFeeRate) / 100)

  return {
    title: String(activeRun?.title ?? activeRun?.name ?? 'Current Payroll Run'),
    status: String(activeRun?.status ?? 'Draft'),
    totalEmployees: employees.length,
    grossPay: formatMoney(gross, currency),
    bonuses: formatMoney(activeRun?.bonus_amount ?? 0, currency),
    deductions: formatMoney(deductions, currency),
    taxes: formatMoney(taxes, currency),
    fees: formatMoney(fees, currency),
    platformFee: formatMoney(platformFee, currency),
    platformFeeRate: `${platformFeeRate}%`,
    platformFeeExempt: onboarding.platformFeeExempt,
    net: formatMoney(net || gross, currency),
    totalDebit: formatMoney((net || gross) + fees + platformFee, currency),
  }
}

function mapSupabaseEmployee(employee: SupabaseEmployee): Employee {
  return {
    id: employee.id,
    name: employee.full_name,
    initials: getInitials(employee.full_name),
    employeeCode: employee.employee_code,
    role: employee.role,
    department: employee.department,
    paymentMethod: employee.payment_method,
    salaryStructure: employee.salary_structure,
    status: employee.status,
    phone: employee.phone,
    salary: employee.salary_display,
    avatarUrl: employee.avatar_url,
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function getNumericAmount(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = Number.parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatMoney(value: unknown, currency = 'NGN') {
  const amount = getNumericAmount(value)
  if (!amount) return typeof value === 'string' && value ? value : `${currency} 0`
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function formatDateRange(start: unknown, end: unknown) {
  if (typeof start !== 'string' || typeof end !== 'string') return ''
  return `${start} - ${end}`
}
