import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { predictionsAPI, nlpAPI } from '../services/api';
import { Sprout, Volume2, RotateCcw, AlertCircle, HelpCircle, Leaf, Thermometer, Droplets, Compass, BarChart } from 'lucide-react';

export default function CropRecommend() {
  const { t, speakText, stopSpeaking } = useLanguage();

  const [form, setForm] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    temperature: '',
    humidity: '',
    pH: '',
    rainfall: '',
    soil_type: 'Loamy'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [localizedCropName, setLocalizedCropName] = useState('');
  const [cropDetails, setCropDetails] = useState(null);

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { nitrogen, phosphorus, potassium, temperature, humidity, pH, rainfall } = form;
    if (!nitrogen || !phosphorus || !potassium || !temperature || !humidity || !pH || !rainfall) {
      return 'Please enter all soil and climate parameters';
    }

    const n = parseFloat(nitrogen);
    const p = parseFloat(phosphorus);
    const k = parseFloat(potassium);
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity);
    const phVal = parseFloat(pH);
    const rain = parseFloat(rainfall);

    if (n < 0 || n > 200) return 'Nitrogen should be between 0 and 200 mg/kg';
    if (p < 0 || p > 200) return 'Phosphorus should be between 0 and 200 mg/kg';
    if (k < 0 || k > 300) return 'Potassium should be between 0 and 300 mg/kg';
    if (temp < -10 || temp > 60) return 'Temperature should be between -10°C and 60°C';
    if (hum < 0 || hum > 100) return 'Humidity should be between 0% and 100%';
    if (phVal < 0 || phVal > 14) return 'pH Level should be between 0 and 14';
    if (rain < 0 || rain > 1000) return 'Rainfall should be between 0 and 1000 mm';

    return '';
  };

  const handleReset = () => {
    setForm({
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      temperature: '',
      humidity: '',
      pH: '',
      rainfall: '',
      soil_type: 'Loamy'
    });
    setResult(null);
    setCropDetails(null);
    setLocalizedCropName('');
    setError('');
    stopSpeaking();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErr = validateForm();
    if (validationErr) {
      return setError(validationErr);
    }

    try {
      setError('');
      setLoading(true);
      setResult(null);

      const metrics = {
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        temperature: parseFloat(form.temperature),
        humidity: parseFloat(form.humidity),
        pH: parseFloat(form.pH),
        rainfall: parseFloat(form.rainfall),
        soil_type: form.soil_type
      };

      const res = await predictionsAPI.predict(metrics);
      if (res.data.success) {
        const predData = res.data.data;
        setResult(predData);

        // Fetch localized crop details and descriptions
        const currentLang = localStorage.getItem('language') || 'en';
        
        // Translate crop name
        const translationRes = await nlpAPI.translateText(predData.prediction, currentLang);
        const translatedCrop = translationRes.data.success ? translationRes.data.translatedText : predData.prediction;
        setLocalizedCropName(translatedCrop);

        // Fetch sowing/irrigation details
        const infoRes = await nlpAPI.getCropInfo(predData.prediction, currentLang);
        if (infoRes.data.success) {
          setCropDetails(infoRes.data.data);
        }

        // Auto trigger Audio Speech narration
        const voiceNarrative = `The optimal crop recommended for your soil is ${translatedCrop} with a confidence level of ${predData.confidence} percent.`;
        speakText(voiceNarrative);
      } else {
        setError(res.data.error || 'Failed to analyze crop recommendation');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error. Failed to run prediction.');
    } finally {
      setLoading(false);
    }
  };

  const speakResultAgain = () => {
    if (result) {
      const voiceNarrative = `The optimal crop recommended for your soil is ${localizedCropName || result.prediction} with a confidence level of ${result.confidence} percent.`;
      speakText(voiceNarrative);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Sprout size={28} className="text-farm-green animate-pulse" />
          {t('predictor')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{t('soilSub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Input Form Column */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 lg:col-span-3">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Compass size={18} className="text-farm-mint" />
            {t('soilHeader')}
          </h3>

          {error && (
            <div className="bg-red-950/40 border border-red-900/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* N */}
            <div>
              <label className="form-label">{t('nitrogen')} <span className="text-xs text-slate-500">(0-150 mg/kg)</span></label>
              <input 
                type="number" 
                name="nitrogen"
                className="form-input" 
                placeholder="e.g. 80" 
                value={form.nitrogen}
                onChange={handleInputChange}
              />
            </div>

            {/* P */}
            <div>
              <label className="form-label">{t('phosphorus')} <span className="text-xs text-slate-500">(0-150 mg/kg)</span></label>
              <input 
                type="number" 
                name="phosphorus"
                className="form-input" 
                placeholder="e.g. 45" 
                value={form.phosphorus}
                onChange={handleInputChange}
              />
            </div>

            {/* K */}
            <div>
              <label className="form-label">{t('potassium')} <span className="text-xs text-slate-500">(0-250 mg/kg)</span></label>
              <input 
                type="number" 
                name="potassium"
                className="form-input" 
                placeholder="e.g. 40" 
                value={form.potassium}
                onChange={handleInputChange}
              />
            </div>

            {/* pH */}
            <div>
              <label className="form-label">{t('phLevel')} <span className="text-xs text-slate-500">(3.5 - 9.5)</span></label>
              <input 
                type="number" 
                step="0.1"
                name="pH"
                className="form-input" 
                placeholder="e.g. 6.5" 
                value={form.pH}
                onChange={handleInputChange}
              />
            </div>

            {/* Temp */}
            <div>
              <label className="form-label">{t('temperature')} <span className="text-xs text-slate-500">(°C)</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Thermometer size={16} />
                </span>
                <input 
                  type="number" 
                  name="temperature"
                  className="form-input pl-10" 
                  placeholder="e.g. 24" 
                  value={form.temperature}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Humidity */}
            <div>
              <label className="form-label">{t('humidity')} <span className="text-xs text-slate-500">(%)</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Droplets size={16} />
                </span>
                <input 
                  type="number" 
                  name="humidity"
                  className="form-input pl-10" 
                  placeholder="e.g. 80" 
                  value={form.humidity}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Rainfall */}
            <div>
              <label className="form-label">{t('rainfall')} <span className="text-xs text-slate-500">(mm)</span></label>
              <input 
                type="number" 
                name="rainfall"
                className="form-input" 
                placeholder="e.g. 180" 
                value={form.rainfall}
                onChange={handleInputChange}
              />
            </div>

            {/* Soil Type */}
            <div>
              <label className="form-label">{t('soilType')}</label>
              <select 
                name="soil_type"
                className="form-input cursor-pointer"
                value={form.soil_type}
                onChange={handleInputChange}
              >
                <option value="Loamy">Loamy Soil</option>
                <option value="Clayey">Clayey Soil</option>
                <option value="Sandy">Sandy Soil</option>
                <option value="Black">Black Soil</option>
                <option value="Alluvial">Alluvial Soil</option>
                <option value="Red">Red Soil</option>
                <option value="Laterite">Laterite Soil</option>
              </select>
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-4 mt-2">
              <button 
                type="button" 
                onClick={handleReset}
                className="btn-secondary py-3 flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} />
                Clear
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary py-3"
              >
                {loading ? t('predicting') : t('predictBtn')}
              </button>
            </div>

          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-farm-green/30 shadow-lg relative overflow-hidden flex flex-col gap-6">
              {/* Glow Accent */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-farm-green/20 rounded-full blur-2xl"></div>

              {/* Title Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Leaf size={14} className="text-farm-green" />
                  {t('resultTitle')}
                </span>
                <button 
                  onClick={speakResultAgain}
                  className="bg-slate-800/80 hover:bg-slate-700/80 p-2 rounded-xl text-farm-mint transition-all flex items-center gap-1"
                  title="Speak details"
                >
                  <Volume2 size={16} />
                  <span className="text-[10px]">Read Aloud</span>
                </button>
              </div>

              {/* Main Predicted Crop */}
              <div className="text-center flex flex-col items-center gap-2 py-4">
                <span className="text-4xl font-extrabold tracking-tight text-white font-sans bg-clip-text bg-gradient-to-r from-emerald-200 to-white">
                  {localizedCropName || result.prediction}
                </span>
                <div className="flex items-center gap-1.5 mt-2 bg-farm-green/10 border border-farm-green/30 text-farm-mint px-4 py-1.5 rounded-full">
                  <BarChart size={14} />
                  <span className="text-sm font-semibold">{result.confidence}% Match Rating</span>
                </div>
              </div>

              {/* Sowing Details from NLP Info */}
              {cropDetails && (
                <div className="bg-slate-950/50 border border-slate-850 p-4.5 rounded-xl flex flex-col gap-3.5 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 font-medium">Optimal Sowing Window</span>
                    <span className="text-slate-200 font-semibold">{cropDetails.sowingTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 font-medium">Irrigation Needs</span>
                    <span className="text-slate-200 font-semibold">{cropDetails.irrigation}</span>
                  </div>
                  <div className="flex flex-col gap-1 leading-relaxed">
                    <span className="text-slate-500 font-medium">Description</span>
                    <p className="text-slate-300 italic">"{cropDetails.description}"</p>
                  </div>
                </div>
              )}

              {/* Alternative Crops */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t('altCrops')}</span>
                  <div className="grid grid-cols-2 gap-3">
                    {result.alternatives.map((alt, i) => (
                      <div key={i} className="bg-slate-950/20 border border-slate-800/60 p-3.5 rounded-xl text-center">
                        <p className="text-slate-200 font-semibold text-sm">{alt.crop}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{alt.confidence}% confidence</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-4 text-slate-500 min-h-[400px]">
              <div className="border border-slate-850 bg-slate-900/40 p-4 rounded-full text-slate-600">
                <HelpCircle size={32} />
              </div>
              <div>
                <h4 className="text-slate-300 font-semibold">Awaiting Soil Analysis</h4>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-1">
                  Complete the soil metrics forms on the left to activate the intelligent crop recommendation engine.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
