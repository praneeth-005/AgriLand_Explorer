import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addLand, updateLand } from '../store/landsSlice';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap, ZoomControl, Popup, Tooltip } from 'react-leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Custom Component to handle map clicks for drawing
function MapDrawHandler({ mode, setPolygonPoints }) {
  useMapEvents({
    click(e) {
      if (mode === 'DRAWING') {
        setPolygonPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    }
  });
  return null;
}

const FitPolygon = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [50, 50] });
    }
  }, [map, positions]);
  return null;
};
const pulseIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_0_4px_rgba(59,130,246,0.5)]"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const SearchFlyTo = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo(location, 16, { duration: 0.5 });
    }
  }, [map, location]);
  return null;
};

export default function MapExplorer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLocation, setSearchLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(!location.state?.editLandId);
  const [selectedLandId, setSelectedLandId] = useState(null);
  
  // Check if we are in Edit Mode
  const editLandId = location.state?.editLandId;
  const lands = useSelector(state => state.lands.items);
  const editingLand = useMemo(() => lands.find(l => l.id === editLandId), [lands, editLandId]);
  
  // Auto-select first land in view mode
  useEffect(() => {
    if (!editLandId && !selectedLandId && lands.length > 0) {
      setSelectedLandId(lands[0].id);
    }
  }, [lands, editLandId, selectedLandId]);

  const selectedLand = lands.find(l => l.id === selectedLandId);

  // Workflow States
  const [mode, setMode] = useState(editLandId ? 'DRAWING' : 'VIEW'); // VIEW | DRAWING | FORM_ENTRY
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState(editingLand?.polygonPoints || []);
  
  // Form State
  const [formData, setFormData] = useState({
    ownerName: editingLand?.name?.replace("'s Farm", "") || '',
    surveyNumber: editingLand?.surveyNumber || '',
    unknownSurvey: editingLand?.surveyNumber?.startsWith("TEMP-") || false,
    area: editingLand?.area || '',
    contactNumber: '' // Mock
  });

  // Calculate Exact Area using Turf.js
  useEffect(() => {
    if (polygonPoints.length > 2) {
      try {
        // Turf requires GeoJSON format: [longitude, latitude], and the first and last point must be identical
        const turfCoords = polygonPoints.map(p => [p[1], p[0]]);
        turfCoords.push(turfCoords[0]); // Close the polygon
        
        const polygon = turf.polygon([turfCoords]);
        const areaSqMeters = turf.area(polygon);
        const areaAcres = (areaSqMeters * 0.000247105).toFixed(2); // Convert to Acres
        
        setFormData(prev => ({ ...prev, area: areaAcres }));
      } catch(e) {
        console.error("Turf area calculation error:", e);
      }
    } else {
      setFormData(prev => ({ ...prev, area: '' }));
      setFormData(prev => ({ ...prev, area: '' }));
    }
  }, [polygonPoints]);

  // Initial Auto-Locate
  useEffect(() => {
    if (!editLandId && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setSearchLocation(loc);
          setUserLocation(loc);
          setIsLocating(false);
        },
        (err) => {
          console.warn("Initial auto-locate failed:", err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
      );
    }
  }, [editLandId]);

  // Live Search Autocomplete Debounce
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data || []);
          setIsSearching(false);
        })
        .catch(err => {
          console.error("Search error:", err);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleStartDrawing = () => {
    setMode('DRAWING');
    setPolygonPoints([]);
  };

  const handleFinishDrawing = () => {
    if (polygonPoints.length < 3) {
      alert("Please click at least 3 points on the map to form a valid boundary.");
      return;
    }
    setMode('FORM_ENTRY');
  };

  const handleDragEnd = (index, e) => {
    const latLng = e.target.getLatLng();
    setPolygonPoints(prev => {
      const newPoints = [...prev];
      newPoints[index] = [latLng.lat, latLng.lng];
      return newPoints;
    });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    
    if (editLandId) {
       dispatch(updateLand({
          id: editLandId,
          ...formData,
          polygonPoints
       }));
       navigate(`/land/${editLandId}`);
    } else {
       dispatch(addLand({
         ...formData,
         polygonPoints
       }));
       navigate('/lands');
    }
  };

  // Pre-existing hardcoded polygon for the view state demo
  const demoPolygon = [
    [29.7023, 76.9845],
    [29.7029, 76.9850],
    [29.7025, 76.9860],
    [29.7018, 76.9855]
  ];

  if (isLocating) {
    return (
      <div className="w-full h-screen bg-[#e0e3e5] flex flex-col items-center justify-center">
        <div className="relative flex justify-center items-center w-24 h-24 mb-6">
           <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-75"></div>
           <div className="relative z-10 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
             <span className="material-symbols-outlined text-green-600 text-3xl animate-pulse">satellite_alt</span>
           </div>
        </div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Acquiring GPS Signal</h2>
        <p className="text-gray-500 font-medium mt-2 animate-pulse">Locking onto your physical location...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#e0e3e5] overflow-hidden">
      
      {/* --- LEAFLET MAP --- */}
      <div className={`absolute inset-0 z-0 ${mode === 'DRAWING' ? 'cursor-crosshair' : ''}`}>
        <MapContainer 
          center={editingLand?.polygonPoints ? editingLand.polygonPoints[0] : (userLocation || [20.5937, 78.9629])} 
          zoom={16} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          {/* Esri World Imagery (High-Res Satellite) */}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution="&copy; Google Maps"
            maxZoom={20}
          />
          
          <MapDrawHandler mode={mode} setPolygonPoints={setPolygonPoints} />
          {editingLand && <FitPolygon positions={editingLand.polygonPoints} />}
          <SearchFlyTo location={searchLocation} />
          
          {userLocation && (
            <Marker position={userLocation} icon={pulseIcon}>
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                You are here
              </Tooltip>
            </Marker>
          )}
          
          {/* Render the user's actively drawn polygon */}
          {polygonPoints.length > 0 && (
            <Polygon 
              positions={polygonPoints} 
              pathOptions={{ color: '#6bff8f', fillColor: '#22c55e', fillOpacity: 0.4, weight: 4 }} 
            />
          )}

          {/* Render markers for corners while drawing. Now DRAGGABLE! */}
          {mode === 'DRAWING' && polygonPoints.map((point, idx) => (
            <Marker 
              key={idx} 
              position={point} 
              icon={customIcon} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => handleDragEnd(idx, e)
              }}
            />
          ))}

          {/* Render ALL user lands when in View Mode */}
          {mode === 'VIEW' && lands.map(land => (
            <Polygon 
              key={land.id}
              positions={land.polygonPoints} 
              pathOptions={{ 
                color: selectedLandId === land.id ? '#16a34a' : '#6b7280', 
                fillColor: selectedLandId === land.id ? '#22c55e' : '#9ca3af', 
                fillOpacity: selectedLandId === land.id ? 0.6 : 0.4, 
                weight: selectedLandId === land.id ? 4 : 2 
              }} 
              eventHandlers={{
                click: () => {
                  setSelectedLandId(land.id);
                  // Don't auto open on mobile, require clicking the 'View Plot Details' button
                }
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* --- UI OVERLAYS --- */}

      {/* Floating Search Bar */}
      <div className="absolute top-4 lg:top-10 left-1/2 -translate-x-1/2 w-[90%] lg:w-full max-w-2xl z-40">
        <div className="relative">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchResults.length > 0) {
                setSearchLocation([parseFloat(searchResults[0].lat), parseFloat(searchResults[0].lon)]);
                setSearchResults([]);
              }
            }}
            className={`bg-white shadow-lg rounded-full flex items-center px-6 h-14 w-full transition-all duration-300 ${isFocused ? 'ring-4 ring-green-500/30' : ''}`}
          >
            <span className="material-symbols-outlined text-gray-500 mr-3">search</span>
            <input 
              className="bg-transparent border-none outline-none focus:ring-0 w-full text-base text-gray-900 placeholder:text-gray-500" 
              placeholder="Search village name or coordinates..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
            {isSearching && <span className="material-symbols-outlined text-gray-400 animate-spin">refresh</span>}
          </form>

          {/* Autocomplete Dropdown */}
          {isFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 z-50 max-h-[60vh] overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchLocation([parseFloat(result.lat), parseFloat(result.lon)]);
                    setSearchQuery(result.display_name.split(',')[0]); 
                    setSearchResults([]);
                  }}
                  className="w-full text-left px-6 py-4 hover:bg-green-50 border-b border-gray-50 last:border-0 transition-colors flex items-start gap-4"
                >
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">location_on</span>
                  <div>
                    <p className="font-bold text-gray-900">{result.display_name.split(',')[0]}</p>
                    <p className="text-sm text-gray-500 line-clamp-1">{result.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {mode === 'DRAWING' && (
           <div className="mt-4 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full text-center text-sm font-bold shadow-lg w-max mx-auto flex items-center gap-3">
             <span className="material-symbols-outlined text-green-400">touch_app</span>
             {editLandId ? 'Drag the markers to edit the boundary' : 'Click on the map corners to draw your boundary'}
             {formData.area && <span className="ml-2 bg-green-600 px-2 py-1 rounded-md">{formData.area} Acres</span>}
           </div>
        )}
      </div>

      {/* Right Side Panel: Plot Details (Slides up on mobile, slides left on desktop) */}
      <div className={`absolute bottom-0 left-0 w-full lg:top-10 lg:right-10 lg:bottom-10 lg:left-auto lg:w-[420px] bg-[#e6e9e6] rounded-t-3xl lg:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:shadow-2xl z-50 lg:z-40 flex flex-col overflow-hidden transition-transform duration-500 ease-in-out ${mode !== 'VIEW' || !selectedLand ? 'translate-y-[150%] lg:translate-y-0 lg:translate-x-[150%]' : (isDetailsOpen ? 'translate-y-0 lg:translate-x-0' : 'translate-y-[150%] lg:translate-y-0 lg:translate-x-[150%]')} h-[80vh] lg:h-auto`}>
        
        {/* Panel Header Image */}
        <div className="h-48 relative flex-shrink-0">
          <img src={selectedLand?.image || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop"} alt="Crop Detail" className="w-full h-full object-cover" />
          <button 
            onClick={() => setIsDetailsOpen(false)}
            className="absolute top-4 left-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors"
          >
             <span className="material-symbols-outlined text-sm">close</span>
          </button>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-green-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
             <div className="w-2 h-2 rounded-full bg-green-600"></div> High Yield
          </div>
        </div>

        {/* Panel Content */}
        <div className="p-8 flex-grow flex flex-col overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-1 truncate pr-2">{selectedLand?.name || 'Plot Details'}</h2>
          <div className="flex items-center text-gray-600 text-sm mb-6">
            <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
            {searchQuery || "Live Location Linked"}
          </div>

          {/* 4 Grid Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Owner</p>
              <p className="font-bold text-gray-900 truncate" title={selectedLand?.name?.split("'s")[0] || 'Unknown'}>{selectedLand?.name?.split("'s")[0] || 'Unknown'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Survey No</p>
              <p className="font-bold text-gray-900 truncate">{selectedLand?.surveyNumber || 'Pending'}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Area</p>
              <p className="font-bold text-gray-900">{selectedLand?.area || '0'} Acres</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Soil Type</p>
              <p className="font-bold text-gray-900">Alluvial</p>
            </div>
          </div>

          {/* Health & Analytics */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Health & Analytics</h3>
              <span className="text-xs font-bold text-green-700 cursor-pointer">View Full PDF</span>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600">Nitrogen Levels</span>
                <span className="text-gray-900 font-bold">Optimal (82%)</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-1.5">
                <div className="bg-green-700 h-1.5 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-600">Moisture Index</span>
                <span className="text-gray-900 font-bold">Stable (64%)</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>
          </div>

          {/* Historical Yield Chart */}
          <div className="mb-auto">
             <h3 className="text-sm font-semibold text-gray-700 mb-4">Historical Yield</h3>
             <div className="flex items-end justify-between h-20 gap-2 px-2">
                <div className="w-full bg-[#a3c2b1] rounded-t-sm h-[30%]"></div>
                <div className="w-full bg-[#83b295] rounded-t-sm h-[45%]"></div>
                <div className="w-full bg-[#529e71] rounded-t-sm h-[55%]"></div>
                <div className="w-full bg-[#006e2f] rounded-t-sm h-[80%]"></div>
                <div className="w-full bg-[#a3c2b1] rounded-t-sm h-[35%]"></div>
             </div>
             <div className="flex justify-between text-[10px] text-gray-500 mt-2 px-2 font-medium">
                <span>2020</span>
                <span>2021</span>
                <span>2022</span>
                <span>2023</span>
                <span>2024</span>
             </div>
          </div>
          
        </div>
        
        {/* Sticky Bottom Action */}
        <div className="p-6 bg-[#e6e9e6] border-t border-gray-300/50">
          <button 
            onClick={() => navigate('/route', { state: { targetLandId: selectedLand?.id } })}
            className="w-full h-14 bg-[#006e2f] hover:bg-[#005321] text-white rounded-xl flex items-center justify-center gap-3 font-semibold text-lg shadow-md transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>navigation</span>
            Navigate to Plot
          </button>
        </div>

      </div>

      {/* Drawing Mode Actions (Bottom Center) */}
      {mode === 'DRAWING' && (
        <div className="absolute bottom-[90px] lg:bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center z-40 transition-all duration-300 w-[90%] lg:w-auto">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-gray-200">
             <button 
               onClick={() => {
                  if(editLandId) navigate(`/land/${editLandId}`);
                  else { setMode('VIEW'); setPolygonPoints([]); }
               }}
               className="w-full lg:w-auto px-6 py-3 hover:bg-gray-100 text-red-600 rounded-xl font-bold transition-colors"
             >
               Cancel
             </button>
             <button 
               onClick={handleFinishDrawing}
               className="w-full lg:w-auto px-8 py-3 bg-[#008e4d] hover:bg-[#00733d] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all active:scale-95"
             >
               <span className="material-symbols-outlined">done_all</span>
               {editLandId ? 'Confirm Changes' : 'Complete Boundary'}
             </button>
          </div>
        </div>
      )}

      {/* Right Side Map Tools (Actions & Location) */}
      <div className={`absolute bottom-[90px] lg:bottom-10 right-4 lg:right-10 flex flex-col gap-4 z-40 transition-transform duration-500 ease-in-out ${mode !== 'VIEW' ? 'translate-x-[150%]' : 'translate-x-0'}`}>
        
        {/* Actions Stack (replaces Zoom Controls) */}
        <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-gray-200">
          {selectedLand && (
            <button 
              onClick={() => setIsDetailsOpen(true)}
              title="View Plot Details"
              className="w-12 h-12 hover:bg-gray-100 text-green-800 transition-colors flex items-center justify-center border-b border-gray-200"
            >
              <span className="material-symbols-outlined text-[24px]">analytics</span>
            </button>
          )}
          <button 
            onClick={handleStartDrawing}
            title="Draw New Boundary"
            className="w-12 h-12 hover:bg-gray-100 text-gray-900 transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">draw</span>
          </button>
        </div>

        {/* Location Button */}
        <button 
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const loc = [pos.coords.latitude, pos.coords.longitude];
                setSearchLocation(loc);
                setUserLocation(loc);
              }, (err) => {
                console.warn("Location warning:", err);
                alert("Could not get your exact location. Please ensure location services are enabled or try again.");
              }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000 // Allow up to 60 seconds cached location for instant response
              });
            } else {
              alert("Geolocation is not supported by your browser.");
            }
          }}
          className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 border border-gray-200"
        >
          <span className="material-symbols-outlined text-[24px]">my_location</span>
        </button>
      </div>

      {/* --- DATA ENTRY FORM MODAL --- */}
      {mode === 'FORM_ENTRY' && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition-transform duration-300 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                       <span className="material-symbols-outlined text-green-600">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">{editLandId ? 'Update Farm Land' : 'Register Farm Land'}</h2>
                 </div>
                 <p className="text-gray-500 mb-8 font-medium pl-13">Boundary captured successfully. Please confirm ownership details.</p>
                 
                 <form onSubmit={handleSaveForm} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Land Owner Full Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.ownerName}
                        onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008e4d] font-medium transition-all" 
                      />
                    </div>

                    {/* Survey Number Section with Unknown Option */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-end mb-2">
                         <label className="block text-sm font-bold text-gray-700">Official Survey Number</label>
                      </div>
                      
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          disabled={formData.unknownSurvey}
                          value={formData.surveyNumber}
                          onChange={(e) => setFormData({...formData, surveyNumber: e.target.value})}
                          className={`w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008e4d] font-medium transition-all ${formData.unknownSurvey ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`} 
                          placeholder={formData.unknownSurvey ? 'Awaiting lookup via GPS coordinates...' : 'e.g. 121/4A'}
                        />
                        
                        <label className="flex items-start gap-3 cursor-pointer group">
                           <input 
                             type="checkbox" 
                             checked={formData.unknownSurvey}
                             onChange={(e) => setFormData({...formData, unknownSurvey: e.target.checked})}
                             className="mt-1 w-5 h-5 rounded border-gray-300 text-[#008e4d] focus:ring-[#008e4d] cursor-pointer transition-colors"
                           />
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                                 I don't know the Survey Number
                              </span>
                              <span className="text-xs text-gray-500 font-medium mt-0.5">
                                 We will generate a temporary ID and attempt to fetch official records using your drawn GPS boundary.
                              </span>
                           </div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Calculated Area</label>
                        <div className="relative">
                           <input type="text" value={formData.area} readOnly className="w-full p-4 bg-green-50/50 border border-green-100 rounded-xl text-green-800 font-bold outline-none" />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 font-bold text-sm">Acres</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contact Mobile</label>
                        <input 
                          type="tel"
                          required
                          pattern="^[0-9]{10}$"
                          title="Please enter a valid 10-digit mobile number"
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({...formData, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                          placeholder="e.g. 9876543210"
                          className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#008e4d] font-medium transition-all focus:invalid:ring-red-500 focus:invalid:border-red-500" 
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                       <button 
                         type="button" 
                         onClick={() => setMode('DRAWING')} 
                         className="flex-1 p-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold transition-colors"
                       >
                         Redraw Boundary
                       </button>
                       <button 
                         type="submit" 
                         className="flex-1 p-4 bg-[#008e4d] hover:bg-[#00733d] text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-900/20"
                       >
                         {editLandId ? 'Update Farm Data' : 'Save Farm Data'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
