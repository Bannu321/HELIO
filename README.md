# ⚡ HELIO — Solar Grid Intelligence Platform
### MERN Stack · Tailwind CSS · Recharts · MongoDB · Express · React · Node.js

---

## Project Structure

```
helio-solar/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── layout/               # Sidebar, Topbar
│   │   ├── dashboard/            # StatCard, EstimationPanel, PanelGrid
│   │   ├── charts/               # PowerChart, EnergyRevenueChart
│   │   ├── weather/              # WeatherWidget
│   │   └── reports/              # RevenueTable
│   ├── pages/                    # Dashboard.jsx (+ future pages)
│   ├── context/                  # SolarContext (global state)
│   ├── services/                 # api.js (axios calls → Express)
│   └── index.css                 # Tailwind + custom design system
├── server/                       # Node.js + Express Backend
│   ├── models/index.js           # MongoDB Mongoose models
│   ├── routes/
│   │   ├── grid.js               # /api/grid/overview|series|reading
│   │   ├── revenue.js            # /api/revenue + /api/revenue/summary
│   │   ├── weather.js            # /api/weather/current|history
│   │   ├── panels.js             # /api/panels
│   │   └── estimation.js        # /api/estimation/forecast (Perez model)
│   ├── index.js                  # Express app entry
│   └── .env.example              # Environment template
├── tailwind.config.js            # Custom solar theme
└── package.json
```

---

## Quick Start

### 1. Frontend (React)
```bash
cd helio-solar
npm install
npm start          # Runs on http://localhost:3000
```

### 2. Backend (Node.js + Express)
```bash
cd helio-solar/server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and OpenWeatherMap API key
npm run dev        # Runs on http://localhost:5000
```

### 3. Connect Frontend to Backend
In `src/services/api.js`, replace mock functions with real axios calls:
```js
import axios from 'axios';
const BASE = 'http://localhost:5000/api';

export const fetchGridOverview = () =>
  axios.get(`${BASE}/grid/overview`).then(r => r.data);

export const fetchWeather = () =>
  axios.get(`${BASE}/weather/current`).then(r => r.data);

export const fetchRevenueReport = (page = 1) =>
  axios.get(`${BASE}/revenue?page=${page}`).then(r => r.data);

export const fetchEstimation = () =>
  axios.get(`${BASE}/estimation/forecast`).then(r => r.data);

export const fetchPowerSeries = (range = '24h') =>
  axios.get(`${BASE}/grid/series?range=${range}`).then(r => r.data);
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/grid/overview | Current power, today's energy, efficiency |
| GET | /api/grid/series?range=24h | Time-series power data |
| POST | /api/grid/reading | Ingest IoT inverter data |
| GET | /api/revenue?page=1 | Paginated energy sale sessions |
| GET | /api/revenue/summary | Monthly aggregated revenue |
| GET | /api/weather/current | Current weather + irradiance |
| GET | /api/weather/history?days=7 | Historical weather data |
| GET | /api/panels | All panel statuses |
| PUT | /api/panels/:id | Update panel reading |
| GET | /api/estimation/forecast | AI power forecast (Perez model) |

---

## MongoDB Collections

| Collection | Purpose |
|-----------|---------|
| powerreadings | 15-min interval data from inverter |
| revenuesessions | Energy sold, rate, revenue per session |
| weathers | Weather snapshots (cached from OWM) |
| panels | Individual panel status + health |
| dailysummaries | Aggregated daily statistics |

---

## IoT Integration

The system expects your inverter/ESP32 to POST to `/api/grid/reading` every 15 minutes:
```json
{
  "powerKW": 42.7,
  "energyKWh": 318.5,
  "voltage": 220,
  "current": 194,
  "panelBlock": "BLOCK-A",
  "irradiance": 912,
  "efficiency": 87.4
}
```

---

## Tech Stack

- **Frontend**: React 18, Tailwind CSS 3, Recharts, React Router v6
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB (Atlas or local)
- **Weather API**: OpenWeatherMap (free tier, 1000 calls/day)
- **Forecast Model**: Perez Irradiance + Historical Regression
- **Fonts**: Syne (display) · Space Mono (data) · DM Sans (body)
