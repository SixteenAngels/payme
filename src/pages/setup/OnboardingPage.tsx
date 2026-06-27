import { RecordRow } from '../../components/ui'
import type { OnboardingInput } from '../../hooks/useAutoPayData'
import { formatDisplayMoney } from '../../lib/format'
import { OnboardingPanel } from './OnboardingPanel'

export function OnboardingPage({ onboarding, saveOnboarding, canManage }: { onboarding: OnboardingInput; saveOnboarding: (input: OnboardingInput) => Promise<void>; canManage: boolean }) {
  return (
    <div className="split-page">
      <OnboardingPanel canManage={canManage} onboarding={onboarding} saveOnboarding={saveOnboarding} />
      <section className="panel launch-checklist">
        <header><h3>Launch Checklist</h3><span>Required setup</span></header>
        {[
          ['Organization profile', onboarding.organizationName],
          ['Country and currency', `${onboarding.country} / ${onboarding.currency}`],
          ['Payroll cadence', onboarding.payrollCadence],
          ['Approval threshold', formatDisplayMoney(onboarding.approvalThreshold)],
          ['Platform fee', onboarding.platformFeeExempt ? 'Exempt' : `${onboarding.platformFeeRate}%`],
          ['First admin membership', 'Created during onboarding'],
        ].map(([title, value], index) => <RecordRow key={title} title={title} meta={`Step ${index + 1} of 6`} value={value} status="Ready" />)}
      </section>
    </div>
  )
}
