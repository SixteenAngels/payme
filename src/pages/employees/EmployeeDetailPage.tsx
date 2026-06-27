import { InfoPanel } from '../../components/ui'
import type { Employee } from '../../lib/autopay-data'

export function EmployeeDetailPage({ employee, openEmployeeForm }: { employee: Employee; openEmployeeForm: (id: string) => void }) {
  return (
    <div className="detail-grid">
      <section className="panel detail-card">
        <header>
          <h3>{employee.name}</h3>
          <button className="ghost" type="button" onClick={() => openEmployeeForm(employee.id)}>
            Edit Employee
          </button>
        </header>
        <div className="profile-large">
          <img src={employee.avatarUrl} alt="" />
          <div>
            <strong>{employee.role}</strong>
            <span>{employee.department}</span>
            <span>{employee.employeeCode}</span>
          </div>
        </div>
      </section>
      <InfoPanel
        title="Payment Profile"
        items={[
          ['Method', employee.paymentMethod],
          ['Phone / Wallet', employee.phone],
          ['Salary', employee.salary],
          ['Structure', employee.salaryStructure],
        ]}
      />
      <InfoPanel
        title="Compliance"
        items={[
          ['Status', employee.status],
          ['Payment method', employee.paymentMethod],
          ['Department', employee.department],
        ]}
      />
    </div>
  )
}
