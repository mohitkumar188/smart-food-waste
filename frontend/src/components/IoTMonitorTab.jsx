import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Thermometer, 
  Droplet, 
  Zap, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Flame, 
  TrendingUp, 
  ShieldAlert,
  Sliders,
  Play
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Legend
} from 'recharts';
import { getApiUrl } from '../config/api.js';

export default function IoTMonitorTab() {
  const [telemetryData, setTelemetryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [triggeringMode, setTriggeringMode] = useState(null);

  // Poll every 3 seconds
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(getApiUrl('/api/iot/telemetry'));
      const data = await res.json();
      setTelemetryData(data);
    } catch (err) {
      console.error("Failed to fetch IoT telemetry:", err);
    }
  };

  const triggerSimulation = async (mode) => {
    setTriggeringMode(mode);
    try {
      await fetch(getApiUrl('/api/iot/simulate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      await fetchTelemetry();
    } catch (err) {
      console.error("Failed to simulate mode:", err);
    } finally {
      setTriggeringMode(null);
    }
  };

  const current = telemetryData?.current || {
    timestamp: "12:00:00",
    cold_storage_temp: 3.2,
    humidity: 89.2,
    energy_consumption_kwh: 44.5,
    yield_loss_pct: 3.8,
    line_status: "Optimal Running",
    anomaly_flag: 0,
    active_mode: "NORMAL"
  };

  const history = telemetryData?.history || [];
  const activeMode = telemetryData?.summary?.active_simulation_mode || "NORMAL";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Module 4 • Industrial IoT & Telemetry
            </span>
            <span className="text-xs text-slate-400">AnnaSetu AI Food Processing Efficiency & Cold-Chain Guard</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Food Processing Unit IoT & Cold-Chain Telemetry Monitor
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Streaming sensor telemetry (3-second cadence), automated thermal threshold tripwires, and statistical yield anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              current.anomaly_flag ? 'bg-rose-400' : 'bg-emerald-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              current.anomaly_flag ? 'bg-rose-500' : 'bg-emerald-500'
            }`}></span>
          </span>
          <span className="text-xs font-mono font-bold text-slate-200">
            {current.anomaly_flag ? "ANOMALY ALERT ACTIVE" : "TELEMETRY STABLE"}
          </span>
        </div>
      </div>

      {/* Interactive Anomaly Simulation Controls */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              Interactive Anomaly Simulation Controls
            </h3>
            <p className="text-xs text-slate-400">
              Trigger real-time edge incidents below to inspect automated alarm dispatch and mitigating redistribution protocols:
            </p>
          </div>
          {activeMode !== 'NORMAL' && (
            <button
              onClick={() => triggerSimulation('NORMAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Normal State</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Breach 1 */}
          <button
            onClick={() => triggerSimulation('COLD_CHAIN_BREACH')}
            disabled={triggeringMode !== null}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeMode === 'COLD_CHAIN_BREACH'
                ? 'bg-rose-600/20 border-rose-500 text-white shadow-md shadow-rose-950/50'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-rose-500/50 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Demo Trigger 1
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300">
                Critical
              </span>
            </div>
            <div className="text-xs font-bold text-white">Simulate Cold-Chain Breach</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Spikes temp to 13.5°C; flags dairy/perishable spoilage hazard.
            </div>
          </button>

          {/* Breach 2 */}
          <button
            onClick={() => triggerSimulation('OVERPRODUCTION_SPIKE')}
            disabled={triggeringMode !== null}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeMode === 'OVERPRODUCTION_SPIKE'
                ? 'bg-amber-600/20 border-amber-500 text-white shadow-md shadow-amber-950/50'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-amber-500/50 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Demo Trigger 2
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300">
                Warning
              </span>
            </div>
            <div className="text-xs font-bold text-white">Simulate Overproduction Spike</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Surges yield loss to 16.8%; auto-lists 340kg surplus lot.
            </div>
          </button>

          {/* Breach 3 */}
          <button
            onClick={() => triggerSimulation('MACHINE_DOWNTIME')}
            disabled={triggeringMode !== null}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeMode === 'MACHINE_DOWNTIME'
                ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Demo Trigger 3
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300">
                Line Stop
              </span>
            </div>
            <div className="text-xs font-bold text-white">Machine Downtime & Power Surge</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Motor locks; energy surges to 88 kWh; emergency stop fires.
            </div>
          </button>
        </div>
      </div>

      {/* Active Anomaly Alert Box (Appears when anomaly is triggered) */}
      {current.anomaly_flag === 1 && (
        <div className={`p-4 rounded-2xl border shadow-lg animate-pulse transition-all ${
          current.severity === 'critical' 
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' 
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
              current.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
            }`} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {current.anomaly_type}
                </span>
                <span className="text-xs font-mono text-slate-400">Triggered at {current.timestamp}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {current.anomaly_description}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                <span className="font-bold text-emerald-400">Mitigation Action:</span> {current.mitigation_action}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4 Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className={`p-4 rounded-xl border bg-slate-900/80 transition-all ${
          current.cold_storage_temp > 4.5 ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cold Storage Temp</span>
            <Thermometer className={`w-4 h-4 ${current.cold_storage_temp > 4.5 ? 'text-rose-400' : 'text-cyan-400'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black ${current.cold_storage_temp > 4.5 ? 'text-rose-400' : 'text-white'}`}>
              {current.cold_storage_temp}°C
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>Threshold: &le; 4.0°C</span>
              <span className={current.cold_storage_temp <= 4.0 ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                {current.cold_storage_temp <= 4.0 ? 'Compliant' : 'Breach'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Relative Humidity</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">{current.humidity}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>Target: 85% – 92%</span>
              <span className="text-emerald-400">Optimal</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`p-4 rounded-xl border bg-slate-900/80 transition-all ${
          current.energy_consumption_kwh > 60.0 ? 'border-purple-500/50 bg-purple-950/20' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Machine Energy</span>
            <Zap className={`w-4 h-4 ${current.energy_consumption_kwh > 60.0 ? 'text-purple-400' : 'text-amber-400'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black ${current.energy_consumption_kwh > 60.0 ? 'text-purple-400' : 'text-white'}`}>
              {current.energy_consumption_kwh} <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>Baseline: 45 kWh</span>
              <span className={current.energy_consumption_kwh > 60.0 ? 'text-purple-400 font-bold' : 'text-slate-400'}>
                {current.energy_consumption_kwh > 60.0 ? 'Energy Surge' : 'Normal Load'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`p-4 rounded-xl border bg-slate-900/80 transition-all ${
          current.yield_loss_pct > 5.0 ? 'border-amber-500/50 bg-amber-950/20' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Raw Material Yield Loss</span>
            <Activity className={`w-4 h-4 ${current.yield_loss_pct > 5.0 ? 'text-amber-400' : 'text-emerald-400'}`} />
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-black ${current.yield_loss_pct > 5.0 ? 'text-amber-400' : 'text-white'}`}>
              {current.yield_loss_pct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between">
              <span>ISO 22000 Limit: &le; 5.0%</span>
              <span className={current.yield_loss_pct <= 5.0 ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                {current.yield_loss_pct <= 5.0 ? 'Controlled' : 'Spike'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Streaming Telemetry Line Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Live Telemetry Multi-Stream Waveform (Polling Every 3s)
            </h3>
            <p className="text-xs text-slate-400">
              Observing Mother Dairy / Haldiram Continuous Retort Line 4 • Safe Cold-Chain Ceiling: 4.0°C
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 inline-block"></span>
              <span className="text-slate-300">Temp (°C)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-purple-400 inline-block"></span>
              <span className="text-slate-300">Energy (kWh)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 inline-block"></span>
              <span className="text-slate-300">Yield Loss (%)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              />
              <ReferenceLine y={4.0} label={{ value: "Max Safe Temp (4°C)", fill: "#f43f5e", fontSize: 10, position: "top" }} stroke="#f43f5e" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="cold_storage_temp" name="Temperature (°C)" stroke="#06b6d4" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="energy_consumption_kwh" name="Energy (kWh)" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="yield_loss_pct" name="Yield Loss (%)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
