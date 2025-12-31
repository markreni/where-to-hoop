import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLngTuple, LeafletEvent } from "leaflet";
import type { BasketballHoop, Coordinates } from "../types/types";
import centerCoordinates from "../utils/constants";
import { useLocationValues } from "../contexts/LocationContext";
import { MapController } from "./reusable/MapController";


interface MiniMapProps {
  formData: BasketballHoop;
  setFormData: React.Dispatch<React.SetStateAction<BasketballHoop>>;
  mapRef: React.RefObject<L.Map | null>;
}

const MiniMap = ({ formData, setFormData, mapRef }: MiniMapProps) => {
    const userLocationContext: Coordinates = useLocationValues();
    
    const centerPosition: LatLngTuple = (userLocationContext.latitude && userLocationContext.longitude) ? [userLocationContext.latitude!, userLocationContext.longitude!] : centerCoordinates; 

   // Mini map marker component for draggable marker
    const DraggableMarker = ({
      position,
    }: { position: [number, number] | null }) => {
      if (!position) return null;
  
      const eventHandlers = {
        dragend(e: LeafletEvent) {
          const marker = e.target;
          const latLng = marker.getLatLng();
          const lat = Number(latLng.lat);
          const lng = Number(latLng.lng);
          setFormData({
            ...formData,
            coordinates: {
              latitude: lat,
              longitude: lng,
            },
          });
        },
      };
  
      return (
        <Marker position={position} draggable eventHandlers={eventHandlers} />
      );
    };

  return (
    <div className="h-50">
      <MapContainer
        center={centerPosition}
        zoom={10}
        className="h-full w-full rounded-lg"
        
      >
        <MapController onMapReady={(map) => { mapRef.current = map; }} />
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker
            position={
            formData.coordinates.latitude !== null && formData.coordinates.longitude !== null ? 
            [formData.coordinates.latitude, formData.coordinates.longitude] : centerCoordinates
            }
        />
      </MapContainer>
    </div>
  );
}

export { MiniMap };