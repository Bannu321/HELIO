# HELIO on Google Cloud

HELIO uses two Cloud Run services:

- `helio-ml` — private Python/Flask ML service.
- `helio-api` — public Node/Express API, Jev decision layer, NVIDIA explanation layer, and audit API.

## One-time GCP setup

1. Create a project and choose a single region (for example `asia-south1`).
2. Enable Cloud Run, Artifact Registry, Cloud Build, Secret Manager, Logging, Monitoring, and Cloud Scheduler APIs.
3. Create a Docker Artifact Registry repository named `helio-containers`.
4. Create a MongoDB Atlas database, preferably in the same region, and add its connection string to Secret Manager as `mongo-uri`.
5. Add `jev-api-key` and `nvidia-api-key` to Secret Manager. Do not add those values to Cloud Build substitutions or Vercel.
6. Create dedicated service accounts for `helio-api` and `helio-ml`. Give only `helio-api` permission to access Jev/NVIDIA/Mongo secrets. Give the Vercel-facing API public invoker access; keep `helio-ml` private.

## Build images

Run from the repository root after authenticating with `gcloud`:

```powershell
gcloud builds submit --config gcp/cloudbuild.yaml
```

## Deploy order

1. Deploy `helio-ml` to Cloud Run with no public access, `PORT=8080`, and a health endpoint of `/api/ml/ready`.
2. Copy its private service URL into the `ML_ENGINE_URL` secret used by `helio-api`.
3. Deploy `helio-api` with `PORT=8080`, `ALLOW_DEMO_WITHOUT_DB=false`, the Vercel domain in `CORS_ORIGINS`, and Secret Manager references for MongoDB, Jev, and NVIDIA.
4. Set `VITE_API_BASE=https://<helio-api-url>/api` in Vercel and redeploy the frontend.

## Smoke tests

```powershell
Invoke-RestMethod https://<helio-api-url>/api/health
Invoke-RestMethod https://<helio-api-url>/api/ready
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"mode":"simulation"}' https://<helio-api-url>/api/ai/decide
```

The final request should return a policy-approved decision. If Jev or NVIDIA keys are intentionally absent, the response remains usable and clearly reports deterministic/template fallbacks.
