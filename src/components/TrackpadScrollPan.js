import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export default function TrackpadScrollPan() {
  const map = useMap();
  const wheelAccumulator = useRef(0);
  const lastWheelTime = useRef(0);
  const isTrackpadMode = useRef(false);
  const trackpadTimeout = useRef(null);
  const pendingZoomTimeout = useRef(null);

  useEffect(() => {
    // Completely disable default scroll zoom
    map.scrollWheelZoom.disable();

    const handleWheel = (e) => {
      e.preventDefault();
      
      const now = Date.now();
      const timeSinceLast = now - lastWheelTime.current;
      lastWheelTime.current = now;

      const isPinch = e.ctrlKey;
      
      // Trackpad detection:
      // 1. Non-zero X delta
      // 2. Fractional Y delta or non-standard integer
      // 3. Very fast subsequent events (< 40ms)
      const hasTrackpadCharacteristics = 
          Math.abs(e.deltaX) > 0 || 
          (e.deltaY % 1 !== 0) || 
          (Math.abs(e.deltaY) > 0 && e.deltaY % 100 !== 0 && e.deltaY % 120 !== 0 && e.deltaY % 50 !== 0);

      // Lock into trackpad mode if characteristics match
      if (hasTrackpadCharacteristics || (timeSinceLast < 40 && !isPinch)) {
         isTrackpadMode.current = true;
         clearTimeout(trackpadTimeout.current);
         // Stay in trackpad mode for 200ms after the last trackpad event
         trackpadTimeout.current = setTimeout(() => { isTrackpadMode.current = false; }, 200);
         
         // If a standard mouse zoom was pending, cancel it! It was actually the first frame of a trackpad scroll.
         if (pendingZoomTimeout.current) {
             clearTimeout(pendingZoomTimeout.current);
             pendingZoomTimeout.current = null;
             // Apply the pending accumulator as a pan instead
             map.panBy([0, wheelAccumulator.current], { animate: false });
             wheelAccumulator.current = 0;
         }
      }

      if (isTrackpadMode.current && !isPinch) {
        // --- PANNING ---
        map.panBy([e.deltaX, e.deltaY], { animate: false });
        wheelAccumulator.current = 0; 
      } else {
        // --- ZOOMING (Pinch or Mouse) ---
        const threshold = isPinch ? 40 : 90; 
        wheelAccumulator.current += e.deltaY;
        
        if (Math.abs(wheelAccumulator.current) >= threshold) {
           const zoomStep = wheelAccumulator.current > 0 ? -1 : 1;
           
           if (isPinch) {
               // Pinch is definitive, zoom immediately
               map.setZoom(map.getZoom() + zoomStep, { animate: true });
               wheelAccumulator.current = 0;
           } else {
               // Mouse wheel might actually be the first frame of a trackpad scroll.
               // We wait 40ms. If no trackpad events arrive, execute the zoom.
               if (!pendingZoomTimeout.current) {
                   pendingZoomTimeout.current = setTimeout(() => {
                       map.setZoom(map.getZoom() + zoomStep, { animate: true });
                       wheelAccumulator.current = 0;
                       pendingZoomTimeout.current = null;
                   }, 40);
               }
           }
        }
      }
    };

    const container = map.getContainer();
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
      map.scrollWheelZoom.enable();
      clearTimeout(trackpadTimeout.current);
      if (pendingZoomTimeout.current) clearTimeout(pendingZoomTimeout.current);
    };
  }, [map]);

  return null;
}
