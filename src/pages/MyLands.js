import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function MyLands() {
  const navigate = useNavigate();
  const lands = useSelector(state => state.lands.items);

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

  const getTagClasses = (color) => {
    switch (color) {
      case 'yellow': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'green': return 'bg-green-50 text-green-700 border-green-100';
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'red': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="h-full w-full bg-[#f3f4f6] overflow-y-auto px-4 lg:px-10 pt-6 lg:pt-10 pb-24 lg:pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0f5132]">My Lands</h1>
        <div className="flex w-full lg:w-auto items-center gap-4">
          <div className="bg-white rounded-full px-4 py-2 flex items-center shadow-sm w-full lg:w-80">
            <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
            <input type="text" placeholder="Search properties..." className="bg-transparent border-none outline-none w-full text-sm" />
          </div>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary hover:bg-surface-variant transition-colors">
             <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-700">Total Holdings</span>
          <div className="my-2">
            <span className="text-3xl font-bold text-gray-900">{totalHoldings}</span>
            <span className="text-lg font-semibold text-gray-700 ml-2">Acres</span>
          </div>
          <div className="flex items-center text-green-600 text-xs font-semibold mt-2">
            <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>
            Live DB Sync
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-700">Active Surveys</span>
          <div className="my-2">
            <span className="text-4xl font-bold text-gray-900">{activeSurveys < 10 ? `0${activeSurveys}` : activeSurveys}</span>
          </div>
          <div className="flex items-center text-blue-600 text-xs font-semibold mt-2">
            <span className="material-symbols-outlined text-[14px] mr-1">sync</span>
            All fields active
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-700">Est. Market Value</span>
          <div className="my-2">
            <span className="text-3xl font-bold text-gray-900">{marketValue}</span>
          </div>
          <div className="flex items-center text-green-600 text-xs font-semibold mt-2">
            <span className="material-symbols-outlined text-[14px] mr-1">verified</span>
            Based on ₹25L/Acre
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <span className="text-sm font-semibold text-gray-700">Yield Projection</span>
          <div className="my-2">
            <span className="text-3xl font-bold text-gray-900">{yieldProjection}</span>
          </div>
          <div className="flex items-center text-green-600 text-xs font-semibold mt-2">
            <span className="material-symbols-outlined text-[14px] mr-1">eco</span>
            Dynamic projection
          </div>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {lands.map((land) => (
          <div 
            key={land.id} 
            onClick={() => navigate(`/land/${land.id}`)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="h-48 relative">
              <img className="w-full h-full object-cover" src={land.image} alt={land.name} />
              <div className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${land.status === 'Verified' ? 'bg-green-600' : 'bg-orange-500'}`}>
                <span className="material-symbols-outlined text-[14px]">{land.status === 'Verified' ? 'verified' : 'pending_actions'}</span> {land.status}
              </div>
            </div>
            <div className="p-5 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold text-gray-900 truncate pr-2">{land.name}</h3>
                <span className="text-green-700 font-bold whitespace-nowrap">{land.area} Acres</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Survey #{land.surveyNumber}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {land.tags.map((tag, idx) => (
                  <span key={idx} className={`${getTagClasses(tag.color)} text-xs px-2 py-1 rounded border font-medium`}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Property Card */}
        <div 
          onClick={() => navigate('/explorer')}
          className="bg-transparent rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors min-h-[350px]"
        >
          <div className="w-16 h-16 bg-[#22c55e] text-white rounded-full flex items-center justify-center shadow-md mb-4">
            <span className="material-symbols-outlined text-4xl">add</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Add New Property</h3>
          <p className="text-sm text-gray-500 text-center max-w-[200px]">Draw boundary on satellite map</p>
        </div>

      </div>

      {/* Floating Chat/Help Button */}
      <button className="fixed bottom-24 lg:bottom-10 right-4 lg:right-10 w-14 h-14 bg-[#006e2f] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50">
        <span className="material-symbols-outlined text-[28px]">add_location_alt</span>
      </button>

    </div>
  );
}
