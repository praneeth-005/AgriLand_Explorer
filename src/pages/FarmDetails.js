import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeLand } from '../store/landsSlice.js';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const FitPolygon = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [20, 20] });
    }
  }, [map, positions]);
  return null;
};

export default function FarmDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lands = useSelector(state => state.lands.items);
  const land = lands.find(l => l.id === id) || lands[0];

  const [weather, setWeather] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this farm? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await dispatch(removeLand(land.id)).unwrap();
        navigate('/lands');
      } catch (err) {
        console.error("Failed to delete farm", err);
        alert("Failed to delete farm. Please try again.");
        setIsDeleting(false);
      }
    }
  };

  useEffect(() => {
    if (land && land.polygonPoints) {
      // Get rough center for weather API
      const centerLat = land.polygonPoints[0][0];
      const centerLon = land.polygonPoints[0][1];

      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${centerLat}&longitude=${centerLon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,soil_temperature_6cm,soil_moisture_3_to_9cm`)
        .then(res => res.json())
        .then(data => setWeather(data.current))
        .catch(err => console.error("Weather fetch error", err));
    }
  }, [land]);

  if (!land) return <div className="p-10">Land not found</div>;

  // Simple weather code mapping
  const getWeatherDescription = (code) => {
    if (code === 0) return { text: "Clear Sky", icon: "sunny", color: "text-yellow-500" };
    if (code <= 3) return { text: "Partly Cloudy", icon: "partly_cloudy_day", color: "text-blue-400" };
    if (code <= 49) return { text: "Foggy", icon: "foggy", color: "text-gray-400" };
    if (code <= 69) return { text: "Rain", icon: "rainy", color: "text-blue-600" };
    if (code <= 79) return { text: "Snow", icon: "cloudy_snowing", color: "text-blue-200" };
    return { text: "Storm", icon: "thunderstorm", color: "text-purple-600" };
  };

  const weatherDetails = weather ? getWeatherDescription(weather.weather_code) : null;

  return (
    <div className="w-full h-full bg-[#f3f4f6] overflow-y-auto pb-10">
      
      {/* Header */}
      <div className="bg-white px-4 lg:px-10 py-4 lg:py-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 sticky top-0 z-40">
        <div className="flex items-center gap-4 w-full">
          <button onClick={() => navigate('/lands')} className="w-10 h-10 bg-gray-100 rounded-full flex flex-shrink-0 items-center justify-center hover:bg-gray-200 text-gray-700 transition-colors">
             <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex-grow min-w-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 truncate">{land.name}</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Survey #{land.surveyNumber}</p>
          </div>
          <div className="hidden lg:flex ml-auto gap-4">
            <button 
              onClick={() => navigate('/route', { state: { targetLandId: land.id } })}
              className="px-6 py-3 bg-[#006e2f] text-white font-bold rounded-xl shadow hover:bg-[#005321] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">navigation</span>
              Navigate
            </button>
          </div>
        </div>
        <div className="flex lg:hidden w-full">
           <button 
             onClick={() => navigate('/route', { state: { targetLandId: land.id } })}
             className="w-full py-3 bg-[#006e2f] text-white font-bold rounded-xl shadow hover:bg-[#005321] transition-colors flex items-center justify-center gap-2"
           >
             <span className="material-symbols-outlined">navigation</span>
             Navigate to Plot
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: Map & Weather */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Mini-Map */}
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 h-[400px] relative overflow-hidden">
             <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm font-bold text-gray-800">
               Boundary Map
             </div>
             <MapContainer 
               center={land.polygonPoints ? land.polygonPoints[0] : [17.3850, 78.4867]} 
               zoom={16} 
               style={{ height: '100%', width: '100%', borderRadius: '20px' }}
               zoomControl={false}
               dragging={false}
               scrollWheelZoom={false}
               doubleClickZoom={false}
             >
               <TileLayer
                 attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                 url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                 maxZoom={20}
               />
               {land.polygonPoints && (
                 <>
                   <Polygon 
                     positions={land.polygonPoints} 
                     pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.3, weight: 3 }}
                   />
                   <FitPolygon positions={land.polygonPoints} />
                 </>
               )}
             </MapContainer>
          </div>

          {/* Live Weather Widget */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-1">Live Agronomic Weather</h3>
              <p className="text-gray-900 font-medium">Exact Plot Coordinates</p>
            </div>
            
            {weather ? (
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center">
                  <span className={`material-symbols-outlined text-[48px] ${weatherDetails.color}`}>
                    {weatherDetails.icon}
                  </span>
                  <span className="text-sm font-bold text-gray-700 mt-1">{weatherDetails.text}</span>
                </div>
                
                <div className="h-12 w-px bg-gray-200"></div>
                
                <div>
                  <div className="text-4xl font-bold text-gray-900 tracking-tighter">
                    {weather.temperature_2m}°<span className="text-2xl text-gray-400">C</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-blue-400">water_drop</span>
                    {weather.relative_humidity_2m}% Humidity
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                    <span className="material-symbols-outlined text-[16px] text-gray-400">air</span>
                    {weather.wind_speed_10m} km/h Wind
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="w-24 h-16 bg-gray-200 rounded-xl"></div>
              </div>
            )}
          </div>

          {/* Live Soil Analytics Widget */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-[-1rem]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 tracking-wider uppercase mb-1">Soil Health Analytics</h3>
                <p className="text-gray-900 font-medium">Real-time Open-Meteo Data (0-9cm Depth)</p>
              </div>
              <span className="material-symbols-outlined text-amber-600 bg-amber-50 p-2 rounded-xl">grass</span>
            </div>
            
            {weather && weather.soil_temperature_6cm !== undefined ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100">
                  <div className="flex justify-between text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                    <span>Soil Temp</span>
                    <span className="material-symbols-outlined text-[16px]">thermostat</span>
                  </div>
                  <div className="text-3xl font-black text-amber-900">
                    {weather.soil_temperature_6cm}°<span className="text-xl text-amber-600/70 font-bold">C</span>
                  </div>
                  <p className="text-xs text-amber-700/80 mt-1 font-medium">Optimal for seed germination</p>
                </div>
                
                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex justify-between text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                    <span>Soil Moisture</span>
                    <span className="material-symbols-outlined text-[16px]">water_drop</span>
                  </div>
                  <div className="text-3xl font-black text-blue-900">
                    {Math.round(weather.soil_moisture_3_to_9cm * 100)}<span className="text-xl text-blue-600/70 font-bold">%</span>
                  </div>
                  <div className="w-full bg-blue-200/50 rounded-full h-1.5 mt-3">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.round(weather.soil_moisture_3_to_9cm * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-pulse grid grid-cols-2 gap-6">
                <div className="h-24 bg-amber-50 rounded-2xl"></div>
                <div className="h-24 bg-blue-50 rounded-2xl"></div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Property Overview</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Area</p>
                <p className="text-2xl font-bold text-green-700">{land.area} {land.area === '2.3' ? 'Acres' : 'Hectares'}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Verification Status</p>
                <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${land.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  <span className="material-symbols-outlined text-[16px]">{land.status === 'Verified' ? 'verified' : 'pending_actions'}</span>
                  {land.status}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Property Tags</p>
                <div className="flex flex-wrap gap-2">
                  {land.tags.map((tag, idx) => (
                    <span key={idx} className={`bg-${tag.color}-50 text-${tag.color}-700 text-sm px-3 py-1.5 rounded border border-${tag.color}-100 font-medium`}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dummy Actions */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Management Actions</h3>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/route', { state: { targetLandId: land.id } })}
                className="w-full py-4 px-4 bg-[#008e4d] hover:bg-[#00733d] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-900/20 active:scale-95"
              >
                 <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
                 Navigate to Plot (Live GPS)
              </button>
              
              <button 
                onClick={() => navigate('/explorer', { state: { editLandId: land.id } })}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-700 transition-colors flex items-center gap-3 mt-2"
              >
                 <span className="material-symbols-outlined">edit_location_alt</span>
                 Edit Boundary
              </button>
              <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-700 transition-colors flex items-center gap-3">
                 <span className="material-symbols-outlined">history</span>
                 View Yield History
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl font-semibold text-red-600 transition-colors flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
              >
                 {isDeleting ? (
                   <span className="material-symbols-outlined animate-spin">refresh</span>
                 ) : (
                   <span className="material-symbols-outlined">delete</span>
                 )}
                 {isDeleting ? 'Removing...' : 'Remove Property'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
