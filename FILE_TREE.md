# HELIO Project File Tree

## Root Directory
- `src/`: Main React Frontend (MERN Stack). Contains pages like Dashboard, GridCommunity, WeatherAI, PanelHealth, etc.
- `server/`: Main Node.js/Express Backend and Python ML server.
- `Solar-guardian/`: Independent interactive simulation app (React frontend + FastAPI backend) for real-time physics and P2P grid simulation.
- `public/`, `dist/`: Build outputs and static assets.
- `docker/`: Frontend production image and Nginx SPA configuration.
- `scripts/`: Local container helpers, smoke test, and GCP deployment script.
- `compose.yaml`: Full local MVP stack (MongoDB, ML, API, frontend).

## Main Application (Frontend & Backend)
### `src/` (React Frontend)
- `components/`: Reusable UI elements (charts, dashboard widgets, layout components).
- `pages/`: Application views:
  - `GridCommunity.jsx`: Simulation-ready engine with real-time battery physics and P2P sharing.
  - `Dashboard.jsx`: Main telemetry dashboard.
  - `WeatherAI.jsx`, `PanelHealth.jsx`, `EnergyDNA.jsx`, etc.
- `context/`: React context providers (`SolarContext.jsx` for global state).
- `services/`: API client (`api.jsx`).
- `index.css`, `tailwind.config.js`: Styling.

### `server/` (Backend Ecosystem)
- `server.js`: Node.js Express entry point.
- `models/`: Mongoose schemas for MongoDB.
- `routes/`: Express API endpoints (grid, weather, revenue, estimation).
- `services/mlClient.js`: Shared local/Cloud Run ML client with optional GCP ID-token auth.
- `ml_engine/ml_api.py`: Python ML API for forecasting, anomaly detection, and normalized decision context.
- `ml_engine/requirements.txt`: Pinned Python runtime dependencies.
- `Dockerfile`: Production Node API image.
- `ml_engine/Dockerfile`: Production Python ML image.
- `pnpm-lock.yaml`: Reproducible Node API dependency lockfile.

### Deployment layout
- `gcp/cloudbuild.yaml`: Builds and pushes API/ML images to Artifact Registry.
- `gcp/README.md`: Cloud Run, Secret Manager, and IAM setup.
- `scripts/gcp-deploy.ps1`: Deploys private ML and public API services after image build.

## Solar Guardian Simulation (`Solar-guardian/`)
A dedicated sandbox environment for real-time physics simulation and AI telemetry integration.

### `Solar-guardian/backend/` (FastAPI)
- `main.py`: FastAPI server managing `House` schemas, battery telemetry (`battery_capacity_kwh`, `battery_kwh`), and energy sharing logic.

### `Solar-guardian/frontend/` (React)
- `src/App.jsx`: Main interface for the standalone simulation.
- `src/components/`: Specific widgets like `HouseCard.jsx`, `EnergyFlowDiagram.jsx`, `SliderControls.jsx`.
- `src/api.js`: API client to communicate with the FastAPI backend.
