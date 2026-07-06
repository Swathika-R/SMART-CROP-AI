import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Menu, X, Globe, LogOut, User, Sprout, ShieldAlert, LineChart, LayoutDashboard, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-farm-green/30 text-white border-l-2 md:border-l-0 md:border-b-2 border-farm-green' : 'text-slate-300 hover:text-white hover:bg-slate-800/40 md:hover:bg-transparent';
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 shadow-lg px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="bg-farm-green p-2 rounded-xl text-white">
            <Sprout size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white font-sans bg-clip-text bg-gradient-to-r from-white to-emerald-400">
            {t('brand')}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        {user && (
          <div className="hidden md:flex items-center gap-1 font-medium">
            <Link to="/dashboard" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${isActive('/dashboard')}`}>
              <LayoutDashboard size={16} />
              {t('dashboard')}
            </Link>
            <Link to="/predict" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${isActive('/predict')}`}>
              <Sprout size={16} />
              {t('predictor')}
            </Link>
            <Link to="/detect" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${isActive('/detect')}`}>
              <ShieldAlert size={16} />
              {t('detector')}
            </Link>
            <Link to="/market" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${isActive('/market')}`}>
              <LineChart size={16} />
              {t('market')}
            </Link>
            <Link to="/feedback" className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${isActive('/feedback')}`}>
              <MessageSquare size={16} />
              {t('feedback')}
            </Link>
          </div>
        )}

        {/* Right Action Menu */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center gap-1.5 text-sm bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-xl transition-all"
            >
              <Globe size={15} />
              <span>{languages.find(l => l.code === language)?.nativeName || 'English'}</span>
            </button>
            
            {langDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 py-1.5">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-all ${language === lang.code ? 'bg-farm-green text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {lang.nativeName} ({lang.name})
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 text-slate-200 text-sm px-3.5 py-1.5 rounded-xl transition-all">
                <User size={15} className="text-farm-green" />
                <span>{user.username}</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-400 p-2 rounded-xl transition-all"
                title={t('logout')}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-slate-300 hover:text-white px-3.5 py-2 text-sm font-medium transition-all">
                {t('login')}
              </Link>
              <Link to="/register" className="bg-farm-green hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-900/20">
                {t('register')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Buttons */}
        <div className="flex md:hidden items-center gap-2">
          {/* Quick Language Switcher for Mobile */}
          <div className="relative">
            <button 
              onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200"
            >
              <Globe size={16} />
            </button>
            {langDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 py-1.5">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-farm-green text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-1">
          {user ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</div>
              <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${isActive('/dashboard')}`}
              >
                <LayoutDashboard size={16} />
                {t('dashboard')}
              </Link>
              <Link 
                to="/predict" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${isActive('/predict')}`}
              >
                <Sprout size={16} />
                {t('predictor')}
              </Link>
              <Link 
                to="/detect" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${isActive('/detect')}`}
              >
                <ShieldAlert size={16} />
                {t('detector')}
              </Link>
              <Link 
                to="/market" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${isActive('/market')}`}
              >
                <LineChart size={16} />
                {t('market')}
              </Link>
              <Link 
                to="/feedback" 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${isActive('/feedback')}`}
              >
                <MessageSquare size={16} />
                {t('feedback')}
              </Link>
              <div className="h-px bg-slate-800 my-2"></div>
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</div>
              <Link 
                to="/profile" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800"
              >
                <User size={16} />
                {t('profile')}
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-950/20"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 p-2">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)}
                className="btn-secondary w-full text-center"
              >
                {t('login')}
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)}
                className="btn-primary w-full text-center"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around py-2 px-2 shadow-2xl">
          <Link to="/dashboard" className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'text-farm-green font-semibold' : 'text-slate-400'}`}>
            <LayoutDashboard size={18} className={location.pathname === '/dashboard' ? 'scale-110 text-farm-green transition-transform' : ''} />
            <span className="text-[10px] tracking-tight">{t('dashboard')}</span>
          </Link>
          <Link to="/predict" className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${location.pathname === '/predict' ? 'text-farm-green font-semibold' : 'text-slate-400'}`}>
            <Sprout size={18} className={location.pathname === '/predict' ? 'scale-110 text-farm-green transition-transform' : ''} />
            <span className="text-[10px] tracking-tight">{t('predictor').split(' ')[0]}</span>
          </Link>
          <Link to="/detect" className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${location.pathname === '/detect' ? 'text-farm-green font-semibold' : 'text-slate-400'}`}>
            <ShieldAlert size={18} className={location.pathname === '/detect' ? 'scale-110 text-farm-green transition-transform' : ''} />
            <span className="text-[10px] tracking-tight">{t('detector').split(' ')[0]}</span>
          </Link>
          <Link to="/market" className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${location.pathname === '/market' ? 'text-farm-green font-semibold' : 'text-slate-400'}`}>
            <LineChart size={18} className={location.pathname === '/market' ? 'scale-110 text-farm-green transition-transform' : ''} />
            <span className="text-[10px] tracking-tight">{t('market').split(' ')[0]}</span>
          </Link>
          <Link to="/feedback" className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${location.pathname === '/feedback' ? 'text-farm-green font-semibold' : 'text-slate-400'}`}>
            <MessageSquare size={18} className={location.pathname === '/feedback' ? 'scale-110 text-farm-green transition-transform' : ''} />
            <span className="text-[10px] tracking-tight">{t('feedback')}</span>
          </Link>
          <Link to="/profile" className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${location.pathname === '/profile' ? 'text-farm-green font-semibold' : 'text-slate-400'}`}>
            <User size={18} className={location.pathname === '/profile' ? 'scale-110 text-farm-green transition-transform' : ''} />
            <span className="text-[10px] tracking-tight">{t('profile').split(' ')[0]}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
