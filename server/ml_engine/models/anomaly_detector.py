import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import json
import os

def detect_anomalies():
    print("Loading energy data to hunt for anomalies...")
    df = pd.read_csv('../data/energy_readings.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    anomalies_list = []

    print("Running Isolation Forest scans on all buildings...")
    for b_id, group in df.groupby('buildingId'):
        # To keep it relevant for a dashboard, we'll scan the last 30 days of data
        recent_data = group[group['timestamp'] >= (group['timestamp'].max() - pd.Timedelta(days=30))].copy()

        if recent_data.empty:
            continue

        recent_data['hour'] = recent_data['timestamp'].dt.hour
        recent_data['dayofweek'] = recent_data['timestamp'].dt.dayofweek

        # Features the AI will use to determine if a reading is "normal"
        X = recent_data[['hour', 'dayofweek', 'energyConsumptionKwh']]

        # Train Isolation Forest (contamination=0.02 means we assume ~2% of data is anomalous)
        model = IsolationForest(contamination=0.02, random_state=42)
        recent_data['anomaly_label'] = model.fit_predict(X)

        # Calculate an expected baseline (simple rolling average for context)
        recent_data['expected_kwh'] = recent_data['energyConsumptionKwh'].rolling(window=4, min_periods=1).mean().shift(1)

        # -1 indicates an anomaly detected by the Isolation Forest
        anomalous_rows = recent_data[recent_data['anomaly_label'] == -1]

        for _, row in anomalous_rows.iterrows():
            expected = row['expected_kwh'] if pd.notna(row['expected_kwh']) else row['energyConsumptionKwh']
            actual = row['energyConsumptionKwh']
            diff = actual - expected
            
            # Categorize the severity
            severity = "high" if abs(diff) > 50 else ("medium" if abs(diff) > 20 else "low")
            anomaly_type = "sudden_spike" if diff > 0 else "unexpected_drop"

            anomalies_list.append({
                "timestamp": row['timestamp'].strftime('%Y-%m-%d %H:%M:%S'),
                "building_id": b_id,
                "anomaly_score": round(abs(float(diff)), 2), # Using the diff magnitude as a proxy score
                "is_anomaly": True,
                "expected_kwh": round(float(expected), 2),
                "actual_kwh": round(float(actual), 2),
                "anomaly_type": anomaly_type,
                "severity": severity
            })

    # Sort anomalies so the newest ones are at the top
    anomalies_list.sort(key=lambda x: x['timestamp'], reverse=True)

    # Save to JSON
    os.makedirs('../data', exist_ok=True)
    with open('../data/anomalies.json', 'w') as f:
        json.dump(anomalies_list, f, indent=2)

    print(f"✅ Detected {len(anomalies_list)} recent anomalies and saved to data/anomalies.json")

if __name__ == "__main__":
    detect_anomalies()