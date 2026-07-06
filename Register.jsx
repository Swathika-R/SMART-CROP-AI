import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout, User, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      return setError('Please fill in all fields');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setError('');
      setLoading(true);
      const res = await register(username, email, password, role);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center min-h-[85vh]">
      
      <div className="glass-panel p-8 rounded-3xl shadow-xl flex flex-col gap-6 border border-slate-800">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-farm-green p-3 rounded-2xl text-white">
            <Sprout size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Join CropAI Community</h2>
          <p className="text-slate-400 text-sm">Create an account to gain AI-powered insights</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="form-label">{t('username')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User size={16} />
              </span>
              <input 
                type="text" 
                className="form-input pl-10" 
                placeholder="Rajesh Kumar" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">{t('email')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail size={16} />
              </span>
              <input 
                type="email" 
                className="form-input pl-10" 
                placeholder="rajesh@farm.com" 
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

          <div>
            <label className="form-label">Select Account Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <UserCheck size={16} />
              </span>
              <select 
                className="form-input pl-10 appearance-none pr-8 cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="farmer">Farmer (Grows Crops)</option>
                <option value="advisor">Agricultural Advisor (Gives Tips)</option>
                <option value="admin">System Administrator</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? t('loading') : t('register')}
            {!loading && <ArrowRight size={16} />}
          </button>

        </form>

        <div className="h-px bg-slate-800 my-1"></div>

        {/* Redirect */}
        <div className="text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-farm-mint hover:underline font-medium">
            Log in here
          </Link>
        </div>

      </div>

    </div>
  );
}
