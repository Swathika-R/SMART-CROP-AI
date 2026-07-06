import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Invalid login details');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-16 flex flex-col justify-center min-h-[80vh]">
      
      <div className="glass-panel p-8 rounded-3xl shadow-xl flex flex-col gap-6 border border-slate-800">
        
        {/* Header logo */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-farm-green p-3 rounded-2xl text-white">
            <Sprout size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Welcome back to CropAI</h2>
          <p className="text-slate-400 text-sm">Log in to manage your farm and predictions</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="form-label">{t('email')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                className="form-input pl-10" 
                placeholder="name@farm.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input 
                type="password" 
                className="form-input pl-10" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? t('loading') : t('login')}
            {!loading && <ArrowRight size={16} />}
          </button>

        </form>

        <div className="h-px bg-slate-800 my-1"></div>

        {/* Redirect */}
        <div className="text-center text-sm text-slate-400">
          New to CropAI?{' '}
          <Link to="/register" className="text-farm-mint hover:underline font-medium">
            Register an account
          </Link>
        </div>

      </div>

    </div>
  );
}
