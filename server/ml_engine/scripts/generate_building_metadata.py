import json
import random
import os

def generate_buildings():
    building_types = {
        'academic': {'count': 6, 'area': (3000, 8000), 'occ': (300, 800)},
        'laboratory': {'count': 3, 'area': (2000, 5000), 'occ': (100, 300)},
        'hostel': {'count': 4, 'area': (5000, 10000), 'occ': (400, 1000)},
        'library': {'count': 2, 'area': (4000, 7000), 'occ': (500, 1200)},
        'administrative': {'count': 2, 'area': (2000, 4000), 'occ': (150, 400)},
        'cafeteria': {'count': 2, 'area': (1500, 3000), 'occ': (200, 600)},
        'sports': {'count': 1, 'area': (6000, 12000), 'occ': (200, 1500)}
    }

    buildings = []
    b_id = 1
    solar_count = 0
    max_solar_buildings = 12

    for b_type, props in building_types.items():
        for i in range(props['count']):
            # Assign solar panels randomly until we hit 12 buildings
            has_solar = False
            if solar_count < max_solar_buildings and random.choice([True, False]):
                has_solar = True
                solar_count += 1
            
            # Force the last few to have solar if we haven't hit 12
            if (20 - b_id) < (max_solar_buildings - solar_count) and not has_solar:
                has_solar = True
                solar_count += 1

            floor_area = random.randint(*props['area'])
            
            building = {
                "buildingId": f"B{b_id:03d}",
                "name": f"{b_type.capitalize()} Block {chr(65+i)}",
                "type": b_type,
                "floorArea": floor_area,
                "maxOccupancy": random.randint(*props['occ']),
                "hasSolar": has_solar,
                "solarCapacityKw": random.randint(20, 100) if has_solar else 0,
                "hvacCapacityKw": floor_area * 0.04, # Rough estimate
                "lightingLoadKw": floor_area * 0.01,
                "location": {
                    "latitude": 16.5 + random.uniform(-0.01, 0.01),
                    "longitude": 80.5 + random.uniform(-0.01, 0.01)
                }
            }
            buildings.append(building)
            b_id += 1

    # Ensure output directory exists
    os.makedirs('../data', exist_ok=True)
    
    with open('../data/buildings.json', 'w') as f:
        json.dump(buildings, f, indent=2)
    
    print(f"✅ Generated {len(buildings)} buildings. Saved to data/buildings.json")

if __name__ == "__main__":
    generate_buildings()