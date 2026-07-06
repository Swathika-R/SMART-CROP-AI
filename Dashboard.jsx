import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { predictionsAPI, diseaseAPI, userAPI } from '../services/api';
import { Sprout, ShieldAlert, LineChart, Cpu, Calendar, Settings, ChevronRight, Activity, Plus, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [predictStats, setPredictStats] = useState({
    totalPredictions: 0,
    mostRecommendedCrop: 'None',
    averageConfidence: 0,
    soilHealthIndex: 'N/A'
  });
  const [diseaseStats, setDiseaseStats] = useState({
    totalDetections: 0,
    criticalDetections: 0,
    mostCommonDisease: 'None',
    healthyCropsPercent: 100
  });
  const [generalStats, setGeneralStats] = useState({
    predictionsCount: 0,
    detectionsCount: 0,
    advisorNotesCount: 0
  });

  const [recentPredictions, setRecentPredictions] = useState([]);
  const [recentDetections, setRecentDetections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Stats calls
        const pStatsRes = await predictionsAPI.getOverviewStats();
        const dStatsRes = await diseaseAPI.getOverviewStats();
        const uStatsRes = await userAPI.getStats();

        if (pStatsRes.data.success) setPredictStats(pStatsRes.data.data);
        if (dStatsRes.data.success) setDiseaseStats(dStatsRes.data.data);
        if (uStatsRes.data.success) setGeneralStats(uStatsRes.data.data);

        // Recent history calls
        const pHistoryRes = await predictionsAPI.getHistory();
        const dHistoryRes = await diseaseAPI.getHistory();

        if (pHistoryRes.data.success) {
          setRecentPredictions(pHistoryRes.data.data.slice(0, 3));
        }
        if (dHistoryRes.data.success) {
          setRecentDetections(dHistoryRes.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-farm-green border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-medium">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Hello, {user?.username} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here is the latest intelligence report for your farm.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/predict" className="btn-primary py-2 text-sm">
            <Plus size={16} />
            New Prediction
          </Link>
          <Link to="/detect" className="btn-secondary py-2 text-sm">
            <Plus size={16} />
            New Scan
          </Link>
        </div>
      </div>

      {/* KPI Stats widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Soil Health */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="bg-farm-green/15 text-farm-green p-3 rounded-xl">
            <Sprout size={22} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Soil Status</p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{predictStats.soilHealthIndex}</h3>
            <p className="text-slate-400 text-xs mt-1">From {predictStats.totalPredictions} analyses</p>
          </div>
        </div>

        {/* KPI 2: Crop Recs */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Primary Recommendation</p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{predictStats.mostRecommendedCrop}</h3>
            <p className="text-slate-400 text-xs mt-1">Avg Confidence: {predictStats.averageConfidence}%</p>
          </div>
        </div>

        {/* KPI 3: Disease Alerts */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Leaf Infections</p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">
              {diseaseStats.totalDetections > 0 ? `${diseaseStats.healthyCropsPercent}% Healthy` : 'No Scans'}
            </h3>
            <p className="text-slate-400 text-xs mt-1 text-amber-400 flex items-center gap-1">
              {diseaseStats.criticalDetections > 0 && <AlertTriangle size={12} />}
              {diseaseStats.criticalDetections} High Severity issues
            </p>
          </div>
        </div>

        {/* KPI 4: Market prices */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Market Outlook</p>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">Active</h3>
            <p className="text-slate-400 text-xs mt-1">Prices changing daily</p>
          </div>
        </div>

      </div>

      {/* Main Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel 1: Recent Crop Predictions */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sprout size={18} className="text-farm-green" />
              Recent Crop Suitabilities
            </h3>
            <Link to="/predict" className="text-farm-mint text-xs hover:underline flex items-center gap-0.5">
              Analyze Soil <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentPredictions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No crop predictions completed yet. Sieve your soil and run one!
              </div>
            ) : (
              recentPredictions.map((pred) => (
                <div key={pred._id} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-200 text-sm">{pred.predictedCrop}</span>
                    <span className="text-slate-500 text-xs flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(pred.createdAt).toLocaleDateString()}
                      <span>•</span>
                      pH: {pred.soilMetrics.pH}
                      <span>•</span>
                      Rainfall: {pred.soilMetrics.rainfall}mm
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-farm-green font-mono text-sm font-semibold">{pred.confidence}%</span>
                    <p className="text-slate-600 text-[10px]">Confidence</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Quick Links / Advisories */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Cpu size={18} className="text-farm-mint" />
            AI Advisories
          </h3>

          <div className="flex flex-col gap-4">
            <div className="bg-farm-green/10 border border-farm-green/20 p-4 rounded-xl flex flex-col gap-2">
              <span className="text-farm-mint font-semibold text-xs uppercase tracking-wider">Quick Hint</span>
              <p className="text-slate-300 text-xs leading-relaxed">
                Checking N-P-K levels before selecting crops helps reduce chemical fertilizer requirements by up to 30%.
              </p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
              <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Advisor Note</span>
              <p className="text-slate-300 text-xs leading-relaxed">
                Delayed monsoon weather reports in Punjab state suggest deferring early paddy transplanting.
              </p>
            </div>
          </div>
        </div>

        {/* Panel 3: Recent Crop Disease Detections */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert size={18} className="text-amber-400" />
              Recent Plant Diagnoses
            </h3>
            <Link to="/detect" className="text-farm-mint text-xs hover:underline flex items-center gap-0.5">
              Scan Leaf <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentDetections.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No leaf diagnostics recorded yet. Snap a picture of a leaf to inspect health status.
              </div>
            ) : (
              recentDetections.map((scan) => (
                <div key={scan._id} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    <img 
                      src={scan.imageUrl} 
                      alt="Crop leaf" 
                      className="w-12 h-12 rounded-lg object-cover bg-slate-850 border border-slate-850 flex-shrink-0"
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-200 text-sm">{scan.cropType} - {scan.detectedDisease}</span>
                      <span className="text-slate-500 text-xs flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        scan.severity === 'Critical' ? 'bg-red-950/60 text-red-400 border border-red-900/30' :
                        scan.severity === 'High' ? 'bg-orange-950/60 text-orange-400 border border-orange-900/30' :
                        scan.severity === 'Medium' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' :
                        'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30'
                      }`}>
                        {scan.severity}
                      </span>
                      <p className="text-slate-600 text-[10px] mt-0.5">Severity</p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-200 font-mono text-sm font-semibold">{scan.confidence}%</span>
                      <p className="text-slate-600 text-[10px]">Confidence</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
