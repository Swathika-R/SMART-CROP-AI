import React, { useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { diseaseAPI } from '../services/api';
import { ShieldAlert, UploadCloud, AlertCircle, FileImage, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function DiseaseDetect() {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return setError('Only image files are allowed!');
    }
    if (file.size > 5 * 1024 * 1024) {
      return setError('Image file is too large (Max limit: 5MB)');
    }
    
    setError('');
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError('');
  };

  const handleUploadAndAnalyze = async () => {
    if (!imageFile) {
      return setError('Please select or upload an image file first.');
    }

    try {
      setError('');
      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('cropType', selectedCrop);

      const res = await diseaseAPI.analyzeImage(formData);
      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError(res.data.error || 'Failed to analyze crop image');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process crop analysis. Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <ShieldAlert size={28} className="text-amber-500 animate-bounce" />
          {t('detector')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{t('detectSub')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Upload Column */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 lg:col-span-3">
          
          <div className="flex flex-col gap-2">
            <label className="form-label font-bold text-base">1. Select Target Crop Category</label>
            <div className="grid grid-cols-4 gap-2">
              {['Rice', 'Tomato', 'Maize', 'Other'].map(crop => (
                <button
                  key={crop}
                  onClick={() => setSelectedCrop(crop === 'Other' ? 'Default' : crop)}
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border transition-all ${
                    (selectedCrop === crop || (crop === 'Other' && selectedCrop === 'Default'))
                      ? 'bg-farm-green border-farm-green text-white shadow-md'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="form-label font-bold text-base">2. Upload Leaf Image</label>
            
            {error && (
              <div className="bg-red-950/40 border border-red-900/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm my-1">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!imagePreview ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 cursor-pointer transition-all min-h-[260px] ${
                  dragActive 
                    ? 'border-farm-green bg-farm-green/5' 
                    : 'border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/40'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="bg-slate-900/80 p-4 rounded-full border border-slate-800 text-slate-500">
                  <UploadCloud size={32} />
                </div>
                <div>
                  <p className="text-slate-200 font-semibold text-sm">{t('uploadArea')}</p>
                  <p className="text-slate-500 text-xs mt-1.5">{t('uploadHint')}</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 max-h-[350px] flex justify-center bg-slate-950/60">
                <img 
                  src={imagePreview} 
                  alt="Crop leaves preview" 
                  className="max-h-[350px] w-auto object-contain rounded-2xl"
                />
                
                {/* Simulated Scan Sweep line */}
                {loading && (
                  <div className="absolute left-0 right-0 h-1 bg-farm-green shadow-[0_0_15px_#2E8B57] animate-scan z-10"></div>
                )}

                {!loading && (
                  <button
                    onClick={handleReset}
                    className="absolute top-4 right-4 bg-red-950/80 hover:bg-red-900 text-red-400 px-3 py-1.5 rounded-xl border border-red-900/40 text-xs transition-all"
                  >
                    Replace Image
                  </button>
                )}
              </div>
            )}
          </div>

          {imagePreview && !loading && !result && (
            <button
              onClick={handleUploadAndAnalyze}
              className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
            >
              <Zap size={16} />
              Run Computer Vision Analysis
            </button>
          )}

          {loading && (
            <div className="bg-slate-950/80 border border-slate-850 p-6 rounded-xl text-center flex flex-col items-center justify-center gap-3 mt-2 min-h-[90px]">
              <div className="w-8 h-8 border-3 border-farm-green border-t-transparent rounded-full animate-spin"></div>
              <span className="text-farm-mint text-xs font-semibold uppercase tracking-wider">{t('scanning')}</span>
            </div>
          )}

        </div>

        {/* Diagnostic Results Column */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-lg flex flex-col gap-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  {t('reportTitle')}
                </h3>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${
                  result.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-900/30' :
                  result.severity === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-900/30' :
                  result.severity === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-900/30' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                }`}>
                  {result.severity} Severity
                </span>
              </div>

              {/* Diagnosis Details */}
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-wider block">{t('detectedIssue')}</span>
                  <span className="text-xl font-bold text-slate-100 mt-1 block">
                    {result.detectedDisease}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Analyzed Crop: <strong className="text-slate-300">{result.cropType}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950/40 border border-slate-850 p-3 rounded-xl text-xs">
                  <div className="bg-farm-green/10 text-farm-green p-1.5 rounded-lg">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Confidence Score</span>
                    <p className="text-slate-200 font-bold font-mono">{result.confidence}% Match Level</p>
                  </div>
                </div>

                {/* Treatments */}
                <div className="flex flex-col gap-3.5 mt-2">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{t('remedies')}</span>
                  <div className="flex flex-col gap-2.5">
                    {result.treatments && result.treatments.map((treatment, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/20 border border-slate-900/60 p-3.5 rounded-xl">
                        <span className="bg-farm-green text-white font-bold w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p>{treatment}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-4 text-slate-500 min-h-[400px]">
              <div className="border border-slate-850 bg-slate-900/40 p-4 rounded-full text-slate-600">
                <FileImage size={32} />
              </div>
              <div>
                <h4 className="text-slate-300 font-semibold">Diagnostic Awaiting Scan</h4>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-1">
                  Upload an image of the plant leaf above and execute the analysis scanning algorithm.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
