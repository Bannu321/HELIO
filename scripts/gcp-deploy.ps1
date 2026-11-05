param(
  [Parameter(Mandatory = $true)] [string]$ProjectId,
  [string]$Region = "asia-south1",
  [string]$Repository = "helio-containers",
  [Parameter(Mandatory = $true)] [string]$ApiServiceAccount,
  [Parameter(Mandatory = $true)] [string]$MlServiceAccount,
  [Parameter(Mandatory = $true)] [string]$FrontendOrigin,
  [string]$MongoSecret = "mongo-uri",
  [string]$NvidiaSecret = "nvidia-api-key"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  throw "gcloud CLI is required. Install it and run gcloud auth login first."
}

gcloud config set project $ProjectId
$tag = (git rev-parse HEAD).Trim()
gcloud builds submit --config gcp/cloudbuild.yaml --substitutions=_REGION=$Region,_REPOSITORY=$Repository,_IMAGE_TAG=$tag

$registry = "$Region-docker.pkg.dev/$ProjectId/$Repository"
$mlImage = "$registry/helio-ml:$tag"
$apiImage = "$registry/helio-api:$tag"

gcloud run deploy helio-ml `
  --image $mlImage `
  --region $Region `
  --platform managed `
  --service-account $MlServiceAccount `
  --no-allow-unauthenticated `
  --port 8080 `
  --set-env-vars PORT=8080

$mlUrl = (gcloud run services describe helio-ml --region $Region --format="value(status.url)").Trim()

gcloud run deploy helio-api `
  --image $apiImage `
  --region $Region `
  --platform managed `
  --service-account $ApiServiceAccount `
  --allow-unauthenticated `
  --port 8080 `
  --set-env-vars "PORT=8080,ALLOW_DEMO_WITHOUT_DB=false,ML_ENGINE_URL=$mlUrl,ML_ENGINE_AUTH=gcp,CORS_ORIGINS=$FrontendOrigin,NVIDIA_MODEL=openai/gpt-oss-120b,NVIDIA_API_URL=https://integrate.api.nvidia.com/v1/chat/completions,NVIDIA_CONFIDENCE_THRESHOLD=0.75" `
  --set-secrets "MONGO_URI=$MongoSecret`:latest,NVIDIA_API_KEY=$NvidiaSecret`:latest"

$apiUrl = (gcloud run services describe helio-api --region $Region --format="value(status.url)").Trim()
gcloud run services update helio-ml --region $Region --update-env-vars "HELIO_API_URL=$apiUrl"

Write-Host "Cloud Run deployment completed." -ForegroundColor Green
Write-Host "ML service:  $mlUrl"
Write-Host "API service:  $apiUrl"
