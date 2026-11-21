import React from 'react';
import { 
  TrendingDown, 
  Utensils, 
  IndianRupee, 
  CloudRain, 
  Droplet, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const PIE_COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];

export default function DashboardTab({ stats, setActiveTab, onNavigateWithData }) {
  const kpis = stats?.kpis || {
    total_food_saved_kg: 990,
    meals_redistributed: 2475,
    financial_savings_inr: 64350,
    carbon_avoided_kg: 2475,
    water_saved_liters: 990000,
    active_alerts_count: 4,
    waste_reduction_rate_pct: 79.2
  };

  const trendData = stats?.trend_data || [];
  const categoryData = stats?.category_breakdown || [];
  const activities = stats?.recent_activities || [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Highlights */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AnnaSetu AI Institutional Food Waste Protocol
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Executive AI Waste Reduction & Redistribution Command Center
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              Unified real-time intelligence connecting Institutional Kitchens (hostels, campus dining, corporate cafeterias) and Food Processing Units with demand forecasting, FEFO expiry defense, cold-chain IoT, and hyper-local NGO distribution logistics across Delhi-NCR.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('forecasting')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-900/30"
            >
              <Sparkles className="w-4 h-4" />
              Run Demand Forecast
            </button>
            <button
              onClick={() => setActiveTab('redistribution')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs sm:text-sm font-medium transition-all"
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Redistribution Map
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Food Saved</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">{kpis.total_food_saved_kg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span></div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <span>+{kpis.waste_reduction_rate_pct}% reduction</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-teal-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Meals Redistributed</span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">{kpis.meals_redistributed.toLocaleString()}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              Fed via verified NGOs
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Financial Savings</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">₹{kpis.financial_savings_inr.toLocaleString()}</div>
            <div className="text-xs text-amber-400/90 font-medium mt-0.5">
              @ ₹65/kg value basis
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">GHG CO2e Avoided</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">{kpis.carbon_avoided_kg.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span></div>
            <div className="text-xs text-cyan-400 font-medium mt-0.5">
              2.5 kg CO2e / kg food
            </div>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Water Conserved</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">{(kpis.water_saved_liters / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-400">Liters</span></div>
            <div className="text-xs text-blue-400 font-medium mt-0.5">
              Embedded H2O footprint
            </div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Alerts</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-400">{kpis.active_alerts_count}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">
              FEFO & IoT Breaches
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                Waste Reduction & Food Salvage Progression
              </h3>
              <p className="text-xs text-slate-400">Weekly tracking: Baseline unoptimized waste vs. AI-optimized food waste (kg)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500/70 inline-block"></span>
                <span className="text-slate-400">Baseline Waste</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"></span>
                <span className="text-slate-300 font-semibold">AI Actual Waste</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" kg" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="baseline_waste_kg" name="Baseline Waste" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" />
                <Area type="monotone" dataKey="ai_actual_waste_kg" name="AI Actual Waste" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (1 column) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Food Stream Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">By food stream category (kg salvaged)</p>
            
            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(val) => [`${val} kg`, 'Quantity']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {categoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                  <span className="text-slate-300 truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="font-semibold text-white">{item.value} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Live Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Live Ecosystem Audit & Activity Feed
              </h3>
              <p className="text-xs text-slate-400">Real-time log of AI forecasts, quality passes, IoT events, and route dispatches</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Live Polling
            </span>
          </div>

          <div className="space-y-3">
            {activities.map((act) => {
              const badgeColors = {
                emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
                blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              };
              const colorClass = badgeColors[act.badge_color] || badgeColors.emerald;

              return (
                <div key={act.id || act.timestamp} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colorClass}`}>
                        {act.event_type}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-200">{act.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 shrink-0">
                    {act.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Demo Navigation & Core Modules (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">AnnaSetu AI Interactive Modules</h3>
            <p className="text-xs text-slate-400 mb-4">Click to inspect and explore each platform capability:</p>

            <div className="space-y-2.5">
              <button
                onClick={() => setActiveTab('forecasting')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Demand & Prep Forecaster</div>
                      <div className="text-[11px] text-slate-400">RandomForest ML on 120-day dataset</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('quality')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">CV Quality & FEFO Guard</div>
                      <div className="text-[11px] text-slate-400">Pillow CV + FSSAI compliance check</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('iot')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Processing Plant IoT Monitor</div>
                      <div className="text-[11px] text-slate-400">Cold chain anomaly triggers for jury</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('redistribution')}
                className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Redistribution Logistics & Map</div>
                      <div className="text-[11px] text-slate-400">10 Delhi-NCR nodes & VRP route solver</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <span className="font-bold">Enterprise Ready:</span> Zero paid API dependencies required. Offline resilient local ML models & OpenStreetMap tiles.
          </div>
        </div>
      </div>
    </div>
  );
}
