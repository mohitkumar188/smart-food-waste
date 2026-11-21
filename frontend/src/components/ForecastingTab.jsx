import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Send, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Sparkles, 
  Calendar, 
  Sun, 
  CloudRain, 
  Flame, 
  Snowflake,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

const PRESETS = [
  {
    name: "IIT Delhi Central Mess (Dinner Special)",
    unit_type: "Institutional Kitchen",
    item: "Hostel Special Dinner (Paneer Butter Masala, Pulao)",
    headcount: 850,
    weather: "Sunny",
    event: "Exam Week"
  },
  {
    name: "Amity Campus Mega Kitchen (Lunch Thali)",
    unit_type: "Institutional Kitchen",
    item: "North Indian Thali (Dal, Rice, Roti, Sabzi)",
    headcount: 1200,
    weather: "Rainy",
    event: "Normal Day"
  },
  {
    name: "Mother Dairy Processing Plant (Dairy Batch)",
    unit_type: "Food Processing Unit",
    item: "Pasteurized Milk & Paneer Batch",
    headcount: 2400,
    weather: "Extreme Heat",
    event: "Festival/Holiday"
  },
  {
    name: "Haldiram Line-4 (Snacks Pellets)",
    unit_type: "Food Processing Unit",
    item: "Extruded Snack Pellets Batch",
    headcount: 3200,
    weather: "Sunny",
    event: "Normal Day"
  }
];

export default function ForecastingTab({ onBridgeToRedistribution }) {
  const [unitType, setUnitType] = useState("Institutional Kitchen");
  const [item, setItem] = useState("North Indian Thali (Dal, Rice, Roti, Sabzi)");
  const [headcount, setHeadcount] = useState(750);
  const [date, setDate] = useState("2026-11-21");
  const [weather, setWeather] = useState("Sunny");
  const [event, setEvent] = useState("Normal Day");
  const [loading, setLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);

  const kitchenItems = [
    "North Indian Thali (Dal, Rice, Roti, Sabzi)",
    "South Indian Breakfast (Idli, Sambar, Vada)",
    "Hostel Special Dinner (Paneer Butter Masala, Pulao)",
    "Continental Cafeteria Lunch (Pasta, Salad, Garlic Bread)",
    "Evening Mess Snacks (Samosa, Pakora, Tea)"
  ];

  const processingItems = [
    "Mango Pulp & Puree Processing Line",
    "Pasteurized Milk & Paneer Batch",
    "Canned Green Peas & Sweet Corn Batch",
    "Artisanal Bakery & Bread Batch",
    "Extruded Snack Pellets Batch"
  ];

  const handleUnitTypeChange = (newType) => {
    setUnitType(newType);
    if (newType === "Institutional Kitchen") {
      setItem(kitchenItems[0]);
      if (headcount > 2000) setHeadcount(750);
    } else {
      setItem(processingItems[0]);
      if (headcount < 1000) setHeadcount(2200);
    }
  };

  const applyPreset = (preset) => {
    setUnitType(preset.unit_type);
    setItem(preset.item);
    setHeadcount(preset.headcount);
    setWeather(preset.weather);
    setEvent(preset.event);
  };

  const runForecast = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/forecast/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_type: unitType,
          item: item,
          headcount_or_orders: Number(headcount),
          date: date,
          weather: weather,
          event: event
        })
      });
      const data = await res.json();
      if (data.success) {
        setForecastResult(data.prediction);
      }
    } catch (err) {
      console.error("Forecast failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const importanceChartData = forecastResult?.feature_importances 
    ? Object.entries(forecastResult.feature_importances).map(([k, v]) => ({ name: k, value: v }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Module 2 • Scikit-Learn Engine
            </span>
            <span className="text-xs text-slate-400">RandomForestRegressor (120-Day Synthetic Dataset)</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            AI Demand & Surplus Risk Forecaster
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Predict precise consumption demand, calculate dynamic safety buffers, and curtail overproduction waste before cooking or processing begins.
          </p>
        </div>

        {/* Quick Presets for Judges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              Demo {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form (Left) & Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls (5 columns) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Operational Parameters
          </h3>

          <form onSubmit={runForecast} className="space-y-4">
            {/* Unit Type Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Unit Classification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUnitTypeChange("Institutional Kitchen")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    unitType === "Institutional Kitchen"
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  🏫 Institutional Kitchen
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitTypeChange("Food Processing Unit")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    unitType === "Food Processing Unit"
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  🏭 Processing Unit
                </button>
              </div>
            </div>

            {/* Item Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                {unitType === "Institutional Kitchen" ? "Meal / Menu Course" : "Product Line / Batch Type"}
              </label>
              <select
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {(unitType === "Institutional Kitchen" ? kitchenItems : processingItems).map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Expected Headcount or Batch Orders */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {unitType === "Institutional Kitchen" ? "Expected Dining Headcount" : "Target Batch Order Volume (kg)"}
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {headcount} {unitType === "Institutional Kitchen" ? "Persons" : "kg"}
                </span>
              </div>
              <input
                type="range"
                min={unitType === "Institutional Kitchen" ? "200" : "500"}
                max={unitType === "Institutional Kitchen" ? "1800" : "4500"}
                step={unitType === "Institutional Kitchen" ? "25" : "50"}
                value={headcount}
                onChange={(e) => setHeadcount(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>{unitType === "Institutional Kitchen" ? "200 Persons" : "500 kg"}</span>
                <span>{unitType === "Institutional Kitchen" ? "1,800 Persons" : "4,500 kg"}</span>
              </div>
            </div>

            {/* Date & Weather Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Weather Condition</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Sunny">☀️ Sunny / Normal</option>
                  <option value="Rainy">🌧️ Heavy Monsoon Rain</option>
                  <option value="Extreme Heat">🔥 Extreme Heat (&gt;41°C)</option>
                  <option value="Cold/Foggy">❄️ Cold / Dense Fog</option>
                </select>
              </div>
            </div>

            {/* Calendar / Holiday Event */}
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Event / Academic Schedule</label>
              <select
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Normal Day">Standard Operating Day</option>
                <option value="Weekend">Weekend (Hostel Vacating Effect)</option>
                <option value="Exam Week">Exam Week (Peak Campus Dining)</option>
                <option value="Festival/Holiday">Gazetted Festival / Long Weekend</option>
                <option value="Monsoon Rain">Severe Weather Alert</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <BrainCircuit className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Computing ML Inference..." : "Generate AI Demand Forecast"}
            </button>
          </form>
        </div>

        {/* Results Panel (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          {forecastResult ? (
            <div className="space-y-4">
              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-medium text-slate-400">Predicted Demand</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {forecastResult.predicted_demand_kg} <span className="text-xs text-slate-400 font-normal">kg</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">True consumption</div>
                </div>

                <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-3.5 bg-emerald-950/20">
                  <div className="text-[11px] font-medium text-emerald-300">Recommended Prep</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                    {forecastResult.recommended_prep_kg} <span className="text-xs text-emerald-300 font-normal">kg</span>
                  </div>
                  <div className="text-[10px] text-emerald-400/90 mt-0.5">+{forecastResult.safety_buffer_pct}% AI buffer</div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-medium text-slate-400">Surplus Risk</div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">
                    {forecastResult.predicted_surplus_risk_kg} <span className="text-xs text-slate-400 font-normal">kg</span>
                  </div>
                  <div className={`text-[10px] font-bold mt-0.5 ${
                    forecastResult.surplus_risk_level === 'Low' ? 'text-emerald-400' :
                    forecastResult.surplus_risk_level === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {forecastResult.surplus_risk_level} Risk Level
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[11px] font-medium text-slate-400">Prevented Waste</div>
                  <div className="text-xl sm:text-2xl font-black text-teal-400 mt-1">
                    {forecastResult.prevented_waste_kg} <span className="text-xs text-slate-400 font-normal">kg</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">vs. 20% overprep</div>
                </div>
              </div>

              {/* Explanatory AI Insights Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  AI Interpretability & Factor Explanations
                </h4>
                <div className="space-y-1.5">
                  {forecastResult.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-emerald-400 mt-0.5">▪</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <Info className="w-3 h-3 text-slate-500" />
                    <span>Model Metrics: R² = {forecastResult.model_r2_score} • MAE = ±{forecastResult.mae_kg} kg on 120-day validation set.</span>
                  </div>
                </div>
              </div>

              {/* Feature Importance Bar Chart */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  RandomForest Feature Importance Attribution
                </h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={importanceChartData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 0.45]} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={90} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }}
                        formatter={(val) => [`${(val * 100).toFixed(1)}%`, 'Weight']}
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {importanceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 2 ? '#10b981' : '#0ea5e9'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quick Bridge Button to Redistribution */}
              <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-400" />
                    Automate Surplus Pre-Listing
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pre-fill {forecastResult.predicted_surplus_risk_kg} kg surplus of {item} into the Redistribution Engine for instant NGO matching.
                  </p>
                </div>
                <button
                  onClick={() => onBridgeToRedistribution && onBridgeToRedistribution({
                    food_item: item,
                    category: unitType === "Institutional Kitchen" ? "Cooked Food" : "Processing Byproduct",
                    quantity_kg: forecastResult.predicted_surplus_risk_kg || 40.0,
                    safe_shelf_life_hours: 4.0
                  })}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 shrink-0"
                >
                  <span>Send Surplus to Redistribution</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-2xl bg-slate-800 text-emerald-400">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">No Forecast Calculated Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Select parameters on the left or click a demo preset button to run the scikit-learn demand forecasting model.
              </p>
              <button
                onClick={() => runForecast()}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
              >
                Run Default Forecast Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
