import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function MyLands({ onOpenLimitModal, onOpenTierModal, onOpenSoilCalc }) {
  const navigate = useNavigate();
  const lands = useSelector(state => state.lands.items);
  const { tier, maxFieldBoundaries, maxChatQueriesPerDay, chatbotQueriesUsedToday } = useSelector(state => state.tier);

  const queriesLeft = Math.max(0, maxChatQueriesPerDay - chatbotQueriesUsedToday);

  // Dynamic calculations based on DB data
  const totalHoldings = lands.reduce((acc, land) => acc + (parseFloat(land.area) || 0), 0).toFixed(2);
  const activeSurveys = lands.length;
  
  // Estimate market value at ₹25 Lakhs per Acre
  const marketValueRs = totalHoldings * 2500000;
  const formatMoney = (val) => {
    if (val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };
  const marketValue = formatMoney(marketValueRs);

  // Yield projection logic based on total area
  const yieldProjection = totalHoldings > 10 ? 'High' : (totalHoldings > 3 ? 'Optimal' : 'Moderate');

  const handleAddNewProperty = () => {
    if (tier === 'free' && lands.length >= maxFieldBoundaries) {
      if (onOpenLimitModal) onOpenLimitModal();
    } else {
      navigate('/explorer');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9ff] text-[#0b1c30] pl-0 lg:pl-64 pt-0 lg:pt-16 pb-16">
      
      {/* Top Header Navigation Bar matching Stitch Screen 861e6d8a442745978d61291aeb220071 */}
      <header className="hidden lg:flex fixed top-0 right-0 left-64 h-16 px-10 items-center justify-between z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-xs">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-1.5 w-96">
          <span className="material-symbols-outlined text-gray-500 mr-2 text-[20px]">search</span>
          <input 
            className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full placeholder:text-gray-400 font-normal" 
            placeholder="Search your lands, plots, or surveys..." 
            type="text"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-[#006c49]/30 bg-[#006c49] text-white font-bold flex items-center justify-center text-sm shadow-xs">
            S
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 lg:px-10 pt-6 lg:pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0b1c30] tracking-tight">My Lands</h2>
            <p className="text-gray-500 text-sm font-medium mt-1">Manage and monitor your agricultural assets in real-time.</p>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
              <span className="material-symbols-outlined text-[18px]">sort</span>
              Sort
            </button>
          </div>
        </div>

        {/* Freemium Banner matching Stitch Screen 861e6d8a442745978d61291aeb220071 */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-[#adedd3]/30 to-[#10b981]/20 border border-[#006c49]/20 relative overflow-hidden shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            
            <div className="flex items-start gap-4">
              <div className="bg-[#10b981] p-3 rounded-xl text-white shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#006c49] leading-tight mb-1">Freemium Tier Active</h3>
                <p className="text-gray-600 text-xs font-semibold">Upgrade for unlimited boundaries and advanced AI insights.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <span>Field Boundaries</span>
                  <span className="text-gray-900">{lands.length}/2</span>
                </div>
                <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006c49] rounded-full" style={{ width: `${(lands.length / 2) * 100}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <span>Weather Forecast</span>
                  <span className="text-[#006c49] font-extrabold">ACTIVE</span>
                </div>
                <div className="h-1.5 w-32 bg-[#006c49]/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006c49] w-full rounded-full"></div>
                </div>
              </div>

              <div onClick={onOpenSoilCalc} className="space-y-1 cursor-pointer hover:opacity-80">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <span>Soil Moisture</span>
                  <span className="text-[#006c49] font-extrabold">ACTIVE</span>
                </div>
                <div className="h-1.5 w-32 bg-[#006c49]/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006c49] w-full rounded-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <span>AI Chatbot</span>
                  <span className="text-gray-900">{queriesLeft}/10</span>
                </div>
                <div className="h-1.5 w-32 bg-[#006c49]/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006c49] w-full rounded-full"></div>
                </div>
              </div>
            </div>

            <button 
              onClick={onOpenTierModal}
              className="px-6 py-2.5 bg-[#006c49] hover:bg-[#005236] text-white font-bold text-sm rounded-xl shadow-md transition-all whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>

          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[180px]">eco</span>
          </div>
        </div>

        {/* Metrics Bento Grid (4 Stat Cards matching Stitch Screen 861e6d8a442745978d61291aeb220071) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="bg-[#eff4ff] p-3 rounded-full text-[#006c49]">
              <span className="material-symbols-outlined">map</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Holdings</p>
              <h4 className="text-2xl font-bold text-[#0b1c30]">{totalHoldings} Acres</h4>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="bg-[#eff4ff] p-3 rounded-full text-[#2b6954]">
              <span className="material-symbols-outlined">assignment_turned_in</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Surveys</p>
              <h4 className="text-2xl font-bold text-[#0b1c30]">{activeSurveys < 10 ? `0${activeSurveys}` : activeSurveys}</h4>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="bg-[#eff4ff] p-3 rounded-full text-[#006c49]">
              <span className="material-symbols-outlined">currency_rupee</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Est. Market Value</p>
              <h4 className="text-2xl font-bold text-[#0b1c30]">{marketValue}</h4>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center gap-4">
            <div className="bg-[#eff4ff] p-3 rounded-full text-amber-600">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Yield Projection</p>
              <div className="flex items-center gap-2">
                <h4 className="text-2xl font-bold text-[#0b1c30]">{yieldProjection}</h4>
                <span className="material-symbols-outlined text-gray-400 text-sm">info</span>
              </div>
            </div>
          </div>

        </div>

        {/* Property Cards & Insights Grid matching Stitch Screen 861e6d8a442745978d61291aeb220071 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Praneeth's Farm */}
          {lands.length > 0 ? (
            lands.map((land) => (
              <div 
                key={land.id}
                onClick={() => navigate(`/land/${land.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col cursor-pointer hover:shadow-md transition-all"
              >
                <div className="h-52 relative">
                  <img className="w-full h-full object-cover" src={land.image} alt={land.name} />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-[#adedd3] text-[#00422b] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      Newly Added
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      Awaiting Analysis
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-xs transition-colors">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="text-xl font-bold text-[#0b1c30] truncate">{land.name}</h3>
                      <span className="text-[#006c49] font-bold text-sm whitespace-nowrap">{land.area} ACRES</span>
                    </div>

                    <div className="flex items-center text-gray-500 text-xs font-medium mb-4">
                      <span className="material-symbols-outlined text-[16px] mr-1 text-gray-400">location_on</span>
                      Rangareddy, Telangana
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">SURVEY ID</span>
                        <span className="font-bold text-gray-800">#{land.surveyNumber || 'AS-88219'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block uppercase">LAST SURVEY</span>
                        <span className="font-bold text-gray-800">Oct 12, 2023</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex -space-x-1">
                      <span className="w-6 h-6 rounded-full bg-[#006c49] text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">AI</span>
                      <span className="w-6 h-6 rounded-full bg-[#2b6954] text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white">SH</span>
                      <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 font-bold text-[10px] flex items-center justify-center ring-2 ring-white">+2</span>
                    </div>
                    <span className="text-[#006c49] font-bold text-sm flex items-center gap-1 hover:underline">
                      View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : null}

          {/* Card 2: Add New Property Dashed Card */}
          <div 
            onClick={handleAddNewProperty}
            className="bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[360px] p-8 text-center"
          >
            <div className="w-14 h-14 bg-[#eff4ff] text-[#006c49] rounded-full flex items-center justify-center shadow-xs mb-4">
              <span className="material-symbols-outlined text-3xl">
                {tier === 'free' && lands.length >= maxFieldBoundaries ? 'lock' : 'add'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#0b1c30] mb-2">
              {tier === 'free' && lands.length >= maxFieldBoundaries ? 'Boundary Limit (2/2)' : 'Add New Property'}
            </h3>
            <p className="text-xs text-gray-500 font-medium max-w-[200px] mb-6">
              {tier === 'free' && lands.length >= maxFieldBoundaries 
                ? 'Freemium tier limit of 2 field boundaries reached.' 
                : 'Map your land boundaries and start analyzing your soil health.'}
            </p>
            <button className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-full shadow-xs transition-colors">
              Click to browse
            </button>
          </div>

          {/* Card 3: Insight of the Day Card */}
          <div className="bg-[#eff4ff] rounded-2xl p-6 border border-gray-200/60 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#adedd3] text-[#00422b] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-xl">lightbulb</span>
              </div>
              <h3 className="text-xl font-bold text-[#0b1c30] mb-3">Insight of the Day</h3>
              <p className="text-xs text-gray-600 font-medium leading-relaxed mb-6">
                Based on local satellite data, the soil moisture in your Rangareddy plot is currently at 65%. Ideal for sowing legumes in the coming 72 hours.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">RECOMMENDED ACTION</span>
                <span className="text-sm font-bold text-[#0b1c30]">Schedule Soil Survey</span>
              </div>
              <span className="material-symbols-outlined text-[#006c49] text-xl">calendar_today</span>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
