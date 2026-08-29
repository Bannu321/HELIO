"""
HELIO Solar Guardian Simulator
================================
Replays real solar_generation.csv data as if it were live ESP32 telemetry,
writing readings to the Express API every 5 seconds.

Supports interactive condition overrides via keyboard commands:
  c  → Switch weather to CLOUDY  (irradiance drops to 150 W/m²)
  p  → Switch weather to PARTLY CLOUDY (500 W/m²)
  s  → Switch weather to CLEAR / SUNNY (900 W/m²)
  f  → Inject FAULT (irradiance drops to 0, fault flag on)
  n  → Simulate NIGHT (irradiance = 0, normal)
  l  → LOAD SPIKE (+15 kW load injection for 30s)
  r  → RESET all overrides (resume CSV replay)
  q  → Quit simulator

Usage:
  python solar_guardian_sim.py [--speed 1.0] [--api http://localhost:3001]
"""

import csv
import os
import sys
import time
import json
import math
import random
import argparse
import threading
import requests
import datetime

# ──────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), 'ml_engine', 'data')
CSV_PATH = os.path.join(DATA_DIR, 'solar_generation.csv')
# ──────────────────────────────────────────────

# ── Shared override state (thread-safe via GIL for simple dicts) ──
override = {
    'active': False,
    'type': None,           # 'cloudy' | 'partly_cloudy' | 'clear' | 'fault' | 'night'
    'irradiance': None,     # W/m²  — None means use CSV value
    'load_spike': False,
    'load_spike_until': 0,
    'fault': False,
    'efficiency_drop': False,
    'device_disconnect': False,
}


def apply_override(row: dict) -> dict:
    """Mutates a CSV row dict to reflect the current interactive override."""
    now = time.time()

    if override['fault']:
        row['solarGenerationKwh'] = '0.000'
        row['irradiance'] = '0'
        row['fault'] = True
        return row

    if override['device_disconnect']:
        row['solarGenerationKwh'] = '0.000'
        row['voltage'] = '0.0'
        row['fault'] = True
        return row

    if override['efficiency_drop']:
        row['efficiency'] = random.uniform(40, 50)
        # Drop generation by 40%
        gen = float(row.get('solarGenerationKwh', 0)) * 0.6
        row['solarGenerationKwh'] = str(round(gen, 3))

    if override['irradiance'] is not None:
        base_irr = float(override['irradiance'])
        # Add ±3% jitter for realism
        irr = max(0, base_irr * (1 + (random.random() - 0.5) * 0.06))
        # Scale generation proportionally
        gen = float(row.get('solarGenerationKwh', 0)) * (irr / 900)
        row['irradiance'] = str(round(irr, 1))
        row['solarGenerationKwh'] = str(round(max(0, gen), 3))

    if override['load_spike'] and now < override['load_spike_until']:
        load = float(row.get('loadKwh', 5)) + 15  # +15 kW spike
        row['loadKwh'] = str(round(load, 3))
    elif now >= override['load_spike_until']:
        override['load_spike'] = False

    return row


def post_reading(row: dict, api_url: str):
    """Sends one row to the Express /api/grid/reading endpoint."""
    try:
        payload = {
            'powerKW':     float(row.get('solarGenerationKwh', 0)) * 4,  # kWh/15min → kW
            'energyKWh':   float(row.get('solarGenerationKwh', 0)),
            'voltage':     float(row.get('voltage', 230 + random.uniform(-2, 2))),
            'current':     float(row.get('solarGenerationKwh', 0)) * 4 / max(230, 0.01),
            'irradiance':  float(row.get('irradiance', 800)),
            'temperature': float(row.get('panelTemperatureC', 35 + random.uniform(-3, 3))),
            'efficiency':  float(row.get('efficiency', 85 + random.uniform(-3, 5))),
            'fault':       row.get('fault', False),
            'source':      'solar_guardian_sim',
            'timestamp':   datetime.datetime.utcnow().isoformat() + 'Z',
        }
        resp = requests.post(f'{api_url}/api/grid/reading', json=payload, timeout=3)
        return resp.status_code
    except requests.exceptions.RequestException as e:
        return f'ERR:{e}'


def keyboard_listener():
    """Listens for single-key commands from stdin (non-blocking on Windows via thread)."""
    print("\n[SIM] Keyboard controls: c=Cloudy p=Partly s=Sunny f=Fault e=EfficiencyDrop d=Disconnect l=LoadSpike r=Reset q=Quit")
    commands = {
        'c': ('CLOUDY',        150),
        'p': ('PARTLY CLOUDY', 500),
        's': ('CLEAR/SUNNY',   900),
        'n': ('NIGHT',          0),
    }
    while True:
        try:
            key = input().strip().lower()
        except EOFError:
            break

        if key == 'q':
            print('[SIM] Quitting...')
            os._exit(0)
        elif key == 'r':
            override['active'] = False
            override['type'] = None
            override['irradiance'] = None
            override['fault'] = False
            override['load_spike'] = False
            override['efficiency_drop'] = False
            override['device_disconnect'] = False
            print('[SIM] ✅ Overrides cleared — resuming CSV replay')
        elif key == 'f':
            override['fault'] = True
            override['active'] = True
            override['type'] = 'FAULT'
            print('[SIM] ⚠️  FAULT injected — solar generation forced to 0')
        elif key == 'e':
            override['efficiency_drop'] = True
            override['active'] = True
            override['type'] = 'EFF_DROP'
            print('[SIM] ⚠️  EFFICIENCY DROP injected — panels derated to 40%')
        elif key == 'd':
            override['device_disconnect'] = True
            override['active'] = True
            override['type'] = 'DISCONNECT'
            print('[SIM] ⚠️  DEVICE DISCONNECT injected — String sensor offline')
        elif key == 'l':
            override['load_spike'] = True
            override['load_spike_until'] = time.time() + 30  # 30 seconds
            print('[SIM] ⚡ Load spike injected (+15 kW for 30 seconds)')
        elif key in commands:
            label, irr = commands[key]
            override['active'] = True
            override['type'] = label
            override['irradiance'] = irr
            override['fault'] = False
            print(f'[SIM] 🌤  Weather → {label} (irradiance: {irr} W/m²)')
        else:
            print(f'[SIM] Unknown key: {key!r}')


def run_simulation(api_url: str, speed: float):
    """Main replay loop — reads CSV row by row in a continuous loop."""
    if not os.path.exists(CSV_PATH):
        print(f'[SIM] ERROR: Cannot find {CSV_PATH}')
        print('[SIM] Make sure you are running from the /server directory.')
        sys.exit(1)

    print(f'[SIM] 🌞 HELIO Solar Guardian Simulator Starting')
    print(f'[SIM] API Target  : {api_url}')
    print(f'[SIM] CSV Source  : {CSV_PATH}')
    print(f'[SIM] Interval    : {5/speed:.1f}s (speed ×{speed})')
    print(f'[SIM] Press Enter then a key command to change conditions.\n')

    rows_sent = 0
    loop_count = 0

    while True:  # loop CSV file continuously
        loop_count += 1
        with open(CSV_PATH, 'r', newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                row = apply_override(dict(row))
                status = post_reading(row, api_url)
                rows_sent += 1

                # Status line
                irr  = float(row.get('irradiance', 0))
                gen  = float(row.get('solarGenerationKwh', 0))
                cond = override['type'] or row.get('weatherCondition', 'live')
                fault_str = '⚠️  FAULT' if override['fault'] else ''
                print(
                    f'\r[SIM] #{rows_sent:>6}  '
                    f'Gen: {gen:>6.3f} kWh  '
                    f'Irr: {irr:>5.0f} W/m²  '
                    f'Cond: {cond:<15}  '
                    f'HTTP: {status}  {fault_str}    ',
                    end='', flush=True
                )

                time.sleep(5 / speed)

        print(f'\n[SIM] Loop {loop_count} complete — restarting CSV replay...')


def main():
    parser = argparse.ArgumentParser(description='HELIO Solar Guardian Simulator')
    parser.add_argument('--api',   default='http://localhost:3001', help='Express API base URL')
    parser.add_argument('--speed', default=1.0, type=float,         help='Playback speed multiplier (default 1.0)')
    args = parser.parse_args()

    # Start keyboard listener in background thread
    kb_thread = threading.Thread(target=keyboard_listener, daemon=True)
    kb_thread.start()

    run_simulation(api_url=args.api, speed=args.speed)


if __name__ == '__main__':
    main()
