from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor

app = Flask(__name__)
# Enable CORS so Node.js and React can make requests to this API
CORS(app)

# Define the path to the generated data files
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')


# 🧠 Train Solar Weather AI Model in memory on boot
print("Training Solar Weather AI Model in memory...")
try:
    solar_df = pd.read_csv(os.path.join(DATA_DIR, 'solar_generation.csv'))
    solar_df['timestamp'] = pd.to_datetime(solar_df['timestamp'])
    solar_df['hour'] = solar_df['timestamp'].dt.hour

    # Map string weather to numeric cloud cover for the ML
    weather_map = {'clear': 10, 'partly_cloudy': 45, 'cloudy': 85}
    solar_df['cloud_cover'] = solar_df['weatherCondition'].map(weather_map)

    # Train on Hour + Cloud Cover to predict kWh
    X = solar_df[['hour', 'cloud_cover']]
    y = solar_df['solarGenerationKwh']

    solar_model = HistGradientBoostingRegressor(random_state=42)
    solar_model.fit(X, y)
    print("✅ Solar Weather AI Model Ready!")
except Exception as e:
    print(f"⚠️ Could not train Solar AI: {e}")
    solar_model = None

@app.route('/api/ml/predict-weather-yield', methods=['POST'])
def predict_weather_yield():
    if solar_model is None:
        return jsonify({"status": "error", "message": "Model not trained"}), 500

    data = request.json
    forecasts = []

    # Predict generation for the requested future hours
    for slot in data.get('hours', []):
        hour = slot['hour']
        cloud_cover = slot['cloudCover']

        # Make prediction (returns kWh for a 15-min interval for ONE building)
        X_pred = pd.DataFrame({'hour': [hour], 'cloud_cover': [cloud_cover]})
        pred_15min_1bldg = max(0, float(solar_model.predict(X_pred)[0]))

        # Convert to Hourly kWh for the whole campus (12 solar buildings * 4 intervals)
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
        return jsonify({
            "status": "success", 
            "results": len(data),
            "data": data
        })
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "DNA profiles not found. Run the training script first."}), 404

@app.route('/api/ml/energy-dna/<building_id>', methods=['GET'])
def get_building_dna(building_id):
    try:
        with open(os.path.join(DATA_DIR, 'energy_dna_profiles.json'), 'r') as f:
            data = json.load(f)
        
        if building_id in data:
            return jsonify({"status": "success", "data": data[building_id]})
        else:
            return jsonify({"status": "error", "message": f"Building {building_id} not found in DNA profiles."}), 404
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "DNA profiles not found."}), 404
    

@app.route('/api/ml/forecast/all', methods=['GET'])
def get_all_forecasts():
    try:
        with open(os.path.join(DATA_DIR, 'forecasts.json'), 'r') as f:
            data = json.load(f)
        return jsonify({"status": "success", "data": data})
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Forecasts not found. Run the forecasting script first."}), 404

@app.route('/api/ml/forecast/<building_id>', methods=['GET'])
def get_building_forecast(building_id):
    # Get 'hours' from query params, default to 24 if not provided
    hours = request.args.get('hours', default=24, type=int)
    intervals = hours * 4 # 4 intervals per hour (15-min each)

    try:
        with open(os.path.join(DATA_DIR, 'forecasts.json'), 'r') as f:
            data = json.load(f)
        
        if building_id in data:
            # Slice the array to return only the requested number of hours
            forecast_slice = data[building_id][:intervals]
            return jsonify({
                "status": "success", 
                "building_id": building_id,
                "forecast_hours": hours,
                "data": forecast_slice
            })
        else:
            return jsonify({"status": "error", "message": f"Building {building_id} not found."}), 404
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Forecasts not found."}), 404
    

@app.route('/api/ml/anomalies', methods=['GET'])
def get_all_anomalies():
    # Allow filtering by building_id if provided in the URL query string
    building_id = request.args.get('building_id')
    
    try:
        with open(os.path.join(DATA_DIR, 'anomalies.json'), 'r') as f:
            data = json.load(f)

        if building_id:
            data = [a for a in data if a['building_id'] == building_id]

        return jsonify({
            "status": "success",
            "results": len(data),
            "data": data
        })
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Anomalies not found. Run the detection script first."}), 404

@app.route('/api/ml/anomalies/latest', methods=['GET'])
def get_latest_anomalies():
    try:
        with open(os.path.join(DATA_DIR, 'anomalies.json'), 'r') as f:
            data = json.load(f)
            
        # Return only the 10 most recent anomalies for the dashboard widget
        return jsonify({
            "status": "success",
            "results": min(10, len(data)),
            "data": data[:10]
        })
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Anomalies not found."}), 404

@app.route('/api/ml/solar-optimization', methods=['GET'])
def get_solar_optimization():
    timestamp = request.args.get('timestamp')
    
    try:
        with open(os.path.join(DATA_DIR, 'solar_optimization.json'), 'r') as f:
            data = json.load(f)
            
        if not data:
            return jsonify({"status": "error", "message": "No optimization data available."}), 404
            
        # If a specific timestamp is requested, return that
        if timestamp and timestamp in data:
            return jsonify({
                "status": "success",
                "data": data[timestamp]
            })
            
        # Otherwise, return the most recent timestamp available
        latest_timestamp = sorted(data.keys())[-1]
        return jsonify({
            "status": "success",
            "timestamp": latest_timestamp,
            "data": data[latest_timestamp]
        })
        
    except FileNotFoundError:
        return jsonify({"status": "error", "message": "Optimization data not found. Run the optimizer script first."}), 404

if __name__ == '__main__':
    # Run Flask on port 5000 so it doesn't conflict with Node on 3000
    app.run(port=5000, debug=True)