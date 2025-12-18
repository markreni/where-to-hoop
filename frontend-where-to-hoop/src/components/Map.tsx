import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"; // Import styles
import "leaflet/dist/leaflet.css";
import type { BasketballHoop, Coordinates } from "../types/types";
import initialHoops from "../mockhoops";
import type { Condition } from "../types/types";
import { conditionColors }from "../assets/style";
import { useEffect, useRef } from "react";
import { useLocationValues } from "../LocationContext.tsx";
import { Button } from "react-aria-components";
import { useLocationDispatch } from "../LocationContext.tsx";
import { MdOutlineMyLocation } from "react-icons/md";


// Component that holds map instance reference
const MapController = ({ onMapReady }: { onMapReady: (map: L.Map) => void }) => {
  const map: L.Map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

const conditionClass = (condition?: Condition) => {
  switch (condition) {
    case 'excellent': return conditionColors.excellent;
    case 'good':      return conditionColors.good;
    case 'fair':      return conditionColors.fair;
    case 'poor':      return conditionColors.poor;
    default:          return conditionColors.unknown;
  }
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
      
      <div className="absolute bottom-6 left-3 bg-white rounded-lg shadow-lg py-2 px-4 z-400">
          <h4 className="text-sm text-gray-700 mb-2"><strong>Court Condition</strong> </h4>
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Excellent', color: conditionColors.excellent },
              { label: 'Good', color: conditionColors.good },
              { label: 'Fair', color: conditionColors.fair },
              { label: 'Poor', color: conditionColors.poor },
              { label: 'Unknown', color: conditionColors.unknown },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-white shadow ${item.color}`}
                />
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}

export default Map;