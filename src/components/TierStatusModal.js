import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { forceRestock, setTier } from '../store/tierSlice';

export default function TierStatusModal({ isOpen, onClose, onOpenSoilCalc }) {
  const dispatch = useDispatch();
  const lands = useSelector(state => state.lands.items);
  const { 
    tier, 
    maxFieldBoundaries, 
    maxChatQueriesPerDay, 
    chatbotQueriesUsedToday,
    soilCalcsUsedToday,
    lastRestockDate,
    lastRestockTime
  } = useSelector(state => state.tier);

  if (!isOpen) return null;

  const fieldsCount = lands.length;
  const queriesLeft = Math.max(0, maxChatQueriesPerDay - chatbotQueriesUsedToday);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[115] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#006e2f] to-[#008e4d] p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-yellow-300 text-3xl">workspace_premium</span>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Freemium Tier Quotas & Restock</h2>
              <p className="text-xs text-green-100 font-semibold mt-0.5">
                Features restock automatically every day at midnight
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Current Tier & Restock Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                {tier === 'free' ? 'FREE' : 'PRO'}
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">
                  {tier === 'free' ? 'Freemium Tier Active' : 'Pro Subscription Active'}
                </h4>
                <p className="text-xs text-emerald-700 font-medium">
                  Last Daily Restock: {lastRestockDate} ({lastRestockTime})
                </p>
              </div>
            </div>

            <button 
              onClick={() => dispatch(forceRestock())}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">autorenew</span>
              Restock Quota Now
            </button>
          </div>

          {/* 4 Freemium Features Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Freemium Plan Included Features
            </h3>

            {/* Feature 1: Field Boundaries */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-green-700 bg-green-100 p-2 rounded-xl">map</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Field Boundaries</h4>
                  <p className="text-xs text-gray-500 font-medium">Up to 2 field boundaries allowed</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${fieldsCount >= maxFieldBoundaries ? 'text-amber-600' : 'text-green-700'}`}>
                  {fieldsCount} / {maxFieldBoundaries} Fields Used
                </span>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                  {fieldsCount >= maxFieldBoundaries ? 'Limit Reached' : 'Quota Available'}
                </p>
              </div>
            </div>

            {/* Feature 2: Standard Weather Forecasts */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2 rounded-xl">partly_cloudy_day</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Standard Weather Forecasts</h4>
                  <p className="text-xs text-gray-500 font-medium">5-day forecasts & agronomic weather metrics</p>
                </div>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                Active (Free)
              </span>
            </div>

            {/* Feature 3: Basic Soil Moisture Calculator */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-600 bg-teal-100 p-2 rounded-xl">water_drop</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Basic Soil Moisture Calculator</h4>
                  <p className="text-xs text-gray-500 font-medium">Calculates soil moisture index & irrigation needs</p>
                </div>
              </div>
              <button 
                onClick={() => { onClose(); onOpenSoilCalc(); }}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-colors"
              >
                Launch Tool
              </button>
            </div>

            {/* Feature 4: 10 AI Chatbot Queries / Day */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-purple-600 bg-purple-100 p-2 rounded-xl">smart_toy</span>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">AI Chatbot Queries</h4>
                  <p className="text-xs text-gray-500 font-medium">10 AI queries per day (Restocks daily)</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-black ${chatbotQueriesUsedToday >= maxChatQueriesPerDay ? 'text-red-600' : 'text-purple-700'}`}>
                  {queriesLeft} / {maxChatQueriesPerDay} Left Today
                </span>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5">Restocks Daily at 12 AM</p>
              </div>
            </div>

          </div>

          {/* Mode Switcher for Testing */}
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500">Plan Tester Toggle:</span>
            <button 
              onClick={() => dispatch(setTier(tier === 'free' ? 'pro' : 'free'))}
              className="text-xs font-bold text-gray-700 hover:text-green-800 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
            >
              Switch to {tier === 'free' ? 'Pro Plan (Unlimited)' : 'Free Plan'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
