import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Thermometer, 
  Sparkles, 
  Send, 
  RefreshCw,
  FileCheck,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';
import { getApiUrl } from '../config/api.js';

const SAMPLE_PRESETS = [
  {
    name: "Cooked Dal Tadka & Rice",
    category: "Cooked Food",
    hours: 1.5,
    temp: 65.0,
    color: "from-amber-600 to-yellow-500",
    description: "Hot holding batch, fresh aroma, vibrant turmeric yellow"
  },
  {
    name: "Paneer Butter Masala Gravy",
    category: "Cooked Food",
    hours: 2.2,
    temp: 63.5,
    color: "from-orange-600 to-red-500",
    description: "Stable emulsion, compliant temperature, rich saffron color"
  },
  {
    name: "Fresh Diced Produce (Peppers & Carrots)",
    category: "Raw Produce",
    hours: 12.0,
    temp: 3.8,
    color: "from-emerald-600 to-green-500",
    description: "Crisp cell wall integrity, high moisture, cold storage 3.8°C"
  },
  {
    name: "Over-held Room Temp Curry (Stale)",
    category: "Cooked Food",
    hours: 5.5,
    temp: 32.0,
    color: "from-slate-700 to-zinc-600",
    description: "Stored in danger zone (32°C) > 5 hours. Mild oxidation."
  }
];

export default function QualityGuardTab({ onBridgeToRedistribution }) {
  const [itemName, setItemName] = useState("Cooked Dal Tadka & Rice");
  const [category, setCategory] = useState("Cooked Food");
  const [hoursSincePrep, setHoursSincePrep] = useState(1.5);
  const [storageTemp, setStorageTemp] = useState(65.0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activePreset, setActivePreset] = useState(0);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionResult, setInspectionResult] = useState(null);

  const [fefoItems, setFefoItems] = useState([]);
  const [loadingFefo, setLoadingFefo] = useState(false);

  // Fetch FEFO items on mount
  useEffect(() => {
    fetchFefo();
  }, []);

  const fetchFefo = async () => {
    setLoadingFefo(true);
    try {
      const res = await fetch(getApiUrl('/api/inventory/fefo'));
      const data = await res.json();
      setFefoItems(data.items || []);
    } catch (err) {
      console.error("Failed to load FEFO:", err);
    } finally {
      setLoadingFefo(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setActivePreset(-1);
    }
  };

  const applyPreset = (preset, idx) => {
    setActivePreset(idx);
    setItemName(preset.name);
    setCategory(preset.category);
    setHoursSincePrep(preset.hours);
    setStorageTemp(preset.temp);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const runInspection = async (e) => {
    if (e) e.preventDefault();
    setInspecting(true);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      formData.append("food_category", category);
      formData.append("item_name", itemName);
      formData.append("hours_since_prep", String(hoursSincePrep));
      formData.append("storage_temp_c", String(storageTemp));

      const res = await fetch(getApiUrl('/api/quality/inspect'), {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setInspectionResult(data);
    } catch (err) {
      console.error("Inspection failed:", err);
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Module 3 • Computer Vision & Safety
            </span>
            <span className="text-xs text-slate-400">Pillow + NumPy Vision Engine & FSSAI Schedule 4</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Food Quality Inspection & FEFO Expiry Guard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Automated visual freshness scoring, thermal holding verification, tiered redistribution routing, and First-Expired, First-Out inventory controls.
          </p>
        </div>

        <button
          onClick={fetchFefo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingFefo ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh FEFO Stock</span>
        </button>
      </div>

      {/* Top Section: Inspection Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Presets (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Visual Inspection Intake
            </h3>
            <span className="text-[11px] text-teal-400 font-semibold">Dual AI/CV Engine</span>
          </div>

          {/* Sample Preset Buttons for Judges */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-2 block">
              1-Click Demo Image Presets:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p, idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    activePreset === idx
                      ? 'bg-teal-600/20 text-white border-teal-500/50 shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.hours}h • {p.temp}°C</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Upload Area */}
          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
              Or Upload Custom Photo / Take Snapshot:
            </label>
            <label className="border-2 border-dashed border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 transition-colors">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              {previewUrl ? (
                <div className="space-y-2 text-center">
                  <img src={previewUrl} alt="Preview" className="h-28 object-cover rounded-lg mx-auto shadow" />
                  <span className="text-[11px] text-teal-400 font-semibold block">Image Loaded. Ready to inspect.</span>
                </div>
              ) : activePreset >= 0 ? (
                <div className="text-center space-y-1">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${SAMPLE_PRESETS[activePreset].color} flex items-center justify-center text-white font-bold mx-auto shadow-md`}>
                    🍽️
                  </div>
                  <div className="text-xs font-semibold text-white mt-1">{SAMPLE_PRESETS[activePreset].name}</div>
                  <div className="text-[11px] text-slate-400">{SAMPLE_PRESETS[activePreset].description}</div>
                </div>
              ) : (
                <div className="text-center space-y-1.5 py-2">
                  <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                  <div className="text-xs font-medium text-slate-300">Click to upload photo or drop file</div>
                  <div className="text-[10px] text-slate-500">PNG, JPG, WebP supported</div>
                </div>
              )}
            </label>
          </div>

          {/* Inspection Parameter Controls */}
          <form onSubmit={runInspection} className="space-y-3 pt-2 border-t border-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Food Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Cooked Food">Cooked Food (Hot)</option>
                  <option value="Raw Produce">Raw Produce (Cold)</option>
                  <option value="Packaged Food">Packaged Goods</option>
                  <option value="Processing Byproduct">Processing Byproduct</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Holding Temp (°C)</label>
                <input
                  type="number"
                  step="0.5"
                  value={storageTemp}
                  onChange={(e) => setStorageTemp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Hours Since Preparation</label>
                <span className="text-xs font-mono font-bold text-teal-400">{hoursSincePrep} Hours</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.5"
                value={hoursSincePrep}
                onChange={(e) => setHoursSincePrep(Number(e.target.value))}
                className="w-full accent-teal-500 bg-slate-950 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>0.5h (Freshly Prepared)</span>
                <span>12h (Extended Holding)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={inspecting}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-950 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className={`w-4 h-4 ${inspecting ? 'animate-spin' : ''}`} />
              {inspecting ? "Scanning Texture, Color & Thermals..." : "Run AI Quality & FSSAI Scan"}
            </button>
          </form>
        </div>

        {/* Right Column: Scan Results & Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {inspectionResult ? (
            <div className="space-y-4">
              {/* Score & Tier Header */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Radial Freshness Meter */}
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-slate-950 border-4 border-slate-800 shrink-0">
                      <div className="text-center">
                        <div className="text-lg font-black text-white">{inspectionResult.freshness_score}%</div>
                        <div className="text-[9px] uppercase font-bold text-teal-400">Fresh</div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                          inspectionResult.badge_color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                          inspectionResult.badge_color === 'amber' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                          'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                          {inspectionResult.action_badge}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Status: {inspectionResult.freshness_status}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{inspectionResult.item_name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Tiered Category: <span className="text-slate-200 font-semibold">{inspectionResult.tier_recommendation}</span>
                      </p>
                    </div>
                  </div>

                  {/* Shelf life badge */}
                  <div className="sm:text-right bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 shrink-0">
                    <div className="text-[11px] text-slate-400 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-400" /> Safe Safe-Window
                    </div>
                    <div className="text-xl font-black text-teal-300 mt-0.5">
                      {inspectionResult.estimated_safe_shelf_life_hours} Hours
                    </div>
                    <div className="text-[10px] text-slate-500">Remaining consumable</div>
                  </div>
                </div>

                {/* Action Recommendation Banner */}
                <div className={`mt-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2.5 ${
                  inspectionResult.badge_color === 'emerald' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' :
                  inspectionResult.badge_color === 'amber' ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' :
                  'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}>
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="font-bold">Protocol Action:</span> {inspectionResult.recommended_action}
                  </div>
                </div>
              </div>

              {/* FSSAI Safety Checklist & Visual Diagnostics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Checklist */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                    FSSAI Schedule 4 Safety Checklist
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-300">Core Temp Compliance ({inspectionResult.storage_temp_c}°C)</span>
                      {inspectionResult.fssai_checklist.thermal_compliance ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-300">Holding Time (&le; 4.0h Safe Limit)</span>
                      {inspectionResult.fssai_checklist.holding_time_under_safe_limit ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-300">Microbial Contamination Index</span>
                      <span className="text-teal-400 font-semibold">{inspectionResult.microbial_risk_level}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-slate-300">FSSAI Hygiene Certification</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {inspectionResult.fssai_checklist.fssai_schedule4_pass ? "PASSED" : "REVIEW"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Computer Vision Detected Attributes */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    CV Texture & Oxidation Features
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {inspectionResult.detected_attributes.map((attr, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-teal-400">▪</span>
                        <span>{attr}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-800 mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Nutritional Retention:</span>
                      <span className="font-bold text-white">{inspectionResult.nutritional_retention_pct}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Bridge Button to Redistribution */}
              {inspectionResult.freshness_score >= 45.0 && (
                <div className="bg-slate-900/80 border border-teal-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Redistribute Verified Safe Batch
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Batch passed safety checks. Match with optimal nearby NGO in Delhi-NCR.
                    </p>
                  </div>
                  <button
                    onClick={() => onBridgeToRedistribution && onBridgeToRedistribution({
                      food_item: inspectionResult.item_name,
                      category: inspectionResult.category,
                      quantity_kg: 45.0,
                      safe_shelf_life_hours: inspectionResult.estimated_safe_shelf_life_hours
                    })}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
                  >
                    <span>Send to Redistribution Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800 text-teal-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Ready for Quality Scan</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Pick a demo image preset on the left or upload a cooked/raw produce photo to trigger the vision freshness analyzer.
              </p>
              <button
                onClick={() => runInspection()}
                className="mt-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
              >
                Inspect Selected Sample Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: FEFO (First-Expired, First-Out) Inventory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              FEFO (First-Expired, First-Out) Live Inventory Guard
            </h3>
            <p className="text-xs text-slate-400">Prioritizes batches by remaining safe shelf-life window to prevent kitchen spoilage</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {fefoItems.length} Monitored Batches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Batch ID</th>
                <th className="py-2.5 px-3">Food Item & Category</th>
                <th className="py-2.5 px-3">Kitchen / Unit Location</th>
                <th className="py-2.5 px-3">Quantity</th>
                <th className="py-2.5 px-3">Storage Temp</th>
                <th className="py-2.5 px-3">Safe Remaining</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {fefoItems.map((item) => {
                const isCritical = item.status === 'Critical' || item.safe_hours_remaining <= 2.5;
                const isNearExpiry = item.status === 'Near Expiry' || (item.safe_hours_remaining > 2.5 && item.safe_hours_remaining <= 6.0);

                return (
                  <tr key={item.batch_code} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-300">{item.batch_code}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{item.item_name}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-[180px] truncate">{item.unit_name}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{item.quantity_kg} kg</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{item.storage_temp_c}°C</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 font-mono font-bold ${
                        isCritical ? 'text-rose-400' : isNearExpiry ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {item.safe_hours_remaining} Hours
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isCritical ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse' :
                        isNearExpiry ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onBridgeToRedistribution && onBridgeToRedistribution({
                          food_item: item.item_name,
                          category: item.category,
                          quantity_kg: item.quantity_kg,
                          safe_shelf_life_hours: item.safe_hours_remaining
                        })}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors"
                      >
                        Redistribute
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
