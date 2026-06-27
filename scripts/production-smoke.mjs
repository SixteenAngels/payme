import { readFileSync } from 'node:fs'

const checks = [
  ['manifest exists', () => JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')).display === 'standalone'],
  ['service worker avoids cross-origin cache', () => readFileSync('public/sw.js', 'utf8').includes('url.origin !== self.location.origin')],
  ['env example includes Supabase public keys', () => readFileSync('.env.example', 'utf8').includes('VITE_SUPABASE_PUBLISHABLE_KEY')],
  ['schema enables RLS', () => readFileSync('supabase/schema.sql', 'utf8').includes('enable row level security')],
  ['schema has role-aware policy helper', () => readFileSync('supabase/schema.sql', 'utf8').includes('private.has_org_role')],
  ['edge function exists for Moolre disbursement execution', () => readFileSync('supabase/functions/execute-disbursement/index.ts', 'utf8').includes('MOOLRE_API_USER')],
  ['edge function requires jwt verification', () => readFileSync('supabase/config.toml', 'utf8').includes('verify_jwt = true')],
  ['SPA deploy rewrites are configured', () => readFileSync('vercel.json', 'utf8').includes('"destination": "/index.html"')],
]

const failures = checks.filter(([, check]) => !check())

if (failures.length) {
  console.error('Production smoke checks failed:')
  for (const [name] of failures) console.error(`- ${name}`)
  process.exit(1)
}

console.log('Production smoke checks passed.')
