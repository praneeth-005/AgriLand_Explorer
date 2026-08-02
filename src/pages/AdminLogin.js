import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';
import { setTier } from '../store/tierSlice';
import { LOGIN_BG_IMAGE } from '../constants/utils';

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [adminEmail, setAdminEmail] = useState('admin@agriasset.com');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      // Default passcode for owner: admin123 or owner2026 or any input
      if (!adminPasscode) {
        setErrorMsg('Please enter your Admin Access Key or Passcode.');
        setLoading(false);
        return;
      }

      // Create Admin Superuser session
      const adminUser = {
        id: 'admin_owner_001',
        email: adminEmail || 'owner@agriasset.com',
        user_metadata: {
          full_name: 'Application Owner (Admin)',
          role: 'admin'
        }
      };

      // Set auth & enable unlimited Pro tier instantly
      dispatch(setAuth({ user: adminUser, session: { access_token: 'admin_token_active' } }));
      dispatch(setTier('pro'));
      
      setLoading(false);
      navigate('/explorer');
    }, 600);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-950 text-white">
      
      {/* Left Side: Admin Portal Cover */}
      <div className="hidden lg:block lg:w-5/12 relative h-screen overflow-hidden">
        <img 
          src={LOGIN_BG_IMAGE} 
          alt="Admin Portal Cover" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-emerald-950/40"></div>
        <div className="absolute bottom-16 left-16 max-w-md z-10 space-y-4">
          <div className="w-14 h-14 bg-amber-500/20 border border-amber-400/40 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="material-symbols-outlined text-amber-400 text-3xl">admin_panel_settings</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Application Owner Portal</h2>
          <p className="text-gray-400 leading-relaxed text-sm font-medium">
            Dedicated administrative portal for the system owner. Bypasses all Freemium restrictions, grants unlimited Pro tier testing, and enables system verification tools.
          </p>
        </div>
      </div>

      {/* Right Side: Admin Sign-In Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center p-8 sm:p-16 lg:p-24 relative min-h-screen">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate('/login')}
          className="lg:absolute lg:top-12 lg:left-12 flex items-center gap-2 text-gray-400 hover:text-white font-bold transition-colors mb-8 lg:mb-0"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Switch to Public User Login
        </button>

        <div className="w-full max-w-md mx-auto">
          
          <div className="flex items-center gap-2.5 mb-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">shield</span>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Owner / Superuser Only
            </span>
          </div>

          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Owner Sign-In</h1>
          <p className="text-gray-400 mb-8 text-sm font-medium">Enter your admin credentials or security passcode to gain full access.</p>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl font-bold text-sm bg-red-950/80 border border-red-500/50 text-red-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500">manage_accounts</span>
                </span>
                <input 
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all font-medium text-white placeholder-gray-600"
                  placeholder="admin@agriasset.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Admin Security Passcode / Key</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-gray-500">key</span>
                </span>
                <input 
                  type="password" 
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all font-medium text-white placeholder-gray-600"
                  placeholder="Enter passcode (e.g. admin123)"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2 font-medium">Tip: Enter any owner passcode (e.g. `admin123`) to unlock Full Owner Mode.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 py-4 rounded-xl font-black text-base transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined">verified_user</span>
              )}
              {loading ? 'Authenticating Owner...' : 'Access Admin Dashboard'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-900 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-xs text-gray-400 hover:text-white font-bold flex items-center justify-center gap-1 mx-auto"
            >
              Standard Public User Login <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
