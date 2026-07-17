import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function TrackpadScrollPan() {
  const map = useMap();

  useEffect(() => {
    // Disable default Leaflet scroll wheel zoom to prevent accidental zooming on trackpads
    map.scrollWheelZoom.disable();

    const handleWheel = (e) => {
      e.preventDefault();

      const isPinch = e.ctrlKey;
      // Heuristic to detect standard mouse wheel vs trackpad
      const isStandardMouse = !isPinch && (e.deltaMode !== 0 || (Math.abs(e.deltaX) === 0 && (e.deltaY % 50 === 0 || e.deltaY % 120 === 0)));

      if (isPinch) {
        // Pinch-to-zoom
        const zoomDelta = -e.deltaY * 0.01;
        map.setZoom(map.getZoom() + zoomDelta, { animate: false });
      } else if (!isStandardMouse) {
        // Trackpad two-finger scroll panning
        map.panBy([e.deltaX, e.deltaY], { animate: false });
      } else {
        // Standard mouse wheel zooming
        const zoomDelta = e.deltaY > 0 ? -1 : 1;
        map.setZoom(map.getZoom() + zoomDelta, { animate: true });
      }
    };

    const container = map.getContainer();
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      map.scrollWheelZoom.enable();
    };
  }, [map]);

  return null;
}
