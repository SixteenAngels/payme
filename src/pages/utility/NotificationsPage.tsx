import { DirectoryPage } from '../../components/ui'
import type { Row } from '../../types'

export function NotificationsPage({ rows }: { rows: Row[] }) {
  return <DirectoryPage title="Notifications" rows={rows.map((row) => String(row.title))} />
}
