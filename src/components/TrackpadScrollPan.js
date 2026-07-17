import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export default function TrackpadScrollPan() {
  const map = useMap();
  const trackpadTimeout = useRef(null);
  const isTrackpadMode = useRef(false);

  useEffect(() => {
    // Ensure Leaflet's native scroll zoom is enabled
    map.scrollWheelZoom.enable();

    const handleWheel = (e) => {
      const isPinch = e.ctrlKey;
      
      const hasTrackpadCharacteristics = 
          Math.abs(e.deltaX) > 0 || 
          (e.deltaY % 1 !== 0) || 
          (Math.abs(e.deltaY) > 0 && e.deltaY % 100 !== 0 && e.deltaY % 120 !== 0 && e.deltaY % 50 !== 0);

      // Lock into trackpad mode
      if (hasTrackpadCharacteristics && !isPinch) {
         isTrackpadMode.current = true;
         clearTimeout(trackpadTimeout.current);
         trackpadTimeout.current = setTimeout(() => { isTrackpadMode.current = false; }, 200);
         
         // CANCEL Leaflet's native pending zoom from any "first frame" mouse-like events!
         if (map.scrollWheelZoom && map.scrollWheelZoom._timer) {
             clearTimeout(map.scrollWheelZoom._timer);
             map.scrollWheelZoom._timer = null;
             map.scrollWheelZoom._delta = 0;
             map.scrollWheelZoom._startTime = null;
         }
      }

      if (isTrackpadMode.current && !isPinch) {
         // It's a trackpad pan!
         e.preventDefault();
         e.stopPropagation(); // Don't let Leaflet see this event
         map.panBy([e.deltaX, e.deltaY], { animate: false });
      }
      // Otherwise, we do nothing and let Leaflet's native event listener capture it.
      // This guarantees flawless native zooming towards the mouse pointer.
    };

    const container = map.getContainer();
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
      clearTimeout(trackpadTimeout.current);
    };
  }, [map]);

  return null;
}
