import { DirectoryPage } from '../../components/ui'
import type { Row } from '../../types'

export function PayslipsPage({ rows }: { rows: Row[] }) {
  return <DirectoryPage title="Payslips" rows={rows.map((row) => String(row.title ?? row.period_label))} />
}
