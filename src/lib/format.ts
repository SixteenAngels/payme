export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function getDisplayNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatDisplayMoney(value: unknown) {
  if (typeof value === 'string' && /[A-Z]{3}/.test(value) && !/^\d/.test(value.trim())) return value
  const amount = getDisplayNumber(value)
  return `NGN ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
