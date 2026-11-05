$ErrorActionPreference = "Stop"

docker compose -f compose.yaml down
Write-Host "HELIO containers stopped. Mongo data volume was preserved." -ForegroundColor Yellow
