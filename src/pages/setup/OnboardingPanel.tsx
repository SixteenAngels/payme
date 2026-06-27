import { useState } from 'react'
import type { OnboardingInput } from '../../hooks/useAutoPayData'

export function OnboardingPanel({ onboarding, saveOnboarding, canManage }: { onboarding: OnboardingInput; saveOnboarding: (input: OnboardingInput) => Promise<void>; canManage: boolean }) {
  const [form, setForm] = useState(onboarding)
  const updateForm = (key: keyof OnboardingInput, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <section className="panel form-panel onboarding-panel">
      <header><h3>Organization Onboarding</h3><span>First admin setup</span></header>
      <div className="form-grid">
        <label>Organization<input value={form.organizationName} onChange={(event) => updateForm('organizationName', event.target.value)} /></label>
        <label>Country<select value={form.country} onChange={(event) => updateForm('country', event.target.value)}><option>Nigeria</option><option>Ghana</option><option>Kenya</option><option>South Africa</option><option>Pan-African</option></select></label>
        <label>Currency<select value={form.currency} onChange={(event) => updateForm('currency', event.target.value)}><option>NGN</option><option>GHS</option><option>KES</option><option>ZAR</option><option>USD</option></select></label>
        <label>Payroll cadence<select value={form.payrollCadence} onChange={(event) => updateForm('payrollCadence', event.target.value)}><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select></label>
        <label>Approval threshold<input inputMode="numeric" value={form.approvalThreshold} onChange={(event) => updateForm('approvalThreshold', event.target.value)} /></label>
        <label>Platform fee %<input inputMode="decimal" value={form.platformFeeRate} onChange={(event) => updateForm('platformFeeRate', event.target.value)} /></label>
        <label className="checkbox-line"><input type="checkbox" checked={form.platformFeeExempt} onChange={(event) => updateForm('platformFeeExempt', event.target.checked)} /> Exempt this account from platform fees</label>
      </div>
      <button className="primary sticky-action" type="button" disabled={!canManage} onClick={() => saveOnboarding(form)}>Save Onboarding</button>
    </section>
  )
}
