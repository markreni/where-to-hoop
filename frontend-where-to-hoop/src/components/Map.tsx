import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"; // Import styles
import "leaflet/dist/leaflet.css";
import type { BasketballHoop, Coordinates } from "../types/types";
import initialHoops from "../mockhoops";
import { useEffect, useRef } from "react";
import { useLocationValues } from "../LocationContext.tsx";
import { Button } from "react-aria-components";
import { useLocationDispatch } from "../LocationContext.tsx";
import { MdOutlineMyLocation } from "react-icons/md";
import { MapLabel } from "./MapLabel.tsx";
import { conditionClass } from "../utils/auxiliary.tsx";


// Component that holds map instance reference
const MapController = ({ onMapReady }: { onMapReady: (map: L.Map) => void }) => {
  const map: L.Map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

const Map = () => {
  const userLocationContext: Coordinates = useLocationValues();
  const dispatch = useLocationDispatch();
  const mapRef = useRef<L.Map | null>(null);

  const centerPosition: LatLngTuple = (userLocationContext.latitude && userLocationContext.longitude) ? [userLocationContext.latitude!, userLocationContext.longitude!] : [60.1695, 24.9354]; // Default to Helsinki if no location

  const locateUser = () => {
    if (userLocationContext.latitude && userLocationContext.longitude) {
      mapRef.current?.flyTo([userLocationContext.latitude, userLocationContext.longitude], 13);
    } else {
      console.log("Locating user...");
      navigator.geolocation.getCurrentPosition((position) => {
        dispatch({
          payload: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
        mapRef.current?.setView([position.coords.latitude, position.coords.longitude], 13);
      }, (error) => {
        console.error("Error getting user's location:", error);
      }, { enableHighAccuracy: true });
    }
  };

  return (
    <div>
        <MapContainer className="h-[100vh] w-[100vw]" center={centerPosition} zoom={13} zoomControl={false} scrollWheelZoom={true}>
        <MapController onMapReady={(map) => { mapRef.current = map; }} />
        <ZoomControl position="bottomright" /> 
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {initialHoops.map((hoop: BasketballHoop) => {
          const icon = L.divIcon({
            html: '<div class="hoop-emoji">🏀</div>',
            className: `hoop-icon-container ${conditionClass(hoop.condition)}`,
            iconSize: [33, 33],
            iconAnchor: [16.5, 16.5],
            popupAnchor: [0, -22],
          });

          return (
            <Marker key={hoop.id} position={[hoop.coordinates.latitude!, hoop.coordinates.longitude!]} icon={icon}>
              <Popup>
                <strong>{hoop.name}</strong><br />
                {hoop.description}<br />
                Condition: {hoop.condition}<br />
                {hoop.indoor ? "Indoor" : "Outdoor"}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <Button 
        className="absolute bottom-27 right-[13px] text-gray-700 text-3xl z-400 cursor-pointer" 
        onPress={locateUser}
        aria-label="Locate Me"
      >
        <MdOutlineMyLocation />
      </Button>
      
      <MapLabel />
      
    </div>
  );
}

export default Map;