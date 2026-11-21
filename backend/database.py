import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "food_waste.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Entities Table (Delhi-NCR Kitchens, Plants, NGOs, Shelters, B2B)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        category_label TEXT,
        address TEXT,
        city TEXT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        contact_person TEXT,
        phone TEXT,
        capacity_kg REAL DEFAULT 300,
        accepts_perishable INTEGER DEFAULT 1,
        accepts_cooked INTEGER DEFAULT 1,
        accepts_raw INTEGER DEFAULT 1,
        accepts_packaged INTEGER DEFAULT 1,
        fssai_verified INTEGER DEFAULT 1
    );
    """)

    # 2. Surplus Batches Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS surplus_batches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_code TEXT UNIQUE,
        source_entity_id INTEGER,
        source_entity_name TEXT,
        food_item TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity_kg REAL NOT NULL,
        prep_time TEXT,
        safe_shelf_life_hours REAL,
        expiry_time TEXT,
        freshness_score REAL DEFAULT 90.0,
        status TEXT DEFAULT 'Available',
        matched_receiver_id INTEGER,
        matched_receiver_name TEXT,
        matched_receiver_type TEXT,
        route_distance_km REAL DEFAULT 0,
        eta_minutes REAL DEFAULT 0,
        co2_avoided_kg REAL DEFAULT 0,
        water_saved_liters REAL DEFAULT 0,
        financial_saved_inr REAL DEFAULT 0,
        fssai_checked INTEGER DEFAULT 1,
        notes TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY(source_entity_id) REFERENCES entities(id),
        FOREIGN KEY(matched_receiver_id) REFERENCES entities(id)
    );
    """)

    # 3. FEFO Inventory Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS fefo_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        batch_code TEXT UNIQUE,
        item_name TEXT NOT NULL,
        unit_name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity_kg REAL NOT NULL,
        prep_date TEXT,
        expiry_date TEXT,
        safe_hours_remaining REAL,
        storage_temp_c REAL,
        storage_zone TEXT,
        status TEXT DEFAULT 'Fresh',
        recommended_action TEXT
    );
    """)

    # 4. IoT Telemetry Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS iot_telemetry_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plant_id TEXT,
        plant_name TEXT,
        timestamp TEXT,
        cold_storage_temp REAL,
        humidity REAL,
        energy_consumption_kwh REAL,
        yield_loss_pct REAL,
        line_status TEXT,
        anomaly_flag INTEGER DEFAULT 0,
        anomaly_type TEXT,
        anomaly_description TEXT
    );
    """)

    # 5. Activity Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        event_type TEXT,
        title TEXT,
        description TEXT,
        badge_color TEXT
    );
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
