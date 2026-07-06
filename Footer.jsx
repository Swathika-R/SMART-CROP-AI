import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sprout } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/60 backdrop-blur-md px-4 py-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
        
        <div className="flex items-center gap-2">
          <div className="bg-farm-green/20 p-1.5 rounded-lg text-farm-green">
            <Sprout size={16} />
          </div>
          <span className="font-semibold text-slate-200">{t('brand')}</span>
          <span className="text-slate-600">|</span>
          <span>Intelligent Smart Farm Platform</span>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span>&copy; {new Date().getFullYear()} SIH Smartfarm Hackathon. All rights reserved.</span>
        </div>
        
        <div className="text-xs text-slate-500">
          Powered by Machine Learning &amp; Resilient Fallbacks
        </div>
        
      </div>
    </footer>
  );
}
