import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';
import { setTier } from '../store/tierSlice';
import { FARM_LAND_BG_IMAGE } from '../constants/utils';

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [adminEmail, setAdminEmail] = useState('admin@agriland.explorer');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      if (!adminPasscode) {
        setErrorMsg('Please enter your Security Key or Admin Passcode.');
        setLoading(false);
        return;
      }

      // Authenticate Admin user
      const adminUser = {
        id: 'admin_owner_001',
        email: adminEmail || 'admin@agriland.explorer',
        user_metadata: {
          full_name: 'System Administrator (Owner)',
          role: 'admin'
        }
      };

      dispatch(setAuth({ user: adminUser, session: { access_token: 'admin_token_active' } }));
      dispatch(setTier('pro'));
      
      setLoading(false);
      navigate('/explorer');
    }, 600);
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] font-sans min-h-screen relative overflow-hidden flex flex-col items-center justify-center selection:bg-[#22c55e] selection:text-[#004b1e]">
      
      {/* Background Layer with Dark Overlay & High-Resolution Farmland Image */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1326]/85 via-[#0b1326]/75 to-[#0b1326]/95 z-10"></div>
        <img 
          alt="Agricultural landscape with center pivot irrigation" 
          className="w-full h-full object-cover grayscale-[20%] brightness-75 scale-105" 
          src={FARM_LAND_BG_IMAGE} 
          loading="eager"
        />
      </div>

      {/* Top Header Bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 lg:px-12 py-4 backdrop-blur-md bg-[#0b1326]/30 border-b border-white/10">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/welcome')}>
          <span className="material-symbols-outlined text-[#4be277] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            eco
          </span>
          <span className="text-xl font-bold text-[#4be277] tracking-tight">AgriLand Explorer</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/welcome')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#bccbb9] hover:text-[#4be277] transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Home
          </button>
          <button className="material-symbols-outlined text-[#bccbb9] hover:text-[#4be277] transition-colors text-xl">
            help_outline
          </button>
        </div>
      </header>

      {/* Main Glass Card Login Container */}
      <main className="relative z-20 w-full max-w-[480px] px-6 my-20">
        <div className="bg-[#0b1326]/70 backdrop-blur-2xl border border-white/10 p-8 lg:p-10 rounded-2xl shadow-2xl space-y-8 animate-fadeIn">
          
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4be277]/10 border border-[#4be277]/20 text-[#4be277] text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm">shield</span>
              Admin Superuser Access
            </div>
            <h1 className="text-3xl font-extrabold text-[#dae2fd] tracking-tight">Admin Portal</h1>
            <p className="text-sm text-[#bccbb9] max-w-[320px] mx-auto leading-relaxed">
              Secure access for system administrators and land managers.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl font-bold text-xs bg-red-950/80 border border-red-500/50 text-red-300 text-center">
              {errorMsg}
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleAdminAuth} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4be277] uppercase tracking-widest ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#bccbb9] text-xl pointer-events-none">
                  mail
                </span>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@agriland.explorer"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-[#060e20]/60 border border-white/10 rounded-xl text-[#dae2fd] placeholder:text-[#bccbb9]/40 focus:outline-none focus:border-[#4be277] focus:ring-1 focus:ring-[#4be277]/50 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4be277] uppercase tracking-widest ml-1" htmlFor="password">
                Security Key
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#bccbb9] text-xl pointer-events-none">
                  lock
                </span>
                <input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-[#060e20]/60 border border-white/10 rounded-xl text-[#dae2fd] placeholder:text-[#bccbb9]/40 focus:outline-none focus:border-[#4be277] focus:ring-1 focus:ring-[#4be277]/50 transition-all font-medium text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bccbb9] hover:text-[#4be277] transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-[#bccbb9]/60 ml-1 font-medium">Enter your admin passcode (e.g. `admin123`) to log in.</p>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs font-medium text-[#bccbb9]">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#22c55e] cursor-pointer"
                />
                <span className="group-hover:text-[#dae2fd] transition-colors">Remember this device</span>
              </label>
              <button 
                type="button"
                onClick={() => alert("Admin Reset: Please enter any passcode like `admin123` to log in.")}
                className="text-[#4be277] hover:underline transition-all font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* CTA Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#4be277] text-[#004b1e] font-bold text-base py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">refresh</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>

          </form>

          {/* System Status Divider */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-[11px] font-bold tracking-widest text-[#bccbb9]/50 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4be277] animate-pulse"></span>
              SYSTEM STATUS: OPTIMAL
            </span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full z-50 flex flex-col items-center gap-1.5 px-6 py-4 backdrop-blur-md bg-[#0b1326]/40 border-t border-white/5 text-xs text-[#bccbb9]">
        <p className="flex items-center gap-1.5 text-red-400 font-semibold opacity-90">
          <span className="material-symbols-outlined text-sm">gpp_maybe</span>
          Authorized Access Only. All activities are monitored.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-[11px] opacity-70">
          <span>© 2024 AgriLand Explorer. Secure Admin Console.</span>
          <div className="flex gap-3">
            <a className="hover:text-[#4be277] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#4be277] transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-[#4be277] transition-colors" href="#">Security Whitepaper</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
