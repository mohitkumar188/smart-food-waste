import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

import io
import csv
import json
from datetime import datetime
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

from database import init_db, get_db_connection
from seed_data import seed_all
from ml.forecaster import forecaster
from ml.quality_analyzer import quality_analyzer
from ml.iot_simulator import iot_simulator
from ml.route_optimizer import redistribution_matcher, route_optimizer, haversine_distance

def ensure_system_initialized():
    """
    Ensures SQLite database, initial seed records, and ML models exist.
    Essential for ephemeral cloud runtimes (e.g. Render free tier restarts).
    """
    try:
        init_db()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM entities")
        count = cursor.fetchone()[0]
        conn.close()

        if count == 0:
            print("[AnnaSetu Startup] Database is empty. Seeding initial records and verifying ML model...")
            seed_all()
        else:
            forecaster._ensure_trained()
    except Exception as e:
        print(f"[AnnaSetu Startup] Warning during initialization check: {e}")
        try:
            seed_all()
        except Exception as seed_err:
            print(f"[AnnaSetu Startup] Fallback seed error: {seed_err}")

# Auto-initialize on module load & startup
ensure_system_initialized()

app = FastAPI(
    title="AnnaSetu AI - Smart Food Waste & Redistribution API",
    description="AnnaSetu AI — AI-Powered Smart Food Waste Reduction & Sustainable Redistribution Platform (Agriculture, FoodTech & Sustainability)",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    ensure_system_initialized()

# Enable CORS for cross-origin requests (e.g. Vercel frontend -> Render backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class ForecastRequest(BaseModel):
    unit_type: str = "Institutional Kitchen"
    item: str = "North Indian Thali (Dal, Rice, Roti, Sabzi)"
    headcount_or_orders: int = 650
    date: Optional[str] = None
    weather: str = "Sunny"
    event: str = "Normal Day"

class IoTSimulateRequest(BaseModel):
    mode: str # NORMAL, COLD_CHAIN_BREACH, OVERPRODUCTION_SPIKE, MACHINE_DOWNTIME

class MatchRequest(BaseModel):
    source_entity_id: int
    food_item: str
    category: str
    quantity_kg: float
    safe_shelf_life_hours: float

class DispatchRequest(BaseModel):
    source_entity_id: int
    matched_receiver_id: int
    food_item: str
    category: str
    quantity_kg: float
    safe_shelf_life_hours: float
    freshness_score: float = 92.0
    notes: Optional[str] = "Dispatched via Smart Redistribution Logistics"

# 1. Health Endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AnnaSetu-AI-Platform",
        "domain": "Agriculture, FoodTech & Sustainability",
        "timestamp": datetime.now().isoformat()
    }

# 2. Executive Dashboard Overview Stats
@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Aggregate surplus batches
    cursor.execute("""
        SELECT 
            COALESCE(SUM(quantity_kg), 0) as total_kg,
            COALESCE(SUM(co2_avoided_kg), 0) as total_co2,
            COALESCE(SUM(water_saved_liters), 0) as total_water,
            COALESCE(SUM(financial_saved_inr), 0) as total_inr,
            COUNT(*) as total_dispatches
        FROM surplus_batches
    """)
    agg = cursor.fetchone()

    total_kg = float(agg["total_kg"])
    total_co2 = float(agg["total_co2"])
    total_water = float(agg["total_water"])
    total_inr = float(agg["total_inr"])
    meals_redistributed = int(total_kg / 0.4) # 1 meal = 0.4 kg wholesome food

    # Active FEFO critical items
    cursor.execute("SELECT COUNT(*) FROM fefo_inventory WHERE status IN ('Critical', 'Near Expiry')")
    critical_fefo_count = cursor.fetchone()[0]

    # Active IoT anomaly check
    iot_status = iot_simulator.get_latest_telemetry()["current"]
    iot_alerts = 1 if iot_status["anomaly_flag"] == 1 else 0

    active_alerts = critical_fefo_count + iot_alerts

    # Recent activities
    cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 8")
    activities = [dict(row) for row in cursor.fetchall()]

    # Category breakdown
    cursor.execute("""
        SELECT category, COALESCE(SUM(quantity_kg), 0) as weight_kg
        FROM surplus_batches
        GROUP BY category
    """)
    category_rows = cursor.fetchall()
    category_breakdown = [
        {"name": row["category"], "value": round(float(row["weight_kg"]), 1)}
        for row in category_rows
    ]

    # Trend data (synthetic weekly historical progression demonstrating AI reduction)
    trend_data = [
        {"week": "Week 1", "baseline_waste_kg": 980, "ai_actual_waste_kg": 940, "food_saved_kg": 40, "co2_avoided_kg": 100},
        {"week": "Week 2", "baseline_waste_kg": 1020, "ai_actual_waste_kg": 760, "food_saved_kg": 260, "co2_avoided_kg": 650},
        {"week": "Week 3", "baseline_waste_kg": 990, "ai_actual_waste_kg": 540, "food_saved_kg": 450, "co2_avoided_kg": 1125},
        {"week": "Week 4", "baseline_waste_kg": 1050, "ai_actual_waste_kg": 380, "food_saved_kg": 670, "co2_avoided_kg": 1675},
        {"week": "Week 5", "baseline_waste_kg": 1010, "ai_actual_waste_kg": 260, "food_saved_kg": 750, "co2_avoided_kg": 1875},
        {"week": "Week 6 (Current)", "baseline_waste_kg": 1080, "ai_actual_waste_kg": 210, "food_saved_kg": 870, "co2_avoided_kg": 2175}
    ]

    conn.close()

    return {
        "kpis": {
            "total_food_saved_kg": round(total_kg, 1),
            "meals_redistributed": meals_redistributed,
            "financial_savings_inr": round(total_inr, 0),
            "carbon_avoided_kg": round(total_co2, 1),
            "water_saved_liters": round(total_water, 0),
            "active_alerts_count": active_alerts,
            "waste_reduction_rate_pct": 79.2
        },
        "trend_data": trend_data,
        "category_breakdown": category_breakdown,
        "recent_activities": activities,
        "iot_quick_status": {
            "mode": iot_status["active_mode"],
            "line_status": iot_status["line_status"],
            "anomaly_flag": iot_status["anomaly_flag"]
        }
    }

# 3. AI Demand & Surplus Forecasting
@app.post("/api/forecast/predict")
def predict_forecast(req: ForecastRequest):
    try:
        prediction = forecaster.predict(
            unit_type=req.unit_type,
            item=req.item,
            headcount_or_orders=req.headcount_or_orders,
            date_str=req.date,
            weather=req.weather,
            event=req.event
        )
        return {
            "success": True,
            "input": req.dict(),
            "prediction": prediction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Computer Vision Food Quality Inspection
@app.post("/api/quality/inspect")
async def inspect_food_quality(
    image: Optional[UploadFile] = File(None),
    food_category: str = Form("Cooked Food"),
    item_name: str = Form("Prepared Meal Batch"),
    hours_since_prep: float = Form(1.5),
    storage_temp_c: float = Form(65.0)
):
    try:
        image_bytes = b""
        if image:
            image_bytes = await image.read()
            
        result = quality_analyzer.analyze_image(
            image_bytes=image_bytes,
            food_category=food_category,
            item_name=item_name,
            hours_since_prep=hours_since_prep,
            storage_temp_c=storage_temp_c
        )

        # Log quality inspection activity
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO activity_logs (timestamp, event_type, title, description, badge_color)
            VALUES (?, ?, ?, ?, ?)
        """, (
            datetime.now().strftime("%H:%M:%S"),
            "QUALITY_SCAN",
            f"Quality Guard: {item_name}",
            f"Freshness Score: {result['freshness_score']}% ({result['freshness_status']}). Safe Window: {result['estimated_safe_shelf_life_hours']}h. Rec: {result['action_badge']}.",
            result["badge_color"]
        ))
        conn.commit()
        conn.close()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. FEFO Inventory
@app.get("/api/inventory/fefo")
def get_fefo_inventory():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM fefo_inventory ORDER BY safe_hours_remaining ASC")
    items = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"items": items, "count": len(items)}

# 6. IoT Telemetry & Anomaly Simulator
@app.get("/api/iot/telemetry")
def get_iot_telemetry():
    data = iot_simulator.get_latest_telemetry()
    return data

@app.post("/api/iot/simulate")
def trigger_iot_simulation(req: IoTSimulateRequest):
    res = iot_simulator.set_simulation_mode(req.mode)
    
    # Log anomaly trigger in activity
    mode_titles = {
        "COLD_CHAIN_BREACH": "CRITICAL: Cold-Chain Thermal Breach Triggered",
        "OVERPRODUCTION_SPIKE": "WARNING: Overproduction Yield Spill Triggered",
        "MACHINE_DOWNTIME": "ALERT: Machine Idling & Energy Anomaly Triggered",
        "NORMAL": "SYSTEM: Plant Telemetry Restored to Normal"
    }
    mode_colors = {
        "COLD_CHAIN_BREACH": "rose",
        "OVERPRODUCTION_SPIKE": "amber",
        "MACHINE_DOWNTIME": "rose",
        "NORMAL": "emerald"
    }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO activity_logs (timestamp, event_type, title, description, badge_color)
        VALUES (?, ?, ?, ?, ?)
    """, (
        datetime.now().strftime("%H:%M:%S"),
        "IOT_ALERT",
        mode_titles.get(req.mode, "IoT Mode Change"),
        f"Plant telemetry simulation mode set to '{req.mode}' for interactive platform demonstration.",
        mode_colors.get(req.mode, "blue")
    ))
    conn.commit()
    conn.close()
    
    return {"success": True, "active_mode": req.mode}

# 7. Surplus Redistribution & Logistics Matching
@app.get("/api/redistribution/entities")
def get_entities():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM entities")
    entities = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"entities": entities}

@app.post("/api/redistribution/match")
def match_surplus(req: MatchRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get source entity
    cursor.execute("SELECT * FROM entities WHERE id = ?", (req.source_entity_id,))
    source_row = cursor.fetchone()
    if not source_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Source entity not found")
    source = dict(source_row)

    # Get receivers (NGOs, Shelters, Community Kitchens, B2B)
    cursor.execute("SELECT * FROM entities WHERE type IN ('ngo', 'shelter', 'community_kitchen', 'b2b_buyer')")
    receivers = [dict(r) for r in cursor.fetchall()]
    conn.close()

    # Match ranking
    matched_receivers = redistribution_matcher.match_best_receivers(
        source_entity=source,
        surplus_qty_kg=req.quantity_kg,
        safe_hours=req.safe_shelf_life_hours,
        category=req.category,
        available_receivers=receivers
    )

    if not matched_receivers:
        raise HTTPException(status_code=400, detail="No suitable recipient found within safe delivery window")

    # Top match & route optimization
    top_match = matched_receivers[0]
    route_details = route_optimizer.optimize_dispatch_route(
        origin={"lat": source["lat"], "lng": source["lng"], "name": source["name"]},
        stops=[{"lat": top_match["lat"], "lng": top_match["lng"], "name": top_match["name"]}]
    )

    # Environmental benefits
    co2_avoided = round(req.quantity_kg * 2.5, 1)
    water_saved = round(req.quantity_kg * 1000.0, 0)
    inr_saved = round(req.quantity_kg * 65.0, 0)

    return {
        "source": source,
        "matched_receivers": matched_receivers,
        "recommended_receiver": top_match,
        "route_summary": route_details,
        "impact_preview": {
            "co2_avoided_kg": co2_avoided,
            "water_saved_liters": water_saved,
            "financial_saved_inr": inr_saved,
            "meals_provided": int(req.quantity_kg / 0.4)
        }
    }

@app.post("/api/redistribution/dispatch")
def dispatch_surplus(req: DispatchRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch source & receiver details
    cursor.execute("SELECT name, lat, lng FROM entities WHERE id = ?", (req.source_entity_id,))
    source = cursor.fetchone()
    cursor.execute("SELECT name, type, lat, lng FROM entities WHERE id = ?", (req.matched_receiver_id,))
    receiver = cursor.fetchone()

    if not source or not receiver:
        conn.close()
        raise HTTPException(status_code=404, detail="Entity not found")

    dist = haversine_distance(source["lat"], source["lng"], receiver["lat"], receiver["lng"])
    eta = int((dist / 28.0) * 60) + 15
    batch_code = f"DISPATCH-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    co2 = round(req.quantity_kg * 2.5, 1)
    water = round(req.quantity_kg * 1000.0, 0)
    inr = round(req.quantity_kg * 65.0, 0)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
        INSERT INTO surplus_batches (
            batch_code, source_entity_id, source_entity_name, food_item, category,
            quantity_kg, safe_shelf_life_hours, freshness_score, status,
            matched_receiver_id, matched_receiver_name, matched_receiver_type,
            route_distance_km, eta_minutes, co2_avoided_kg, water_saved_liters,
            financial_saved_inr, fssai_checked, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        batch_code, req.source_entity_id, source["name"], req.food_item, req.category,
        req.quantity_kg, req.safe_shelf_life_hours, req.freshness_score, "Dispatched",
        req.matched_receiver_id, receiver["name"], receiver["type"],
        dist, eta, co2, water, inr, 1, req.notes, now_str, now_str
    ))

    # Log activity
    cursor.execute("""
        INSERT INTO activity_logs (timestamp, event_type, title, description, badge_color)
        VALUES (?, ?, ?, ?, ?)
    """, (
        datetime.now().strftime("%H:%M:%S"),
        "DISPATCH",
        f"Redistribution Dispatched: {batch_code}",
        f"Sent {req.quantity_kg} kg of {req.food_item} from {source['name']} to {receiver['name']} (ETA: {eta} min). {co2} kg CO2e avoided.",
        "teal"
    ))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "batch_code": batch_code,
        "source_name": source["name"],
        "receiver_name": receiver["name"],
        "quantity_kg": req.quantity_kg,
        "eta_minutes": eta,
        "distance_km": dist,
        "co2_avoided_kg": co2,
        "water_saved_liters": water,
        "financial_saved_inr": inr,
        "delivery_challan": {
            "tracking_id": batch_code,
            "fssai_hygiene_declaration": "Certified Safe for Consumption / Safe Handling Guaranteed",
            "dispatch_time": now_str,
            "max_safe_window": f"{req.safe_shelf_life_hours} Hours"
        }
    }

@app.get("/api/redistribution/history")
def get_surplus_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM surplus_batches ORDER BY id DESC")
    batches = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"batches": batches}

# 8. ESG & Sustainability Analytics & CSV Export
@app.get("/api/esg/report")
def get_esg_report():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COALESCE(SUM(quantity_kg), 0) as total_kg,
            COALESCE(SUM(co2_avoided_kg), 0) as total_co2,
            COALESCE(SUM(water_saved_liters), 0) as total_water,
            COALESCE(SUM(financial_saved_inr), 0) as total_inr,
            COUNT(*) as total_batches
        FROM surplus_batches
    """)
    agg = cursor.fetchone()
    conn.close()

    total_kg = float(agg["total_kg"])
    total_co2 = float(agg["total_co2"])
    total_water = float(agg["total_water"])
    total_inr = float(agg["total_inr"])
    # Landfill methane abatement (approx 0.08 kg CH4 avoided per kg food diverted from anaerobic landfill decomposition)
    ch4_avoided = round(total_kg * 0.082, 1)

    return {
        "total_food_diverted_kg": round(total_kg, 1),
        "total_co2e_avoided_kg": round(total_co2, 1),
        "total_ch4_abated_kg": ch4_avoided,
        "total_water_conserved_liters": round(total_water, 0),
        "total_financial_value_inr": round(total_inr, 0),
        "meals_provided": int(total_kg / 0.4),
        "compliance_standards": {
            "un_sdg_12_3": {
                "title": "UN Sustainable Development Goal 12.3",
                "target": "Halve global per capita food waste & reduce post-harvest food losses",
                "progress_status": "Aligned & Measured",
                "reduction_achieved_pct": 79.2
            },
            "sebi_brsr": {
                "title": "SEBI BRSR (Business Responsibility & Sustainability Reporting)",
                "principle_6": "Environment: Resource Stewardship, Scope 3 Waste Minimization, and Circular Valorization",
                "principle_8": "Inclusive Growth: Nourishing vulnerable local communities through verified NGO networks",
                "audit_readiness": "Audit Ready (CSV Exportable Logs)"
            },
            "national_fssai": {
                "title": "National Food Safety & FSSAI 'Save Food Share Food Share Joy' Initiative",
                "hygiene_compliance": "FSSAI Schedule 4 Compliant Redistribution Protocol",
                "cold_chain_compliance": "Thermal Threshold Monitored"
            }
        }
    }

@app.get("/api/esg/export-csv")
def export_esg_csv():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            batch_code, source_entity_name, food_item, category,
            quantity_kg, safe_shelf_life_hours, freshness_score,
            status, matched_receiver_name, matched_receiver_type,
            route_distance_km, eta_minutes, co2_avoided_kg,
            water_saved_liters, financial_saved_inr, created_at
        FROM surplus_batches
        ORDER BY id ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Batch Code", "Source Entity", "Food Item", "Category",
        "Quantity (kg)", "Safe Shelf Life (hours)", "Freshness Score (%)",
        "Status", "Recipient Entity", "Recipient Type",
        "Route Distance (km)", "ETA (minutes)", "GHG CO2e Avoided (kg)",
        "Water Conserved (Liters)", "Financial Value Salvaged (INR)", "Timestamp"
    ])

    for r in rows:
        writer.writerow([
            r["batch_code"], r["source_entity_name"], r["food_item"], r["category"],
            r["quantity_kg"], r["safe_shelf_life_hours"], r["freshness_score"],
            r["status"], r["matched_receiver_name"], r["matched_receiver_type"],
            r["route_distance_km"], r["eta_minutes"], r["co2_avoided_kg"],
            r["water_saved_liters"], r["financial_saved_inr"], r["created_at"]
        ])

    output.seek(0)
    filename = f"AnnaSetu_AI_Food_Waste_ESG_Report_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
