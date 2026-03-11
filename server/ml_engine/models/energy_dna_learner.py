import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import json
import os

def learn_energy_dna():
    print("Loading energy data for DNA analysis...")
    # Navigate up one directory to access the data folder
    df = pd.read_csv('../data/energy_readings.csv')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['is_weekend'] = df['timestamp'].dt.dayofweek >= 5

    profiles = {}
    features_list = []
    b_ids = []

    print("Extracting features and running K-Means clustering...")
    for b_id, group in df.groupby('buildingId'):
        # 1. Extract mathematical features
        avg_hourly = group.groupby('hour')['energyConsumptionKwh'].mean()
        peak_hour = int(avg_hourly.idxmax())
        base_load = float(group['energyConsumptionKwh'].quantile(0.1))
        peak_load = float(group['energyConsumptionKwh'].quantile(0.95))
        
        weekday_mean = group[~group['is_weekend']]['energyConsumptionKwh'].mean()
        weekend_mean = group[group['is_weekend']]['energyConsumptionKwh'].mean()
        ww_ratio = float(weekday_mean / (weekend_mean if weekend_mean > 0 else 1))

        features = [peak_hour, base_load, peak_load, ww_ratio]
        features_list.append(features)
        b_ids.append(b_id)

        # 2. Store base profile data
        profiles[b_id] = {
            "peak_hour": peak_hour,
            "base_load_kwh": round(base_load, 2),
            "peak_load_kwh": round(peak_load, 2),
            "weekday_weekend_ratio": round(ww_ratio, 2)
        }

    # 3. K-Means Clustering
    X = np.array(features_list)
    # Normalize the data so large numbers (like total kWh) don't overpower small numbers (like ratios)
    X_norm = (X - X.mean(axis=0)) / X.std(axis=0)
    
    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_norm)

    # 4. Assign human-readable DNA labels based on clusters
    dna_labels = {
        0: "9-to-5 Worker",
        1: "Night Owl",
        2: "Always On",
        3: "Weekend Warrior",
        4: "Heat Seeker"
    }

    for i, b_id in enumerate(b_ids):
        c_id = int(clusters[i])
        profiles[b_id]["cluster_id"] = c_id
        profiles[b_id]["dna_type"] = dna_labels.get(c_id, f"Type {c_id}")

    # 5. Save the output to a JSON file for the Flask API to read quickly
    os.makedirs('../data', exist_ok=True)
    with open('../data/energy_dna_profiles.json', 'w') as f:
        json.dump(profiles, f, indent=2)
    
    print("✅ Energy DNA Profiles generated and saved to data/energy_dna_profiles.json")

if __name__ == "__main__":
    learn_energy_dna()