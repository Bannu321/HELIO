from flask import Flask, jsonify, request
from flask_cors import CORS
import json, os, requests, datetime
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor

app = Flask(__name__)
# Enable CORS so Node.js and React can make requests to this API
CORS(app)

# Define the path to the generated data files
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

# LM Studio local server (OpenAI-compatible API)
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"

# ──────────────────────────────────────────────────
# 🧠 Train Solar Weather AI Model in memory on boot
# ──────────────────────────────────────────────────
print("Training Solar Weather AI Model in memory...")
try:
    solar_df = pd.read_csv(os.path.join(DATA_DIR, 'solar_generation.csv'))
    solar_df['timestamp'] = pd.to_datetime(solar_df['timestamp'])
    solar_df['hour'] = solar_df['timestamp'].dt.hour

    weather_map = {'clear': 10, 'partly_cloudy': 45, 'cloudy': 85}
    solar_df['cloud_cover'] = solar_df['weatherCondition'].map(weather_map)

    X = solar_df[['hour', 'cloud_cover']]
    y = solar_df['solarGenerationKwh']

    solar_model = HistGradientBoostingRegressor(random_state=42)
    solar_model.fit(X, y)
    print("✅ Solar Weather AI Model Ready!")
except Exception as e:
    print(f"⚠️ Could not train Solar AI: {e}")
    solar_model = None


# ──────────────────────────────────────────────────
# EXISTING ENDPOINTS (unchanged)
# ──────────────────────────────────────────────────

@app.route('/api/ml/predict-weather-yield', methods=['POST'])
def predict_weather_yield():
    if solar_model is None:
        return jsonify({"status": "error", "message": "Model not trained"}), 500

    data = request.json
    forecasts = []

    for slot in data.get('hours', []):
        hour = slot['hour']
        cloud_cover = slot['cloudCover']

        X_pred = pd.DataFrame({'hour': [hour], 'cloud_cover': [cloud_cover]})
        pred_15min_1bldg = max(0, float(solar_model.predict(X_pred)[0]))

        campus_hourly_kwh = pred_15min_1bldg * 48

        forecasts.append({
            "hour": hour,
            "predicted_kwh": round(campus_hourly_kwh, 2)
        })

    return jsonify({"status": "success", "predictions": forecasts})


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "success", "message": "ML Engine is running smoothly"})

@app.route('/api/ml/energy-dna', methods=['GET'])
def get_all_dna():
    try:
        with open(os.path.join(DATA_DIR, 'energy_dna_profiles.json'), 'r') as f:
            data = json.load(f)
        return jsonify({"status": "success", "results": len(data), "data": data})
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "DNA profiles not found."}), 404

@app.route('/api/ml/energy-dna/<building_id>', methods=['GET'])
def get_building_dna(building_id):
    try:
        with open(os.path.join(DATA_DIR, 'energy_dna_profiles.json'), 'r') as f:
            data = json.load(f)
        if building_id in data:
            return jsonify({"status": "success", "data": data[building_id]})
        return jsonify({"status": "error", "message": f"Building {building_id} not found."}), 404
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "DNA profiles not found."}), 404

@app.route('/api/ml/forecast/all', methods=['GET'])
def get_all_forecasts():
    try:
        with open(os.path.join(DATA_DIR, 'forecasts.json'), 'r') as f:
            data = json.load(f)
        return jsonify({"status": "success", "data": data})
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Forecasts not found."}), 404

@app.route('/api/ml/forecast/<building_id>', methods=['GET'])
def get_building_forecast(building_id):
    hours = request.args.get('hours', default=24, type=int)
    intervals = hours * 4

    try:
        with open(os.path.join(DATA_DIR, 'forecasts.json'), 'r') as f:
            data = json.load(f)
        if building_id in data:
            return jsonify({
                "status": "success",
                "building_id": building_id,
                "forecast_hours": hours,
                "data": data[building_id][:intervals]
            })
        return jsonify({"status": "error", "message": f"Building {building_id} not found."}), 404
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Forecasts not found."}), 404

@app.route('/api/ml/anomalies', methods=['GET'])
def get_all_anomalies():
    building_id = request.args.get('building_id')
    try:
        with open(os.path.join(DATA_DIR, 'anomalies.json'), 'r') as f:
            data = json.load(f)
        if building_id:
            data = [a for a in data if a['building_id'] == building_id]
        return jsonify({"status": "success", "results": len(data), "data": data})
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Anomalies not found."}), 404

@app.route('/api/ml/anomalies/latest', methods=['GET'])
def get_latest_anomalies():
    try:
        # 1. Fetch live telemetry from Express API
        try:
            res = requests.get('http://localhost:3001/api/grid/telemetry/latest', timeout=2)
            telemetry = res.json() if res.status_code == 200 else {}
        except Exception:
            telemetry = {}

        anomalies = []
        is_fault = telemetry.get('fault', False)
        efficiency = telemetry.get('efficiency', 85.0)
        voltage = float(telemetry.get('voltage', 230.0))
        
        # Determine if there's a live anomaly
        anomaly_type = None
        severity = None
        if is_fault:
            anomaly_type = "hardware_fault" if voltage < 10.0 else "unexpected_drop"
            severity = "high"
        elif efficiency < 70.0:
            anomaly_type = "unexpected_drop"
            severity = "medium"
        else:
            # No live anomaly, return empty array
            return jsonify({"status": "success", "results": 0, "data": []})

        # We have an anomaly. Let's build the context for LLM.
        system_prompt = (
            "You are an AI diagnostic agent for a solar microgrid. "
            "Given the anomaly data, output ONLY a JSON object with two keys: "
            "'causes' (an array of 2-3 likely technical causes) and 'action' (a single string recommending immediate action). "
            "Do not include markdown or explanations outside the JSON."
        )
        user_prompt = f"Anomaly: {anomaly_type}, Severity: {severity}, Efficiency: {round(efficiency,1)}%, Voltage: {voltage}V, Fault Flag: {is_fault}. Provide causes and action."

        try:
            lm_response = requests.post(
                LM_STUDIO_URL,
                json={
                    "model": "local-model",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 150,
                    "stream": False
                },
                timeout=5
            )
            lm_response.raise_for_status()
            content = lm_response.json()['choices'][0]['message']['content'].strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            llm_result = json.loads(content)
        except Exception as e:
            # Fallback if LM Studio is offline
            llm_result = {
                "causes": ["Sensor disconnect", "Inverter error", "Panel shading"],
                "action": "Investigate physical connections on string sensors." if is_fault else "Check panels for debris or shading."
            }

        anomalies.append({
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "building_id": "HELIO Core 01",
            "anomaly_score": 95.0 if severity == "high" else 75.0,
            "is_anomaly": True,
            "expected_kwh": 35.0,
            "actual_kwh": round(float(telemetry.get('energyKWh', 0)), 2),
            "anomaly_type": anomaly_type,
            "severity": severity,
            "causes": llm_result.get("causes", ["Unknown issue"]),
            "action": llm_result.get("action", "Inspect system logs.")
        })

        return jsonify({"status": "success", "results": len(anomalies), "data": anomalies})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/ml/solar-optimization', methods=['GET'])
def get_solar_optimization():
    timestamp = request.args.get('timestamp')
    try:
        with open(os.path.join(DATA_DIR, 'solar_optimization.json'), 'r') as f:
            data = json.load(f)
        if not data:
            return jsonify({"status": "error", "message": "No optimization data."}), 404
        if timestamp and timestamp in data:
            return jsonify({"status": "success", "data": data[timestamp]})
        latest_timestamp = sorted(data.keys())[-1]
        return jsonify({"status": "success", "timestamp": latest_timestamp, "data": data[latest_timestamp]})
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Optimization data not found."}), 404


# ──────────────────────────────────────────────────
# NEW: /api/ml/aggregate-context
# Collects all ML outputs into one unified JSON package
# ──────────────────────────────────────────────────

def _get_aggregate_context(scenario_override=None):
    """
    Builds the unified intelligence context from all ML data sources.
    scenario_override: dict with optional keys {irradiance, temperature, load}
    """
    now = datetime.datetime.now()
    hour = now.hour

    # --- Solar forecast (next 6h and 12h) ---
    forecast_kwh_6h = 0.0
    forecast_kwh_12h = 0.0
    irradiance = scenario_override.get('irradiance', 800) if scenario_override else 800
    cloud_cover = max(0, min(100, int((1 - irradiance / 1000) * 100)))

    if solar_model is not None:
        hours_6 = [{'hour': (hour + i) % 24, 'cloudCover': cloud_cover} for i in range(1, 7)]
        hours_12 = [{'hour': (hour + i) % 24, 'cloudCover': cloud_cover} for i in range(1, 13)]
        for slot in hours_6:
            X_pred = pd.DataFrame({'hour': [slot['hour']], 'cloud_cover': [slot['cloudCover']]})
            forecast_kwh_6h += max(0, float(solar_model.predict(X_pred)[0])) * 48
        for slot in hours_12:
            X_pred = pd.DataFrame({'hour': [slot['hour']], 'cloud_cover': [slot['cloudCover']]})
            forecast_kwh_12h += max(0, float(solar_model.predict(X_pred)[0])) * 48

    # --- Battery state from optimization data ---
    battery_kwh = 342.35
    battery_capacity_kwh = 500.0
    try:
        with open(os.path.join(DATA_DIR, 'solar_optimization.json'), 'r') as f:
            opt_data = json.load(f)
        latest = opt_data[sorted(opt_data.keys())[-1]]
        battery_kwh = latest.get('battery_storage', {}).get('current_level_kwh', battery_kwh)
        battery_capacity_kwh = latest.get('battery_storage', {}).get('capacity_kwh', battery_capacity_kwh)
    except Exception:
        pass

    battery_pct = round((battery_kwh / battery_capacity_kwh) * 100, 1)

    # --- Anomalies ---
    active_anomalies = []
    top_anomaly = None
    try:
        with open(os.path.join(DATA_DIR, 'anomalies.json'), 'r') as f:
            anomalies = json.load(f)
        high = [a for a in anomalies if a.get('severity') == 'high']
        medium = [a for a in anomalies if a.get('severity') == 'medium']
        active_anomalies = (high + medium)[:3]
        if active_anomalies:
            top_anomaly = {
                "type": active_anomalies[0].get('anomaly_type'),
                "severity": active_anomalies[0].get('severity'),
                "building": active_anomalies[0].get('building_id'),
                "deviation_pct": round(
                    abs(active_anomalies[0].get('actual_kwh', 0) - active_anomalies[0].get('expected_kwh', 1)) /
                    max(active_anomalies[0].get('expected_kwh', 1), 0.01) * 100, 1
                )
            }
    except Exception:
        pass

    # --- Energy DNA (dominant building profile) ---
    dominant_dna = {"dna_type": "9-to-5 Worker", "peak_hour": 12, "base_load_kwh": 30.0}
    try:
        with open(os.path.join(DATA_DIR, 'energy_dna_profiles.json'), 'r') as f:
            dna = json.load(f)
        if dna:
            dominant_dna = list(dna.values())[0]
    except Exception:
        pass

    # --- Weather label ---
    if cloud_cover < 25:
        weather_label = "clear"
    elif cloud_cover < 60:
        weather_label = "partly cloudy"
    else:
        weather_label = "cloudy"

    current_solar_kw = scenario_override.get('irradiance', 800) / 1000 * 40 if scenario_override else 32.0
    current_load_kw = scenario_override.get('load', 30) if scenario_override else 30.0

    return {
        "timestamp": now.isoformat(),
        "current_hour": hour,
        "weather_condition": weather_label,
        "cloud_cover_pct": cloud_cover,
        "irradiance_wm2": irradiance,
        "current_solar_kw": round(current_solar_kw, 2),
        "current_load_kw": round(current_load_kw, 2),
        "solar_forecast_6h_kwh": round(forecast_kwh_6h, 2),
        "solar_forecast_12h_kwh": round(forecast_kwh_12h, 2),
        "battery_kwh": round(battery_kwh, 2),
        "battery_capacity_kwh": round(battery_capacity_kwh, 2),
        "battery_pct": battery_pct,
        "anomalies_active": len(active_anomalies),
        "top_anomaly": top_anomaly,
        "energy_dna": dominant_dna,
    }


@app.route('/api/ml/aggregate-context', methods=['GET'])
def aggregate_context():
    try:
        ctx = _get_aggregate_context()
        return jsonify({"status": "success", "data": ctx})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ──────────────────────────────────────────────────
# NEW: Rule-engine fallback (no LLM required)
# ──────────────────────────────────────────────────

def _rule_engine_decision(ctx):
    """
    Deterministic fallback when LM Studio is offline.
    Returns the same structure as the LLM response.
    """
    hour = ctx['current_hour']
    battery_pct = ctx['battery_pct']
    solar_kw = ctx['current_solar_kw']
    load_kw = ctx['current_load_kw']
    forecast_6h = ctx['solar_forecast_6h_kwh']
    weather = ctx['weather_condition']
    anomaly = ctx['top_anomaly']

    # Evening approaching (17:00–21:00) + cloudy forecast → protect battery
    if hour >= 15 and weather in ('cloudy', 'partly cloudy') and battery_pct < 50:
        return {
            "strategy": "BATTERY_PRIORITY",
            "primary_action": "Suspend P2P trading. Charge battery from available solar.",
            "load_advice": f"Defer high-load appliances until after 21:00 when evening peak subsides.",
            "reasoning": f"Evening approaching ({hour}:00) with {weather} forecast. "
                         f"Battery at {battery_pct}% ({ctx['battery_kwh']} kWh). "
                         f"Solar forecast for next 6h is only {forecast_6h} kWh — insufficient to cover evening load. "
                         f"Prioritising battery reserves over trading revenue.",
            "confidence": 0.88,
            "expires_minutes": 30,
            "override_greedy": True,
            "source": "rule_engine"
        }

    # Battery critically low → import from grid
    if battery_pct < 15:
        return {
            "strategy": "GRID_IMPORT",
            "primary_action": "Import from grid to replenish battery reserves.",
            "load_advice": "Reduce non-essential load to minimum. Avoid P2P export.",
            "reasoning": f"Battery critically low at {battery_pct}% ({ctx['battery_kwh']} kWh). "
                         f"Grid import is necessary to prevent complete discharge.",
            "confidence": 0.95,
            "expires_minutes": 15,
            "override_greedy": True,
            "source": "rule_engine"
        }

    # Solar surplus + battery healthy → trade
    if solar_kw > load_kw * 1.2 and battery_pct > 60:
        return {
            "strategy": "TRADE",
            "primary_action": "Export surplus solar to P2P grid. Battery adequately charged.",
            "load_advice": "Optimal window for high-load tasks (11:00–14:00 solar peak).",
            "reasoning": f"Solar generating {solar_kw} kW vs {load_kw} kW load — {round(solar_kw - load_kw, 1)} kW surplus. "
                         f"Battery healthy at {battery_pct}%. Recommend exporting surplus.",
            "confidence": 0.85,
            "expires_minutes": 60,
            "override_greedy": False,
            "source": "rule_engine"
        }

    # Active anomaly → investigate before trading
    if anomaly and anomaly['severity'] == 'high':
        return {
            "strategy": "BALANCED",
            "primary_action": f"Hold current routing. Investigate anomaly on {anomaly.get('building', 'system')}.",
            "load_advice": "Do not increase load until anomaly is resolved.",
            "reasoning": f"High-severity anomaly detected: {anomaly.get('type', 'unknown')} — "
                         f"{anomaly.get('deviation_pct', 0)}% deviation from expected. "
                         f"Suspending trading decisions until fault is cleared.",
            "confidence": 0.80,
            "expires_minutes": 10,
            "override_greedy": True,
            "source": "rule_engine"
        }

    # Default — balanced
    return {
        "strategy": "BALANCED",
        "primary_action": "Greedy algorithm routing is optimal. No override needed.",
        "load_advice": "System operating within expected parameters.",
        "reasoning": f"Solar: {solar_kw} kW | Load: {load_kw} kW | Battery: {battery_pct}% | Weather: {weather}. "
                     f"No significant condition change. Greedy routing is sufficient.",
        "confidence": 0.75,
        "expires_minutes": 30,
        "override_greedy": False,
        "source": "rule_engine"
    }


# ──────────────────────────────────────────────────
# NEW: /api/ai/energy-decision
# Sends ML context to LM Studio → returns structured strategy
# ──────────────────────────────────────────────────

@app.route('/api/ai/energy-decision', methods=['POST', 'GET'])
def energy_decision():
    try:
        # Accept scenario overrides from frontend sliders (optional)
        if request.method == 'POST':
            override = request.json or {}
        else:
            override = {
                'irradiance': request.args.get('irradiance', type=float),
                'temperature': request.args.get('temperature', type=float),
                'load': request.args.get('load', type=float),
            }
            override = {k: v for k, v in override.items() if v is not None}

        ctx = _get_aggregate_context(override if override else None)

        # Build the LLM prompt
        system_prompt = (
            "You are HELIO's AI Energy Manager embedded in a solar microgrid system. "
            "Your job is to analyse the current energy state and make ONE clear strategic decision. "
            "Respond ONLY with a valid JSON object — no markdown, no explanation outside the JSON. "
            "Required JSON keys: strategy (one of: BATTERY_PRIORITY, TRADE, GRID_IMPORT, BALANCED), "
            "primary_action (string, max 120 chars), load_advice (string, max 120 chars), "
            "reasoning (string, 2-4 sentences), confidence (float 0.0-1.0), "
            "expires_minutes (int), override_greedy (boolean)."
        )

        user_prompt = f"""Current Energy State — {ctx['timestamp']}

Solar Generation Now: {ctx['current_solar_kw']} kW
Campus Load Now: {ctx['current_load_kw']} kW
Battery: {ctx['battery_kwh']} kWh / {ctx['battery_capacity_kwh']} kWh ({ctx['battery_pct']}%)
Weather: {ctx['weather_condition']} (Cloud cover: {ctx['cloud_cover_pct']}%)
Solar Forecast next 6h: {ctx['solar_forecast_6h_kwh']} kWh
Solar Forecast next 12h: {ctx['solar_forecast_12h_kwh']} kWh
Current Hour: {ctx['current_hour']}:00
Active Anomalies: {ctx['anomalies_active']}
Top Anomaly: {json.dumps(ctx['top_anomaly']) if ctx['top_anomaly'] else 'None'}
Energy DNA (dominant profile): {ctx['energy_dna'].get('dna_type')} — peak at {ctx['energy_dna'].get('peak_hour')}:00, base load {ctx['energy_dna'].get('base_load_kwh')} kWh

Available strategies: BATTERY_PRIORITY, TRADE, GRID_IMPORT, BALANCED
What is the optimal energy strategy? Respond in JSON only."""

        # Try LM Studio
        try:
            lm_response = requests.post(
                LM_STUDIO_URL,
                json={
                    "model": "local-model",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.2,
                    "max_tokens": 400,
                    "stream": False
                },
                timeout=10
            )
            lm_response.raise_for_status()
            content = lm_response.json()['choices'][0]['message']['content'].strip()

            # Strip markdown code fences if the model adds them
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]

            decision = json.loads(content)
            decision['source'] = 'llm'
            decision['context_snapshot'] = ctx

            return jsonify({"status": "success", "data": decision})

        except Exception as lm_err:
            # LM Studio offline or returned bad JSON — use rule engine
            print(f"⚠️  LM Studio unavailable ({lm_err}), using rule engine fallback")
            decision = _rule_engine_decision(ctx)
            decision['context_snapshot'] = ctx
            return jsonify({"status": "success", "data": decision})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == '__main__':
    # Run Flask on port 5000 so it doesn't conflict with Node on 3001
    app.run(port=5000, debug=True)
