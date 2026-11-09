# HELIO on Google Cloud

HELIO uses two Cloud Run services:

- `helio-ml` — private Python/Flask ML service.
- `helio-api` — public Node/Express API, NVIDIA NIM decision and explanation layers, and audit API.

## One-time GCP setup

1. Create a project and choose a single region (for example `asia-south1`).
2. Enable Cloud Run, Artifact Registry, Cloud Build, Secret Manager, Logging, Monitoring, and Cloud Scheduler APIs.
3. Create a Docker Artifact Registry repository named `helio-containers`.
4. Create a MongoDB Atlas database, preferably in the same region, and add its connection string to Secret Manager as `mongo-uri`.
5. Create an NVIDIA API key and add it to Secret Manager as `nvidia-api-key`.
6. Create dedicated service accounts for `helio-api` and `helio-ml`. Give only `helio-api` permission to access NVIDIA/Mongo secrets. Give the Vercel-facing API public invoker access; keep `helio-ml` private.

## Build images

Run from the repository root after authenticating with `gcloud`:

```powershell
gcloud builds submit --config gcp/cloudbuild.yaml --substitutions=_IMAGE_TAG=latest
```

The same build and deploy flow is available as a PowerShell script. It builds
both images, deploys the ML service privately, obtains its Cloud Run URL, and
deploys the public API with `ML_ENGINE_AUTH=gcp` so Node sends authenticated
ID-token requests to ML:

```powershell
.\scripts\gcp-deploy.ps1 `
  -ProjectId "your-project-id" `
  -ApiServiceAccount "helio-api@your-project-id.iam.gserviceaccount.com" `
  -MlServiceAccount "helio-ml@your-project-id.iam.gserviceaccount.com" `
  -FrontendOrigin "https://your-vercel-domain.vercel.app"
```

Before running it, grant the API service account the Cloud Run Invoker role on
`helio-ml`, and grant it Secret Manager Secret Accessor on the MongoDB and NVIDIA secrets.
The ML service account needs only the runtime permissions required by the ML
container. The script expects the Artifact Registry repository and named
secrets from the one-time setup below to already exist.

## Deploy order

1. Deploy `helio-ml` to Cloud Run with no public access, `PORT=8080`, and a health endpoint of `/api/ml/ready`.
2. Set the API's `ML_ENGINE_URL` to the ML service URL and `ML_ENGINE_AUTH=gcp`; the included script does this automatically.
3. Deploy `helio-api` with `PORT=8080`, `ALLOW_DEMO_WITHOUT_DB=false`, the Vercel domain in `CORS_ORIGINS`, and Secret Manager references for MongoDB and NVIDIA.
4. Set `VITE_API_BASE=https://<helio-api-url>/api` in Vercel and redeploy the frontend.

## Smoke tests

```powershell
Invoke-RestMethod https://<helio-api-url>/api/health
Invoke-RestMethod https://<helio-api-url>/api/ready
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"mode":"simulation"}' https://<helio-api-url>/api/ai/decide
```

The final request should return a policy-approved decision. If the NVIDIA credential is intentionally absent, the response remains usable and clearly reports deterministic/template fallbacks.

NVIDIA NIM exposes an OpenAI-compatible chat completion endpoint at `https://integrate.api.nvidia.com/v1/chat/completions`. HELIO requests a strict JSON decision contract, validates the strategy and urgency locally, and then applies the deterministic safety policy.
