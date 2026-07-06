import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout, ShieldAlert, LineChart, ChevronRight, CheckCircle2, UserCheck, Languages } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-24">
      
      {/* Hero Section */}
      <section className="text-center flex flex-col items-center gap-6 py-8 relative">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-farm-green/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-farm-green/10 border border-farm-green/20 text-farm-mint text-xs font-semibold uppercase tracking-wider mb-2">
          <Sprout size={12} />
          Smart India Hackathon Entry
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-4xl leading-tight">
          {t('heroTitle')}
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light">
          {t('heroSub')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          {user ? (
            <Link to="/dashboard" className="btn-primary px-8 py-3 text-base shadow-lg shadow-farm-green/20">
              Go to Dashboard
              <ChevronRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary px-8 py-3 text-base shadow-lg shadow-farm-green/20">
                {t('getStarted')}
                <ChevronRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3 text-base">
                {t('learnMore')}
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Feature: Crop Prediction */}
        <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full"></div>
          <div className="bg-farm-green/20 text-farm-green p-3.5 rounded-xl w-fit">
            <Sprout size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mt-2">{t('featurePredictorTitle')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{t('featurePredictorDesc')}</p>
          <div className="flex items-center gap-2 text-xs font-medium text-farm-mint bg-slate-900/60 w-fit px-2.5 py-1 rounded-md mt-2 border border-slate-800">
            <CheckCircle2 size={12} />
            7 Soil &amp; Climate Metrics
          </div>
        </div>

        {/* Feature: Disease detection */}
        <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full"></div>
          <div className="bg-amber-500/10 text-amber-400 p-3.5 rounded-xl w-fit">
            <ShieldAlert size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mt-2">{t('featureDetectorTitle')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{t('featureDetectorDesc')}</p>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-300 bg-slate-900/60 w-fit px-2.5 py-1 rounded-md mt-2 border border-slate-800">
            <CheckCircle2 size={12} />
            Instant Severity Grading
          </div>
        </div>

        {/* Feature: Market Intelligence */}
        <div className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full"></div>
          <div className="bg-blue-500/10 text-blue-400 p-3.5 rounded-xl w-fit">
            <LineChart size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mt-2">{t('featureMarketTitle')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{t('featureMarketDesc')}</p>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-300 bg-slate-900/60 w-fit px-2.5 py-1 rounded-md mt-2 border border-slate-800">
            <CheckCircle2 size={12} />
            8 State Mandi Price Indexes
          </div>
        </div>

      </section>

      {/* Advanced Capabilities */}
      <section className="glass-panel p-8 md:p-12 rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 text-farm-mint bg-farm-green/10 border border-farm-green/20 px-3 py-1 rounded-full text-xs font-semibold w-fit">
            <Languages size={14} />
            Localization Engine
          </div>
          
          <h2 className="text-3xl font-bold text-white leading-tight">
            Designed for Local Indian Farming Communities
          </h2>
          
          <p className="text-slate-300 leading-relaxed text-sm font-light">
            Agriculture thrives on regional knowledge. CropAI features local translation dictionaries and voice audio assistance (Text-to-Speech) supporting 10 languages (Hindi, Tamil, Telugu, Punjabi, Gujarati, etc.). It addresses the visual and linguistic diversity of farmers across different regions.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-start gap-2">
              <div className="bg-farm-green/20 text-farm-mint p-1 rounded-lg mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">10+ Regional Dialects</h4>
                <p className="text-xs text-slate-500">Instant UI Translation</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-farm-green/20 text-farm-mint p-1 rounded-lg mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Voice Assistance</h4>
                <p className="text-xs text-slate-500">Narrates diagnostics aloud</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Grid Illustration */}
        <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 font-mono text-xs text-slate-400">
          <div className="flex justify-between border-b border-slate-900 pb-2">
            <span className="text-farm-mint font-semibold">LANGUAGE ENGINE MAPPINGS</span>
            <span className="text-slate-600">STABLE</span>
          </div>
          <div className="flex justify-between">
            <span>en: "Crop Predictor"</span>
            <span className="text-slate-600">--&gt;</span>
            <span className="text-slate-200">"Crop Predictor"</span>
          </div>
          <div className="flex justify-between">
            <span>hi: "Crop Predictor"</span>
            <span className="text-slate-600">--&gt;</span>
            <span className="text-slate-200">"फसल प्रेडिक्टर"</span>
          </div>
          <div className="flex justify-between">
            <span>ta: "Crop Predictor"</span>
            <span className="text-slate-600">--&gt;</span>
            <span className="text-slate-200">"பயிர் கணிப்பான்"</span>
          </div>
          <div className="flex justify-between">
            <span>te: "Crop Predictor"</span>
            <span className="text-slate-600">--&gt;</span>
            <span className="text-slate-200">"పంట సిఫార్సుదారు"</span>
          </div>
          <div className="flex justify-between">
            <span>bn: "Crop Predictor"</span>
            <span className="text-slate-600">--&gt;</span>
            <span className="text-slate-200">"ফসল সুপারিশকারী"</span>
          </div>
        </div>
      </section>

    </div>
  );
}
