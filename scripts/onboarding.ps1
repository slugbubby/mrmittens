[CmdletBinding()]
param(
  [switch]$SkipGlobalTools,
  [switch]$SkipDependencies
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ServerEnvExample = Join-Path $RepoRoot 'apps/server/.env.example'
$ServerEnvPath = Join-Path $RepoRoot 'apps/server/.env'
$ClientEnvExample = Join-Path $RepoRoot 'apps/client/.env.example'
$ClientEnvPath = Join-Path $RepoRoot 'apps/client/.env'
$MinimumNodeMajor = 20
$MinimumPnpmMajor = 9
$RunningOnWindows = $env:OS -eq 'Windows_NT'

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

function Write-Info {
  param([string]$Message)
  Write-Host "[info] $Message"
}

function Test-CommandAvailable {
  param([string]$CommandName)
  return $null -ne (Get-Command -Name $CommandName -ErrorAction SilentlyContinue)
}

function Add-SessionPath {
  param([string]$PathEntry)

  if ([string]::IsNullOrWhiteSpace($PathEntry)) {
    return
  }

  $trimmedEntry = $PathEntry.TrimEnd('\\')
  $currentEntries = @($env:Path -split ';' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
  $alreadyPresent = $false

  foreach ($existingEntry in $currentEntries) {
    if ($existingEntry.TrimEnd('\\') -ieq $trimmedEntry) {
      $alreadyPresent = $true
      break
    }
  }

  if (-not $alreadyPresent) {
    $env:Path = "$trimmedEntry;$env:Path"
  }
}

function Refresh-SessionPath {
  $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
  $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
  $combinedPath = @($machinePath, $userPath) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  $env:Path = ($combinedPath -join ';')

  Add-SessionPath (Join-Path $HOME 'scoop\shims')
  Add-SessionPath (Join-Path $HOME 'AppData\Roaming\npm')
}

function Invoke-ExternalCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$FriendlyName = $FilePath
  )

  & $FilePath @Arguments
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) {
    throw "$FriendlyName failed with exit code $exitCode."
  }
}

function Invoke-ExternalCommandAllowFailure {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  $output = & $FilePath @Arguments 2>&1
  $exitCode = $LASTEXITCODE

  return [pscustomobject]@{
    ExitCode = $exitCode
    Output = @($output)
  }
}

function Get-VersionText {
  param(
    [string]$CommandName,
    [string[]]$Arguments = @('--version')
  )

  if (-not (Test-CommandAvailable $CommandName)) {
    return $null
  }

  $output = & $CommandName @Arguments 2>$null
  if ($LASTEXITCODE -ne 0 -or $null -eq $output) {
    return $null
  }

  return ($output | Select-Object -First 1).ToString().Trim()
}

function Get-MajorVersion {
  param([string]$VersionText)

  if ([string]::IsNullOrWhiteSpace($VersionText)) {
    return $null
  }

  $match = [regex]::Match($VersionText, '(\d+)')
  if (-not $match.Success) {
    return $null
  }

  return [int]$match.Groups[1].Value
}

function Assert-WindowsPowerShell {
  if (-not $RunningOnWindows) {
    throw 'This onboarding script only supports Windows.'
  }

  if ($PSVersionTable.PSVersion.Major -lt 5) {
    throw 'PowerShell 5.1 or newer is required.'
  }

  if (-not (Test-Path (Join-Path $RepoRoot 'package.json'))) {
    throw "Could not find package.json in $RepoRoot. Run this script from the repository checkout."
  }

  Write-Success "PowerShell $($PSVersionTable.PSVersion) detected on Windows."
}

function Ensure-ExecutionPolicyForScoop {
  $currentUserPolicy = Get-ExecutionPolicy -Scope CurrentUser
  if ($currentUserPolicy -in @('Restricted', 'Undefined')) {
    Write-Step 'Setting CurrentUser execution policy to RemoteSigned for Scoop.'
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
    Write-Success 'Execution policy updated for the current user.'
  }
  else {
    Write-Success "CurrentUser execution policy is already $currentUserPolicy."
  }
}

function Ensure-Scoop {
  if (Test-CommandAvailable 'scoop') {
    Write-Success 'Scoop is already installed.'
    return
  }

  Ensure-ExecutionPolicyForScoop

  Write-Step 'Installing Scoop.'
  Invoke-RestMethod -Uri 'https://get.scoop.sh' | Invoke-Expression
  Refresh-SessionPath

  if (-not (Test-CommandAvailable 'scoop')) {
    throw 'Scoop installation completed, but the scoop command is still unavailable.'
  }

  Write-Success 'Installed Scoop.'
}

function Ensure-ScoopBucket {
  param(
    [string]$BucketName,
    [string]$BucketSource
  )

  $bucketList = (& scoop bucket list 2>$null | Out-String)
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to list Scoop buckets.'
  }

  if ($bucketList -match "(?m)^\s*$([regex]::Escape($BucketName))\s") {
    Write-Success "Scoop bucket '$BucketName' is already configured."
    return
  }

  Write-Step "Adding Scoop bucket '$BucketName'."
  Invoke-ExternalCommand -FilePath 'scoop' -Arguments @('bucket', 'add', $BucketName, $BucketSource) -FriendlyName "scoop bucket add $BucketName"
  Write-Success "Added Scoop bucket '$BucketName'."
}

function Ensure-NodeJs {
  $nodeVersionText = Get-VersionText -CommandName 'node'
  $nodeMajor = Get-MajorVersion -VersionText $nodeVersionText

  if ($nodeMajor -ge $MinimumNodeMajor) {
    Write-Success "Node.js $nodeVersionText is already available."
    return
  }

  if ($nodeVersionText) {
    Write-WarningMessage "Node.js $nodeVersionText was found, but this repo expects Node.js $MinimumNodeMajor or newer. Installing Node.js LTS with Scoop."
  }
  else {
    Write-Step 'Installing Node.js LTS with Scoop.'
  }

  Ensure-Scoop
  Invoke-ExternalCommand -FilePath 'scoop' -Arguments @('install', 'nodejs-lts') -FriendlyName 'scoop install nodejs-lts'
  Refresh-SessionPath

  $nodeVersionText = Get-VersionText -CommandName 'node'
  $nodeMajor = Get-MajorVersion -VersionText $nodeVersionText
  if ($nodeMajor -lt $MinimumNodeMajor) {
    throw 'Node.js is still unavailable or below the required version after installation.'
  }

  Write-Success "Node.js $nodeVersionText is ready."
}

function Ensure-Pnpm {
  $pnpmVersionText = Get-VersionText -CommandName 'pnpm'
  $pnpmMajor = Get-MajorVersion -VersionText $pnpmVersionText

  if ($pnpmMajor -ge $MinimumPnpmMajor) {
    Write-Success "pnpm $pnpmVersionText is already available."
    return
  }

  if (-not (Test-CommandAvailable 'corepack')) {
    throw 'corepack is required to provision pnpm but was not found after installing Node.js.'
  }

  Write-Step 'Enabling Corepack and activating pnpm 9.'
  $corepackEnable = Invoke-ExternalCommandAllowFailure -FilePath 'corepack' -Arguments @('enable')
  if ($corepackEnable.ExitCode -ne 0) {
    Write-WarningMessage 'corepack enable failed; falling back to npm global pnpm install.'
    foreach ($line in $corepackEnable.Output) {
      if (-not [string]::IsNullOrWhiteSpace($line)) {
        Write-Info $line.ToString().TrimEnd()
      }
    }

    Ensure-NpmGlobalCommand -CommandName 'pnpm' -PackageName 'pnpm@9' -DisplayName 'pnpm'
    return
  }

  Invoke-ExternalCommand -FilePath 'corepack' -Arguments @('prepare', 'pnpm@9', '--activate') -FriendlyName 'corepack prepare pnpm@9 --activate'
  Refresh-SessionPath

  $pnpmVersionText = Get-VersionText -CommandName 'pnpm'
  $pnpmMajor = Get-MajorVersion -VersionText $pnpmVersionText
  if ($pnpmMajor -lt $MinimumPnpmMajor) {
    throw 'pnpm is still unavailable or below the required version after Corepack activation.'
  }

  Write-Success "pnpm $pnpmVersionText is ready."
}

function Ensure-ScoopPackageCommand {
  param(
    [string]$CommandName,
    [string]$PackageName,
    [string]$DisplayName,
    [string]$BucketName,
    [string]$BucketSource
  )

  if (Test-CommandAvailable $CommandName) {
    Write-Success "$DisplayName is already installed."
    return
  }

  Ensure-Scoop
  if ($BucketName -and $BucketSource) {
    Ensure-ScoopBucket -BucketName $BucketName -BucketSource $BucketSource
  }

  Write-Step "Installing $DisplayName with Scoop."
  Invoke-ExternalCommand -FilePath 'scoop' -Arguments @('install', $PackageName) -FriendlyName "scoop install $PackageName"
  Refresh-SessionPath

  if (-not (Test-CommandAvailable $CommandName)) {
    throw "$DisplayName installation completed, but '$CommandName' is still unavailable."
  }

  Write-Success "$DisplayName is ready."
}

function Ensure-NpmGlobalCommand {
  param(
    [string]$CommandName,
    [string]$PackageName,
    [string]$DisplayName
  )

  if (Test-CommandAvailable $CommandName) {
    Write-Success "$DisplayName is already installed."
    return
  }

  Write-Step "Installing $DisplayName with npm."
  Invoke-ExternalCommand -FilePath 'npm' -Arguments @('install', '--global', $PackageName) -FriendlyName "npm install --global $PackageName"

  $npmGlobalPrefix = (& npm prefix -g 2>$null | Select-Object -First 1)
  Refresh-SessionPath
  if ($LASTEXITCODE -eq 0 -and $npmGlobalPrefix) {
    Add-SessionPath $npmGlobalPrefix.ToString().Trim()
  }

  if (-not (Test-CommandAvailable $CommandName)) {
    throw "$DisplayName installation completed, but '$CommandName' is still unavailable."
  }

  Write-Success "$DisplayName is ready."
}

function Ensure-EnvFile {
  param(
    [string]$ExamplePath,
    [string]$TargetPath
  )

  if (Test-Path $TargetPath) {
    Write-Success "Found existing $(Split-Path -Leaf $TargetPath)."
    return
  }

  Copy-Item -Path $ExamplePath -Destination $TargetPath
  Write-Success "Created $(Split-Path -Leaf $TargetPath) from $(Split-Path -Leaf $ExamplePath)."
}

function Install-WorkspaceDependencies {
  Write-Step 'Installing workspace dependencies with pnpm.'
  Push-Location $RepoRoot
  try {
    Invoke-ExternalCommand -FilePath 'pnpm' -Arguments @('install') -FriendlyName 'pnpm install'
  }
  finally {
    Pop-Location
  }

  Write-Success 'Workspace dependencies installed.'
}

function Write-NextSteps {
  Write-Host ''
  Write-Host 'Next steps:' -ForegroundColor Cyan
  Write-Host '  1. Fill in apps/server/.env and apps/client/.env with your local values.'
  Write-Host '  2. Make sure PostgreSQL is running, then apply the schema with:'
  Write-Host '     pnpm --filter @mrmittens/server db:push'
  Write-Host '  3. Start the full stack with:'
  Write-Host '     pnpm dev'
  Write-Host '  4. Start only the backend with:'
  Write-Host '     pnpm --filter @mrmittens/server start:dev'
  Write-Host '  5. Start only the web client with:'
  Write-Host '     pnpm --filter client dev'
  Write-Host '  6. Desktop app note: this branch does not currently contain an Electron app workspace, so there is no desktop run command yet.'
  Write-Host '  7. Manual auth setup still required:'
  Write-Host '     - Register a Twitch app and create apps/server/tokens.notslugbubby.json'
  Write-Host '     - Run vercel login before deploying the client'
}

Write-Step 'Starting Windows onboarding for Mr. Mittens.'
Assert-WindowsPowerShell
Refresh-SessionPath

if (-not (Test-Path (Join-Path $RepoRoot 'pnpm-workspace.yaml')) -or -not (Test-Path (Join-Path $RepoRoot 'pnpm-lock.yaml'))) {
  throw 'This repo expects pnpm workspaces, but pnpm workspace files were not found.'
}

Write-Info 'Detected pnpm workspace repo with apps/client and apps/server.'

if (-not $SkipGlobalTools) {
  Ensure-Scoop
  Ensure-NodeJs
  Ensure-Pnpm
  Ensure-ScoopPackageCommand -CommandName 'twitch' -PackageName 'twitch-cli' -DisplayName 'Twitch CLI' -BucketName 'twitch' -BucketSource 'https://github.com/twitchdev/scoop-bucket.git'
  Ensure-NpmGlobalCommand -CommandName 'vercel' -PackageName 'vercel' -DisplayName 'Vercel CLI'
}
else {
  Write-WarningMessage 'Skipping global tool installation by request.'
}

Ensure-EnvFile -ExamplePath $ServerEnvExample -TargetPath $ServerEnvPath
Ensure-EnvFile -ExamplePath $ClientEnvExample -TargetPath $ClientEnvPath

if (-not $SkipDependencies) {
  Ensure-NodeJs
  Ensure-Pnpm
  Install-WorkspaceDependencies
}
else {
  Write-WarningMessage 'Skipping dependency installation by request.'
}

Write-Success 'Windows onboarding is complete.'
Write-NextSteps
