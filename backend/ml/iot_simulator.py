import time
import random
import numpy as np
from datetime import datetime
from collections import deque

class IoTPlantSimulator:
    def __init__(self, plant_id="PLANT-DELHI-NCR-01", plant_name="Mother Dairy / Haldiram Integrated Processing Unit"):
        self.plant_id = plant_id
        self.plant_name = plant_name
        self.active_simulation_mode = "NORMAL" # "NORMAL", "COLD_CHAIN_BREACH", "OVERPRODUCTION_SPIKE", "MACHINE_DOWNTIME"
        self.history = deque(maxlen=30)
        self._init_history()

    def _init_history(self):
        # Prepopulate with 20 historical readings
        base_time = time.time() - (20 * 3)
        for i in range(20):
            ts = datetime.fromtimestamp(base_time + (i * 3)).strftime("%H:%M:%S")
            reading = self._generate_reading_values("NORMAL", ts)
            self.history.append(reading)

    def set_simulation_mode(self, mode: str):
        valid_modes = ["NORMAL", "COLD_CHAIN_BREACH", "OVERPRODUCTION_SPIKE", "MACHINE_DOWNTIME"]
        if mode in valid_modes:
            self.active_simulation_mode = mode
        return {"current_mode": self.active_simulation_mode}

    def _generate_reading_values(self, mode: str, ts_str: str) -> dict:
        anomaly_flag = 0
        anomaly_type = None
        anomaly_desc = None
        mitigation_action = None
        severity = "info"

        if mode == "COLD_CHAIN_BREACH":
            temp = round(random.uniform(12.5, 14.8), 2)
            humidity = round(random.uniform(58.0, 66.0), 1)
            energy = round(random.uniform(44.0, 49.0), 1)
            yield_loss = round(random.uniform(5.5, 7.2), 2)
            line_status = "Warning - Thermal Hazard"
            anomaly_flag = 1
            anomaly_type = "Cold Chain Thermal Breach"
            anomaly_desc = f"CRITICAL: Cold storage chamber temperature spiked to {temp}°C (Safe limit: ≤ 4.0°C). Compressor leak suspected."
            mitigation_action = "Automated Protocol: Dispatched backup thermal curtains; re-routed 180kg dairy/perishable stock to immediate redistribution."
            severity = "critical"
        elif mode == "OVERPRODUCTION_SPIKE":
            temp = round(random.uniform(2.8, 3.8), 2)
            humidity = round(random.uniform(86.0, 91.0), 1)
            energy = round(random.uniform(52.0, 58.0), 1)
            yield_loss = round(random.uniform(14.8, 18.5), 2)
            line_status = "High Throughput - Batch Mismatch"
            anomaly_flag = 1
            anomaly_type = "Overproduction & Yield Spill"
            anomaly_desc = f"HIGH RISK: Raw material trim & yield loss surged to {yield_loss}% (Threshold: 5.0%). 340kg surplus batch at packaging line."
            mitigation_action = "AI Protocol: Auto-published surplus lot to Secondary B2B Discount Feed & Food Bank pickup."
            severity = "warning"
        elif mode == "MACHINE_DOWNTIME":
            temp = round(random.uniform(3.1, 4.0), 2)
            humidity = round(random.uniform(84.0, 89.0), 1)
            energy = round(random.uniform(82.0, 94.5), 1)
            yield_loss = round(random.uniform(8.0, 11.0), 2)
            line_status = "HALTED - Conveyor Motor Stall"
            anomaly_flag = 1
            anomaly_type = "Line Downtime & Phantom Energy Spike"
            anomaly_desc = f"ALERT: Line 2 packaging motor locked. Energy spiked to {energy} kWh while line throughput is zero."
            mitigation_action = "Automated Protocol: Emergency line stop activated to prevent product scorching and save grid power."
            severity = "critical"
        else: # NORMAL
            temp = round(random.uniform(2.4, 3.8), 2)
            humidity = round(random.uniform(87.0, 92.0), 1)
            energy = round(random.uniform(43.0, 47.5), 1)
            yield_loss = round(random.uniform(3.2, 4.4), 2)
            line_status = "Optimal Running"
            anomaly_flag = 0
            anomaly_desc = "All telemetry streams operating within HACCP and ISO 22000 standard control thresholds."

        return {
            "timestamp": ts_str,
            "cold_storage_temp": temp,
            "humidity": humidity,
            "energy_consumption_kwh": energy,
            "yield_loss_pct": yield_loss,
            "line_status": line_status,
            "anomaly_flag": anomaly_flag,
            "anomaly_type": anomaly_type,
            "anomaly_description": anomaly_desc,
            "mitigation_action": mitigation_action,
            "severity": severity,
            "active_mode": mode
        }

    def get_latest_telemetry(self) -> dict:
        ts_str = datetime.now().strftime("%H:%M:%S")
        reading = self._generate_reading_values(self.active_simulation_mode, ts_str)
        self.history.append(reading)

        # Statistical baseline metrics from history
        temps = [r["cold_storage_temp"] for r in self.history]
        energies = [r["energy_consumption_kwh"] for r in self.history]
        yields = [r["yield_loss_pct"] for r in self.history]

        return {
            "current": reading,
            "history": list(self.history),
            "summary": {
                "avg_temp": round(float(np.mean(temps)), 2),
                "avg_energy_kwh": round(float(np.mean(energies)), 1),
                "avg_yield_loss_pct": round(float(np.mean(yields)), 2),
                "active_simulation_mode": self.active_simulation_mode,
                "plant_id": self.plant_id,
                "plant_name": self.plant_name
            }
        }

iot_simulator = IoTPlantSimulator()
