import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { trackSoilCalcUse } from '../store/tierSlice';

export default function SoilMoistureCalculator({ isOpen, onClose, initialTemp = 28 }) {
  const dispatch = useDispatch();
  const { tier, lastRestockTime } = useSelector(state => state.tier);

  const [soilType, setSoilType] = useState('Loam');
  const [cropType, setCropType] = useState('Wheat');
  const [temp, setTemp] = useState(initialTemp);
  const [rainfall, setRainfall] = useState(0);
  const [daysSinceIrrigation, setDaysSinceIrrigation] = useState(3);
  const [calculated, setCalculated] = useState(null);

  if (!isOpen) return null;

  const soilRetention = {
    'Clay': 0.85,
    'Loam': 0.72,
    'Alluvial': 0.65,
    'Silt': 0.58,
    'Sandy': 0.38
  };

  const cropDemand = {
    'Paddy (Rice)': 1.45,
    'Sugarcane': 1.30,
    'Wheat': 1.00,
    'Cotton': 0.95,
    'Maize': 0.88,
    'Vegetables': 1.15,
    'Pulses': 0.70
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    dispatch(trackSoilCalcUse());

    const baseRetention = soilRetention[soilType] || 0.65;
    const cropCoeff = cropDemand[cropType] || 1.0;
    
    // Evapotranspiration estimation (mm/day)
    const et0 = (temp * 0.15) + 1.2;
    const cropET = et0 * cropCoeff;

    // Water loss calculation
    const totalWaterLoss = cropET * daysSinceIrrigation;
    const waterGain = parseFloat(rainfall) * 0.8;

    // Net Moisture Level
    let moisturePercentage = Math.round((baseRetention * 100) - (totalWaterLoss * 2.8) + (waterGain * 1.5));
    moisturePercentage = Math.max(12, Math.min(98, moisturePercentage));

    let status = 'Optimal';
    let statusColor = 'text-green-700 bg-green-100 border-green-200';
    let advice = 'Soil moisture level is optimal. No immediate irrigation required for your crop.';
    let recVolume = '0 Liters / Acre';

    if (moisturePercentage < 45) {
      status = 'Severe Deficit';
      statusColor = 'text-red-700 bg-red-100 border-red-200';
      advice = `Critical water stress detected for ${cropType} in ${soilType} soil. Irrigate promptly to avoid yield loss.`;
      recVolume = `${Math.round((50 - moisturePercentage) * 600)} Liters / Acre (~15-20 mm)`;
    } else if (moisturePercentage < 62) {
      status = 'Moderate Deficit';
      statusColor = 'text-amber-700 bg-amber-100 border-amber-200';
      advice = `Moisture levels dropping. Schedule irrigation within the next 24-48 hours.`;
      recVolume = `${Math.round((65 - moisturePercentage) * 450)} Liters / Acre (~10-12 mm)`;
    } else if (moisturePercentage > 85) {
      status = 'High Saturation';
      statusColor = 'text-blue-700 bg-blue-100 border-blue-200';
      advice = 'Soil is near saturation. Ensure proper field drainage to prevent root hypoxia.';
      recVolume = '0 Liters / Acre (Drain Excess Water)';
    }

    setCalculated({
      moisturePercentage,
      status,
      statusColor,
      advice,
      recVolume,
      etRate: cropET.toFixed(1)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-emerald-700 p-6 text-white relative flex-shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-yellow-300 text-3xl">water_drop</span>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Basic Soil Moisture Calculator</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-white/20 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Freemium Tier Feature
                </span>
                <span className="text-xs text-blue-100 font-medium">
                  🔄 Restocked Daily ({lastRestockTime})
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-blue-100 mt-2">
            Calculate root-zone soil moisture percentage, crop evapotranspiration loss, and precise irrigation volume.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Soil Texture Type
              </label>
              <select 
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="Loam font-bold">Loam (Medium Retention)</option>
                <option value="Clay">Clay (High Water Retention)</option>
                <option value="Alluvial">Alluvial (Balanced Fertility)</option>
                <option value="Silt">Silt (Fine Particles)</option>
                <option value="Sandy">Sandy (Fast Drainage)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Crop Type
              </label>
              <select 
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="Wheat">Wheat</option>
                <option value="Paddy (Rice)">Paddy (Rice - High Water)</option>
                <option value="Cotton">Cotton</option>
                <option value="Maize">Maize / Corn</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Pulses">Pulses / Legumes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Ambient Air Temp (°C): <span className="text-teal-700 font-bold">{temp}°C</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="48" 
                value={temp} 
                onChange={(e) => setTemp(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                <span>10°C (Cool)</span>
                <span>30°C (Warm)</span>
                <span>48°C (Extreme)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Days Since Last Irrigation / Rain
              </label>
              <input 
                type="number" 
                min="0" 
                max="21" 
                value={daysSinceIrrigation} 
                onChange={(e) => setDaysSinceIrrigation(Number(e.target.value))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Recent Rainfall in last 48h (mm): <span className="text-teal-700 font-bold">{rainfall} mm</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="60" 
                value={rainfall} 
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2 text-lg transition-all active:scale-[0.99]"
              >
                <span className="material-symbols-outlined">calculate</span>
                Calculate Soil Moisture & Water Requirement
              </button>
            </div>
          </form>

          {/* Results Display */}
          {calculated && (
            <div className="bg-teal-50/50 border border-teal-100 rounded-3xl p-6 mt-4 space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calculated Moisture Index</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-gray-900">{calculated.moisturePercentage}%</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${calculated.statusColor}`}>
                      {calculated.status}
                    </span>
                  </div>
                </div>

                <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Daily ET Loss</span>
                  <p className="text-lg font-bold text-teal-800">{calculated.etRate} mm/day</p>
                </div>
              </div>

              {/* Moisture Progress Gauge */}
              <div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner flex">
                  <div 
                    className={`h-full transition-all duration-700 ${calculated.moisturePercentage < 45 ? 'bg-red-500' : calculated.moisturePercentage < 62 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${calculated.moisturePercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
                  <span>Dry (0%)</span>
                  <span>Optimal Target (60-75%)</span>
                  <span>Saturated (100%)</span>
                </div>
              </div>

              {/* Actionable Advice */}
              <div className="bg-white rounded-2xl p-4 border border-teal-100/80 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <span className="material-symbols-outlined text-teal-600">nature_people</span>
                  Agronomic Recommendation
                </div>
                <p className="text-sm text-gray-600 font-medium">{calculated.advice}</p>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Recommended Irrigation Volume:</span>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                    {calculated.recVolume}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
