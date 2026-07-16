import React from 'react';
import { NavLink } from 'react-router-dom';
// Force cache reload
import { useSelector, useDispatch } from 'react-redux';
import { supabase } from '../supabaseClient.js';
import { clearAuth } from '../store/authSlice';

export default function Sidebar() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
      dispatch(clearAuth());
    }
  };

  const getNavClass = (isActive) => {
    return isActive
      ? "flex items-center gap-4 px-6 py-4 mx-4 bg-[#e0e7ff] text-[#1e1b4b] font-bold rounded-xl"
      : "flex items-center gap-4 px-6 py-4 mx-4 text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary transition-colors rounded-xl font-medium cursor-pointer";
  };

  const getMobileNavClass = (isActive) => {
    return isActive
      ? "flex flex-col items-center justify-center p-2 text-[#008e4d] font-bold"
      : "flex flex-col items-center justify-center p-2 text-gray-400 hover:text-gray-600 font-medium cursor-pointer transition-colors";
  };

  const username = user?.email ? user.email.split('@')[0] : 'User';
  const displayUsername = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <>
      {/* Mobile Bottom Navigation (Hidden on lg+ screens) */}
      <aside className="lg:hidden w-full h-[72px] bg-white border-t border-gray-200 flex justify-around items-center z-50 flex-shrink-0 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <NavLink to="/lands" className={({ isActive }) => getMobileNavClass(isActive)}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>grid_view</span>
          <span className="text-[10px] mt-1">Lands</span>
        </NavLink>
        <NavLink to="/explorer" className={({ isActive }) => getMobileNavClass(isActive)}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>map</span>
          <span className="text-[10px] mt-1">Explore</span>
        </NavLink>
        <NavLink to="/route" className={({ isActive }) => getMobileNavClass(isActive)}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>navigation</span>
          <span className="text-[10px] mt-1">Routes</span>
        </NavLink>
        <div onClick={handleLogout} className={getMobileNavClass(false)}>
          <span className="material-symbols-outlined text-red-500" style={{ fontSize: '28px' }}>logout</span>
          <span className="text-[10px] mt-1 text-red-500">Exit</span>
        </div>
      </aside>

      {/* Desktop Sidebar (Hidden on mobile screens) */}
      <aside className="hidden lg:flex w-[280px] h-screen bg-[#f8fafc] border-r border-outline-variant/30 flex-col justify-between flex-shrink-0 z-50">
        
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo */}
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-[#006e2f] tracking-tight">AgriLand</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2 mt-4">
            <div onClick={() => alert('Profile settings coming soon!')} className={getNavClass(false)}>
              <span className="material-symbols-outlined">person</span>
              <span className="text-lg">Profile</span>
            </div>
            
            <NavLink to="/lands" className={({ isActive }) => getNavClass(isActive)}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
              <span className="text-lg">My Lands</span>
            </NavLink>

            <div onClick={() => alert('Saved Plots coming soon! Use My Lands to view properties.')} className={getNavClass(false)}>
              <span className="material-symbols-outlined">bookmark</span>
              <span className="text-lg">Saved Plots</span>
            </div>

            <NavLink to="/explorer" className={({ isActive }) => getNavClass(isActive)}>
              <span className="material-symbols-outlined">map</span>
              <span className="text-lg">Explorer</span>
            </NavLink>

            <NavLink to="/route" className={({ isActive }) => getNavClass(isActive)}>
              <span className="material-symbols-outlined">navigation</span>
              <span className="text-lg">Routes</span>
            </NavLink>

            <div onClick={() => alert('Analytics dashboard coming soon!')} className={getNavClass(false)}>
              <span className="material-symbols-outlined">insert_chart</span>
              <span className="text-lg">Analytics</span>
            </div>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-8 pb-8 px-8">
          <div className="flex items-center gap-4 text-gray-500 hover:text-gray-900 cursor-pointer transition-colors">
            <span className="material-symbols-outlined">help</span>
            <span className="text-lg font-medium">Help</span>
          </div>

          <div className="h-[1px] w-full bg-gray-200"></div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#006e2f] flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-sm">
                {displayUsername.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-base truncate max-w-[120px]">{displayUsername}</span>
                <span className="text-xs text-gray-500 font-medium">Free Account</span>
              </div>
            </div>
            <button onClick={handleLogout} title="Log Out" className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>

          <div className="text-center text-xs text-gray-400 mt-2">
            v2.4.0
          </div>
        </div>
        
      </aside>
    </>
  );
}
