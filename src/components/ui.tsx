import { useState, type ReactNode } from 'react'
import { Gauge, Plus, Sparkles, type IconComponent } from './icons'

export function Metric({ icon: Icon, eyebrow, title, value }: { icon: IconComponent; eyebrow: string; title: string; value: string }) {
  return <section className="metric-card"><Icon /><span>{eyebrow}</span><h3>{title}</h3><strong>{value}</strong></section>
}

export function NavButton({ icon: Icon, label, active, onClick }: { icon: IconComponent; label: string; active: boolean; onClick: () => void }) {
  return <button className={active ? 'active' : ''} type="button" onClick={onClick}><Icon size={22} /><span>{label}</span></button>
}

export function ActionCard({ icon: Icon, title, copy, onClick }: { icon: IconComponent; title: string; copy: string; onClick: () => void }) {
  return <button className="action-card" type="button" onClick={onClick}><Icon /><h3>{title}</h3><p>{copy}</p></button>
}

export function SummaryStat({ icon: Icon, label, value, accent }: { icon: IconComponent; label: string; value: string; accent?: 'danger' }) {
  return <section className={`summary-stat ${accent ?? ''}`}><Icon size={28} /><span>{label}</span><strong>{value}</strong></section>
}

export function SummaryLine({ label, value, tone }: { label: string; value: string; tone?: 'blue' | 'red' }) {
  return <div className="summary-line"><span>{label}</span><strong className={tone}>{value}</strong></div>
}

export function StatusBanner({ title, copy, tone = 'info' }: { title: string; copy: string; tone?: 'info' | 'warning' }) {
  return <section className={`status-banner ${tone}`}><strong>{title}</strong><p>{copy}</p></section>
}

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <div className="empty-state"><Sparkles size={28} /><strong>{title}</strong><p>{copy}</p></div>
}

export function InfoPanel({ title, items }: { title: string; items: Array<[string, string]> }) {
  return <section className="panel info-panel"><header><h3>{title}</h3></header>{items.map(([label, value]) => <div className="summary-line" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
}

export function RecordRow({ title, meta, value, status, actionLabel = 'Open', disabled = false, onClick }: { title: string; meta: string; value: string; status: string; actionLabel?: string; disabled?: boolean; onClick?: () => void }) {
  return <button className="record-row" type="button" disabled={disabled} onClick={onClick}><div><strong>{title}</strong><span>{meta}</span></div><strong>{value}</strong><span className="pill info">{status}</span><span>{actionLabel}</span></button>
}

export function ModuleGrid({ modules, footer }: { modules: Array<[string, string]>; footer?: ReactNode }) {
  return <div className="module-grid">{modules.map(([title, copy]) => <section className="action-card module-card" key={title}><Gauge /><h3>{title}</h3><p>{copy}</p></section>)}{footer && <section className="panel module-footer">{footer}</section>}</div>
}

export function WorkflowPage({ title, steps, action, disabled = false, onAction }: { title: string; steps: string[]; action: string; disabled?: boolean; onAction?: () => void }) {
  return (
    <section className="panel workflow-panel">
      <header>
        <h3>{title}</h3>
        <button className="primary sticky-action" type="button" disabled={disabled} onClick={onAction}>
          {action}
        </button>
      </header>
      {steps.map((step, index) => (
        <RecordRow key={step} title={step} meta={`Step ${index + 1} of ${steps.length}`} value="Pending" status="Open" />
      ))}
    </section>
  )
}

export function DirectoryPage({ title, rows, onAdd, canManage = true }: { title: string; rows: string[]; onAdd?: (name: string) => Promise<void>; canManage?: boolean }) {
  const [name, setName] = useState('')
  return <section className="panel"><header><h3>{title}</h3>{onAdd ? <div className="inline-add"><input placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} /><button className="primary" type="button" disabled={!canManage || !name} onClick={() => onAdd(name).then(() => setName(''))}><Plus size={18} /> Add</button></div> : <button className="primary" type="button"><Plus size={18} /> Add</button>}</header>{rows.map((row, index) => <RecordRow key={row} title={row} meta="Active record" value={`#${index + 1}`} status="Active" />)}</section>
}
