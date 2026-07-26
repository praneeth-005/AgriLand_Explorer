import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTier } from '../store/tierSlice';

export default function FieldLimitModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[130] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform animate-fadeIn">
        
        {/* Header Warning */}
        <div className="bg-amber-500 p-6 text-white text-center relative">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-4xl text-white">lock</span>
          </div>
          <h2 className="text-2xl font-black">2 Field Boundaries Limit Reached</h2>
          <p className="text-xs text-amber-100 font-medium mt-1">
            Freemium Tier includes up to 2 field boundaries per account.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          <p className="text-sm text-gray-600 font-medium">
            You currently have <span className="font-bold text-gray-900">2 registered fields</span>. To add a 3rd field boundary, please manage your existing fields or switch plan modes.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2 text-xs text-amber-900 font-medium">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <span className="material-symbols-outlined text-sm">workspace_premium</span>
              Freemium Features Notice:
            </div>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              <li>Up to 2 Field Boundaries</li>
              <li>Standard Weather Forecasts</li>
              <li>Basic Soil Moisture Calculator</li>
              <li>10 AI Chatbot Queries/Day (Restocked Daily)</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <button 
              onClick={() => {
                onClose();
                navigate('/lands');
              }}
              className="w-full py-3.5 bg-[#006e2f] hover:bg-[#005321] text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              Manage Existing Fields in My Lands
            </button>

            <button 
              onClick={() => {
                dispatch(setTier('pro'));
                onClose();
              }}
              className="w-full py-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              Test Pro Mode (Unlimited Fields)
            </button>

            <button 
              onClick={onClose}
              className="w-full py-2.5 text-gray-500 hover:text-gray-800 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
