-- Optional fallback seed.
-- The app can create the first organization and owner membership from Settings.
-- Use this only if you prefer to seed the first organization manually.
-- Replace the placeholder UUID with your first Supabase Auth user id.

with organization as (
  insert into public.organizations (name, country)
  values ('Pan-African Hub', 'Ghana')
  returning id
)
insert into public.organization_members (organization_id, user_id, role)
select
  organization.id,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'owner'
from organization;
