import os
import random
from datetime import datetime, timedelta
from database import init_db, get_db_connection
from ml.forecaster import forecaster

ENTITIES_DATA = [
    # Source: Institutional Kitchens & Processing Plants
    {
        "name": "IIT Delhi Central Dining Hall",
        "type": "kitchen",
        "category_label": "Institutional Kitchen (Higher Ed)",
        "address": "Hauz Khas, New Delhi",
        "city": "South Delhi",
        "lat": 28.5450,
        "lng": 77.1926,
        "contact_person": "Chef Rajesh Sharma",
        "phone": "+91 98110 23412",
        "capacity_kg": 600,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "Amity University Mega Kitchen Hub",
        "type": "kitchen",
        "category_label": "Institutional Kitchen (Campus)",
        "address": "Sector 125, Noida Express Highway",
        "city": "Noida",
        "lat": 28.5440,
        "lng": 77.3331,
        "contact_person": "Virender Tyagi",
        "phone": "+91 98730 45812",
        "capacity_kg": 950,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "Mother Dairy Patparganj Processing Plant",
        "type": "processing_unit",
        "category_label": "Food Processing Unit (Dairy & Beverages)",
        "address": "Patparganj Industrial Area",
        "city": "East Delhi",
        "lat": 28.6289,
        "lng": 77.2965,
        "contact_person": "Dr. Sunita Rao (QA Head)",
        "phone": "+91 99100 87654",
        "capacity_kg": 4000,
        "accepts_perishable": 1,
        "accepts_cooked": 0,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "Haldiram Snacks Line-4 Processing Unit",
        "type": "processing_unit",
        "category_label": "Food Processing Unit (Snacks & Bakery)",
        "address": "Sector 63, Industrial Complex",
        "city": "Noida",
        "lat": 28.6258,
        "lng": 77.3824,
        "contact_person": "Anil Agarwal (Plant Mgr)",
        "phone": "+91 98210 99876",
        "capacity_kg": 3500,
        "accepts_perishable": 0,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "IMS Ghaziabad Hostel Kitchen",
        "type": "kitchen",
        "category_label": "Institutional Kitchen (Hostel)",
        "address": "G.T. Road, Lal Quan",
        "city": "Ghaziabad",
        "lat": 28.6720,
        "lng": 77.4420,
        "contact_person": "Manoj Verma",
        "phone": "+91 97180 54321",
        "capacity_kg": 450,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    # Receivers: NGOs, Shelters, Community Kitchens, B2B Secondary
    {
        "name": "Robin Hood Army (Noida Central Chapter)",
        "type": "ngo",
        "category_label": "Verified NGO (Zero-Hunger)",
        "address": "Atta Market, Sector 18",
        "city": "Noida",
        "lat": 28.5708,
        "lng": 77.3260,
        "contact_person": "Pooja Malhotra (Volunteer Lead)",
        "phone": "+91 98101 22334",
        "capacity_kg": 350,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "Feeding India by Zomato (Delhi-East Hub)",
        "type": "ngo",
        "category_label": "Verified Food Bank & NGO",
        "address": "Pocket 1, Mayur Vihar Phase 1",
        "city": "East Delhi",
        "lat": 28.6080,
        "lng": 77.2990,
        "contact_person": "Rohan Mehra",
        "phone": "+91 99990 11223",
        "capacity_kg": 600,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "Roti Bank Ghaziabad (Nav Yug Market)",
        "type": "community_kitchen",
        "category_label": "Community Kitchen & Food Bank",
        "address": "Navyug Market, Model Town",
        "city": "Ghaziabad",
        "lat": 28.6650,
        "lng": 77.4350,
        "contact_person": "Sardar Kuldeep Singh",
        "phone": "+91 98910 88776",
        "capacity_kg": 280,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "Rain Basera DUSIB Night Shelter Home",
        "type": "shelter",
        "category_label": "Government Shelter Home",
        "address": "Near ISBT, Kashmere Gate",
        "city": "Central Delhi",
        "lat": 28.6665,
        "lng": 77.2285,
        "contact_person": "Devi Prasad (Superintendent)",
        "phone": "+91 97110 33445",
        "capacity_kg": 200,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    },
    {
        "name": "AgroBio Organics & Animal Feed Co.",
        "type": "b2b_buyer",
        "category_label": "Secondary B2B & Biogas Processing",
        "address": "Site 4 Industrial Area, Sahibabad",
        "city": "Ghaziabad",
        "lat": 28.6810,
        "lng": 77.3680,
        "contact_person": "Gaurav Singhal",
        "phone": "+91 98118 77665",
        "capacity_kg": 2000,
        "accepts_perishable": 1,
        "accepts_cooked": 1,
        "accepts_raw": 1,
        "accepts_packaged": 1,
        "fssai_verified": 1
    }
]

FEFO_DATA = [
    {
        "batch_code": "BATCH-FEFO-01",
        "item_name": "Cooked Dal Tadka & Jeera Rice (45kg)",
        "unit_name": "IIT Delhi Central Dining Hall",
        "category": "Cooked Food",
        "quantity_kg": 45.0,
        "prep_date": (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
        "expiry_date": (datetime.now() + timedelta(hours=2.5)).strftime("%Y-%m-%d %H:%M"),
        "safe_hours_remaining": 2.5,
        "storage_temp_c": 64.0,
        "storage_zone": "Hot Holding Unit #2",
        "status": "Critical",
        "recommended_action": "Immediate dispatch to Robin Hood Army or Night Shelter (< 2.5h)"
    },
    {
        "batch_code": "BATCH-FEFO-02",
        "item_name": "Paneer Butter Masala Gravy (30kg)",
        "unit_name": "Amity University Mega Kitchen Hub",
        "category": "Cooked Food",
        "quantity_kg": 30.0,
        "prep_date": (datetime.now() - timedelta(hours=1.5)).strftime("%Y-%m-%d %H:%M"),
        "expiry_date": (datetime.now() + timedelta(hours=3.5)).strftime("%Y-%m-%d %H:%M"),
        "safe_hours_remaining": 3.5,
        "storage_temp_c": 66.5,
        "storage_zone": "Thermal Insulated Tub 4",
        "status": "Near Expiry",
        "recommended_action": "Match with Feeding India Delhi-East Depot"
    },
    {
        "batch_code": "BATCH-FEFO-03",
        "item_name": "Grade-B Diced Bell Peppers & Carrots (85kg)",
        "unit_name": "Mother Dairy Patparganj Processing Plant",
        "category": "Raw Produce",
        "quantity_kg": 85.0,
        "prep_date": (datetime.now() - timedelta(hours=14)).strftime("%Y-%m-%d %H:%M"),
        "expiry_date": (datetime.now() + timedelta(hours=18.0)).strftime("%Y-%m-%d %H:%M"),
        "safe_hours_remaining": 18.0,
        "storage_temp_c": 3.8,
        "storage_zone": "Cold Storage Chamber 1",
        "status": "Fresh",
        "recommended_action": "Optimal for Community Kitchen mass cooking"
    },
    {
        "batch_code": "BATCH-FEFO-04",
        "item_name": "Broken Wheat & Bakery Off-Cuts (120kg)",
        "unit_name": "Haldiram Snacks Line-4 Processing Unit",
        "category": "Processing Byproduct",
        "quantity_kg": 120.0,
        "prep_date": (datetime.now() - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"),
        "expiry_date": (datetime.now() + timedelta(hours=30.0)).strftime("%Y-%m-%d %H:%M"),
        "safe_hours_remaining": 30.0,
        "storage_temp_c": 22.0,
        "storage_zone": "Dry Storage Silo B",
        "status": "Fresh",
        "recommended_action": "Secondary B2B Value-Add: Divert to AgroBio Animal Feed"
    },
    {
        "batch_code": "BATCH-FEFO-05",
        "item_name": "Fresh Curd / Dahi Pouch Surplus (60kg)",
        "unit_name": "IMS Ghaziabad Hostel Kitchen",
        "category": "Packaged Food",
        "quantity_kg": 60.0,
        "prep_date": (datetime.now() - timedelta(hours=8)).strftime("%Y-%m-%d %H:%M"),
        "expiry_date": (datetime.now() + timedelta(hours=12.0)).strftime("%Y-%m-%d %H:%M"),
        "safe_hours_remaining": 12.0,
        "storage_temp_c": 4.1,
        "storage_zone": "Chiller Unit 3",
        "status": "Near Expiry",
        "recommended_action": "Redistribute to Roti Bank Ghaziabad"
    },
    {
        "batch_code": "BATCH-FEFO-06",
        "item_name": "Vegetable Pulao & Mix Raita (50kg)",
        "unit_name": "IIT Delhi Central Dining Hall",
        "category": "Cooked Food",
        "quantity_kg": 50.0,
        "prep_date": (datetime.now() - timedelta(hours=3.2)).strftime("%Y-%m-%d %H:%M"),
        "expiry_date": (datetime.now() + timedelta(hours=1.2)).strftime("%Y-%m-%d %H:%M"),
        "safe_hours_remaining": 1.2,
        "storage_temp_c": 52.0,
        "storage_zone": "Counter Pan B",
        "status": "Critical",
        "recommended_action": "Emergency dispatch to nearby Rain Basera shelter"
    }
]

HISTORICAL_SURPLUS_DATA = [
    {
        "batch_code": "SURPLUS-2026-081",
        "source_name": "IIT Delhi Central Dining Hall",
        "food_item": "Rajma Masala & Steamed Rice",
        "category": "Cooked Food",
        "qty": 85.0,
        "receiver_name": "Robin Hood Army (Noida Central Chapter)",
        "receiver_type": "ngo",
        "dist_km": 14.8,
        "eta": 32,
        "days_ago": 6
    },
    {
        "batch_code": "SURPLUS-2026-082",
        "source_name": "Amity University Mega Kitchen Hub",
        "food_item": "Paneer Biryani & Mixed Raita",
        "category": "Cooked Food",
        "qty": 110.0,
        "receiver_name": "Feeding India by Zomato (Delhi-East Hub)",
        "receiver_type": "ngo",
        "dist_km": 9.2,
        "eta": 24,
        "days_ago": 5
    },
    {
        "batch_code": "SURPLUS-2026-083",
        "source_name": "Mother Dairy Patparganj Processing Plant",
        "food_item": "Surplus Pasteurised Milk Crates (180L)",
        "category": "Packaged Food",
        "qty": 185.0,
        "receiver_name": "Rain Basera DUSIB Night Shelter Home",
        "receiver_type": "shelter",
        "dist_km": 8.1,
        "eta": 21,
        "days_ago": 4
    },
    {
        "batch_code": "SURPLUS-2026-084",
        "source_name": "Haldiram Snacks Line-4 Processing Unit",
        "food_item": "Nutritional Savoury Extruded Pellets",
        "category": "Processing Byproduct",
        "qty": 320.0,
        "receiver_name": "AgroBio Organics & Animal Feed Co.",
        "receiver_type": "b2b_buyer",
        "dist_km": 6.4,
        "eta": 18,
        "days_ago": 3
    },
    {
        "batch_code": "SURPLUS-2026-085",
        "source_name": "IMS Ghaziabad Hostel Kitchen",
        "food_item": "Chole Bhature & Boondi Raita",
        "category": "Cooked Food",
        "qty": 70.0,
        "receiver_name": "Roti Bank Ghaziabad (Nav Yug Market)",
        "receiver_type": "community_kitchen",
        "dist_km": 3.5,
        "eta": 12,
        "days_ago": 2
    },
    {
        "batch_code": "SURPLUS-2026-086",
        "source_name": "IIT Delhi Central Dining Hall",
        "food_item": "Kadhi Pakora & Jeera Rice",
        "category": "Cooked Food",
        "qty": 95.0,
        "receiver_name": "Feeding India by Zomato (Delhi-East Hub)",
        "receiver_type": "ngo",
        "dist_km": 12.6,
        "eta": 29,
        "days_ago": 1
    },
    {
        "batch_code": "SURPLUS-2026-087",
        "source_name": "Amity University Mega Kitchen Hub",
        "food_item": "Dal Makhani & Butter Naan / Rotis",
        "category": "Cooked Food",
        "qty": 125.0,
        "receiver_name": "Robin Hood Army (Noida Central Chapter)",
        "receiver_type": "ngo",
        "dist_km": 4.1,
        "eta": 14,
        "days_ago": 0
    }
]

INITIAL_ACTIVITIES = [
    {
        "timestamp": (datetime.now() - timedelta(minutes=14)).strftime("%H:%M:%S"),
        "event_type": "AI_PREDICTION",
        "title": "Demand Forecast Optimized",
        "description": "Amity Mega Kitchen dinner prep adjusted from 520 kg to 442 kg based on Friday evening hostel outbound trends. Prevented 78 kg excess prep.",
        "badge_color": "emerald"
    },
    {
        "timestamp": (datetime.now() - timedelta(minutes=42)).strftime("%H:%M:%S"),
        "event_type": "REDISTRIBUTION",
        "title": "Surplus Route Dispatched",
        "description": "125 kg Dal Makhani safely matched with Robin Hood Army Noida Hub. ETA 14 mins. 312.5 kg CO2e avoided.",
        "badge_color": "teal"
    },
    {
        "timestamp": (datetime.now() - timedelta(minutes=85)).strftime("%H:%M:%S"),
        "event_type": "QUALITY_SCAN",
        "title": "CV Quality Guard Passed",
        "description": "IIT Delhi Central Kitchen batch BATCH-CV-442 verified with 94.2% Freshness Score. Certified FSSAI compliant for immediate consumption.",
        "badge_color": "blue"
    },
    {
        "timestamp": (datetime.now() - timedelta(minutes=130)).strftime("%H:%M:%S"),
        "event_type": "IOT_MONITOR",
        "title": "Cold Storage Control Stable",
        "description": "Mother Dairy Patparganj line maintained standard 3.2°C holding temperature across all cold storage silos.",
        "badge_color": "purple"
    }
]

def seed_all():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing data for fresh demo seed
    cursor.execute("DELETE FROM entities;")
    cursor.execute("DELETE FROM surplus_batches;")
    cursor.execute("DELETE FROM fefo_inventory;")
    cursor.execute("DELETE FROM activity_logs;")
    cursor.execute("DELETE FROM iot_telemetry_logs;")

    # 1. Insert Entities
    for ent in ENTITIES_DATA:
        cursor.execute("""
            INSERT INTO entities (
                name, type, category_label, address, city, lat, lng,
                contact_person, phone, capacity_kg, accepts_perishable,
                accepts_cooked, accepts_raw, accepts_packaged, fssai_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            ent["name"], ent["type"], ent["category_label"], ent["address"], ent["city"],
            ent["lat"], ent["lng"], ent["contact_person"], ent["phone"], ent["capacity_kg"],
            ent["accepts_perishable"], ent["accepts_cooked"], ent["accepts_raw"],
            ent["accepts_packaged"], ent["fssai_verified"]
        ))
    
    # 2. Insert FEFO Inventory
    for item in FEFO_DATA:
        cursor.execute("""
            INSERT INTO fefo_inventory (
                batch_code, item_name, unit_name, category, quantity_kg,
                prep_date, expiry_date, safe_hours_remaining, storage_temp_c,
                storage_zone, status, recommended_action
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item["batch_code"], item["item_name"], item["unit_name"], item["category"],
            item["quantity_kg"], item["prep_date"], item["expiry_date"],
            item["safe_hours_remaining"], item["storage_temp_c"], item["storage_zone"],
            item["status"], item["recommended_action"]
        ))

    # 3. Insert Historical Surplus Batches
    for h in HISTORICAL_SURPLUS_DATA:
        created_time = (datetime.now() - timedelta(days=h["days_ago"], hours=random.randint(1, 6))).strftime("%Y-%m-%d %H:%M:%S")
        expiry_time = (datetime.now() - timedelta(days=h["days_ago"]) + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S")
        
        # Environmental and financial metrics:
        # 1 kg food waste saved = 2.5 kg CO2e avoided, 1000 L water saved, ₹65 average financial value
        co2 = round(h["qty"] * 2.5, 1)
        water = round(h["qty"] * 1000.0, 0)
        inr = round(h["qty"] * 65.0, 0)
        
        cursor.execute("""
            INSERT INTO surplus_batches (
                batch_code, source_entity_name, food_item, category, quantity_kg,
                safe_shelf_life_hours, expiry_time, freshness_score, status,
                matched_receiver_name, matched_receiver_type, route_distance_km,
                eta_minutes, co2_avoided_kg, water_saved_liters, financial_saved_inr,
                fssai_checked, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            h["batch_code"], h["source_name"], h["food_item"], h["category"], h["qty"],
            4.5, expiry_time, 92.5, "Delivered" if h["days_ago"] > 0 else "Dispatched",
            h["receiver_name"], h["receiver_type"], h["dist_km"], h["eta"],
            co2, water, inr, 1, created_time, created_time
        ))

    # 4. Insert Initial Activity Logs
    for act in INITIAL_ACTIVITIES:
        cursor.execute("""
            INSERT INTO activity_logs (timestamp, event_type, title, description, badge_color)
            VALUES (?, ?, ?, ?, ?)
        """, (act["timestamp"], act["event_type"], act["title"], act["description"], act["badge_color"]))

    conn.commit()
    conn.close()
    print("Seed complete: 10 Entities, FEFO records, historical surplus batches, and activities seeded successfully.")

    # Train and verify forecaster model file exists
    print("Verifying Demand Forecaster Model...")
    forecaster._ensure_trained()
    print("Demand Forecaster Ready.")

if __name__ == "__main__":
    seed_all()
