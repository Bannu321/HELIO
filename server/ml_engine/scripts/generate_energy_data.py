import pandas as pd
import numpy as np
import json
import os
from datetime import timedelta

def load_buildings():
    with open('../data/buildings.json', 'r') as f:
        return json.load(f)

def generate_energy_data():
    buildings = load_buildings()
    
    # 6 Months of 15-min intervals: Jan 1, 2024 to Jun 30, 2024
    dates = pd.date_range(start="2024-01-01", end="2024-06-30 23:45:00", freq="15min")
    
    all_data = []
    
    print("Generating energy readings... this might take a minute.")
    for b in buildings:
        b_type = b['type']
        
        # Base arrays
        hours = dates.hour
        dayofweek = dates.dayofweek
        is_weekend = dayofweek >= 5
        
        # Temperature Simulation (Colder in Jan/Feb, Hotter in May/Jun)
        month_temp_base = {1: 15, 2: 18, 3: 25, 4: 30, 5: 35, 6: 32}
        temps = np.array([month_temp_base[d.month] + np.sin((d.hour-6)*np.pi/12)*5 + np.random.normal(0, 1) for d in dates])
        
        # Base Consumption Profiles
        if b_type == 'academic':
            base = 65
            multiplier = np.where((hours >= 8) & (hours <= 18) & ~is_weekend, 2.0, 0.5)
            occupancy = np.where((hours >= 8) & (hours <= 18) & ~is_weekend, np.random.uniform(40, 90, len(dates)), np.random.uniform(0, 5, len(dates)))
        elif b_type == 'laboratory':
            base = 110
            multiplier = np.where((hours >= 9) & (hours <= 21) & ~is_weekend, 1.8, 1.0)
            occupancy = np.where((hours >= 9) & (hours <= 21), np.random.uniform(30, 80, len(dates)), np.random.uniform(5, 15, len(dates)))
        elif b_type == 'hostel':
            base = 50
            multiplier = np.where(((hours >= 18) | (hours <= 8)), 2.2, 0.8) # High at night/morning
            occupancy = np.where(((hours >= 18) | (hours <= 8)), np.random.uniform(60, 95, len(dates)), np.random.uniform(10, 30, len(dates)))
        elif b_type == 'library':
            base = 40
            multiplier = np.where((hours >= 8) & (hours <= 22), 2.0, 0.4)
            occupancy = np.where((hours >= 8) & (hours <= 22), np.random.uniform(20, 85, len(dates)), 0)
        elif b_type == 'administrative':
            base = 25
            multiplier = np.where((hours >= 9) & (hours <= 17) & ~is_weekend, 2.5, 0.3)
            occupancy = np.where((hours >= 9) & (hours <= 17) & ~is_weekend, np.random.uniform(50, 90, len(dates)), 0)
        elif b_type == 'cafeteria':
            base = 40
            # Spikes at breakfast (7-9), lunch (12-14), dinner (18-20)
            spikes = ((hours >= 7) & (hours <= 9)) | ((hours >= 12) & (hours <= 14)) | ((hours >= 18) & (hours <= 20))
            multiplier = np.where(spikes, 4.0, 0.5)
            occupancy = np.where(spikes, np.random.uniform(60, 100, len(dates)), np.random.uniform(0, 10, len(dates)))
        else: # sports
            base = 50
            multiplier = np.where((hours >= 16) & (hours <= 22), 2.8, 0.5)
            occupancy = np.where((hours >= 16) & (hours <= 22), np.random.uniform(40, 100, len(dates)), 0)

        # Apply Temperature HVAC load (higher temp = more AC)
        hvac_load = np.where(temps > 25, (temps - 25) * 2.5, 0)
        
        # Calculate final consumption with random noise
        consumption = (base * multiplier) + hvac_load + np.random.normal(0, base*0.05, len(dates))
        consumption = np.maximum(consumption, base * 0.2) # Ensure no negative/zero consumption
        
        df = pd.DataFrame({
            'timestamp': dates,
            'buildingId': b['buildingId'],
            'energyConsumptionKwh': np.round(consumption, 2),
            'occupancyPercent': np.round(occupancy, 1),
            'temperatureCelsius': np.round(temps, 1)
        })
        all_data.append(df)

    final_df = pd.concat(all_data, ignore_index=True)
    
    # Inject 20 Random Anomalies
    print("Injecting anomalies...")
    for _ in range(20):
        idx = np.random.randint(0, len(final_df))
        anomaly_type = np.random.choice(['equipment_failure', 'after_hours_waste'])
        
        if anomaly_type == 'equipment_failure':
            # 50-80% spike for 2 hours (8 intervals)
            final_df.loc[idx:idx+8, 'energyConsumptionKwh'] *= np.random.uniform(1.5, 1.8)
        else:
            # High consumption during night
            final_df.loc[idx:idx+16, 'energyConsumptionKwh'] += np.random.uniform(50, 100)

    final_df.to_csv('../data/energy_readings.csv', index=False)
    print(f"✅ Generated {len(final_df)} energy readings. Saved to data/energy_readings.csv")

if __name__ == "__main__":
    generate_energy_data()