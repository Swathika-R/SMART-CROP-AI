import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Settings, User, Mail, ShieldAlert, Compass, CheckCircle2, Lock, Eye, AlertTriangle } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, updatePassword, deleteAccount } = useAuth();
  const { t } = useLanguage();

  // Profile Form States
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [farmLocation, setFarmLocation] = useState(user?.farmDetails?.location || '');
  const [farmSize, setFarmSize] = useState(user?.farmDetails?.size || '');
  
  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Alert/Status States
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setProfileError('');
      setProfileSuccess('');
      setLoading(true);

      const updates = {
        username,
        email,
        farmDetails: {
          location: farmLocation,
          size: parseFloat(farmSize) || 0
        }
      };

      const res = await updateProfile(updates);
      if (res.success) {
        setProfileSuccess('Farmer profile updated successfully!');
      } else {
        setProfileError(res.error || 'Failed to update profile details.');
      }
    } catch (err) {
      setProfileError('Server error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return setPasswordError('Please enter both current and new passwords.');
    }
    if (newPassword.length < 6) {
      return setPasswordError('New password must be at least 6 characters long.');
    }

    try {
      setPasswordError('');
      setPasswordSuccess('');
      setLoading(true);

      const res = await updatePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordError(res.error || 'Failed to update credentials.');
      }
    } catch (err) {
      setPasswordError('Server error updating credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const res = await deleteAccount();
      if (!res.success) {
        setProfileError(res.error || 'Failed to delete account.');
      }
    } catch (err) {
      setProfileError('Server error deleting user profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Settings size={28} className="text-farm-green" />
          {t('profile')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">{t('profileSub')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Profile Card & Farm Info Form */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2.5 flex items-center gap-1.5">
              <User size={18} className="text-farm-green" />
              General Coordinates
            </h3>

            {profileSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="bg-red-950/40 border border-red-900/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs">
                <ShieldAlert size={16} className="flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="form-label">{t('username')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">{t('email')}</label>
                <input 
                  type="email" 
                  className="form-input text-slate-400 cursor-not-allowed bg-slate-950/40 border-slate-900" 
                  value={email}
                  disabled
                />
              </div>

              <div>
                <label className="form-label">{t('farmLocation')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Ludhiana, Punjab"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">{t('farmSize')}</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 5.5"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary sm:col-span-2 py-2.5 text-sm mt-2"
              >
                {loading ? t('loading') : t('save')}
              </button>

            </form>
          </div>
        </div>

        {/* Security and Danger Zone Column */}
        <div className="flex flex-col gap-6">
          
          {/* Change Password Card */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Lock size={16} className="text-farm-mint" />
              Credentials Setup
            </h3>

            {passwordSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 px-3 py-2 rounded-xl flex items-center gap-2 text-[10px]">
                <CheckCircle2 size={14} className="flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="bg-red-950/40 border border-red-900/30 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2 text-[10px]">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Current Password</label>
                <input 
                  type="password" 
                  className="form-input py-2 text-xs" 
                  placeholder="••••••••" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">New Password</label>
                <input 
                  type="password" 
                  className="form-input py-2 text-xs" 
                  placeholder="••••••••" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-secondary py-2 text-xs font-semibold mt-2"
              >
                Change password
              </button>
            </form>
          </div>

          {/* Danger zone */}
          <div className="glass-panel p-6 rounded-2xl border border-red-950/20 flex flex-col gap-4">
            <h3 className="text-base font-bold text-red-400 border-b border-red-950/40 pb-2.5 flex items-center gap-1.5">
              <AlertTriangle size={16} />
              {t('dangerZone')}
            </h3>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 text-red-400 py-2.5 rounded-xl text-xs font-semibold transition-all text-center"
              >
                {t('deleteAcc')}
              </button>
            ) : (
              <div className="flex flex-col gap-3.5">
                <p className="text-[10px] text-red-400 leading-relaxed">
                  Are you absolutely sure? All database prediction logs and leaf diagnosis documents will be deleted. This cannot be undone.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDeleteConfirm(false)}
                    className="btn-secondary py-2 text-[10px]"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className="bg-red-700 hover:bg-red-600 text-white font-semibold py-2 rounded-xl text-[10px] text-center"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
