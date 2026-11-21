import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import DashboardTab from './components/DashboardTab.jsx';
import ForecastingTab from './components/ForecastingTab.jsx';
import QualityGuardTab from './components/QualityGuardTab.jsx';
import IoTMonitorTab from './components/IoTMonitorTab.jsx';
import RedistributionTab from './components/RedistributionTab.jsx';
import ESGReportTab from './components/ESGReportTab.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bridgeData, setBridgeData] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBridgeToRedistribution = (data) => {
    setBridgeData(data);
    setActiveTab('redistribution');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={fetchStats}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={stats}
            setActiveTab={setActiveTab}
            onNavigateWithData={handleBridgeToRedistribution}
          />
        )}

        {activeTab === 'forecasting' && (
          <ForecastingTab
            onBridgeToRedistribution={handleBridgeToRedistribution}
          />
        )}

        {activeTab === 'quality' && (
          <QualityGuardTab
            onBridgeToRedistribution={handleBridgeToRedistribution}
          />
        )}

        {activeTab === 'iot' && (
          <IoTMonitorTab />
        )}

        {activeTab === 'redistribution' && (
          <RedistributionTab
            initialFormData={bridgeData}
          />
        )}

        {activeTab === 'esg' && (
          <ESGReportTab />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AnnaSetu AI • AI-Powered Smart Food Waste Reduction & Sustainable Redistribution Platform • Agriculture, FoodTech & Sustainability
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Production Grade MVP • Zero Paid API Dependencies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
