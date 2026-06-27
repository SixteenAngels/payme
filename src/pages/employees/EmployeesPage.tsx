import { useState } from 'react'
import { Activity, Check, Download, Landmark, Phone, Plus, Search, Sparkles, Users } from '../../components/icons'
import { EmptyState, SummaryStat } from '../../components/ui'
import type { Employee } from '../../lib/autopay-data'

export function EmployeesPage({ employees, openEmployee, openEmployeeForm, importEmployeesFromCsv, canManage }: { employees: Employee[]; openEmployee: (id: string) => void; openEmployeeForm: () => void; importEmployeesFromCsv: (file: File) => Promise<void>; canManage: boolean }) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('All')
  const [status, setStatus] = useState('All')
  const departments = ['All', ...Array.from(new Set(employees.map((employee) => employee.department)))]
  const filtered = employees.filter((employee) => `${employee.name} ${employee.employeeCode} ${employee.role}`.toLowerCase().includes(query.toLowerCase()) && (department === 'All' || employee.department === department) && (status === 'All' || employee.status === status))

  return (
    <div className="employee-view">
      <div className="stat-row">
        <SummaryStat icon={Users} label="Total Staff" value="1,284" />
        <SummaryStat icon={Check} label="Active" value={employees.filter((employee) => employee.status === 'Active').length.toString()} />
        <SummaryStat icon={Activity} label="On Leave" value="32" />
        <SummaryStat icon={Sparkles} label="Onboarding" value="12" accent="danger" />
      </div>
      <section className="filter-strip">
        <label><Search size={20} /><input placeholder="Search by name or ID..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <select value={department} onChange={(event) => setDepartment(event.target.value)}>{departments.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>{['All', 'Active', 'On Leave', 'Onboarding'].map((item) => <option key={item}>{item}</option>)}</select>
        <label className="file-button"><Download size={18} />Import CSV<input type="file" accept=".csv,text/csv" disabled={!canManage} onChange={(event) => event.target.files?.[0] && importEmployeesFromCsv(event.target.files[0])} /></label>
        <button className="primary" type="button" disabled={!canManage} onClick={() => openEmployeeForm()}><Plus size={18} /> Add Employee</button>
      </section>
      <section className="panel employee-table">
        <div className="employee-head"><span>Employee</span><span>Position</span><span>Department</span><span>Payment Method</span><span>Salary Structure</span><span>Status</span><span>Action</span></div>
        {filtered.map((employee) => <div className="employee-row" key={employee.id}><div className="employee-cell"><img src={employee.avatarUrl} alt="" /><div><strong>{employee.name}</strong><small>{employee.employeeCode}</small></div></div><span>{employee.role}</span><span className="department">{employee.department}</span><span className="payment-method">{employee.paymentMethod === 'Mobile Money' ? <Phone size={18} /> : <Landmark size={18} />} {employee.paymentMethod}</span><span>{employee.salaryStructure}</span><span className={`pill ${employee.status === 'Active' ? 'success' : employee.status === 'On Leave' ? 'warning' : 'info'}`}>{employee.status}</span><button type="button" onClick={() => openEmployee(employee.id)}>Open</button></div>)}
        {!filtered.length && <EmptyState title="No employees match this filter" copy="Adjust the search or add a new employee record." />}
      </section>
    </div>
  )
}
