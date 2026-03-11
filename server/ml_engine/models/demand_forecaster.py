import pandas as pd
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor
import json
import os
from datetime import timedelta

def train_and_forecast():
    print("Loading energy data for forecasting... (This may take 30-60 seconds)")
    df = pd.read_csv('../data/energy_readings.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    forecasts = {}
    # Get the last timestamp in our dataset to start forecasting the "future"
    last_date = df['timestamp'].max()

    print("Training models and generating 24-hour forecasts for each building...")
    
    for b_id, group in df.groupby('buildingId'):
        group = group.sort_values('timestamp').copy()

        # 1. Feature Engineering
        group['hour'] = group['timestamp'].dt.hour
        group['dayofweek'] = group['timestamp'].dt.dayofweek
        group['is_weekend'] = (group['dayofweek'] >= 5).astype(int)
        
        X = group[['hour', 'dayofweek', 'is_weekend', 'temperatureCelsius']]
        y = group['energyConsumptionKwh']

        # 2. Train the ML Model (Gradient Boosting is extremely fast and accurate for this)
        model = HistGradientBoostingRegressor(random_state=42)
        model.fit(X, y)

        # 3. Generate future timestamps (Next 24 hours = 96 intervals of 15 mins)
        future_dates = [last_date + timedelta(minutes=15 * i) for i in range(1, 97)]
        future_df = pd.DataFrame({'timestamp': future_dates})
        future_df['hour'] = future_df['timestamp'].dt.hour
        future_df['dayofweek'] = future_df['timestamp'].dt.dayofweek
        future_df['is_weekend'] = (future_df['dayofweek'] >= 5).astype(int)

        # Simulate a temperature forecast for the next 24 hours (Bell curve peaking in afternoon)
        month_temp_base = 32 # Assuming June weather
        future_df['temperatureCelsius'] = month_temp_base + np.sin((future_df['hour']-6)*np.pi/12)*5

        # 4. Predict the future!
        X_future = future_df[['hour', 'dayofweek', 'is_weekend', 'temperatureCelsius']]
        predictions = model.predict(X_future)

        # 5. Format the output
        forecast_data = []
        for idx, date in enumerate(future_dates):
            # Ensure predictions don't dip below a realistic baseline (e.g., 5 kWh)
            pred_value = max(round(float(predictions[idx]), 2), 5.0)
            forecast_data.append({
                "timestamp": date.strftime('%Y-%m-%d %H:%M:%S'),
                "predicted_kwh": pred_value
            })

        forecasts[b_id] = forecast_data

    # Save to JSON for the Flask API to serve instantly
    os.makedirs('../data', exist_ok=True)
    with open('../data/forecasts.json', 'w') as f:
        json.dump(forecasts, f, indent=2)

    print("✅ 24-Hour Forecasts generated and saved to data/forecasts.json")

if __name__ == "__main__":
    train_and_forecast()