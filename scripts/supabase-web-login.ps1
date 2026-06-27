$ErrorActionPreference = 'Stop'

$tokenUrl = 'https://supabase.com/dashboard/account/tokens'
$envPath = Join-Path (Get-Location) '.env'

Write-Host ''
Write-Host 'AutoPay Supabase web login'
Write-Host 'Opening the Supabase access token page in your browser...'
Write-Host ''
Write-Host 'Create a personal access token, copy it, then paste it here.'
Write-Host 'The token will be passed to the Supabase CLI login command and should not be committed.'
Write-Host ''

Start-Process $tokenUrl

$secureToken = Read-Host 'Paste Supabase access token' -AsSecureString
$token = [System.Net.NetworkCredential]::new('', $secureToken).Password.Trim()

if (-not $token) {
  throw 'No token was provided.'
}

if ($token -notmatch '^sbp_') {
  Write-Warning 'Supabase personal access tokens usually start with sbp_. Continuing anyway.'
}

$env:SUPABASE_ACCESS_TOKEN = $token

Write-Host ''
Write-Host 'Logging in with Supabase CLI...'
npx supabase login --token $token

Write-Host ''
Write-Host 'Checking accessible Supabase projects...'
npx supabase projects list

Write-Host ''
$projectRef = Read-Host 'Enter the Supabase project ref to connect AutoPay to'

if (-not $projectRef) {
  Write-Host ''
  Write-Host 'Supabase login is ready for this machine.'
  Write-Host 'No project ref entered, so .env was not updated.'
  exit 0
}

$projectRef = $projectRef.Trim()
$projectUrl = "https://$projectRef.supabase.co"
$apiSettingsUrl = "https://supabase.com/dashboard/project/$projectRef/settings/api"

Write-Host ''
Write-Host "Opening API settings for $projectRef..."
Start-Process $apiSettingsUrl
Write-Host 'Copy the publishable or anon public key from Project Settings > API.'
Write-Host ''

$securePublicKey = Read-Host 'Paste Supabase publishable/anon key' -AsSecureString
$publicKey = [System.Net.NetworkCredential]::new('', $securePublicKey).Password.Trim()

if (-not $publicKey) {
  throw 'No Supabase publishable/anon key was provided.'
}

$envLines = @(
  "VITE_SUPABASE_URL=$projectUrl"
  "VITE_SUPABASE_PUBLISHABLE_KEY=$publicKey"
)

Set-Content -Path $envPath -Value $envLines -Encoding utf8

Write-Host ''
Write-Host ".env updated for $projectUrl"
Write-Host ''

$shouldLink = Read-Host 'Link the Supabase CLI project too? Type y to link, or press Enter to skip'

if ($shouldLink -match '^(y|yes)$') {
  $secureDbPassword = Read-Host 'Paste database password for this project' -AsSecureString
  $dbPassword = [System.Net.NetworkCredential]::new('', $secureDbPassword).Password

  if (-not $dbPassword) {
    throw 'Database password is required to link non-interactively.'
  }

  $env:SUPABASE_DB_PASSWORD = $dbPassword
  npx supabase link --project-ref $projectRef --password $dbPassword
}

Write-Host ''
Write-Host 'Supabase setup is ready.'
Write-Host 'Run npm run supabase:check to verify the app can reach the project.'
