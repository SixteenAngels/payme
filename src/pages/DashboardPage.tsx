import { BriefcaseBusiness, CalendarDays, FileText, Sparkles, Users, WalletCards } from '../components/icons'
import { ActionCard, Metric } from '../components/ui'
import { useAutoPayData } from '../hooks/useAutoPayData'
import { formatDisplayMoney } from '../lib/format'
import { quickModules } from '../lib/navigation'
import type { Row, SetView } from '../types'

export function DashboardPage({ metrics, payrollRunRows, setView }: { metrics: ReturnType<typeof useAutoPayData>['dashboardMetrics']; payrollRunRows: Row[]; setView: SetView }) {
  return (
    <div className="dashboard-grid">
      <Metric icon={CalendarDays} eyebrow="Scheduled" title="Next Payroll" value={metrics.nextPayroll} />
      <Metric icon={WalletCards} eyebrow="Total Est." title="Disbursement" value={metrics.totalDisbursement} />
      <Metric icon={BriefcaseBusiness} eyebrow={`${metrics.activeEmployees} active`} title="Employees" value={metrics.totalEmployees.toLocaleString()} />
      <Metric icon={Sparkles} eyebrow={metrics.automationState} title="Sync Status" value={metrics.automationState} />
      <section className="panel history-panel">
        <header><h3>Recent Payroll History</h3><button type="button" onClick={() => setView('payroll')}>View All</button></header>
        <div className="history-table">
          <div className="table-header"><span>Date</span><span>Reference ID</span><span>Amount</span><span>Status</span><span>Action</span></div>
          {payrollRunRows.map((run, index) => <div className="table-row" key={String(run.id ?? index)}><span>{String(run.period ?? run.period_start ?? 'Current period')}</span><span>{String(run.id ?? `RUN-${index + 1}`).toUpperCase()}</span><strong>{formatDisplayMoney(run.net_amount ?? run.gross_amount ?? run.amount)}</strong><span className="pill info">{String(run.status ?? 'Draft')}</span><button type="button" onClick={() => setView('payroll-detail')}><FileText size={17} /> View Report</button></div>)}
        </div>
      </section>
      <aside className="panel upcoming-panel">
        <header><h3>Upcoming Payments</h3><span>Next 7 Days</span></header>
        {payrollRunRows.slice(0, 3).map((run, index) => <article className="payment-tile" key={String(run.id ?? index)}><Users size={22} /><div><h4>{String(run.title ?? run.name ?? 'Payroll run')}</h4><small>{String(run.status ?? 'Draft')} batch</small><strong>{formatDisplayMoney(run.net_amount ?? run.gross_amount ?? run.amount)}</strong></div><time>{String(run.period_end ?? `Run ${index + 1}`)}</time></article>)}
        <div className="automation-callout"><h4>Automated Payouts</h4><p>Disbursements run through Moolre after payroll execution is approved.</p><strong>{metrics.upcomingCount} recurring obligations</strong></div>
        <button className="dark wide" type="button" onClick={() => setView('automation')}>Manage Schedule</button>
      </aside>
      {quickModules.slice(0, 6).map((module) => <ActionCard key={module.id} {...module} onClick={() => setView(module.id)} />)}
    </div>
  )
}
