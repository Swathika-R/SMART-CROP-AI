import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { marketAPI } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart, DollarSign, Calendar, Search, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function MarketIntel() {
  const { t } = useLanguage();

  const [prices, setPrices] = useState([]);
  const [trends, setTrends] = useState({});
  const [forecasts, setForecasts] = useState([]);
  const [weatherImpacts, setWeatherImpacts] = useState([]);

  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const pRes = await marketAPI.getPrices();
        const tRes = await marketAPI.getTrends();
        const fRes = await marketAPI.getForecast();
        const wRes = await marketAPI.getWeatherImpact();

        if (pRes.data.success) setPrices(pRes.data.data);
        if (tRes.data.success) setTrends(tRes.data.data);
        if (fRes.data.success) setForecasts(fRes.data.data);
        if (wRes.data.success) setWeatherImpacts(wRes.data.data);
      } catch (err) {
        console.error('Error fetching market details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const handleCropTrendSelect = (crop) => {
    setSelectedCrop(crop);
  };

  const filteredPrices = prices.filter(p => {
    const matchQuery = p.crop.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.state.toLowerCase().includes(searchQuery.toLowerCase());
    return matchQuery;
  });

  // Prepare chart data
  const chartData = trends[selectedCrop] || [];

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
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <LineChart size={28} className="text-farm-green" />
          {t('market')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{t('marketSub')}</p>
      </div>

      {/* Weather Impacts Banner Alerts */}
      {weatherImpacts.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-400" />
            {t('weatherImpact')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weatherImpacts.map((impact, i) => (
              <div key={i} className="glass-panel p-4.5 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{impact.region}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    impact.severity === 'High' ? 'bg-red-950/60 text-red-400 border border-red-900/30' :
                    impact.severity === 'Medium' ? 'bg-amber-950/60 text-amber-400 border border-amber-900/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {impact.severity} Severity
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 mt-1">{impact.cropAffected} : {impact.condition}</h4>
                <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{impact.impactDetails}</p>
                <div className="flex justify-between items-center text-[10px] mt-1 text-slate-500 pt-1.5 border-t border-slate-900">
                  <span>Price Outlook: <strong className={impact.priceChangePercent > 0 ? "text-emerald-400" : "text-amber-400"}>{impact.priceDirection}</strong></span>
                  <span className={impact.priceChangePercent > 0 ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                    {impact.priceChangePercent > 0 ? `+${impact.priceChangePercent}%` : `${impact.priceChangePercent}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grids: Prices & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Live Mandi Prices list */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 lg:col-span-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3.5">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <DollarSign size={18} className="text-farm-green" />
              {t('priceIndex')}
            </h3>
            
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-8 pr-3.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-farm-green/50 focus:border-farm-green placeholder-slate-650"
                placeholder="Search state/crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">{t('crop')}</th>
                  <th className="py-2.5 px-3">{t('state')}</th>
                  <th className="py-2.5 px-3 text-right">{t('minPrice')}</th>
                  <th className="py-2.5 px-3 text-right">{t('maxPrice')}</th>
                  <th className="py-2.5 px-3 text-right">{t('avgPrice')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {filteredPrices.slice(0, 15).map((price) => (
                  <tr 
                    key={price.id} 
                    onClick={() => handleCropTrendSelect(price.crop)}
                    className={`hover:bg-slate-900/40 cursor-pointer transition-all ${
                      selectedCrop === price.crop ? 'bg-farm-green/5' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-200 font-semibold">{price.crop}</td>
                    <td className="py-3 px-3 text-slate-400">{price.state}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">₹{price.minPrice}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">₹{price.maxPrice}</td>
                    <td className="py-3 px-3 text-right font-mono text-farm-mint font-semibold">₹{price.modalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts & Forecasts Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Charts */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <div className="border-b border-slate-850 pb-2 flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">
                {selectedCrop} {t('trends')}
              </span>
              <span className="text-[10px] text-slate-500">₹ per Quintal</span>
            </div>

            <div className="h-[200px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8B57" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2E8B57" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['dataMin - 200', 'dataMax + 200']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', color: '#f8fafc', fontSize: 11 }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#2E8B57" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                  Select a crop from the price list to load chart.
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              <Info size={10} className="inline mr-1" />
              Click any crop in the left table directory to load its price trend graphs.
            </p>
          </div>

          {/* Forecasts */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2.5 flex items-center gap-1.5">
              <TrendingUp size={15} className="text-farm-green" />
              {t('forecasts')}
            </h3>

            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
              {forecasts.map((forecast, i) => (
                <div key={i} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200 text-xs">{forecast.crop}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Confidence: {forecast.confidenceScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      forecast.marketSentiment.includes('Bullish') ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' :
                      forecast.marketSentiment.includes('Bearish') ? 'bg-red-950/60 text-red-400 border border-red-900/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {forecast.marketSentiment.split(' ')[0]}
                    </span>
                    <p className={`text-[10px] font-bold mt-1 ${forecast.projectedChangePercent > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {forecast.projectedChangePercent > 0 ? `+${forecast.projectedChangePercent}%` : `${forecast.projectedChangePercent}%`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
