# HELIO Project File Tree

## Root Directory
- `src/`: Main React Frontend (MERN Stack). Contains pages like Dashboard, GridCommunity, WeatherAI, PanelHealth, etc.
- `server/`: Main Node.js/Express Backend and Python ML server.
- `Solar-guardian/`: Independent interactive simulation app (React frontend + FastAPI backend) for real-time physics and P2P grid simulation.
- `public/`, `dist/`: Build outputs and static assets.

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
- `server.js`, `index.js`: Node.js Express entry points.
- `models/`: Mongoose schemas for MongoDB.
- `routes/`: Express API endpoints (grid, weather, revenue, estimation).
- `main.py`, `ml_api.py`: Python ML backends for forecasting and anomaly detection.
- `models/` (Python): ML models for solar optimization and energy DNA.

## Solar Guardian Simulation (`Solar-guardian/`)
A dedicated sandbox environment for real-time physics simulation and AI telemetry integration.

### `Solar-guardian/backend/` (FastAPI)
- `main.py`: FastAPI server managing `House` schemas, battery telemetry (`battery_capacity_kwh`, `battery_kwh`), and energy sharing logic.

### `Solar-guardian/frontend/` (React)
- `src/App.jsx`: Main interface for the standalone simulation.
- `src/components/`: Specific widgets like `HouseCard.jsx`, `EnergyFlowDiagram.jsx`, `SliderControls.jsx`.
- `src/api.js`: API client to communicate with the FastAPI backend.
