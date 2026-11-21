import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Send, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Sparkles, 
  Fuel, 
  CloudRain, 
  Phone, 
  Building2, 
  FileText, 
  X,
  Printer
} from 'lucide-react';

// Custom Map Recenter Helper Component
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Leaflet custom DivIcons to avoid asset bundler 404 icon bugs
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const ICONS = {
  kitchen: createCustomIcon('#10b981', '🍳'),
  processing_unit: createCustomIcon('#059669', '🏭'),
  ngo: createCustomIcon('#0284c7', '🤝'),
  shelter: createCustomIcon('#7c3aed', '🏠'),
  community_kitchen: createCustomIcon('#d97706', '🍲'),
  b2b_buyer: createCustomIcon('#e11d48', '♻️')
};

export default function RedistributionTab({ initialFormData }) {
  const [entities, setEntities] = useState([]);
  const [sourceEntityId, setSourceEntityId] = useState(1);
  const [foodItem, setFoodItem] = useState("North Indian Thali (Dal, Rice, Roti, Sabzi)");
  const [category, setCategory] = useState("Cooked Food");
  const [quantityKg, setQuantityKg] = useState(65.0);
  const [safeHours, setSafeHours] = useState(3.5);

  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [challanModal, setChallanModal] = useState(null);
  const [history, setHistory] = useState([]);

  // Map center defaults to Delhi-NCR (South Delhi/Noida centroid)
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2600]);
  const [mapZoom, setMapZoom] = useState(11);

  // Load initial data if passed from forecasting / quality tabs
  useEffect(() => {
    if (initialFormData) {
      if (initialFormData.food_item) setFoodItem(initialFormData.food_item);
      if (initialFormData.category) setCategory(initialFormData.category);
      if (initialFormData.quantity_kg) setQuantityKg(Number(initialFormData.quantity_kg));
      if (initialFormData.safe_shelf_life_hours) setSafeHours(Number(initialFormData.safe_shelf_life_hours));
    }
  }, [initialFormData]);

  // Fetch entities and history on mount
  useEffect(() => {
    fetchEntities();
    fetchHistory();
  }, []);

  const fetchEntities = async () => {
    try {
      const res = await fetch('/api/redistribution/entities');
      const data = await res.json();
      setEntities(data.entities || []);
      if (data.entities && data.entities.length > 0) {
        setSourceEntityId(data.entities[0].id);
      }
    } catch (err) {
      console.error("Failed to load entities:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/redistribution/history');
      const data = await res.json();
      setHistory(data.batches || []);
    } catch (err) {
      console.error("Failed to load surplus history:", err);
    }
  };

  const runMatch = async (e) => {
    if (e) e.preventDefault();
    setMatching(true);

    try {
      const res = await fetch('/api/redistribution/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_entity_id: Number(sourceEntityId),
          food_item: foodItem,
          category: category,
          quantity_kg: Number(quantityKg),
          safe_shelf_life_hours: Number(safeHours)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMatchResult(data);
        if (data.source) {
          setMapCenter([data.source.lat, data.source.lng]);
          setMapZoom(12);
        }
      } else {
        alert(data.detail || "Matching failed");
      }
    } catch (err) {
      console.error("Match failed:", err);
    } finally {
      setMatching(false);
    }
  };

  const confirmDispatch = async () => {
    if (!matchResult || !matchResult.recommended_receiver) return;
    setDispatching(true);

    try {
      const res = await fetch('/api/redistribution/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_entity_id: Number(sourceEntityId),
          matched_receiver_id: matchResult.recommended_receiver.id,
          food_item: foodItem,
          category: category,
          quantity_kg: Number(quantityKg),
          safe_shelf_life_hours: Number(safeHours),
          freshness_score: 92.0,
          notes: "Automated AnnaSetu AI Smart Logistics Dispatch"
        })
      });
      const data = await res.json();
      if (data.success) {
        setChallanModal(data);
        fetchHistory();
      }
    } catch (err) {
      console.error("Dispatch failed:", err);
    } finally {
      setDispatching(false);
    }
  };

  const sourceEntities = entities.filter(e => e.type === 'kitchen' || e.type === 'processing_unit');
  const receiverEntities = entities.filter(e => e.type !== 'kitchen' && e.type !== 'processing_unit');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Module 5 • Logistics & GIS Map
            </span>
            <span className="text-xs text-slate-400">Haversine Multi-Criteria Matching & VRP Nearest-Neighbor Optimizer</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Automated Surplus Redistribution & Smart Logistics Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time geospatial dispatch engine connecting 10 verified Delhi-NCR institutional kitchens, food processing units, NGOs, and bio-economy buyers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span>🍳/🏭 5 Donors</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span>🤝 5 Verified Receivers</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Surplus Intake & Matching (Left 5 cols) vs Leaflet Interactive Map (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Surplus Batch Registration & Route Matching
            </h3>

            <form onSubmit={runMatch} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Origin Source (Kitchen / Plant)</label>
                <select
                  value={sourceEntityId}
                  onChange={(e) => setSourceEntityId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {sourceEntities.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Food Item Name</label>
                <input
                  type="text"
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cooked Food">Cooked Food</option>
                    <option value="Raw Produce">Raw Produce</option>
                    <option value="Packaged Food">Packaged Goods</option>
                    <option value="Processing Byproduct">Processing Byproduct</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Surplus Quantity (kg)</label>
                  <input
                    type="number"
                    step="5"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Safe Shelf-Life Window (Hours)</label>
                  <span className="text-xs font-mono font-bold text-blue-400">{safeHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.5"
                  value={safeHours}
                  onChange={(e) => setSafeHours(Number(e.target.value))}
                  className="w-full accent-blue-500 bg-slate-950 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>1.0h (Urgent Flash Transit)</span>
                  <span>12.0h (Standard Window)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={matching}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-950 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 ${matching ? 'animate-spin' : ''}`} />
                {matching ? "Evaluating Proximity, Capacity & Safe Windows..." : "Auto-Match Best Receiver & Route"}
              </button>
            </form>
          </div>

          {/* Matched Receivers Ranking & Dispatch Box */}
          {matchResult && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Top Matched Recipients (Ranked)
                </h4>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {matchResult.matched_receivers.length} Nodes Eligible
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {matchResult.matched_receivers.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      idx === 0 
                        ? 'bg-blue-950/30 border-blue-500/50 shadow-sm' 
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {idx === 0 && <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">#1 Best Fit</span>}
                          <span>{rec.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {rec.category_label} • Capacity: {rec.capacity_kg} kg
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-blue-400">{rec.match_score}% Match</div>
                        <div className="text-[10px] text-slate-400">{rec.distance_km} km ({rec.transit_time_minutes}m)</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Route Summary & Confirm Dispatch Action */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Total Transit Distance</span>
                    <span className="font-bold text-white font-mono">{matchResult.route_summary.total_distance_km} km</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Est. Delivery Time</span>
                    <span className="font-bold text-emerald-400 font-mono">~{matchResult.route_summary.estimated_minutes} Mins</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    Fuel Saved: <strong className="text-slate-200">{matchResult.route_summary.fuel_saved_liters} L</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                    CO2 Avoided: <strong className="text-slate-200">{matchResult.impact_preview.co2_avoided_kg} kg</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={confirmDispatch}
                  disabled={dispatching}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${dispatching ? 'animate-spin' : ''}`} />
                  {dispatching ? "Confirming Dispatch..." : `Confirm Dispatch to ${matchResult.recommended_receiver.name.split(' ')[0]}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Map (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Live Delhi-NCR GIS Redistribution Grid
              </h3>
              <p className="text-xs text-slate-400">OpenStreetMap Interactive Tiles • 10 Live Pre-Seeded Nodes</p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Donor</span>
              <span className="flex items-center gap-1 text-sky-400"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> NGO</span>
              <span className="flex items-center gap-1 text-purple-400"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Shelter</span>
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner relative z-0">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <ChangeView center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render all 10 Entities */}
              {entities.map((ent) => {
                const icon = ICONS[ent.type] || ICONS.kitchen;
                return (
                  <Marker
                    key={ent.id}
                    position={[ent.lat, ent.lng]}
                    icon={icon}
                  >
                    <Popup>
                      <div className="text-slate-900 text-xs space-y-1 p-0.5">
                        <div className="font-bold text-sm text-slate-950">{ent.name}</div>
                        <div className="text-[11px] text-slate-600 font-medium">{ent.category_label}</div>
                        <div className="text-[11px] text-slate-700">📍 {ent.address}, {ent.city}</div>
                        <div className="text-[11px] text-slate-700">📞 {ent.phone} ({ent.contact_person})</div>
                        <div className="text-[11px] font-bold text-emerald-800">
                          Daily Capacity: {ent.capacity_kg} kg
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Render Route Polyline when match is active */}
              {matchResult && matchResult.route_summary && matchResult.route_summary.polyline && (
                <Polyline
                  positions={matchResult.route_summary.polyline}
                  color="#10b981"
                  weight={4}
                  dashArray="6, 8"
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Dispatched Batches History */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            Verified Surplus Redistribution Ledger
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {history.length} Completed Batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Tracking Code</th>
                <th className="py-2.5 px-3">Source Donor</th>
                <th className="py-2.5 px-3">Food Item</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Matched Recipient</th>
                <th className="py-2.5 px-3">Distance & ETA</th>
                <th className="py-2.5 px-3">CO2e Saved</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((h) => (
                <tr key={h.batch_code} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-300">{h.batch_code}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{h.source_entity_name}</td>
                  <td className="py-2.5 px-3 text-slate-300">{h.food_item}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{h.quantity_kg} kg</td>
                  <td className="py-2.5 px-3 text-slate-300 font-medium">{h.matched_receiver_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{h.route_distance_km} km ({h.eta_minutes}m)</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400 font-semibold">{h.co2_avoided_kg} kg</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Challan Modal */}
      {challanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setChallanModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AnnaSetu AI Official Redistribution Challan
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Surplus Dispatch Confirmed</h3>
              </div>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Dispatch Tracking ID:</span>
                <span className="font-mono font-bold text-emerald-400">{challanModal.batch_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Origin Donor:</span>
                <span className="font-semibold text-white">{challanModal.source_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient:</span>
                <span className="font-semibold text-blue-400">{challanModal.receiver_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dispatched Quantity:</span>
                <span className="font-bold text-white">{challanModal.quantity_kg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distance & ETA:</span>
                <span className="font-mono text-slate-300">{challanModal.distance_km} km • ~{challanModal.eta_minutes} mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CO2e Emissions Avoided:</span>
                <span className="font-mono text-cyan-400 font-bold">{challanModal.co2_avoided_kg} kg CO2e</span>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <strong>FSSAI Hygiene Certification:</strong> {challanModal.delivery_challan.fssai_hygiene_declaration}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Delivery Challan</span>
              </button>
              <button
                onClick={() => setChallanModal(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
