[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$Command = 'help',

  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Arguments
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ServerEnvPath = Join-Path $RepoRoot 'apps/server/.env'
$ClientEnvPath = Join-Path $RepoRoot 'apps/client/.env'

function Write-Step {
  param([string]$Message)
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Success {
  param([string]$Message)
  Write-Host "[ok] $Message" -ForegroundColor Green
}

function Write-WarningMessage {
  param([string]$Message)
  Write-Host "[warn] $Message" -ForegroundColor Yellow
}

function Get-EnvValue {
  param(
    [string]$FilePath,
    [string]$Key
  )

  if (-not (Test-Path $FilePath)) {
    return $null
  }

  foreach ($line in [System.IO.File]::ReadAllLines($FilePath)) {
    if ($line -match "^$([regex]::Escape($Key))=(.*)$") {
      return $matches[1]
    }
  }

  return $null
}

function Set-EnvValue {
  param(
    [string]$FilePath,
    [string]$Key,
    [string]$Value
  )

  $lines = @()
  if (Test-Path $FilePath) {
    $lines = [System.IO.File]::ReadAllLines($FilePath)
  }

  $updated = $false
  for ($index = 0; $index -lt $lines.Length; $index++) {
    if ($lines[$index] -match "^$([regex]::Escape($Key))=") {
      $lines[$index] = "$Key=$Value"
      $updated = $true
      break
    }
  }

  if (-not $updated) {
    $lines += "$Key=$Value"
  }

  [System.IO.File]::WriteAllLines($FilePath, $lines)
}

function Prompt-EnvValue {
  param(
    [string]$FilePath,
    [string]$Key,
    [string]$Prompt,
    [string]$DefaultValue = '',
    [switch]$Secret
  )

  $currentValue = Get-EnvValue -FilePath $FilePath -Key $Key
  $effectiveDefault = if ($currentValue) { $currentValue } else { $DefaultValue }
  $displayDefault = if ($Secret -and $effectiveDefault) { '<hidden>' } else { $effectiveDefault }

  if ($displayDefault) {
    $inputValue = Read-Host "$Prompt [$displayDefault]"
  }
  else {
    $inputValue = Read-Host $Prompt
  }

  $finalValue = if ([string]::IsNullOrWhiteSpace($inputValue)) {
    $effectiveDefault
  }
  else {
    $inputValue.Trim()
  }

  if ([string]::IsNullOrWhiteSpace($finalValue)) {
    return
  }

  Set-EnvValue -FilePath $FilePath -Key $Key -Value $finalValue
}

function Test-PlaceholderValue {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $true
  }

  $normalizedValue = $Value.Trim().ToLowerInvariant()
  $placeholderPatterns = @(
    'your_',
    'changeme',
    'example',
    'placeholder',
    '<hidden>',
    'postgres:password',
    'streamer_login',
    'streamer display'
  )

  foreach ($pattern in $placeholderPatterns) {
    if ($normalizedValue.Contains($pattern)) {
      return $true
    }
  }

  return $false
}

function Validate-EnvValues {
  $checks = @(
    @{ File = $ServerEnvPath; Key = 'DATABASE_URL'; Label = 'Server DATABASE_URL' },
    @{ File = $ServerEnvPath; Key = 'TWITCH_CLIENT_ID'; Label = 'Twitch client ID' },
    @{ File = $ServerEnvPath; Key = 'TWITCH_CLIENT_SECRET'; Label = 'Twitch client secret' },
    @{ File = $ServerEnvPath; Key = 'TWITCH_CHANNEL_USERNAME'; Label = 'Twitch channel username' },
    @{ File = $ServerEnvPath; Key = 'TWITCH_TOKEN_PATH'; Label = 'Twitch token path' },
    @{ File = $ClientEnvPath; Key = 'API_URL'; Label = 'Client API_URL' }
  )

  $warnings = New-Object System.Collections.Generic.List[string]

  foreach ($check in $checks) {
    $value = Get-EnvValue -FilePath $check.File -Key $check.Key
    if (Test-PlaceholderValue $value) {
      $warnings.Add("$($check.Label) still looks like a placeholder.")
    }
  }

  $tokenPath = Get-EnvValue -FilePath $ServerEnvPath -Key 'TWITCH_TOKEN_PATH'
  if (-not (Test-PlaceholderValue $tokenPath)) {
    $absoluteTokenPath = if ([System.IO.Path]::IsPathRooted($tokenPath)) {
      $tokenPath
    }
    else {
      Join-Path (Join-Path $RepoRoot 'apps/server') $tokenPath
    }

    if (-not (Test-Path $absoluteTokenPath)) {
      $warnings.Add("Twitch token file was not found yet at $tokenPath.")
    }
  }

  if ($warnings.Count -eq 0) {
    Write-Success 'Env validation looks good. Nothing obviously placeholder-shaped survived.'
    return
  }

  Write-WarningMessage 'Some values still need attention before the bot is truly stream-ready:'
  foreach ($warning in $warnings) {
    Write-Host "  - $warning"
  }
}

function Show-Help {
  Write-Host 'slugBot commands:' -ForegroundColor Cyan
  Write-Host '  slugBot onboard    Install tooling, prompt for env values, and warn about placeholders.'
}

function Invoke-Onboard {
  Write-Step 'Running project onboarding.'
  & (Join-Path $PSScriptRoot 'onboarding.ps1') @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "onboarding.ps1 failed with exit code $LASTEXITCODE."
  }

  Write-Step 'Configuring local environment values.'
  Prompt-EnvValue -FilePath $ServerEnvPath -Key 'DATABASE_URL' -Prompt 'Server DATABASE_URL' -DefaultValue 'postgresql://postgres:password@localhost:5432/mittensdb'
  Prompt-EnvValue -FilePath $ServerEnvPath -Key 'PORT' -Prompt 'Server PORT' -DefaultValue '3000'
  Prompt-EnvValue -FilePath $ServerEnvPath -Key 'TWITCH_CLIENT_ID' -Prompt 'Twitch client ID'
  Prompt-EnvValue -FilePath $ServerEnvPath -Key 'TWITCH_CLIENT_SECRET' -Prompt 'Twitch client secret' -Secret
  Prompt-EnvValue -FilePath $ServerEnvPath -Key 'TWITCH_CHANNEL_USERNAME' -Prompt 'Streamer Twitch username'

  $channelUsername = Get-EnvValue -FilePath $ServerEnvPath -Key 'TWITCH_CHANNEL_USERNAME'
  Prompt-EnvValue -FilePath $ServerEnvPath -Key 'TWITCH_CHANNEL_DISPLAY_NAME' -Prompt 'Streamer display name' -DefaultValue $channelUsername
  Prompt-EnvValue -FilePath $ServerEnvPath -Key 'TWITCH_TOKEN_PATH' -Prompt 'Local Twitch token file path' -DefaultValue './tokens.bot.json'
  Prompt-EnvValue -FilePath $ClientEnvPath -Key 'API_URL' -Prompt 'Client API_URL' -DefaultValue 'http://localhost:3000'

  Write-Success 'Local .env files are configured.'
  Validate-EnvValues
  Write-Host ''
  Write-Host 'Next:' -ForegroundColor Cyan
  Write-Host '  1. Generate the Twitch token JSON at the path in TWITCH_TOKEN_PATH.'
  Write-Host '  2. Run pnpm --filter @mrmittens/server db:push'
  Write-Host '  3. Run pnpm dev'
}

switch ($Command.ToLowerInvariant()) {
  'onboard' { Invoke-Onboard }
  'help' { Show-Help }
  default {
    Write-Host "Unknown command: $Command" -ForegroundColor Yellow
    Show-Help
    exit 1
  }
}
