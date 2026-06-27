import { readFileSync } from 'node:fs'

const env = readEnvFile('.env')
const supabaseUrl = env.VITE_SUPABASE_URL
const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_ANON_KEY

const report = {
  hasEnvFile: true,
  hasSupabaseUrl: hasRealValue(supabaseUrl) && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl),
  hasPublicKey: isValidPublicKey(publicKey),
  restReachable: false,
  status: 'not_checked',
}

if (!report.hasSupabaseUrl || !report.hasPublicKey) {
  report.status = 'missing_or_placeholder_env'
  console.log(JSON.stringify(report, null, 2))
  process.exit(1)
}

try {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      apikey: publicKey,
      Authorization: `Bearer ${publicKey}`,
    },
  })

  report.restReachable = response.status < 500
  report.status = response.ok || response.status === 401 || response.status === 404 ? 'reachable' : `http_${response.status}`
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.restReachable ? 0 : 1)
} catch {
  report.status = 'network_error'
  console.log(JSON.stringify(report, null, 2))
  process.exit(1)
}

function readEnvFile(path) {
  try {
    return readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .reduce((values, line) => {
        const match = line.match(/^\s*([^#][^=]+)=(.*)$/)
        if (!match) return values
        values[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '')
        return values
      }, {})
  } catch {
    return {}
  }
}

function hasRealValue(value) {
  return Boolean(value && !/your-|placeholder|example/i.test(value))
}

function isValidPublicKey(value) {
  if (!hasRealValue(value)) return false
  return value.startsWith('sb_publishable_') || value.length > 60
}
