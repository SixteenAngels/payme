export function IntegrationsPage({ isSupabaseConfigured, syncState }: { isSupabaseConfigured: boolean; syncState: string }) {
  const integrations = [
    ['Supabase', isSupabaseConfigured ? syncState : 'Missing env', 'Authentication, tenant data, RLS, and protected reads.'],
    ['Moolre Disbursements', 'Configured in Edge Function', 'Mobile money and bank transfer payouts via execute-disbursement.'],
    ['Email / SMS', 'Not connected', 'Payroll receipts, approvals, and reminder notifications.'],
    ['Webhooks', 'Not connected', 'Provider callbacks for reconciliation and payout status updates.'],
  ]

  return (
    <div className="module-grid">
      {integrations.map(([title, status, copy]) => (
        <section className="panel integration-card" key={title}>
          <header>
            <h3>{title}</h3>
            <span className={`pill ${status === 'Missing env' ? 'warning' : 'info'}`}>{status}</span>
          </header>
          <p>{copy}</p>
          <button className="ghost" type="button">
            Configure
          </button>
        </section>
      ))}
    </div>
  )
}
