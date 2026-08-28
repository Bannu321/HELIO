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
- **Python ML Server:** Handles AI logic, including demand forecasting, anomaly detection, and energy optimization (`ml_api.py`, `main.py`).

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
npm install
npm run dev
```

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
