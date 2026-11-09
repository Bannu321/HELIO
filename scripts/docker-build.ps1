$ErrorActionPreference = "Stop"

docker compose -f compose.yaml build
Write-Host "HELIO images built successfully." -ForegroundColor Green
