# HELIO Frontend Data Status

The following is a breakdown of which pages in the HELIO frontend currently rely on dummy data, simulations, or fallbacks.

## 1. Pages using `src/services/api.jsx` (100% Mock Data)
The `api.jsx` file is currently configured to return Promises with randomized/static mock data instead of real `axios` calls. Any page consuming this service or the `SolarContext` is using dummy data:

* **`Dashboard.jsx`**: Uses mocked `overview` and `weather` data.
* **`GridMonitor.jsx`**: Uses mocked grid metrics.
* **`PanelHealth.jsx`**: Uses mocked panel fault numbers and string health.
* **`RevenueReports.jsx`**: Uses `fetchRevenueReport` to generate a randomized list of sessions.
* **`WeatherAI.jsx`**: Uses randomized weather conditions and mocked forecasts.
* **`Estimation.jsx`**: Uses `fetchPowerSeries` to plot random curves mimicking Prophet predictions.
* **`EnergyDNA.jsx`**: Consumes the mocked global context.
* **`BatteryManagementModule.jsx`**: Consumes mocked battery levels from the context.

## 2. Pages with Python Backend Fallbacks
These pages attempt to hit the actual Python ML/Log backends (`http://127.0.0.1:5000`), but have hardcoded arrays of dummy data they fall back to if the backend is unreachable.

* **`Alerts.jsx`**: Fetches from `/api/ml/anomalies/latest`. If it fails, it loads 4 hardcoded alerts (e.g., "Low Generation Detected (Array C)").
* **`EnergyLog.jsx`**: Fetches from `/api/grid/log`. If it fails, it loads a hardcoded table of 5 days of generation history and static lifetime yield stats.

## 3. Purely Hardcoded / Locally Simulated Pages
These pages contain hardcoded states or interactive local logic that doesn't communicate with any API.

* **`HardwareStatus.jsx`**: Hardcoded ESP32 metrics, static IP addresses, Modbus baud rates, and a simulated `setInterval` for the heartbeat ping.
* **`EnergyFlow.jsx`**: An interactive Digital Twin sandbox that uses a local "greedy algorithm" React effect to route power based on slider inputs. No external data is used.
* **`GridCommunity.jsx`**: Uses a static array of mock community members and peer-to-peer energy trades.

## Next Steps for Integration
To make the frontend "live", you will need to:
1. Update `src/services/api.jsx` to swap the `delay()` mock functions with actual `axios.get(BASE_URL + '/endpoint')` calls.
2. Ensure the Python backend at `127.0.0.1:5000` is running to feed real ML anomalies to `Alerts.jsx` and `EnergyLog.jsx`.
3. Replace the hardcoded state in `HardwareStatus.jsx` with a websocket or polling endpoint connected directly to the ESP32 or the MQTT broker.
