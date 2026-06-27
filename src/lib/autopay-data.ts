export type Employee = {
  id: string
  name: string
  initials: string
  employeeCode: string
  role: string
  department: string
  paymentMethod: 'Mobile Money' | 'Bank Transfer'
  salaryStructure: string
  status: 'Active' | 'On Leave' | 'Onboarding'
  phone: string
  salary: string
  avatarUrl: string
}
