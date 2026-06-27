create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  platform_fee_rate numeric(5, 2) not null default 1.00,
  platform_fee_exempt boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'approver', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'approver', 'viewer')),
  status text not null check (status in ('Invited', 'Accepted', 'Revoked')) default 'Invited',
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.payroll_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade unique,
  payroll_cadence text not null default 'Monthly',
  approval_threshold numeric(14, 2) not null default 0,
  country text not null,
  currency text not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  employee_code text not null,
  role text not null,
  department text not null,
  payment_method text not null check (payment_method in ('Mobile Money', 'Bank Transfer')),
  salary_structure text not null,
  status text not null check (status in ('Active', 'On Leave', 'Onboarding')),
  phone text not null,
  salary_display text not null,
  avatar_url text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, employee_code)
);

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  period_start date not null,
  period_end date not null,
  status text not null check (status in ('Draft', 'Verification', 'Approval', 'Executing', 'Paid', 'Failed')),
  gross_amount numeric(14, 2) not null default 0,
  net_amount numeric(14, 2) not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_run_id uuid not null references public.payroll_runs(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  base_amount numeric(14, 2) not null,
  bonus_amount numeric(14, 2) not null default 0,
  deduction_amount numeric(14, 2) not null default 0,
  net_amount numeric(14, 2) not null,
  status text not null check (status in ('Pending', 'Verified', 'Blocked')) default 'Pending'
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  payroll_run_id uuid references public.payroll_runs(id) on delete cascade,
  approver_id uuid references auth.users(id),
  status text not null check (status in ('Pending', 'Approved', 'Rejected')) default 'Pending',
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  category text not null,
  payment_method text not null,
  status text not null default 'Active'
);

create table if not exists public.recurring_obligations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  obligation_type text not null check (obligation_type in ('Bill', 'Subscription', 'Rent', 'Tax', 'Vendor')),
  amount numeric(14, 2) not null,
  cadence text not null,
  next_due_date date not null,
  status text not null default 'Active'
);

create table if not exists public.salary_advances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  amount numeric(14, 2) not null,
  status text not null check (status in ('Requested', 'Approved', 'Rejected', 'Paid')) default 'Requested',
  created_at timestamptz not null default now()
);

create table if not exists public.payslips (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  payroll_run_id uuid not null references public.payroll_runs(id) on delete cascade,
  period_label text not null,
  status text not null check (status in ('Draft', 'Published')) default 'Draft',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_provider_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider_name text not null,
  provider_type text not null check (provider_type in ('Mobile Money', 'Bank Transfer')),
  mode text not null check (mode in ('sandbox', 'production')) default 'sandbox',
  status text not null check (status in ('Not Configured', 'Active', 'Paused')) default 'Not Configured',
  created_at timestamptz not null default now()
);

create table if not exists public.disbursement_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  payroll_run_id uuid references public.payroll_runs(id) on delete set null,
  provider_connection_id uuid references public.payment_provider_connections(id) on delete set null,
  status text not null check (status in ('Staged', 'Submitted', 'Processing', 'Paid', 'Failed')) default 'Staged',
  total_amount numeric(14, 2) not null default 0,
  payout_amount numeric(14, 2) not null default 0,
  platform_fee_rate numeric(5, 2) not null default 1.00,
  platform_fee_amount numeric(14, 2) not null default 0,
  platform_fee_exempt boolean not null default false,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.organizations
  add column if not exists platform_fee_rate numeric(5, 2) not null default 1.00,
  add column if not exists platform_fee_exempt boolean not null default false;

alter table public.disbursement_batches
  add column if not exists payout_amount numeric(14, 2) not null default 0,
  add column if not exists platform_fee_rate numeric(5, 2) not null default 1.00,
  add column if not exists platform_fee_amount numeric(14, 2) not null default 0,
  add column if not exists platform_fee_exempt boolean not null default false;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invites enable row level security;
alter table public.payroll_policies enable row level security;
alter table public.employees enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_items enable row level security;
alter table public.approvals enable row level security;
alter table public.vendors enable row level security;
alter table public.recurring_obligations enable row level security;
alter table public.salary_advances enable row level security;
alter table public.payslips enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.payment_provider_connections enable row level security;
alter table public.disbursement_batches enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members members
    where members.organization_id = target_organization_id
      and members.user_id = auth.uid()
  );
$$;

revoke all on function private.is_org_member(uuid) from public;
grant execute on function private.is_org_member(uuid) to authenticated;

create or replace function private.has_org_role(target_organization_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members members
    where members.organization_id = target_organization_id
      and members.user_id = auth.uid()
      and members.role = any(allowed_roles)
  );
$$;

revoke all on function private.has_org_role(uuid, text[]) from public;
grant execute on function private.has_org_role(uuid, text[]) to authenticated;

create policy "Members can read their organizations"
  on public.organizations for select
  to authenticated
  using (private.is_org_member(id));

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  to authenticated
  with check (true);

create policy "Members can read memberships"
  on public.organization_members for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Users can create their owner membership"
  on public.organization_members for insert
  to authenticated
  with check (user_id = auth.uid() and role = 'owner');

create policy "Members can read organization invites"
  on public.organization_invites for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can write organization invites"
  on public.organization_invites for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read payroll policies"
  on public.payroll_policies for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can write payroll policies"
  on public.payroll_policies for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read employees"
  on public.employees for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can insert employees"
  on public.employees for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Admins can update employees"
  on public.employees for update
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read payroll runs"
  on public.payroll_runs for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can insert payroll runs"
  on public.payroll_runs for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Admins and approvers can update payroll runs"
  on public.payroll_runs for update
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin', 'approver']))
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'approver']));

create policy "Members can read payroll items through run"
  on public.payroll_items for select
  to authenticated
  using (
    exists (
      select 1 from public.payroll_runs runs
      where runs.id = payroll_run_id
        and private.is_org_member(runs.organization_id)
    )
  );

create policy "Admins can insert payroll items through run"
  on public.payroll_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.payroll_runs runs
      where runs.id = payroll_run_id
        and private.has_org_role(runs.organization_id, array['owner', 'admin'])
    )
  );

create policy "Admins can update payroll items through run"
  on public.payroll_items for update
  to authenticated
  using (
    exists (
      select 1 from public.payroll_runs runs
      where runs.id = payroll_run_id
        and private.has_org_role(runs.organization_id, array['owner', 'admin'])
    )
  )
  with check (
    exists (
      select 1 from public.payroll_runs runs
      where runs.id = payroll_run_id
        and private.has_org_role(runs.organization_id, array['owner', 'admin'])
    )
  );

create policy "Members can read approvals"
  on public.approvals for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Approvers can insert approvals"
  on public.approvals for insert
  to authenticated
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'approver']));

create policy "Approvers can update approvals"
  on public.approvals for update
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin', 'approver']))
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'approver']));

create policy "Members can read vendors"
  on public.vendors for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can write vendors"
  on public.vendors for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read recurring obligations"
  on public.recurring_obligations for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can write recurring obligations"
  on public.recurring_obligations for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read salary advances"
  on public.salary_advances for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can update salary advances"
  on public.salary_advances for update
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin', 'approver']))
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'approver']));

create policy "Members can read payslips"
  on public.payslips for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can write payslips"
  on public.payslips for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read audit logs"
  on public.audit_logs for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Members can insert audit logs"
  on public.audit_logs for insert
  to authenticated
  with check (private.is_org_member(organization_id));

create policy "Users can read assigned notifications"
  on public.notifications for select
  to authenticated
  using (private.is_org_member(organization_id) and (user_id is null or user_id = auth.uid()));

create policy "Admins can write notifications"
  on public.notifications for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read payment provider connections"
  on public.payment_provider_connections for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins can write payment provider connections"
  on public.payment_provider_connections for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin']))
  with check (private.has_org_role(organization_id, array['owner', 'admin']));

create policy "Members can read disbursement batches"
  on public.disbursement_batches for select
  to authenticated
  using (private.is_org_member(organization_id));

create policy "Admins and approvers can write disbursement batches"
  on public.disbursement_batches for all
  to authenticated
  using (private.has_org_role(organization_id, array['owner', 'admin', 'approver']))
  with check (private.has_org_role(organization_id, array['owner', 'admin', 'approver']));
