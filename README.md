# ⚡ HELIO — Solar Grid Intelligence Platform

HELIO is a comprehensive Solar Grid Intelligence Platform that combines real-time IoT telemetry, AI-driven forecasting, and peer-to-peer (P2P) grid simulation into a single cohesive ecosystem. 

## Project Architecture

HELIO consists of three major components:

### 1. HELIO Main Frontend (React / Vite)
Located in `src/`. This is the primary user interface.
- **Tech:** React 18, Tailwind CSS, Recharts, React Router v6
- **Features:** Real-time dashboards (`Dashboard.jsx`), P2P simulation visualization (`GridCommunity.jsx`), weather intelligence (`WeatherAI.jsx`), and panel health monitoring (`PanelHealth.jsx`).
- **State Management:** Uses React Context (`SolarContext.jsx`) and a centralized API service layer (`services/api.jsx`).

### 2. HELIO Main Backend Ecosystem
Located in `server/`. A hybrid environment for traditional data persistence and advanced machine learning.
- **Node.js Express Server:** Manages MongoDB collections (`powerreadings`, `revenuesessions`, `weathers`, `panels`) and exposes REST endpoints.
- **Python ML Server:** Handles AI logic, including demand forecasting, anomaly detection, and energy optimization (`server/ml_engine/ml_api.py`).

### 3. Solar Guardian Simulation Sandbox
Located in `Solar-guardian/`. A dedicated module simulating real-world physics, battery degradation, and dynamic grid events.
- **Backend (FastAPI):** `Solar-guardian/backend/main.py` manages real-time states (e.g., `battery_kwh`, `battery_capacity_kwh`) and handles the logic for P2P energy distribution based on simulated deficits and surpluses.
- **Frontend (React):** `Solar-guardian/frontend/` provides a localized dashboard for manipulating the simulation parameters (solar generation, house load) and visualizing real-time flow (`EnergyFlowDiagram.jsx`).

## Key Features & Recent Updates

- **Real-Time Battery Physics:** Fully implemented C-rate monitoring, dynamic time-to-empty calculations, and precise storage telemetry using kWh instead of percentages.
- **Dynamic P2P Sharing:** Surplus/deficit balancing algorithm that intelligently distributes power among nodes in the grid.
- **Scenario Engine:** Interactive real-world test cases including Midday P2P, Evening Deficit, Isolated House Deficit, and Storm Blackouts.
- **Centralized Telemetry Pipeline (Planned):** An upcoming architecture to unify Weather AI, Grid Sensors, and Panel Health into a single real-time data endpoint for the entire platform.

## Quick Start

### HELIO Main App
```bash
# Start Frontend
npm install
npm run dev

# Start Node.js Backend
cd server
pnpm install
pnpm run dev
```

### Reproducible local containers

The complete MVP stack is defined in [`compose.yaml`](compose.yaml): MongoDB,
the Python ML service, the Node decision API, and an Nginx-served frontend.

```powershell
.\scripts\docker-up.ps1
.\scripts\smoke-test.ps1
.\scripts\docker-down.ps1
```

Open `http://localhost:8080` after startup. Provider keys are optional for the
demo; without them, the deterministic safety policy and explanation template
keep the simulated decision loop usable.

### Solar Guardian Sandbox
```bash
# Start FastAPI Backend
cd Solar-guardian/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Start Frontend
cd Solar-guardian/frontend
npm install
npm run dev
```

## Cloud MVP deployment

The cloud-ready deployment uses two Google Cloud Run services: `helio-api` for the Express API, NVIDIA NIM decision and explanation layers, and audit API; and `helio-ml` for the Python ML models. Dockerfiles, Compose packaging, Cloud Build configuration, Secret Manager guidance, and smoke tests are in [`gcp/README.md`](gcp/README.md).

The decision flow is:

```text
ML context → NVIDIA NIM structured decision → deterministic safety policy → NVIDIA explanation → React UI
```

If the NVIDIA NIM credential is unavailable, HELIO returns a deterministic/template fallback and clearly labels its source. No automated hardware actuation is performed by the MVP.
