import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapContainer, TileLayer, Polygon, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TrackpadScrollPan from '../components/TrackpadScrollPan';

// Fix for default Leaflet markers missing icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Icon for the User's Live GPS Location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to track user location dynamically during navigation
const NavigationTracker = ({ routeCoords, userLocation, isNavigating, isAutoTracking, setIsAutoTracking }) => {
  const map = useMap();
  
  useEffect(() => {
    // Stop auto-tracking if the user manually drags the map
    const handleDragStart = () => setIsAutoTracking(false);
    map.on('dragstart', handleDragStart);
    return () => map.off('dragstart', handleDragStart);
  }, [map, setIsAutoTracking]);

  useEffect(() => {
    if (isNavigating && userLocation && isAutoTracking) {
      // Zoom in tight and lock map center to user's moving GPS coordinates
      map.setView(userLocation, 18, { animate: true, duration: 0.5 });
    } else if (!isNavigating && routeCoords && routeCoords.length > 0) {
      // Overview mode: Show entire route
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, routeCoords, userLocation, isNavigating, isAutoTracking]);
  
  return null;
};

// Fallback polygon defined outside to guarantee a stable reference
const DEFAULT_POLYGON = [
  [17.3850, 78.4867],
  [17.3850, 78.4880],
  [17.3840, 78.4880],
  [17.3840, 78.4867]
];

export default function NavigationRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const targetLandId = location.state?.targetLandId;
  const lands = useSelector(state => state.lands.items);
  const targetLand = lands.find(l => l.id === targetLandId) || lands[0];

  const [isNavigating, setIsNavigating] = useState(false);
  const [isAutoTracking, setIsAutoTracking] = useState(true);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState(null);
  
  // OSRM Routing State
  const [routeData, setRouteData] = useState({
    distanceKm: null,
    etaFormatted: null,
    coordinates: [],
    steps: []
  });

  const targetPolygon = targetLand?.polygonPoints || DEFAULT_POLYGON;

  // useMemo ensures this array reference stays stable across renders
  const targetCenter = React.useMemo(() => {
    return targetPolygon.reduce(
      (acc, val) => [acc[0] + val[0] / targetPolygon.length, acc[1] + val[1] / targetPolygon.length],
      [0, 0]
    );
  }, [targetPolygon]);

  // Fetch Route from OSRM
  useEffect(() => {
    if (userLocation && targetCenter && isNavigating) {
      // OSRM uses Longitude, Latitude
      const startLon = userLocation[1];
      const startLat = userLocation[0];
      const endLon = targetCenter[1];
      const endLat = targetCenter[0];

      const url = `https://router.project-osrm.org/route/v1/bike/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&steps=true`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            
            // OSRM returns GeoJSON [lon, lat], Leaflet needs [lat, lon]
            const leafletCoords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            // Bridge the gap: OSRM stops at the nearest mapped road. 
            // We prepend the exact user location and append the exact farm center 
            // to ensure the blue route line connects perfectly to both endpoints.
            leafletCoords.unshift([userLocation[0], userLocation[1]]);
            leafletCoords.push([targetCenter[0], targetCenter[1]]);
            
            const totalMins = Math.round(route.duration / 60);
            const hours = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            const etaString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            
            setRouteData({
              distanceKm: (route.distance / 1000).toFixed(1),
              etaFormatted: etaString,
              coordinates: leafletCoords,
              steps: route.legs[0].steps
            });
          }
        })
        .catch(err => console.error("Error fetching route:", err));
    }
  }, [userLocation, targetCenter, isNavigating]);

  // Handle Geolocation Watcher
  useEffect(() => {
    if (!isNavigating || isManualLocation) return;

    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setGeoError(null);
        },
        (error) => {
          console.warn("GPS access warning:", error.message);
          setGeoError(error.message);
          
          // Mock fallback just so the UI isn't stuck if denied
          setUserLocation(prev => prev || [targetCenter[0] - 0.05, targetCenter[1] - 0.05]); 
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    } else {
      setGeoError("Geolocation is not supported by your browser");
    }

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, targetCenter, isManualLocation]);

  const startNavigation = () => {
    setIsNavigating(true);
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.log("Initial GPS request failed", err)
        );
    }
  };

  const nextStep = routeData.steps?.length > 1 ? routeData.steps[1] : routeData.steps?.[0];

  return (
    <div className="w-full h-full relative bg-[#e0e3e5]">
      
      {/* Interactive Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={targetCenter} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          className="w-full h-full"
          zoomControl={true}
        >
          <TrackpadScrollPan />
          <TileLayer
            attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            maxZoom={20}
          />
          
          {/* Target Farm Boundary */}
          {targetPolygon && (
            <Polygon 
              positions={targetPolygon} 
              pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.3, weight: 3 }}
            />
          )}

          {/* User's Exact Physical Location Marker */}
          {userLocation && (
            <Marker 
              position={userLocation} 
              icon={userIcon} 
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  setUserLocation([pos.lat, pos.lng]);
                  setIsManualLocation(true);
                  setIsAutoTracking(false);
                }
              }}
            />
          )}

          {/* True Road Route OR Fallback Straight Line */}
          {userLocation && (
             <Polyline 
               positions={routeData.coordinates.length > 0 ? routeData.coordinates : [userLocation, targetCenter]} 
               pathOptions={{ 
                 color: '#3b82f6', 
                 weight: 6, 
                 opacity: 0.8,
                 dashArray: routeData.coordinates.length > 0 ? null : '10, 10' 
               }} 
             />
          )}

          <NavigationTracker 
            routeCoords={routeData.coordinates} 
            userLocation={userLocation} 
            isNavigating={isNavigating} 
            isAutoTracking={isAutoTracking}
            setIsAutoTracking={setIsAutoTracking}
          />
          
        </MapContainer>
      </div>

      {/* Live Turn-by-Turn Overlay */}
      {isNavigating && nextStep && (
        <div className="absolute bottom-[90px] lg:bottom-10 left-1/2 -translate-x-1/2 bg-[#006e2f] text-white px-4 lg:px-8 py-3 lg:py-5 rounded-3xl shadow-2xl z-50 flex items-center gap-4 lg:gap-6 w-[90%] lg:w-auto min-w-0 lg:min-w-[350px] border-[3px] lg:border-[5px] border-white/20 backdrop-blur-md">
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[32px] lg:text-[40px]">
              {nextStep.maneuver.type === 'turn' && nextStep.maneuver.modifier?.includes('right') ? 'turn_right' : 
               nextStep.maneuver.type === 'turn' && nextStep.maneuver.modifier?.includes('left') ? 'turn_left' : 
               nextStep.maneuver.type === 'arrive' ? 'pin_drop' : 'straight'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xl lg:text-3xl font-black truncate">{nextStep.maneuver.instruction}</p>
            <p className="text-sm lg:text-xl font-bold text-green-200 mt-1">in {(nextStep.distance).toFixed(0)} meters</p>
          </div>
        </div>
      )}

      {/* Back Button & Floating Title */}
      <div className="absolute top-4 lg:top-8 left-4 lg:left-8 flex items-center gap-2 lg:gap-4 z-40 w-max max-w-[90%]">
        <button onClick={() => navigate('/lands')} className="w-10 h-10 lg:w-12 lg:h-12 bg-white/95 backdrop-blur-md rounded-xl shadow-md flex items-center justify-center flex-shrink-0 hover:bg-gray-50 text-[#006e2f]">
           <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="bg-white/95 backdrop-blur-md px-4 lg:px-6 py-2 lg:py-3 rounded-xl shadow-md flex items-center gap-2 lg:gap-4 flex-wrap">
          <h1 className="text-lg lg:text-2xl font-bold text-[#006e2f] whitespace-nowrap">GPS Navigation</h1>
          
          {/* Recenter / Resume Live GPS Button */}
          {isNavigating && (isManualLocation ? (
            <button 
              onClick={() => { setIsManualLocation(false); setIsAutoTracking(true); }}
              className="ml-0 lg:ml-4 bg-orange-500 hover:bg-orange-600 text-white text-xs lg:text-sm font-bold px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg flex items-center gap-1 lg:gap-2 shadow-lg animate-pulse"
            >
              <span className="material-symbols-outlined text-[16px] lg:text-[18px]">gps_fixed</span>
              Resume Live GPS
            </button>
          ) : !isAutoTracking && (
            <button 
              onClick={() => setIsAutoTracking(true)}
              className="ml-0 lg:ml-4 bg-blue-500 hover:bg-blue-600 text-white text-xs lg:text-sm font-bold px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg flex items-center gap-1 lg:gap-2 shadow-lg animate-bounce"
            >
              <span className="material-symbols-outlined text-[16px] lg:text-[18px]">my_location</span>
              Recenter
            </button>
          ))}
        </div>
      </div>

      {/* Geolocation Error Alert */}
      {geoError && (
        <div className="absolute top-24 left-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-40 max-w-md">
          <p className="font-bold">GPS Error</p>
          <p className="text-sm">{geoError}. Please ensure you have granted Location permissions to this site.</p>
        </div>
      )}

      {/* Right Side Route Panel */}
      <div className={`absolute bottom-0 lg:bottom-auto left-0 lg:left-auto lg:top-8 right-0 lg:right-10 w-full lg:w-[420px] flex flex-col gap-0 lg:gap-4 z-40 max-h-[50vh] lg:max-h-[90vh] overflow-hidden transition-transform duration-500 ease-in-out ${isNavigating ? 'translate-y-[150%] lg:translate-y-0 lg:translate-x-[150%]' : 'translate-y-0 lg:translate-x-0'}`}>
        
        {/* Main Card */}
        <div className="bg-[#f0ece1] rounded-t-3xl lg:rounded-3xl p-6 lg:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:shadow-xl flex-shrink-0">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold text-green-700 tracking-wider uppercase">Destination</span>
            {isNavigating && (
                <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> GPS Active
                </span>
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-6 truncate">{targetLand?.name || 'Selected Plot'}</h2>

          {!isNavigating ? (
              <div className="bg-white/80 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700">Click Start to ping your exact GPS location, calculate real roads, and route to this farm.</p>
              </div>
          ) : (
            <div className="flex flex-col gap-4 mb-4">
                <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-xl p-3 text-xs font-bold flex items-start gap-2">
                   <span className="material-symbols-outlined text-sm">info</span>
                   If your GPS location is slightly off, you can drag the blue marker to your exact apartment or building.
                </div>
                <div className="flex gap-4">
                  <div className="bg-white/80 rounded-xl p-4 flex-1">
                    <p className="text-xs text-gray-500 mb-1">Distance</p>
                    <p className="text-3xl font-bold text-gray-900 tracking-tighter">
                      {routeData.distanceKm !== null ? routeData.distanceKm : '--'}
                      <span className="text-sm font-medium ml-1">km</span>
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 flex-1">
                    <p className="text-xs text-gray-500 mb-1">ETA</p>
                    <p className="text-3xl font-bold text-gray-900 tracking-tighter">
                      {routeData.etaFormatted !== null ? routeData.etaFormatted : '--'}
                    </p>
                  </div>
                </div>
            </div>
          )}

          <button 
            onClick={startNavigation}
            disabled={isNavigating && !geoError}
            className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl text-white shadow-lg transition-colors ${isNavigating && !geoError ? 'bg-[#005321] opacity-70 cursor-not-allowed' : 'bg-[#006e2f] hover:bg-[#005321]'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{isNavigating && !geoError ? 'my_location' : 'play_arrow'}</span>
            {isNavigating && !geoError ? 'Tracking Active' : 'Enable GPS Navigation'}
          </button>
        </div>

        {/* Turn-by-Turn Directions Panel */}
        {isNavigating && routeData.steps.length > 0 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl flex-grow overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 sticky top-0 bg-white/90 backdrop-blur-sm pb-2">Turn-by-turn Directions</h3>
            <div className="flex flex-col gap-4">
              {routeData.steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">
                      {step.maneuver.type === 'turn' && step.maneuver.modifier === 'right' ? 'turn_right' : 
                       step.maneuver.type === 'turn' && step.maneuver.modifier === 'left' ? 'turn_left' : 
                       step.maneuver.type === 'arrive' ? 'pin_drop' : 'straight'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{step.maneuver.instruction}</p>
                    <p className="text-xs text-gray-500 mt-1">{(step.distance).toFixed(0)} meters</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
