import { useEffect } from "react";
import { useMap } from "react-leaflet";


// Component that holds map instance reference
const MapController = ({ onMapReady }: { onMapReady: (map: L.Map) => void }) => {
  const map: L.Map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  
  return null;
};

export { MapController };