# AutoPay Africa PWA

AutoPay Africa is a Vite + React + TypeScript PWA for enterprise payroll automation, employee management, salary advances, approvals, recurring disbursements, reports, and audit trails.

## F Drive Workflow

The C drive on this machine is low on space. Use an npm cache on the project drive:

```powershell
$env:npm_config_cache='F:\autopay\.npm-cache'
```

Then run:

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

## Production Verify

```powershell
$env:npm_config_cache='F:\autopay\.npm-cache'
npm run verify
npm audit --json
npm run supabase:check
```

`npm run verify` runs the TypeScript production build, ESLint, and a local production smoke check.
`npm run supabase:check` validates that `.env` has non-placeholder Supabase values and that the REST endpoint is reachable without printing secrets.

## Supabase Setup

Create a `.env` file in the project root and set:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Apply the database SQL in this order:

1. Run `supabase/schema.sql` in the Supabase SQL editor, or install/link the Supabase CLI and apply it as a migration.
2. Create the first admin user through the app sign-up flow.
3. Open Settings and complete Organization Onboarding.
4. The app creates the organization, owner membership, and payroll policy automatically.

The schema includes tenant-aware tables for organizations, memberships, employees, payroll runs, payroll items, approvals, vendors, recurring obligations, salary advances, payslips, audit logs, and notifications. RLS is enabled on every exposed table, with role-aware read/write policies.

### Platform Fee

AutoPay can add a platform fee to every payout transaction so the app can fund operations. The default rate is `1%`, stored on the organization record as `platform_fee_rate`. Admins can exempt selected accounts in Settings by enabling `platform_fee_exempt`.

When a payroll run moves to execution, the disbursement batch stores:

- `payout_amount`: employee disbursement total.
- `platform_fee_rate`: the active fee rate.
- `platform_fee_amount`: the fee owed by the account.
- `platform_fee_exempt`: whether the account was exempt for that batch.
- `total_amount`: payout amount plus platform fee.

### Edge Function: Moolre Disbursement Execution

Real payment submission is handled by `supabase/functions/execute-disbursement/index.ts` so Moolre secrets never ship to the browser. The function submits one Moolre transfer per payable payroll item.

Set function secrets in Supabase:

```powershell
supabase secrets set MOOLRE_BASE_URL=https://sandbox.moolre.com
supabase secrets set MOOLRE_API_USER=your-moolre-username
supabase secrets set MOOLRE_API_KEY=your-moolre-private-key
supabase secrets set MOOLRE_ACCOUNT_NUMBER=your-moolre-account-number
supabase secrets set MOOLRE_CURRENCY=GHS
supabase secrets set MOOLRE_DEFAULT_CHANNEL=1
```

Use `https://api.moolre.com` for `MOOLRE_BASE_URL` when the Moolre account is approved for live payouts. `MOOLRE_DEFAULT_CHANNEL` maps Mobile Money payouts to Moolre's channel value; use `1` for MTN, `6` for Telecel, `7` for AT, or `2` for Instant Bank Transfer. If using bank transfers, also set `MOOLRE_BANK_SUBLIST_ID`.

Deploy when the Supabase CLI is installed and linked:

```powershell
supabase functions deploy execute-disbursement
```

If Moolre secrets are not set, the function still verifies the Supabase session and marks the batch as submitted in sandbox mode. Before live payouts, confirm employee phone/account data, Moolre channel mapping, and bank sublist IDs.

## App Routes

- `/` dashboard
- `/employees`
- `/employees/new`
- `/employees/:id`
- `/employees/:id/edit`
- `/payroll`
- `/payroll/current`
- `/payroll/approval`
- `/payroll/execute`
- `/reports`
- `/automation`
- `/bulk-disbursement`
- `/vendors`
- `/bills`
- `/salary-advances`
- `/payslips`
- `/audit-logs`
- `/notifications`
- `/profile`
- `/settings`
- `/wallet`
- `/onboarding`
- `/team`
- `/integrations`
- `/tax-filings`
- `/reconciliation`
- `/self-service`

`vercel.json` includes SPA rewrites so these URLs load correctly in production.

## PWA

The installable app pieces are in `public/`:

- `manifest.webmanifest`
- `sw.js`
- `pwa-icon.svg`

The service worker caches only same-origin app shell/static assets and skips Supabase/API-style data.

## 1-8 Production Status

Completed locally:

- Supabase Auth UI and REST session handling.
- Tenant-aware schema and seed template.
- Supabase reads for employees, payroll runs, vendors, obligations, advances, payslips, audit logs, and notifications.
- Supabase/local mutation paths for employee add/edit, vendor add, bill/obligation add, salary advance approval, and payroll status transitions.
- CSV employee import and CSV export.
- Role-aware UI gating for employee, payroll, settings, approval, and export actions.
- Payment provider schema boundary for provider connections and disbursement batches.
- Supabase Edge Function scaffold for server-side disbursement execution.

Still requires live credentials:

- Real `.env` values.
- Running `supabase/schema.sql` against the live Supabase project.
- Real Moolre credentials, approved live account access, and verified channel/bank mappings. Payment execution must not run directly from browser keys.
