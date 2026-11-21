import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

import main
from main import (
    health_check, get_dashboard_stats, predict_forecast, ForecastRequest,
    get_fefo_inventory, get_iot_telemetry, trigger_iot_simulation, IoTSimulateRequest,
    get_entities, match_surplus, MatchRequest, dispatch_surplus, DispatchRequest,
    get_surplus_history, get_esg_report
)

def run_direct_tests():
    print("1. Testing health_check...")
    h = health_check()
    assert h["status"] == "healthy"
    print("Health:", h)

    print("\n2. Testing get_dashboard_stats...")
    stats = get_dashboard_stats()
    assert "total_food_saved_kg" in stats["kpis"]
    print("KPIs:", stats["kpis"])

    print("\n3. Testing predict_forecast...")
    req = ForecastRequest(
        unit_type="Institutional Kitchen",
        item="North Indian Thali (Dal, Rice, Roti, Sabzi)",
        headcount_or_orders=700,
        date="2026-11-21",
        weather="Sunny",
        event="Normal Day"
    )
    pred = predict_forecast(req)
    assert pred["success"] is True
    print("Forecast output:", pred["prediction"]["predicted_demand_kg"], "kg recommended prep:", pred["prediction"]["recommended_prep_kg"], "kg")

    print("\n4. Testing quality_analyzer...")
    from PIL import Image
    import io
    img = Image.new("RGB", (100, 100), color=(140, 180, 70))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    q_res = main.quality_analyzer.analyze_image(
        image_bytes=buf.getvalue(),
        food_category="Cooked Food",
        item_name="Steamed Rice & Dal",
        hours_since_prep=1.2,
        storage_temp_c=65.0
    )
    print("Quality result:", q_res["freshness_score"], "% -", q_res["freshness_status"], "-", q_res["action_badge"])
    assert q_res["freshness_score"] > 0

    print("\n5. Testing get_fefo_inventory...")
    fefo = get_fefo_inventory()
    print("FEFO count:", fefo["count"])
    assert fefo["count"] > 0

    print("\n6. Testing IoT telemetry and simulation...")
    t = get_iot_telemetry()
    assert "current" in t
    trigger_iot_simulation(IoTSimulateRequest(mode="COLD_CHAIN_BREACH"))
    t2 = get_iot_telemetry()
    assert t2["current"]["anomaly_flag"] == 1
    trigger_iot_simulation(IoTSimulateRequest(mode="NORMAL"))
    print("IoT Anomaly & Normal reset verified!")

    print("\n7. Testing redistribution match & dispatch...")
    entities = get_entities()["entities"]
    src_id = entities[0]["id"]
    match_res = match_surplus(MatchRequest(
        source_entity_id=src_id,
        food_item="Paneer Butter Masala",
        category="Cooked Food",
        quantity_kg=40.0,
        safe_shelf_life_hours=3.5
    ))
    rec = match_res["recommended_receiver"]
    print(f"Matched with: {rec['name']} (Score: {rec['match_score']}, Distance: {rec['distance_km']} km)")

    disp = dispatch_surplus(DispatchRequest(
        source_entity_id=src_id,
        matched_receiver_id=rec["id"],
        food_item="Paneer Butter Masala",
        category="Cooked Food",
        quantity_kg=40.0,
        safe_shelf_life_hours=3.5,
        freshness_score=94.0
    ))
    print("Dispatched successfully:", disp["batch_code"])

    print("\n8. Testing ESG report...")
    esg = get_esg_report()
    assert esg["total_food_diverted_kg"] > 0
    print("ESG Total Food Saved:", esg["total_food_diverted_kg"], "kg, CO2e Avoided:", esg["total_co2e_avoided_kg"], "kg")

    print("\n>>> ALL DIRECT BACKEND LOGIC TESTS PASSED 100%! <<<")

if __name__ == "__main__":
    run_direct_tests()
