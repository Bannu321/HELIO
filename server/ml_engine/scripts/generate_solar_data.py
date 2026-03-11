import pandas as pd
import numpy as np
import json
import os

def load_buildings():
    with open('../data/buildings.json', 'r') as f:
        return json.load(f)

def generate_solar_data():
    buildings = load_buildings()
    solar_buildings = [b for b in buildings if b['hasSolar']]
    
    dates = pd.date_range(start="2024-01-01", end="2024-06-30 23:45:00", freq="15min")
    hours = dates.hour
    
    # Simulate weather (sunny, partly_cloudy, cloudy) - changes daily
    days = pd.date_range(start="2024-01-01", end="2024-06-30", freq="D")
    weather_choices = ['clear', 'partly_cloudy', 'cloudy']
    weather_probs = [0.6, 0.3, 0.1] # Mostly clear days
    
    daily_weather = {day.date(): np.random.choice(weather_choices, p=weather_probs) for day in days}
    weather_array = np.array([daily_weather[d.date()] for d in dates])
    
    # Weather efficiency multipliers
    weather_mult = np.where(weather_array == 'clear', 1.0, 
                   np.where(weather_array == 'partly_cloudy', 0.6, 0.3))

    all_data = []
    
    for b in solar_buildings:
        capacity = b['solarCapacityKw']
        
        # Perfect solar curve (bell curve peaking at 12 Noon)
        # Formula: max_capacity * e^(-(hour - 12)^2 / (2 * spread^2))
        spread = 2.5 
        base_curve = np.exp(-((hours + (dates.minute/60) - 12)**2) / (2 * spread**2))
        
        # Zero generation before 6 AM and after 6 PM
        base_curve = np.where((hours >= 6) & (hours <= 18), base_curve, 0)
        
        # Apply weather and capacity (divided by 4 because intervals are 15-mins to get kWh)
        generation = base_curve * capacity * weather_mult / 4 
        
        # Add slight cloud noise
        noise = np.random.uniform(0.9, 1.0, len(dates))
        generation = generation * noise
        
        df = pd.DataFrame({
            'timestamp': dates,
            'buildingId': b['buildingId'],
            'solarGenerationKwh': np.round(generation, 2),
            'weatherCondition': weather_array
        })
        all_data.append(df)

    final_df = pd.concat(all_data, ignore_index=True)
    final_df.to_csv('../data/solar_generation.csv', index=False)
    print(f"✅ Generated {len(final_df)} solar readings. Saved to data/solar_generation.csv")

if __name__ == "__main__":
    generate_solar_data()