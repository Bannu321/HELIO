import pandas as pd
import json
import os

def optimize_solar_sharing():
    print("Loading energy and solar data for microgrid optimization...")
    energy_df = pd.read_csv('../data/energy_readings.csv')
    solar_df = pd.read_csv('../data/solar_generation.csv')

    energy_df['timestamp'] = pd.to_datetime(energy_df['timestamp'])
    solar_df['timestamp'] = pd.to_datetime(solar_df['timestamp'])

    # Merge consumption and generation data
    # Buildings without solar will have NaN, which we fill with 0
    # df = pd.merge(energy_df, solar_df[['timestamp', 'buildingId', 'solarGenerationKwh']], 
    #               on=['timestamp', 'buildingId'], how='left')
    # df['solarGenerationKwh'] = df['solarGenerationKwh'].fillna(0)

    df = pd.merge(energy_df, solar_df[['timestamp', 'buildingId', 'solarGenerationKwh']], 
                  on=['timestamp', 'buildingId'], how='left')
    df['solarGenerationKwh'] = df['solarGenerationKwh'].fillna(0)

    df['solarGenerationKwh'] = df['solarGenerationKwh'] * 8

    # last_date = df['timestamp'].max()

    # Filter to the last 7 days for the demo simulation
    last_date = df['timestamp'].max()
    start_date = last_date - pd.Timedelta(days=7)
    recent_df = df[df['timestamp'] > start_date].copy()

    # Campus Battery Storage System
    battery_capacity_kwh = 500.0
    current_battery_level = 100.0  # Start with some charge

    optimization_results = {}
    
    print("Calculating peer-to-peer energy flows and battery states...")
    
    # Process interval by interval chronologically
    for timestamp, group in recent_df.groupby('timestamp'):
        surplus_buildings = []
        deficit_buildings = []
        
        # Determine who has extra and who needs more
        for _, row in group.iterrows():
            b_id = row['buildingId']
            net = row['solarGenerationKwh'] - row['energyConsumptionKwh']
            
            if net > 0:
                surplus_buildings.append({"id": b_id, "amount": net})
            else:
                deficit_buildings.append({"id": b_id, "amount": abs(net)})
                
        # Sort so we fulfill the biggest deficits first
        surplus_buildings.sort(key=lambda x: x['amount'], reverse=True)
        deficit_buildings.sort(key=lambda x: x['amount'], reverse=True)
        
        energy_flows = []
        
        # 1. Peer-to-Peer Sharing
        for surplus in surplus_buildings:
            for deficit in deficit_buildings:
                if surplus['amount'] <= 0:
                    break
                if deficit['amount'] <= 0:
                    continue
                    
                # How much can we transfer?
                transfer_amount = min(surplus['amount'], deficit['amount'])
                
                energy_flows.append({
                    "from_building": surplus['id'],
                    "to_building": deficit['id'],
                    "energy_kwh": round(transfer_amount, 2),
                    "flow_type": "solar_sharing"
                })
                
                surplus['amount'] -= transfer_amount
                deficit['amount'] -= transfer_amount

        # 2. Battery Logic (Charge with remaining surplus, discharge for remaining deficits)
        charged_kwh = 0.0
        discharged_kwh = 0.0
        
        # Any surplus left over goes into the battery
        total_remaining_surplus = sum(s['amount'] for s in surplus_buildings)
        if total_remaining_surplus > 0:
            available_capacity = battery_capacity_kwh - current_battery_level
            charge_amount = min(total_remaining_surplus, available_capacity)
            current_battery_level += charge_amount
            charged_kwh = charge_amount

        # Any deficits left over pull from battery (if it has charge)
        total_remaining_deficit = sum(d['amount'] for d in deficit_buildings)
        if total_remaining_deficit > 0 and current_battery_level > 0:
            discharge_amount = min(total_remaining_deficit, current_battery_level)
            current_battery_level -= discharge_amount
            discharged_kwh = discharge_amount

        ts_str = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        optimization_results[ts_str] = {
            "timestamp": ts_str,
            "energy_flows": energy_flows,
            "battery_storage": {
                "charged_kwh": round(charged_kwh, 2),
                "discharged_kwh": round(discharged_kwh, 2),
                "current_level_kwh": round(current_battery_level, 2),
                "capacity_kwh": battery_capacity_kwh
            }
        }

    # Save to JSON
    os.makedirs('../data', exist_ok=True)
    with open('../data/solar_optimization.json', 'w') as f:
        json.dump(optimization_results, f, indent=2)

    print("✅ Solar optimization complete and saved to data/solar_optimization.json")

if __name__ == "__main__":
    optimize_solar_sharing()