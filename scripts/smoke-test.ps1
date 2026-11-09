param(
  [string]$ApiBase = "http://localhost:3001/api",
  [string]$WebBase = "http://localhost:8080"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking frontend..."
$web = Invoke-WebRequest -UseBasicParsing "$WebBase/health"
if ($web.StatusCode -ne 200) { throw "Frontend health check failed." }

Write-Host "Checking API readiness..."
$ready = Invoke-RestMethod "$ApiBase/ready"
if ($ready.status -notin @("ok", "degraded")) { throw "API readiness check failed." }

Write-Host "Checking simulated community data..."
$houses = Invoke-RestMethod "$ApiBase/community/houses"
if (-not $houses.data -and -not $houses.houses) { throw "Community data contract is empty." }

Write-Host "Checking AI decision loop..."
$body = @{ mode = "simulation"; scenario = "evening_deficit" } | ConvertTo-Json
$decision = Invoke-RestMethod -Method Post -ContentType "application/json" -Body $body "$ApiBase/ai/decide"
if ($decision.status -ne "success") { throw "AI decision endpoint failed." }

Write-Host "HELIO smoke test passed." -ForegroundColor Green
