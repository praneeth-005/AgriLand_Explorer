import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { supabase } from '../supabaseClient.js';
import { clearAuth } from '../store/authSlice';

export default function Sidebar({ onOpenTierModal, onOpenSoilCalc }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Sign out warning:", e);
    }
    localStorage.removeItem('agri_auth_user');
    dispatch(clearAuth());
    window.location.href = '/welcome';
  };

  return (
    <>
      {/* Toast Notification Overlay */}
      <div className={`fixed top-6 lg:top-10 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-3 transition-all duration-300 ${toast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'}`}>
        <span className="material-symbols-outlined text-yellow-400 text-[20px]">construction</span>
        <span className="font-bold text-sm tracking-wide">{toast}</span>
      </div>

      {/* Mobile Navigation Bar */}
      <aside className="lg:hidden w-full h-[72px] bg-white border-t border-gray-200 flex justify-around items-center z-50 flex-shrink-0 pb-safe shadow-sm">
        <NavLink to="/lands" className={({ isActive }) => isActive ? "flex flex-col items-center p-2 text-[#006c49] font-bold" : "flex flex-col items-center p-2 text-gray-500 font-medium"}>
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>landscape</span>
          <span className="text-[10px] mt-1">Lands</span>
        </NavLink>
        <NavLink to="/explorer" className={({ isActive }) => isActive ? "flex flex-col items-center p-2 text-[#006c49] font-bold" : "flex flex-col items-center p-2 text-gray-500 font-medium"}>
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>explore</span>
          <span className="text-[10px] mt-1">Explore</span>
        </NavLink>
        <div onClick={onOpenSoilCalc} className="flex flex-col items-center p-2 text-gray-500 font-medium cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>water_drop</span>
          <span className="text-[10px] mt-1">Moisture</span>
        </div>
        <div onClick={handleLogout} className="flex flex-col items-center p-2 text-red-600 font-medium cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>logout</span>
          <span className="text-[10px] mt-1">Logout</span>
        </div>
      </aside>

      {/* Desktop Side Navigation Bar (Matching Stitch Screen 861e6d8a442745978d61291aeb220071) */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white z-40 shadow-sm">
        <div className="flex flex-col h-full py-6">
          
          {/* Logo Header */}
          <div className="px-6 mb-10">
            <h1 className="text-2xl font-bold text-[#006c49] tracking-tight">AgriAsset</h1>
            <p className="text-xs text-gray-500 font-medium opacity-70 mt-0.5">Precision Management</p>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 space-y-1">
            <NavLink 
              to="/lands" 
              className={({ isActive }) => 
                isActive 
                  ? "flex items-center gap-3 px-4 py-3 bg-[#adedd3]/50 text-[#00422b] border-l-4 border-[#006c49] font-semibold transition-all duration-200" 
                  : "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              }
            >
              <span className="material-symbols-outlined">landscape</span>
              <span className="text-sm">My Lands</span>
            </NavLink>

            <NavLink 
              to="/explorer" 
              className={({ isActive }) => 
                isActive 
                  ? "flex items-center gap-3 px-4 py-3 bg-[#adedd3]/50 text-[#00422b] border-l-4 border-[#006c49] font-semibold transition-all duration-200" 
                  : "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              }
            >
              <span className="material-symbols-outlined">explore</span>
              <span className="text-sm">Explorer</span>
            </NavLink>

            <div onClick={() => showToast('Analytics active')} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium cursor-pointer">
              <span className="material-symbols-outlined">monitoring</span>
              <span className="text-sm">Analytics</span>
            </div>

            <div onClick={() => showToast('Saved plots active')} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium cursor-pointer">
              <span className="material-symbols-outlined">bookmark</span>
              <span className="text-sm">Saved Plots</span>
            </div>

            <div onClick={onOpenTierModal} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors font-medium cursor-pointer">
              <span className="material-symbols-outlined">person</span>
              <span className="text-sm">Profile</span>
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="px-4 mt-auto space-y-2">
            <NavLink 
              to="/explorer" 
              className="w-full py-3 bg-[#006c49] hover:bg-[#005236] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Add New Plot
            </NavLink>

            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors font-bold text-sm"
            >
              <span className="material-symbols-outlined">logout</span>
              Log Out
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
