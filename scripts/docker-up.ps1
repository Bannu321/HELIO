$ErrorActionPreference = "Stop"

docker compose -f compose.yaml up --build -d
Write-Host "HELIO is running:" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:8080"
Write-Host "  API:      http://localhost:3001/api/health"
Write-Host "  ML:       http://localhost:5000/api/ml/ready"
