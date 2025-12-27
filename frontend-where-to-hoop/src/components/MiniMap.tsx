import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LeafletEvent } from "leaflet";
import type { BasketballHoop } from "../types/types";
import centerCoordinates from "../utils/constants";


const MiniMap = ({ formData, setFormData }: { formData: BasketballHoop; setFormData: React.Dispatch<React.SetStateAction<BasketballHoop>> }) => {

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
    <div className="mt-2 mb-2 h-50">
      <MapContainer
        center={centerCoordinates}
        zoom={10}
        className="h-full w-full rounded-lg"
        
      >
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